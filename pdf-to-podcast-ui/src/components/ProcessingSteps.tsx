import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, Loader, XCircle } from 'lucide-react';
import { useUploadStore } from '../stores/useUploadStore';

export const ProcessingSteps: React.FC = () => {
  const { stages, isProcessing } = useUploadStore();

  if (!isProcessing && !stages.some(stage => stage.status !== 'pending')) {
    return null;
  }

  const getStageIcon = (stage: any) => {
    switch (stage.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Loader className="h-5 w-5 text-primary animate-spin" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-300" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto mt-8"
    >
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center mb-6">
          <div className="w-2 h-2 bg-primary rounded-full mr-3 animate-pulse"></div>
          <h3 className="text-lg font-semibold text-gray-900">Processing Your PDF</h3>
        </div>
        
        <div className="space-y-3">
          {stages.map((stage, index) => (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 ${
                stage.status === 'in_progress' 
                  ? 'bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/30 shadow-md' 
                  : stage.status === 'completed'
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200'
                  : stage.status === 'error'
                  ? 'bg-gradient-to-r from-red-50 to-rose-50 border border-red-200'
                  : 'bg-gray-50 border border-transparent'
              }`}
            >
              <div className={`flex-shrink-0 ${
                stage.status === 'in_progress' ? 'animate-pulse' : ''
              }`}>
                {getStageIcon(stage)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm ${
                  stage.status === 'completed' ? 'text-green-700' :
                  stage.status === 'in_progress' ? 'text-primary' :
                  stage.status === 'error' ? 'text-red-700' :
                  'text-gray-600'
                }`}>
                  {stage.name}
                </p>
                <p className={`text-xs mt-1 ${
                  stage.status === 'completed' ? 'text-green-600' :
                  stage.status === 'in_progress' ? 'text-primary/80' :
                  stage.status === 'error' ? 'text-red-600' :
                  'text-gray-500'
                }`}>
                  {stage.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Enhanced Progress Bar */}
        <div className="mt-8">
          <div className="flex justify-between items-center text-sm font-medium text-gray-700 mb-3">
            <span>Overall Progress</span>
            <span className="text-primary">
              {Math.round((stages.filter(s => s.status === 'completed').length / stages.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-primary via-purple-500 to-primary h-full rounded-full shadow-sm"
              initial={{ width: 0 }}
              animate={{ 
                width: `${(stages.filter(s => s.status === 'completed').length / stages.length) * 100}%` 
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};