import React from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { UploadArea } from './components/UploadArea';
import { SpeakerConfigComponent } from './components/SpeakerConfig';
import { ProcessingSteps } from './components/ProcessingSteps';
import { AudioPlayer } from './components/AudioPlayer';
import { useUploadStore } from './stores/useUploadStore';
import { useAudioConversion } from './hooks/useAudioConversion';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

function App() {
  const { file, audioFile, isProcessing, isUploading, conversionSettings, setConversionSettings } = useUploadStore();
  const { convertToAudio, resetConversion, isConverting } = useAudioConversion();

  const handleStartConversion = () => {
    convertToAudio();
  };

  const handleNewConversion = () => {
    resetConversion();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section - only show when no file is selected */}
        {!file && !audioFile && <HeroSection />}

        {/* Upload Area */}
        <div className="py-8">
          <UploadArea />
        </div>

        {/* Speaker Configuration - Show when file is uploaded but not processing */}
        {file && !audioFile && !isProcessing && !isUploading && (
          <div className="py-4">
            <SpeakerConfigComponent 
              settings={conversionSettings}
              onChange={setConversionSettings}
            />
          </div>
        )}

        {/* Start Processing Button */}
        {file && !audioFile && !isProcessing && !isUploading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center pb-8"
          >
            <button
              onClick={handleStartConversion}
              disabled={isConverting}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary to-purple-500 text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              Generate Podcast
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <p className="text-sm text-gray-500 mt-2">
              This will take 2-5 minutes to complete
            </p>
          </motion.div>
        )}

        {/* Processing Steps */}
        <ProcessingSteps />

        {/* Audio Player */}
        {audioFile && <AudioPlayer audioFile={audioFile} />}

        {/* New Conversion Button */}
        {audioFile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8"
          >
            <button
              onClick={handleNewConversion}
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Convert Another PDF
            </button>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p className="text-sm">
              Powered by AI • Convert PDFs to engaging podcast conversations
            </p>
            <p className="text-xs mt-2">
              Built with React, TypeScript, and Tailwind CSS
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
