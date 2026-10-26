import React from 'react';
import { 
  Umbrella, 
  Volume2, 
  VolumeX, 
  Sun, 
  Moon, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  ShieldCheck, 
  Type,
  Menu
} from 'lucide-react';
import { Language, AppTheme, TextScale } from '../types';
import { t, getTranslation } from '../utils/translations';

interface HeaderProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  theme: AppTheme;
  onThemeToggle: () => void;
  onSelectTheme?: (theme: AppTheme) => void;
  textScale: TextScale;
  onTextScaleChange: (scale: TextScale) => void;
  voiceEnabled: boolean;
  onVoiceToggle: () => void;
  isOnline: boolean;
  pendingSyncCount: number;
  onSyncClick: () => void;
  isSyncing: boolean;
  onOpenAuthModal: () => void;
  isLoggedIn: boolean;
  onOpenCustomPrompt: () => void;
  onToggleMobileMenu?: () => void;
  onNavigateToLogin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onLanguageChange,
  theme,
  onThemeToggle,
  onSelectTheme,
  textScale,
  onTextScaleChange,
  voiceEnabled,
  onVoiceToggle,
  isOnline,
  pendingSyncCount,
  onSyncClick,
  isSyncing,
  onOpenAuthModal,
  isLoggedIn,
  onOpenCustomPrompt,
  onToggleMobileMenu,
  onNavigateToLogin,
}) => {
  const isContrastLight = theme === 'contrast-light-black';

  const handleSelectTheme = (newTheme: AppTheme) => {
    if (onSelectTheme) {
      onSelectTheme(newTheme);
    } else {
      onThemeToggle();
    }
  };

  return (
    <header 
      id="app-header"
      className={`w-full sticky top-0 z-40 border-b transition-colors ${
        isContrastLight
          ? 'bg-white border-b-2 border-black text-black shadow-sm'
          : 'bg-emerald-900 border-emerald-800 text-white shadow-lg'
      }`}
    >
      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Mobile Vertical Menu Hamburger Toggle & Logo */}
        <div className="flex items-center gap-3">
          {onToggleMobileMenu && (
            <button
              id="btn-toggle-mobile-sidebar"
              onClick={onToggleMobileMenu}
              className={`lg:hidden p-2 rounded-xl border transition-all ${
                isContrastLight
                  ? 'bg-black text-white border-black'
                  : 'bg-emerald-950/80 hover:bg-emerald-800 text-white border-emerald-700'
              }`}
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div 
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-inner relative transform rotate-180 shrink-0 ${
              isContrastLight
                ? 'bg-black text-white'
                : 'bg-emerald-500 text-slate-900'
            }`}
            title="Jalsanchay Rain Harvester"
          >
            <Umbrella className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-ping"></span>
          </div>

          <div>
            <h1 className="text-base sm:text-2xl font-black tracking-tight leading-tight flex items-center gap-2">
              <span>{lang === 'mr' ? 'जलसंचय' : lang === 'hi' ? 'जलसंचय' : 'Jalsanchay'}</span>
              <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-extrabold uppercase ${
                isContrastLight
                  ? 'bg-black text-white'
                  : 'bg-emerald-700 text-emerald-100'
              }`}>
                GIS & Recharge
              </span>
            </h1>
            <p className={`text-[11px] sm:text-sm font-medium ${
              isContrastLight ? 'text-black font-semibold' : 'text-emerald-100/90'
            }`}>
              {getTranslation('tagline', lang)}
            </p>
          </div>
        </div>

        {/* Global Controls: Language, High Contrast Light / Emerald, Text Size, Voice, Sync */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Language Switcher */}
          <div 
            id="lang-selector-group"
            className={`inline-flex p-1 rounded-lg border ${
              isContrastLight 
                ? 'bg-slate-100 border-black'
                : 'bg-emerald-950/80 border-emerald-700'
            }`}
          >
            {(['mr', 'hi', 'en'] as Language[]).map((l) => {
              const isActive = lang === l;
              const labels: Record<Language, string> = {
                mr: 'मराठी',
                hi: 'हिंदी',
                en: 'EN',
              };
              return (
                <button
                  key={l}
                  id={`btn-lang-${l}`}
                  onClick={() => onLanguageChange(l)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                    isActive
                      ? isContrastLight
                        ? 'bg-black text-white shadow'
                        : 'bg-emerald-500 text-slate-950 shadow'
                      : isContrastLight
                      ? 'text-black hover:bg-slate-300 font-extrabold'
                      : 'text-emerald-200 hover:text-white hover:bg-emerald-800/50'
                  }`}
                >
                  {labels[l]}
                </button>
              );
            })}
          </div>

          {/* Theme Selector: Contrast Light (Black) | Emerald | Night Calm */}
          <div 
            id="theme-selector-group"
            className={`inline-flex p-0.5 rounded-lg border text-xs font-bold ${
              isContrastLight
                ? 'bg-slate-100 border-black'
                : 'bg-emerald-950/80 border-emerald-700'
            }`}
            title="Select Theme / Contrast"
          >
            <button
              id="theme-btn-contrast-light"
              onClick={() => handleSelectTheme('contrast-light-black')}
              className={`px-2.5 py-1 rounded font-black transition-all flex items-center gap-1.5 ${
                theme === 'contrast-light-black'
                  ? 'bg-black text-white shadow'
                  : isContrastLight
                  ? 'text-black'
                  : 'text-emerald-200 hover:text-white'
              }`}
              title="Contrast Light (Black) Mode"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-black border border-white shrink-0"></span>
              <span>काळा (Black)</span>
            </button>

            <button
              id="theme-btn-emerald"
              onClick={() => handleSelectTheme('emerald-fresh')}
              className={`px-2.5 py-1 rounded font-black transition-all flex items-center gap-1.5 ${
                theme === 'emerald-fresh'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : isContrastLight
                  ? 'text-black hover:bg-slate-200'
                  : 'text-emerald-200 hover:text-white'
              }`}
              title="Emerald Fresh Mode"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0"></span>
              <span>हिरवा (Emerald)</span>
            </button>

            <button
              id="theme-btn-night-calm"
              onClick={() => handleSelectTheme('night-calm')}
              className={`px-2.5 py-1 rounded font-black transition-all flex items-center gap-1.5 ${
                theme === 'night-calm'
                  ? 'bg-slate-800 text-slate-100 shadow'
                  : isContrastLight
                  ? 'text-black hover:bg-slate-200'
                  : 'text-emerald-200 hover:text-white'
              }`}
              title="Night Calm Mode"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shrink-0"></span>
              <span>Night Calm</span>
            </button>

            <button
              id="theme-btn-high-contrast-solar"
              onClick={() => handleSelectTheme('high-contrast-solar')}
              className={`px-2.5 py-1 rounded font-black transition-all flex items-center gap-1.5 ${
                theme === 'high-contrast-solar'
                  ? 'bg-amber-300 text-slate-950 shadow'
                  : isContrastLight
                  ? 'text-black hover:bg-slate-200'
                  : 'text-emerald-200 hover:text-white'
              }`}
              title="High Contrast Solar Mode"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0"></span>
              <span>Solar</span>
            </button>
          </div>

          {/* Text Size Scale Toggle */}
          <div 
            id="text-scale-group"
            className={`flex items-center rounded-lg border p-0.5 ${
              isContrastLight ? 'bg-slate-100 border-black' : 'bg-emerald-950/80 border-emerald-700'
            }`}
            title={getTranslation('textSize', lang)}
          >
            {(['normal', 'large', 'xl'] as TextScale[]).map((scale) => {
              const isActive = textScale === scale;
              const scaleLabel = scale === 'normal' ? 'A' : scale === 'large' ? 'A+' : 'A++';
              return (
                <button
                  key={scale}
                  id={`btn-text-scale-${scale}`}
                  onClick={() => onTextScaleChange(scale)}
                  className={`px-2 py-1 text-xs font-bold rounded transition-all ${
                    isActive
                      ? isContrastLight
                        ? 'bg-black text-white'
                        : 'bg-emerald-500 text-slate-950'
                      : isContrastLight
                      ? 'text-black hover:bg-slate-200'
                      : 'text-emerald-200 hover:text-white'
                  }`}
                >
                  {scaleLabel}
                </button>
              );
            })}
          </div>

          {/* AI Custom Prompt Button */}
          <button
            id="btn-header-custom-prompt"
            onClick={onOpenCustomPrompt}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-black transition-all shadow-xs active:scale-95 ${
              isContrastLight
                ? 'bg-black text-white border-black hover:bg-slate-900'
                : 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 border-amber-400 hover:brightness-105'
            }`}
            title="Ask AI Hydrologist (Custom Prompt)"
          >
            <span className="text-sm">⚡</span>
            <span className="hidden sm:inline">{getTranslation('givePromptBtn', lang)}</span>
          </button>

          {/* Voice Narration Master Button */}
          <button
            id="btn-toggle-voice"
            onClick={onVoiceToggle}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all shadow-sm ${
              voiceEnabled
                ? isContrastLight
                  ? 'bg-black text-white border-black'
                  : 'bg-cyan-500 text-slate-950 border-cyan-400 ring-2 ring-cyan-300/50'
                : isContrastLight
                ? 'bg-slate-100 text-black border-black/40'
                : 'bg-emerald-800/80 text-emerald-300 border-emerald-700'
            }`}
            title="Voice Assistance Toggle"
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4 animate-bounce" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden md:inline">{getTranslation('voiceAssist', lang)}</span>
          </button>

          {/* Online / Offline Sync Indicator */}
          <div className="flex items-center gap-1.5">
            <button
              id="btn-sync-status"
              onClick={onSyncClick}
              disabled={isSyncing}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                !isOnline
                  ? 'bg-red-700 text-white border-red-500 animate-pulse'
                  : pendingSyncCount > 0
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : isContrastLight
                  ? 'bg-black text-white border-black'
                  : 'bg-emerald-800 text-emerald-200 border-emerald-600'
              }`}
              title={isOnline ? 'Online - Click to Sync' : 'Offline Mode - Click to Retry'}
            >
              {isSyncing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : isOnline ? (
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <WifiOff className="w-3.5 h-3.5 text-red-200" />
              )}
              <span className="hidden sm:inline">
                {!isOnline
                  ? 'Offline'
                  : pendingSyncCount > 0
                  ? `${pendingSyncCount} Sync`
                  : 'Live'}
              </span>
            </button>
          </div>

          {/* User Auth / Security Button */}
          <button
            id="btn-user-auth"
            onClick={() => {
              if (onNavigateToLogin) {
                onNavigateToLogin();
              } else {
                onOpenAuthModal();
              }
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all text-xs font-bold ${
              isLoggedIn
                ? isContrastLight
                  ? 'bg-black text-white border-black'
                  : 'bg-emerald-600 text-white border-emerald-400 shadow-sm'
                : isContrastLight
                ? 'bg-slate-100 text-black border-black/40'
                : 'bg-emerald-800/80 text-emerald-300 border-emerald-700 hover:bg-emerald-700'
            }`}
            title="User Profile & Login"
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="hidden md:inline">
              {isLoggedIn ? (lang === 'mr' ? 'खाते' : 'Account') : (lang === 'mr' ? 'लॉगिन' : 'Login')}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
