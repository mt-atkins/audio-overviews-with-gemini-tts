import { create } from 'zustand';
import { UploadState, ProcessingStage, ConversionSettings } from '../types';

const initialStages: ProcessingStage[] = [
  {
    id: 'upload',
    name: 'Upload',
    status: 'pending',
    description: 'Uploading your PDF...'
  },
  {
    id: 'extraction',
    name: 'Text Extraction',
    status: 'pending',
    description: 'Analyzing document content...'
  },
  {
    id: 'script',
    name: 'Script Generation',
    status: 'pending',
    description: 'Creating conversation script...'
  },
  {
    id: 'audio',
    name: 'Audio Creation',
    status: 'pending',
    description: 'Generating multi-speaker audio...'
  },
  {
    id: 'finalize',
    name: 'Finalizing',
    status: 'pending',
    description: 'Almost ready...'
  }
];

interface UploadStore extends UploadState {
  conversionSettings: ConversionSettings;
  setFile: (file: File | null) => void;
  setUploading: (isUploading: boolean) => void;
  setProcessing: (isProcessing: boolean) => void;
  setProgress: (progress: number) => void;
  setCurrentStage: (stage: string) => void;
  updateStageStatus: (stageId: string, status: ProcessingStage['status']) => void;
  setError: (error: string | null) => void;
  setAudioFile: (audioFile: UploadState['audioFile']) => void;
  setConversionSettings: (settings: ConversionSettings) => void;
  reset: () => void;
}

const initialState: UploadState = {
  file: null,
  isUploading: false,
  isProcessing: false,
  progress: 0,
  currentStage: '',
  stages: initialStages,
  error: null,
  audioFile: null,
};

const initialConversionSettings: ConversionSettings = {
  speaker1: { name: '', voice: 'zephyr' },
  speaker2: { name: '', voice: 'puck' },
  tone: 'conversational'
};

export const useUploadStore = create<UploadStore>((set) => ({
  ...initialState,
  conversionSettings: initialConversionSettings,
  
  setFile: (file) => set({ file }),
  
  setUploading: (isUploading) => set({ isUploading }),
  
  setProcessing: (isProcessing) => set({ isProcessing }),
  
  setProgress: (progress) => set({ progress }),
  
  setCurrentStage: (currentStage) => set({ currentStage }),
  
  updateStageStatus: (stageId, status) => set((state) => ({
    stages: state.stages.map(stage =>
      stage.id === stageId ? { ...stage, status } : stage
    )
  })),
  
  setError: (error) => set({ error }),
  
  setAudioFile: (audioFile) => set({ audioFile }),
  
  setConversionSettings: (conversionSettings) => set({ conversionSettings }),
  
  reset: () => set({ ...initialState, conversionSettings: initialConversionSettings }),
}));