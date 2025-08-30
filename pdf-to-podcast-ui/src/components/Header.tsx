import React from 'react';
import { FileAudio, Zap } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-primary to-purple-500 p-2 rounded-lg">
              <FileAudio className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">PDF to Podcast</h1>
              <p className="text-xs text-gray-500">Powered by AI</p>
            </div>
          </div>

          {/* Status indicator */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Zap className="h-4 w-4 text-green-500" />
            <span>Service Online</span>
          </div>
        </div>
      </div>
    </header>
  );
};