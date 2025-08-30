import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 minutes timeout for long processing
});

export interface ConversionOptions {
  speaker1Name?: string;
  speaker1Voice?: string;
  speaker2Name?: string;
  speaker2Voice?: string;
  tone?: string;
}

export const uploadPdfForAudio = async (
  file: File,
  options?: ConversionOptions,
  onProgress?: (progress: number) => void
): Promise<Blob> => {
  const formData = new FormData();
  formData.append('file', file);
  
  if (options?.speaker1Name) formData.append('speaker1_name', options.speaker1Name);
  if (options?.speaker1Voice) formData.append('speaker1_voice', options.speaker1Voice);
  if (options?.speaker2Name) formData.append('speaker2_name', options.speaker2Name);
  if (options?.speaker2Voice) formData.append('speaker2_voice', options.speaker2Voice);
  if (options?.tone) formData.append('tone', options.tone);

  const response = await api.post('/pdf-to-notebooklm-audio', formData, {
    responseType: 'blob',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    },
  });

  return response.data;
};

export const checkHealth = async (): Promise<any> => {
  const response = await api.get('/');
  return response.data;
};

export interface VoicesResponse {
  voices: string[];
  default_voice1: string;
  default_voice2: string;
}

export interface TonePreset {
  name: string;
  description: string;
}

export interface TonesResponse {
  tones: Record<string, TonePreset>;
  default: string;
}

export const getAvailableVoices = async (): Promise<VoicesResponse> => {
  const response = await api.get('/voices');
  return response.data;
};

export const getTonePresets = async (): Promise<TonesResponse> => {
  const response = await api.get('/tones');
  return response.data;
};