import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Mic, Volume2 } from 'lucide-react';
import { ConversionSettings, SpeakerConfig } from '../types';
import { getAvailableVoices, getTonePresets, TonesResponse } from '../utils/api';

interface SpeakerConfigProps {
  settings: ConversionSettings;
  onChange: (settings: ConversionSettings) => void;
}

export const SpeakerConfigComponent: React.FC<SpeakerConfigProps> = ({ settings, onChange }) => {
  const [voices, setVoices] = useState<string[]>([]);
  const [tones, setTones] = useState<TonesResponse['tones']>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [voicesData, tonesData] = await Promise.all([
          getAvailableVoices(),
          getTonePresets()
        ]);
        
        setVoices(voicesData.voices);
        setTones(tonesData.tones);
        
        // Set defaults if not already set
        if (!settings.speaker1.name || !settings.speaker2.name) {
          onChange({
            ...settings,
            speaker1: {
              name: settings.speaker1.name || generateRandomName(),
              voice: settings.speaker1.voice || voicesData.default_voice1
            },
            speaker2: {
              name: settings.speaker2.name || generateRandomName(),
              voice: settings.speaker2.voice || voicesData.default_voice2
            },
            tone: settings.tone || tonesData.default
          });
        }
      } catch (error) {
        console.error('Failed to load configuration data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const generateRandomName = (): string => {
    const names = [
      'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn',
      'Blake', 'Sage', 'Drew', 'Parker', 'Emery', 'Rowan', 'Finley', 'Hayden'
    ];
    return names[Math.floor(Math.random() * names.length)];
  };

  const updateSpeaker = (speakerKey: 'speaker1' | 'speaker2', updates: Partial<SpeakerConfig>) => {
    onChange({
      ...settings,
      [speakerKey]: {
        ...settings[speakerKey],
        ...updates
      }
    });
  };

  const updateTone = (tone: string) => {
    onChange({
      ...settings,
      tone
    });
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-4">
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <Users className="h-5 w-5 text-primary mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Customize Your Podcast</h3>
        </div>

        <div className="space-y-6">
          {/* Speaker 1 Configuration */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <Mic className="h-4 w-4 text-primary mr-2" />
              <h4 className="font-medium text-gray-900">
                {['recursive', 'single_speaker'].includes(settings.tone) ? 'Narrator' : 'Speaker 1'}
              </h4>
              {['recursive', 'single_speaker'].includes(settings.tone) && (
                <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                  Single Speaker Mode
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={settings.speaker1.name}
                  onChange={(e) => updateSpeaker('speaker1', { name: e.target.value })}
                  placeholder={['recursive', 'single_speaker'].includes(settings.tone) ? 'Enter narrator name' : 'Enter speaker name'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Voice
                </label>
                <select
                  value={settings.speaker1.voice}
                  onChange={(e) => updateSpeaker('speaker1', { voice: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  {voices.map((voice) => (
                    <option key={voice} value={voice}>
                      {voice}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Speaker 2 Configuration - Hidden for single-speaker modes */}
          {!['recursive', 'single_speaker'].includes(settings.tone) && (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Volume2 className="h-4 w-4 text-primary mr-2" />
                <h4 className="font-medium text-gray-900">Speaker 2</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={settings.speaker2.name}
                    onChange={(e) => updateSpeaker('speaker2', { name: e.target.value })}
                    placeholder="Enter speaker name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Voice
                  </label>
                  <select
                    value={settings.speaker2.voice}
                    onChange={(e) => updateSpeaker('speaker2', { voice: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    {voices.map((voice) => (
                      <option key={voice} value={voice}>
                        {voice}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
          
          {/* Single Speaker Mode Info */}
          {settings.tone === 'recursive' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4"
            >
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold text-purple-900 text-sm mb-1">
                    Recursive Deep Dive Mode
                  </h4>
                  <p className="text-purple-700 text-xs leading-relaxed">
                    This creates a single-speaker explanation that progressively deepens understanding through multiple layers:
                    <br />• 30s foundation (ELI5 level)
                    <br />• 1min framework (high school level)
                    <br />• 2min expansion (college level)
                    <br />• 2min expert perspective
                    <br />• Includes background research for deeper context
                  </p>
                </div>
              </div>
            </motion.div>
          )}
          
          {settings.tone === 'single_speaker' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4"
            >
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold text-blue-900 text-sm mb-1">
                    Single Speaker Mode
                  </h4>
                  <p className="text-blue-700 text-xs leading-relaxed">
                    Creates a professional single-narrator audio overview that covers the document's key points in an engaging, comprehensive manner. Perfect for:
                    <br />• Executive summaries
                    <br />• Professional presentations
                    <br />• Accessibility compliance
                    <br />• Clean, consistent narration
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tone Preset Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Conversation Style
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(tones).map(([key, tone]) => (
                <button
                  key={key}
                  onClick={() => updateTone(key)}
                  className={`p-3 text-left border rounded-lg transition-all ${
                    settings.tone === key
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium text-sm">{tone.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{tone.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};