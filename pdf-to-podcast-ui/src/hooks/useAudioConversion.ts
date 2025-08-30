import { useState, useCallback } from 'react';
import { useUploadStore } from '../stores/useUploadStore';
import { uploadPdfForAudio, ConversionOptions } from '../utils/api';
import { AudioFile } from '../types';

export const useAudioConversion = () => {
  const {
    file,
    conversionSettings,
    setUploading,
    setProcessing,
    setCurrentStage,
    updateStageStatus,
    setError,
    setAudioFile,
    reset
  } = useUploadStore();

  const [isConverting, setIsConverting] = useState(false);

  const convertToAudio = useCallback(async () => {
    if (!file) return;

    setIsConverting(true);
    setError(null);

    try {
      // Stage 1: Upload
      setUploading(true);
      setCurrentStage('upload');
      updateStageStatus('upload', 'in_progress');
      
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate upload time
      updateStageStatus('upload', 'completed');

      // Stage 2: Text Extraction
      setUploading(false);
      setProcessing(true);
      setCurrentStage('extraction');
      updateStageStatus('extraction', 'in_progress');
      
      // Stage 3: Script Generation
      setTimeout(() => {
        updateStageStatus('extraction', 'completed');
        setCurrentStage('script');
        updateStageStatus('script', 'in_progress');
      }, 1000);

      // Stage 4: Audio Creation
      setTimeout(() => {
        updateStageStatus('script', 'completed');
        setCurrentStage('audio');
        updateStageStatus('audio', 'in_progress');
      }, 3000);

      // Stage 5: Finalize
      setTimeout(() => {
        updateStageStatus('audio', 'completed');
        setCurrentStage('finalize');
        updateStageStatus('finalize', 'in_progress');
      }, 8000);

      // Prepare conversion options
      const options: ConversionOptions = {
        speaker1Name: conversionSettings.speaker1.name || undefined,
        speaker1Voice: conversionSettings.speaker1.voice,
        speaker2Name: conversionSettings.speaker2.name || undefined,
        speaker2Voice: conversionSettings.speaker2.voice,
        tone: conversionSettings.tone
      };

      // Make the API call
      const audioBlob = await uploadPdfForAudio(file, options, (progress: number) => {
        // Progress is handled by the stages above
      });

      // Create audio file object
      const audioUrl = URL.createObjectURL(audioBlob);
      const audioFile: AudioFile = {
        id: Date.now().toString(),
        filename: file.name,
        originalPdf: file.name,
        duration: 0, // Will be set when audio loads
        size: audioBlob.size,
        url: audioUrl,
        createdAt: new Date(),
      };

      updateStageStatus('finalize', 'completed');
      setAudioFile(audioFile);
      setProcessing(false);

    } catch (error) {
      console.error('Conversion error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred during processing');
      
      // Mark current stage as error
      const currentStageId = useUploadStore.getState().currentStage;
      if (currentStageId) {
        updateStageStatus(currentStageId, 'error');
      }
    } finally {
      setIsConverting(false);
      setUploading(false);
      setProcessing(false);
    }
  }, [file, conversionSettings, setUploading, setProcessing, setCurrentStage, updateStageStatus, setError, setAudioFile]);

  const resetConversion = useCallback(() => {
    reset();
    setIsConverting(false);
  }, [reset]);

  return {
    convertToAudio,
    resetConversion,
    isConverting
  };
};