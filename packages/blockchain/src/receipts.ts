export interface ExecutionReceipt {
  id: string;
  sessionId: string;
  agentName: string;
  taskId?: string;
  inputHash: string;
  outputHash: string;
  executionTimeMs: number;
  costUnits: number;
  signature: string;
  createdAt: Date;
}

export interface ReceiptData {
  sessionId: string;
  agentName: string;
  taskId?: string;
  inputData: Record<string, unknown>;
  outputData: Record<string, unknown>;
  executionTimeMs: number;
  costUnits: number;
  createdAt: Date;
}

export async function createExecutionReceipt(
  data: ReceiptData
): Promise<ExecutionReceipt> {
  const inputHash = await hashData(data.inputData);
  const outputHash = await hashData(data.outputData);

  return {
    id: crypto.randomUUID(),
    sessionId: data.sessionId,
    agentName: data.agentName,
    taskId: data.taskId,
    inputHash,
    outputHash,
    executionTimeMs: data.executionTimeMs,
    costUnits: data.costUnits,
    signature: '',
    createdAt: data.createdAt,
  };
}

export async function hashData(data: Record<string, unknown>): Promise<string> {
  const jsonString = JSON.stringify(data);
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(jsonString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyReceipt(
  inputData: Record<string, unknown>,
  outputData: Record<string, unknown>,
  inputHash: string,
  outputHash: string
): Promise<boolean> {
  try {
    const expectedInputHash = await hashData(inputData);
    const expectedOutputHash = await hashData(outputData);

    return (
      inputHash === expectedInputHash &&
      outputHash === expectedOutputHash
    );
  } catch {
    return false;
  }
}
