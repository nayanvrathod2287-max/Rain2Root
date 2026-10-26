import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  Bot, 
  Building2, 
  Home, 
  Tractor, 
  Droplets 
} from 'lucide-react';
import { Language, AppTheme, PropertyType } from '../types';
import { startVoiceRecognition, speak, stopSpeaking } from '../utils/speech';

interface CustomPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  theme: AppTheme;
  initialPropertyType?: PropertyType;
}

export const CustomPromptModal: React.FC<CustomPromptModalProps> = ({
  isOpen,
  onClose,
  lang,
  theme,
  initialPropertyType = 'house',
}) => {
  if (!isOpen) return null;

  const isContrastLight = theme === 'contrast-light-black';
  const [promptText, setPromptText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [responseHtml, setResponseHtml] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<PropertyType>(initialPropertyType);

  const stopRecognitionRef = useRef<(() => void) | null>(null);

  const promptSuggestions: Record<PropertyType, { title: string; prompt: Record<Language, string> }[]> = {
    building: [
      {
        title: '🏢 Society Setup & Tax Rebate',
        prompt: {
          mr: 'आमच्या २० फ्लॅट्सच्या इमारतीसाठी (५००० चौ.फूट टेरेस) रेन वॉटर हार्वेस्टिंगचा खर्च किती येईल आणि महापालिकेकडून मालमत्ता कर सवलत कशी मिळते?',
          hi: 'हमारी 20 फ्लैट्स की सोसायटी के लिए रूफटॉप रेनवाटर हार्वेस्टिंग की लागत और नगर निगम टैक्स छूट की जानकारी दें।',
          en: 'What is the cost and design for rainwater harvesting in our 20-flat society (5,000 sq ft terrace) and how to get municipal property tax rebate?',
        },
      },
      {
        title: '💧 Sump & Borewell Filter',
        prompt: {
          mr: 'इमारतीच्या गच्चीचे पाणी थेट तळघरातील पाण्याच्या टाकीत (Sump) साठवण्यासाठी कोणता २-स्तरीय फिल्टर लावावा?',
          hi: 'इमारत की छत का पानी भूमिगत वाटर टैंक में सुरक्षित जमा करने हेतु कौन सा फिल्टर लगाएं?',
          en: 'Which dual-chamber filter is recommended to divert rooftop rainwater into our underground storage sump?',
        },
      },
    ],
    house: [
      {
        title: '🏠 House 1200 sq.ft Terrace',
        prompt: {
          mr: 'माझ्या १५०० चौरस फूट घराच्या गच्चीवरून वर्षाला किती लिटर पाणी मिळेल आणि यासाठी किती आकाराची फिल्टर कुंडी लागेल?',
          hi: 'मेरे 1500 वर्ग फुट मकान की छत से साल में कितना पानी मिलेगा और कौन सा कॉम्पैक्ट फिल्टर लगेगा?',
          en: 'How many liters of water can be harvested from a 1,500 sq ft house terrace and what compact filter is suitable?',
        },
      },
      {
        title: '🚰 Drinking Quality Check',
        prompt: {
          mr: 'घराच्या छतावरील पाणी गाळून पिण्यासाठी किंवा स्वयंपाकासाठी सुरक्षित आहे का? ते शुद्ध कसे करावे?',
          hi: 'क्या मकान की छत का वर्षा जल पीने के लिए सुरक्षित बनाया जा सकता है? इसे कैसे शुद्ध करें?',
          en: 'Is filtered rooftop rainwater safe for household drinking and what post-filtration is needed?',
        },
      },
    ],
    commercial: [
      {
        title: '🏫 School / Factory Rooftop',
        prompt: {
          mr: 'शाळा किंवा कारखान्याच्या १०,००० चौ.फूट पत्र्याच्या शेडवरून पाणी जिरवण्यासाठी भूजल पुनर्भरण खड्डा (Recharge Pit) कसा बनवावा?',
          hi: 'स्कूल या कारखाने की 10,000 वर्ग फुट टीन शेड के लिए भूजल पुनर्भरण गड्ढा (Recharge Pit) कैसे बनाएं?',
          en: 'How to design a groundwater recharge pit for a 10,000 sq ft school or commercial metal sheet roof?',
        },
      },
    ],
    farm: [
      {
        title: '🌾 Farm Borewell Silt Solution',
        prompt: {
          mr: 'आमच्या शेतातील बोअरवेल पावसाळ्यात चोक होऊ नये म्हणून उलट छत्री आणि व्हॉर्टेक्स कुंडी कशी काम करते?',
          hi: 'खेत के बोरवेल को कीचड़ और सिल्ट से बचाने के लिए उल्टा छाता और चक्रवात कुंडी कैसे लगाएं?',
          en: 'How does the Inverted Umbrella vortex chamber prevent farm borewell silt choking during monsoons?',
        },
      },
    ],
  };

  const handleToggleMic = () => {
    if (isListening) {
      if (stopRecognitionRef.current) {
        stopRecognitionRef.current();
        stopRecognitionRef.current = null;
      }
      setIsListening(false);
      return;
    }

    const stopFn = startVoiceRecognition(
      lang,
      (transcript, isFinal) => {
        setPromptText(transcript);
        if (isFinal) {
          setIsListening(false);
        }
      },
      () => setIsListening(false),
      () => setIsListening(true),
      () => setIsListening(false)
    );
    stopRecognitionRef.current = stopFn;
  };

  const handleSubmitPrompt = async (textToRun?: string) => {
    const q = (textToRun || promptText).trim();
    if (!q || isLoading) return;

    setIsLoading(true);
    setResponseHtml(null);

    try {
      const res = await fetch('/api/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          language: lang,
          farmContext: {
            catchmentArea: selectedCategory,
            region: 'Urban & Rural Maharashtra',
          },
        }),
      });

      const data = await res.json();
      const answer = data.advice || data.fallbackAdvice || 'सल्ला उपलब्ध नाही.';
      setResponseHtml(answer);

      // Speak answer
      speak(answer, lang, () => setIsPlayingAudio(false));
      setIsPlayingAudio(true);
    } catch (e) {
      const fallback =
        lang === 'mr'
          ? `**जलतज्ज्ञ सल्ला (Hydrologist Advisory):**\n- **इमारती व घरे:** गच्चीवरील पावसाचे पाणी फर्स्ट-फ्लश गाळणीतून अंडरग्राउंड टाकीत किंवा बोअरवेल पुनर्भरण शाफ्टमध्ये सोडू शकता. यामुळे दरवर्षी टँकरच्या खर्चात ७०% बचत होते.\n- **शासकीय नियम:** अनेक महानगरपालिकांमध्ये (PMC, BMC, PCMC) रेन वॉटर हार्वेस्टिंग करणाऱ्या सोसायट्यांना मालमत्ता करात ५% ते १०% सूट दिली जाते.`
          : `**Rooftop & Building Advisory:**\n- Divert terrace runoff through our dual-stage first flush filter directly into your underground water storage sump or injection recharge pit.\n- Most Municipal Corporations provide 5% to 10% annual Property Tax rebates for functional rainwater harvesting.`;
      setResponseHtml(fallback);
      speak(fallback, lang, () => setIsPlayingAudio(false));
      setIsPlayingAudio(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      stopSpeaking();
      setIsPlayingAudio(false);
    } else if (responseHtml) {
      setIsPlayingAudio(true);
      speak(responseHtml, lang, () => setIsPlayingAudio(false));
    }
  };

  const handleCopy = () => {
    if (responseHtml) {
      navigator.clipboard.writeText(responseHtml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div
        className={`w-full max-w-2xl rounded-3xl border-2 shadow-2xl p-5 sm:p-7 space-y-5 my-auto transition-all ${
          isContrastLight
            ? 'bg-white border-2 border-black text-black'
            : 'bg-white border-slate-300 text-slate-900'
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b pb-3.5 border-current/15">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-sm">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
                  AI Hydrologist Prompt
                </span>
                <span className="text-xs font-bold text-slate-500">
                  House • Building • Farm
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black mt-0.5">
                {lang === 'mr'
                  ? 'तुमचा प्रश्न किंवा प्रॉम्प्ट विचारा'
                  : lang === 'hi'
                  ? 'अपना कस्टम प्रॉम्प्ट या प्रश्न पूछें'
                  : 'Give Your Custom Prompt'}
              </h3>
            </div>
          </div>

          <button
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="p-2 rounded-xl bg-black/5 hover:bg-black/10 text-current transition-all"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Selector Tabs: Building, House, Commercial, Farm */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 border border-slate-200">
          {[
            { id: 'house', label: lang === 'mr' ? '🏠 घर / बंगला' : '🏠 House', icon: Home },
            { id: 'building', label: lang === 'mr' ? '🏢 इमारत / सोसायटी' : '🏢 Building', icon: Building2 },
            { id: 'commercial', label: lang === 'mr' ? '🏫 शाळा / संकुल' : '🏫 School/Office', icon: Droplets },
            { id: 'farm', label: lang === 'mr' ? '🌾 शेत / जमीन' : '🌾 Farm', icon: Tractor },
          ].map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id as PropertyType)}
                className={`flex-1 min-w-[120px] py-1.5 px-2.5 rounded-xl font-bold text-xs transition-all text-center ${
                  isSelected
                    ? isContrastLight
                      ? 'bg-black text-white shadow-sm'
                      : 'bg-emerald-700 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-white/80'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* One-Click Prompt Suggestions */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
            {lang === 'mr' ? 'उदाहरणे (क्लिक करा):' : 'Suggested Prompts (Tap to ask):'}
          </span>
          <div className="flex flex-col gap-1.5">
            {promptSuggestions[selectedCategory]?.map((sug, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  const txt = sug.prompt[lang] || sug.prompt.en;
                  setPromptText(txt);
                  handleSubmitPrompt(txt);
                }}
                className={`w-full p-2.5 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                  isContrastLight
                    ? 'bg-white border-2 border-black text-black hover:bg-slate-100'
                    : 'bg-slate-50 hover:bg-emerald-50 text-slate-800 border-slate-200 hover:border-emerald-300'
                }`}
              >
                <span className="font-bold">{sug.prompt[lang] || sug.prompt.en}</span>
                <span className="text-[10px] font-black text-emerald-700 uppercase shrink-0 ml-2">
                  Ask →
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Prompt Input & Voice Controls */}
        <div className="space-y-2">
          {isListening && (
            <div className="p-2.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-black flex items-center justify-between animate-pulse">
              <span className="flex items-center gap-2">
                <Mic className="w-4 h-4" />
                <span>
                  {lang === 'mr' ? 'माईक चालू आहे... स्पष्ट बोला' : 'Listening... speak clearly'}
                </span>
              </span>
              <button
                onClick={handleToggleMic}
                className="px-2 py-0.5 rounded bg-black text-amber-300 text-xs"
              >
                Stop
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleMic}
              className={`w-12 h-12 rounded-xl flex items-center justify-center font-black transition-all shrink-0 ${
                isListening
                  ? 'bg-red-600 text-white ring-4 ring-red-400/50 animate-pulse'
                  : isContrastLight
                  ? 'bg-black text-white border-2 border-black hover:bg-slate-900'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
              title="Speak prompt with mic"
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <input
              type="text"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder={
                lang === 'mr'
                  ? 'येथे तुमचा प्रॉम्प्ट टाइप करा...'
                  : lang === 'hi'
                  ? 'यहाँ अपना प्रश्न टाइप करें...'
                  : 'Type your custom prompt here...'
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmitPrompt();
              }}
              className="flex-1 px-4 py-3 rounded-xl font-bold text-sm border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <button
              type="button"
              onClick={() => handleSubmitPrompt()}
              disabled={!promptText.trim() || isLoading}
              className={`px-4 sm:px-5 h-12 rounded-xl font-black text-sm flex items-center gap-1.5 transition-all shrink-0 disabled:opacity-50 ${
                isContrastLight
                  ? 'bg-black text-white hover:bg-slate-900 border-2 border-black'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white'
              }`}
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">
                {lang === 'mr' ? 'विचारा' : 'Send'}
              </span>
            </button>
          </div>
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-900 text-xs font-bold animate-pulse">
            <Bot className="w-5 h-5 text-emerald-600 animate-spin" />
            <span>
              {lang === 'mr'
                ? 'AI जलतज्ज्ञ तुमच्या प्रॉम्प्टचे विश्लेषण करत आहे...'
                : 'AI Hydrologist analyzing your prompt...'}
            </span>
          </div>
        )}

        {/* Response Box */}
        {responseHtml && (
          <div
            className={`p-4 sm:p-5 rounded-2xl border space-y-3 shadow-inner ${
              isContrastLight ? 'bg-white border-2 border-black' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between border-b pb-2 border-slate-200">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <Bot className="w-4 h-4" />
                <span>{lang === 'mr' ? 'तज्ज्ञ उत्तर (Expert Response):' : 'Expert Response:'}</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleAudio}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                    isPlayingAudio
                      ? 'bg-amber-400 text-black animate-pulse'
                      : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                  }`}
                >
                  {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span>{isPlayingAudio ? 'थांबवा' : 'ऐका'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-all"
                  title="Copy response"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="text-xs sm:text-sm font-medium whitespace-pre-wrap leading-relaxed text-slate-800">
              {responseHtml}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
