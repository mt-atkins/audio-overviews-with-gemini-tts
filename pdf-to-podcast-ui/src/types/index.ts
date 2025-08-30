export interface ProcessingStage {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  description: string;
}

export interface AudioFile {
  id: string;
  filename: string;
  originalPdf: string;
  duration: number;
  size: number;
  url: string;
  createdAt: Date;
}

export interface UploadState {
  file: File | null;
  isUploading: boolean;
  isProcessing: boolean;
  progress: number;
  currentStage: string;
  stages: ProcessingStage[];
  error: string | null;
  audioFile: AudioFile | null;
}

export interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
}

export interface SpeakerConfig {
  name: string;
  voice: string;
}

export interface ConversionSettings {
  speaker1: SpeakerConfig;
  speaker2: SpeakerConfig;
  tone: string;
}