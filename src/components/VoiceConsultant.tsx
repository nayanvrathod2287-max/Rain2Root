import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Send, 
  Volume2, 
  VolumeX, 
  Trash2, 
  Bot, 
  User, 
  Sparkles, 
  WifiOff, 
  Wifi,
  HelpCircle,
  Clock
} from 'lucide-react';
import { Language, AppTheme, TextScale, ChatMessage } from '../types';
import { t, getTranslation } from '../utils/translations';
import { startVoiceRecognition, isSpeechRecognitionSupported, speak, stopSpeaking } from '../utils/speech';

interface VoiceConsultantProps {
  lang: Language;
  theme: AppTheme;
  textScale: TextScale;
  isOnline: boolean;
}

export const VoiceConsultant: React.FC<VoiceConsultantProps> = ({
  lang,
  theme,
  textScale,
  isOnline,
}) => {
  const isContrastLight = theme === 'contrast-light-black';
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text:
        lang === 'mr'
          ? 'नमस्कार शेतकरी मित्र! मी उलट छत्री जल सल्लागार आहे. बोअरवेल, विहीर पुनर्भरण, पाण्याचा निचरा किंवा गाळणी बद्दल खालील माईक दाबून मराठीत विचारा!'
          : lang === 'hi'
          ? 'नमस्ते किसान मित्र! मैं उल्टा छाता जल सलाहकार हूँ। भूजल पुनर्भरण, बोरवेल या फिल्टर संबंधी कोई भी प्रश्न बोलकर या लिखकर पूछें।'
          : 'Welcome Farmer Friend! I am your Inverted Umbrella Water & Recharge Consultant. Tap the microphone and speak your query in your language.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'expert_rule_engine',
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentlyPlayingAudioId, setCurrentlyPlayingAudioId] = useState<string | null>(null);

  const stopRecognitionRef = useRef<(() => void) | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const quickQuestions: Record<Language, string[]> = {
    mr: [
      '🏢 २० फ्लॅट्सच्या इमारतीसाठी रेन वॉटर हार्वेस्टिंग व कर सवलत कशी मिळते?',
      '🏠 १५०० चौ.फूट घराच्या गच्चीचे पाणी पिण्यासाठी साठवता येईल का?',
      '🌾 शेतातील बोअरवेलमध्ये गाळ साचू नये म्हणून कोणती गाळणी लावावी?',
      '💧 पहिल्या पावसाचे पाणी (First Flush) का वेगळे करावे?',
    ],
    hi: [
      '🏢 हाउसिंग सोसाइटी के लिए रूफटॉप रेनवाटर हार्वेस्टिंग और टैक्स छूट कैसे पाएं?',
      '🏠 1500 वर्ग फुट मकान की छत का पानी टैंक में कैसे जमा करें?',
      '🌾 खेत के बोरवेल में गाद जमा न हो इसके लिए क्या करें?',
      '💧 फर्स्ट फ्लश वाल्व कैसे काम करता है?',
    ],
    en: [
      '🏢 How to implement rooftop harvesting for a 20-flat society and get tax rebate?',
      '🏠 Can we store 1,500 sq ft house terrace rainwater in our underground tank?',
      '🌾 How does Inverted Umbrella prevent farm borewell silt choking?',
      '💧 What is the benefit of the hydrodynamic first-flush diverter?',
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

    setErrorMessage('');
    const stopFn = startVoiceRecognition(
      lang,
      (transcript, isFinal) => {
        setInputQuery(transcript);
        if (isFinal) {
          setIsListening(false);
        }
      },
      (err) => {
        setErrorMessage(err);
        setIsListening(false);
      },
      () => {
        setIsListening(true);
      },
      () => {
        setIsListening(false);
      }
    );

    stopRecognitionRef.current = stopFn;
  };

  const handleSendMessage = async (textToSend?: string) => {
    const queryText = (textToSend || inputQuery).trim();
    if (!queryText || isLoading) return;

    // Add User Message
    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryText,
          language: lang,
          farmContext: {
            catchmentArea: 'Farm Land & Farm Shed',
            region: 'Maharashtra Rural Zone',
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      const assistantText = data.advice || data.fallbackAdvice || 'सल्ला उपलब्ध नाही.';

      const assistantMsg: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'assistant',
        text: assistantText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source || 'gemini_ai',
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Automatically speak reply if brief or user asked
      speak(assistantText, lang);
    } catch (err: any) {
      console.warn('Consult error, using offline knowledge base:', err);

      // Offline instant intelligent fallback
      const offlineFallback =
        lang === 'mr'
          ? `**उलट छत्री ऑफलाइन सल्लागार (Offline Advisory):**\n- पावसाचे पाणी बोअरवेलमध्ये सोडण्यापूर्वी ३-स्तरीय गाळणी (मोठे खडे, बारीक खडी, जाड वाळू व चारकोल) बसवणे आवश्यक आहे.\n- व्हॉर्टेक्स चेंबरमुळे माती ९४% वेगळी होते.\n- अटल भूजल योजनेअंतर्गत ग्रामपंचायतीमध्ये ६५% अनुदानाचा लाभ घेता येतो.`
          : `**Inverted Umbrella Offline Advisory:**\n- Pass all rainwater through our 4-tier graded filter media before aquifer injection.\n- Hydrodynamic vortex chamber eliminates silt choking without electricity.\n- Eligible under Atal Bhujal Yojana subsidy scheme.`;

      const fallbackMsg: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'assistant',
        text: offlineFallback,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'expert_rule_engine',
      };

      setMessages((prev) => [...prev, fallbackMsg]);
      speak(offlineFallback, lang);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAudio = (msgId: string, text: string) => {
    if (currentlyPlayingAudioId === msgId) {
      stopSpeaking();
      setCurrentlyPlayingAudioId(null);
    } else {
      setCurrentlyPlayingAudioId(msgId);
      speak(text, lang, () => {
        setCurrentlyPlayingAudioId(null);
      });
    }
  };

  return (
    <div id="voice-consultant-view" className="space-y-5">
      {/* Title & Microphone Banner */}
      <div
        className={`p-5 sm:p-6 rounded-2xl border transition-all shadow-sm ${
          isContrastLight
            ? 'bg-white border-2 border-black text-black'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isContrastLight ? 'bg-black text-white' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              <Bot className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                  {getTranslation('consultTitle', lang)}
                </h2>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-cyan-100 text-cyan-900 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-600" />
                  <span>AI + Offline</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium opacity-85 mt-0.5">
                {getTranslation('consultSub', lang)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMessages([])}
              className="p-2 rounded-xl border border-slate-300 text-slate-600 hover:text-red-600 hover:bg-slate-100 transition-all text-xs font-bold flex items-center gap-1"
              title="Clear chat"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">{getTranslation('clearChat', lang)}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Questions Chips */}
      <div className="space-y-1.5">
        <span className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>{getTranslation('quickQuestionsLabel', lang)}</span>
        </span>
        <div className="flex flex-wrap gap-2">
          {quickQuestions[lang]?.map((q, idx) => (
            <button
              key={idx}
              id={`quick-q-${idx}`}
              onClick={() => handleSendMessage(q)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all text-left ${
                isContrastLight
                  ? 'bg-white border-2 border-black text-black hover:bg-slate-100'
                  : 'bg-emerald-50/80 hover:bg-emerald-100 text-emerald-950 border-emerald-300 shadow-xs'
              }`}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div
        className={`rounded-2xl border p-4 sm:p-6 min-h-[360px] max-h-[500px] overflow-y-auto space-y-4 shadow-inner ${
          isContrastLight ? 'bg-slate-50 border-2 border-black' : 'bg-slate-100/70 border-slate-200'
        }`}
      >
        {messages.map((msg) => {
          const isAssistant = msg.sender === 'assistant';
          const isPlayingThis = currentlyPlayingAudioId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                isAssistant ? 'justify-start' : 'justify-end'
              }`}
            >
              {isAssistant && (
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-black text-xs ${
                    isContrastLight ? 'bg-black text-white' : 'bg-emerald-700 text-white'
                  }`}
                >
                  <Bot className="w-5 h-5" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl shadow-xs space-y-2 ${
                  isAssistant
                    ? isContrastLight
                      ? 'bg-white border-2 border-black text-black'
                      : 'bg-white border border-slate-200 text-slate-900'
                    : isContrastLight
                    ? 'bg-black text-white border-2 border-black'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                <div className="text-xs sm:text-sm whitespace-pre-wrap font-medium leading-relaxed">
                  {msg.text}
                </div>

                <div className="flex items-center justify-between text-[10px] opacity-75 pt-1 border-t border-current/15">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{msg.timestamp}</span>
                    {msg.source && (
                      <span className="ml-1 font-bold">
                        ({msg.source === 'gemini_ai' ? 'Gemini AI' : 'Offline Rule Base'})
                      </span>
                    )}
                  </span>

                  {isAssistant && (
                    <button
                      onClick={() => handlePlayAudio(msg.id, msg.text)}
                      className={`px-2 py-0.5 rounded font-black flex items-center gap-1 transition-all ${
                        isPlayingThis
                          ? 'bg-amber-400 text-black animate-pulse'
                          : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                      }`}
                      title="Listen audio"
                    >
                      {isPlayingThis ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                      <span>{isPlayingThis ? 'थांबवा' : 'ऐका'}</span>
                    </button>
                  )}
                </div>
              </div>

              {!isAssistant && (
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-black text-xs ${
                    isContrastLight ? 'bg-black text-white' : 'bg-slate-800 text-white'
                  }`}
                >
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
              <span>{lang === 'mr' ? 'उलट छत्री सल्लागार विचार करत आहे...' : 'Consulting hydrologist AI...'}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Voice & Text Input Form */}
      <div
        className={`p-3 sm:p-4 rounded-2xl border transition-all ${
          isContrastLight
            ? 'bg-white border-2 border-black'
            : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        {errorMessage && (
          <div className="mb-2 p-2 rounded-lg bg-red-100 border border-red-300 text-red-900 text-xs font-bold">
            {errorMessage}
          </div>
        )}

        {isListening && (
          <div className="mb-2 p-2.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-between animate-pulse">
            <span className="flex items-center gap-2">
              <Mic className="w-4 h-4" />
              <span>{getTranslation('micListening', lang)}</span>
            </span>
            <button
              onClick={handleToggleMic}
              className="px-2 py-0.5 rounded bg-black text-white text-xs font-bold"
            >
              {getTranslation('micStop', lang)}
            </button>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          {/* Big Voice Button (STT) for Farmers */}
          <button
            id="btn-voice-mic"
            type="button"
            onClick={handleToggleMic}
            className={`w-14 h-12 rounded-xl flex items-center justify-center font-black transition-all shrink-0 active:scale-95 ${
              isListening
                ? 'bg-red-600 text-white ring-4 ring-red-400/50 animate-pulse'
                : isContrastLight
                ? 'bg-black text-white hover:bg-slate-900 border-2 border-black'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white'
            }`}
            title="Tap to speak in Marathi, Hindi or English"
          >
            {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          {/* Text Input */}
          <input
            id="input-consult-text"
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={
              lang === 'mr'
                ? 'येथे लिहा किंवा माईक दाबून बोला...'
                : lang === 'hi'
                ? 'यहाँ लिखें या माइक दबाकर बोलें...'
                : 'Type query or speak using mic...'
            }
            className={`flex-1 px-4 py-3 rounded-xl font-bold text-sm sm:text-base border focus:outline-none focus:ring-2 ${
              isContrastLight
                ? 'border-2 border-black bg-white text-black focus:ring-black'
                : 'border-slate-300 bg-slate-50 text-slate-900 focus:ring-emerald-500'
            }`}
          />

          {/* Send Button */}
          <button
            id="btn-send-consult"
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className={`px-4 sm:px-6 h-12 rounded-xl font-black text-sm flex items-center gap-2 transition-all shrink-0 active:scale-95 disabled:opacity-50 ${
              isContrastLight
                ? 'bg-black text-white hover:bg-slate-900 border-2 border-black'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">{getTranslation('askBtn', lang)}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
