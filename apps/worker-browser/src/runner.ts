import { chromium, Browser, Page } from 'playwright';

export interface SearchTask {
  query: string;
  limit?: number;
}

export interface ScrapeTask {
  url: string;
  selectors?: string[];
}

export interface FillFormTask {
  url: string;
  formData: Record<string, string>;
  submit?: boolean;
}

export type Task = SearchTask | ScrapeTask | FillFormTask;

export class TaskRunner {
  private browser: Browser | null = null;

  async initialize(): Promise<void> {
    this.browser = await chromium.launch({ headless: true });
  }

  async executeTask(task: Task, sessionId: string): Promise<unknown> {
    if (!this.browser) {
      await this.initialize();
    }

    switch (task.type) {
      case 'search':
        return this.executeSearch(task as SearchTask, sessionId);
      case 'scrape':
        return this.executeScrape(task as ScrapeTask, sessionId);
      case 'fill_form':
        return this.executeFillForm(task as FillFormTask, sessionId);
      default:
        throw new Error(`Unknown task type: ${(task as Task).type}`);
    }
  }

  private async executeSearch(
    task: SearchTask,
    sessionId: string
  ): Promise<unknown> {
    const { query, limit = 10 } = task;
    const page = await this.browser!.newPage();

    try {
      await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
      await page.waitForLoadState('networkidle');

      const results = await page.$$eval('div.g', (elements) =>
        elements.slice(0, limit).map((el) => {
          const titleEl = el.querySelector('h3');
          const linkEl = el.querySelector('a');
          const snippetEl = el.querySelector('div[data-content-for-h3]');

          return {
            title: titleEl?.textContent || '',
            url: linkEl?.href || '',
            snippet: snippetEl?.textContent || '',
          };
        })
      );

      return {
        success: true,
        query,
        results,
        count: results.length,
      };
    } finally {
      await page.close();
    }
  }

  private async executeScrape(
    task: ScrapeTask,
    sessionId: string
  ): Promise<unknown> {
    const { url, selectors = ['body'] } = task;
    const page = await this.browser!.newPage();

    try {
      await page.goto(url);
      await page.waitForLoadState('networkidle');

      const data: Record<string, string> = {};
      for (const selector of selectors) {
        const elements = await page.$$(selector);
        data[selector] = elements.map((el) => el.textContent || '').join('\n');
      }

      return {
        success: true,
        url,
        data,
      };
    } finally {
      await page.close();
    }
  }

  private async executeFillForm(
    task: FillFormTask,
    sessionId: string
  ): Promise<unknown> {
    const { url, formData, submit = false } = task;
    const page = await this.browser!.newPage();

    try {
      await page.goto(url);
      await page.waitForLoadState('networkidle');

      for (const [selector, value] of Object.entries(formData)) {
        await page.fill(selector, value);
      }

      if (submit) {
        const submitButton = await page.$('button[type="submit"], input[type="submit"]');
        if (submitButton) {
          await submitButton.click();
          await page.waitForLoadState('networkidle');
        }
      }

      return {
        success: true,
        url,
        filled: Object.keys(formData).length,
      };
    } finally {
      await page.close();
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

export const taskRunner = new TaskRunner();
