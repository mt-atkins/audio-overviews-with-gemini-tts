import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  Download, 
  Share2,
  Clock
} from 'lucide-react';
import { AudioFile } from '../types';

interface AudioPlayerProps {
  audioFile: AudioFile;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioFile }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const skipTime = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = Math.max(0, Math.min(duration, audio.currentTime + seconds));
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = (parseFloat(e.target.value) / 100) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value) / 100;
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const downloadAudio = () => {
    const link = document.createElement('a');
    link.href = audioFile.url;
    link.download = `${audioFile.filename.replace('.pdf', '')}-podcast.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareAudio = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Podcast: ${audioFile.filename}`,
          text: 'Check out this AI-generated podcast from a PDF!',
          url: audioFile.url,
        });
      } catch (err) {
        // Fallback to clipboard
        navigator.clipboard.writeText(audioFile.url);
      }
    } else {
      navigator.clipboard.writeText(audioFile.url);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto mt-8"
    >
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Your Podcast is Ready!</h3>
            <p className="text-sm text-gray-500">
              {audioFile.filename} • {formatTime(duration)}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={downloadAudio}
              className="p-2 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
              title="Download audio"
            >
              <Download className="h-5 w-5" />
            </button>
            <button
              onClick={shareAudio}
              className="p-2 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
              title="Share audio"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Audio element */}
        <audio ref={audioRef} src={audioFile.url} preload="metadata" />

        {/* Waveform placeholder */}
        <div className="mb-6">
          <div className="h-16 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg flex items-center justify-center">
            <div className="flex items-center space-x-1">
              {Array.from({ length: 40 }).map((_, i) => {
                const height = Math.floor(Math.random() * 6) + 2;
                return (
                  <div
                    key={i}
                    className={`w-1 bg-gradient-to-t from-primary to-purple-500 rounded-full transition-all duration-200 ${
                      isPlaying ? 'animate-pulse' : ''
                    }`}
                    style={{
                      height: `${height * 0.25}rem`,
                      opacity: currentTime > 0 && (i / 40) <= (currentTime / duration) ? 1 : 0.3
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <input
            type="range"
            min="0"
            max="100"
            value={(currentTime / duration) * 100 || 0}
            onChange={handleSeek}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => skipTime(-15)}
              className="p-2 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
              title="Skip back 15s"
            >
              <SkipBack className="h-5 w-5" />
            </button>
            
            <button
              onClick={togglePlay}
              className="p-3 bg-gradient-to-r from-primary to-purple-500 text-white rounded-full hover:shadow-lg transition-all transform hover:scale-105"
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6 ml-0.5" />
              )}
            </button>

            <button
              onClick={() => skipTime(15)}
              className="p-2 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
              title="Skip forward 15s"
            >
              <SkipForward className="h-5 w-5" />
            </button>
          </div>

          {/* Playback rate */}
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <select
              value={playbackRate}
              onChange={(e) => handlePlaybackRateChange(parseFloat(e.target.value))}
              className="text-sm bg-transparent border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="0.75">0.75x</option>
              <option value="1">1x</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
            </select>
          </div>

          {/* Volume */}
          <div className="flex items-center space-x-2">
            <Volume2 className="h-4 w-4 text-gray-400" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume * 100}
              onChange={handleVolumeChange}
              className="w-16 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};