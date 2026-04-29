import { IntentClassification } from '@solli/shared';

export type RouterOutput = IntentClassification | 'APPROVAL_WAIT' | 'ERROR';

export function routeIntent(state: { userIntent?: string; requiresApproval: boolean; lastError: string | null }): IntentClassification {
  if (state.requiresApproval) {
    return 'GENERAL' as IntentClassification;
  }

  if (state.lastError) {
    return 'GENERAL' as IntentClassification;
  }

  const intent = state.userIntent?.toUpperCase() || '';

  if (
    intent.includes('RESEARCH') ||
    intent.includes('SEARCH') ||
    intent.includes('LOOK UP') ||
    intent.includes('FIND')
  ) {
    return 'RESEARCH';
  }

  if (
    intent.includes('INBOX') ||
    intent.includes('EMAIL') ||
    intent.includes('GMAIL') ||
    intent.includes('MESSAGE')
  ) {
    return 'INBOX';
  }

  if (
    intent.includes('PLAN') ||
    intent.includes('SCHEDULE') ||
    intent.includes('CALENDAR') ||
    intent.includes('ORGANIZE')
  ) {
    return 'PLANNING';
  }

  return 'RESEARCH';
}
