import { apiRequest } from './client';

interface OCRResponse {
  status: string;
  data: {
    merchant_name: string;
    total_amount: string;
    date: string;
  };
}

export async function uploadReceipt(file: File): Promise<OCRResponse> {
  const formData = new FormData();
  formData.append('file', file);

  return apiRequest<OCRResponse>('/upload', {
    method: 'POST',
    body: formData,
  });
}
