import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Clock, Users } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16 px-4"
    >
      <div className="max-w-4xl mx-auto">
        {/* Main headline */}
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Transform any{' '}
          <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            PDF
          </span>{' '}
          into an engaging{' '}
          <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            podcast conversation
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          AI-powered conversations between two speakers make your documents come alive. 
          Perfect for learning on the go.
        </p>

        {/* Value propositions */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center space-x-2 text-gray-600"
          >
            <Clock className="h-5 w-5 text-primary" />
            <span className="font-medium">Save time</span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center space-x-2 text-gray-600"
          >
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-medium">Stay informed</span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center space-x-2 text-gray-600"
          >
            <Users className="h-5 w-5 text-primary" />
            <span className="font-medium">Learn while you move</span>
          </motion.div>
        </div>

        {/* Demo stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-50 rounded-lg p-6 inline-block"
        >
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-600">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">2-5</div>
              <div>Minutes</div>
            </div>
            <div className="h-8 w-px bg-gray-300"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">AI</div>
              <div>Powered</div>
            </div>
            <div className="h-8 w-px bg-gray-300"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">10MB</div>
              <div>Max Size</div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};