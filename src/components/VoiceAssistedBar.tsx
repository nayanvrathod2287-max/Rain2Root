import React, { useState } from 'react';
import { Volume2, VolumeX, Play, Square, Sparkles } from 'lucide-react';
import { Language, AppTheme } from '../types';
import { speak, stopSpeaking } from '../utils/speech';

interface VoiceAssistedBarProps {
  lang: Language;
  theme: AppTheme;
  pageSummaryText: string;
  activeSectionName: string;
}

export const VoiceAssistedBar: React.FC<VoiceAssistedBarProps> = ({
  lang,
  theme,
  pageSummaryText,
  activeSectionName,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const isContrastLight = theme === 'contrast-light-black';

  const handlePlay = () => {
    if (isPlaying) {
      stopSpeaking();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      speak(pageSummaryText, lang, () => {
        setIsPlaying(false);
      });
    }
  };

  const getButtonText = () => {
    if (isPlaying) {
      return lang === 'mr' ? 'आवाज थांबवा (Stop)' : lang === 'hi' ? 'आवाज रोकें' : 'Stop Audio';
    }
    return lang === 'mr'
      ? `हा भाग ऐका: ${activeSectionName}`
      : lang === 'hi'
      ? `यह भाग सुनें: ${activeSectionName}`
      : `Listen to: ${activeSectionName}`;
  };

  return (
    <div
      id="voice-assisted-banner"
      className={`w-full py-2.5 px-4 border-b transition-all flex flex-wrap items-center justify-between gap-3 ${
        isContrastLight
          ? 'bg-black text-white border-2 border-black'
          : 'bg-emerald-800/90 text-white border-emerald-700 backdrop-blur-sm'
      }`}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isPlaying
              ? 'bg-amber-400 text-black animate-pulse'
              : isContrastLight
              ? 'bg-white text-black font-black'
              : 'bg-emerald-600 text-white'
          }`}
        >
          {isPlaying ? <Volume2 className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
        </div>

        <div>
          <span className="text-xs uppercase font-bold tracking-wider opacity-80 block">
            {lang === 'mr' ? 'शेतकरी आवाज सहाय्यक' : lang === 'hi' ? 'किसान वॉइस असिस्टेंट' : 'Farmer Audio Assistant'}
          </span>
          <span className="text-sm font-semibold">
            {lang === 'mr'
              ? 'मोठ्याने ऐकण्यासाठी उजवीकडील बटण दाबा'
              : lang === 'hi'
              ? 'बोलकर सुनने के लिए बटन दबाएं'
              : 'Tap button to hear instructions in your regional language'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          id="btn-read-aloud"
          onClick={handlePlay}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold shadow-md transition-all active:scale-95 ${
            isPlaying
              ? 'bg-red-500 hover:bg-red-600 text-white ring-2 ring-white/50'
              : isContrastLight
              ? 'bg-white hover:bg-slate-100 text-black ring-2 ring-white font-black'
              : 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 ring-2 ring-emerald-200/50'
          }`}
        >
          {isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          <span>{getButtonText()}</span>
        </button>
      </div>
    </div>
  );
};
