import { api } from './api';

export async function chat(message: string): Promise<{ reply: string; provider?: string }> {
  const res = await api.post('/api/ai/chat/', { message });
  return res.data;
}

export async function parseReceipt(file: File) {
  const form = new FormData();
  form.append('file', file);
  // Let the browser set the correct multipart boundary automatically
  const res = await api.post('/api/ai/receipt/parse/', form);
  return res.data as { id: number; parsed: any; status: string; error?: string };
}

export async function commitReceipt(jobId: number, items: Array<Record<string, any>>) {
  const res = await api.post('/api/ai/receipt/commit/', { job_id: jobId, items });
  return res.data as { created_expense_ids: number[] };
}


