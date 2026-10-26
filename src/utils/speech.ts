/**
 * Web Speech API helper for Voice-assisted Navigation and Voice-texting
 * Supports Marathi (mr-IN), Hindi (hi-IN), and English (en-IN)
 */

import { Language } from '../types';

interface SpeechRecognitionEventLike {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal: boolean;
      length: number;
    };
    length: number;
  };
}

let currentUtterance: SpeechSynthesisUtterance | null = null;
let activeRecognition: any = null;

export const isSpeechSynthesisSupported = (): boolean => {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
};

export const isSpeechRecognitionSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    'SpeechRecognition' in window ||
    'webkitSpeechRecognition' in window
  );
};

export const stopSpeaking = () => {
  if (isSpeechSynthesisSupported()) {
    try {
      window.speechSynthesis.cancel();
      currentUtterance = null;
    } catch (e) {
      console.warn('Error stopping speech synthesis', e);
    }
  }
};

export const speak = (
  text: string,
  lang: Language = 'mr',
  onEnd?: () => void
) => {
  if (!isSpeechSynthesisSupported()) {
    if (onEnd) onEnd();
    return;
  }

  try {
    stopSpeaking();

    // Strip markdown formatting characters for clean speech
    const cleanText = text
      .replace(/[*_#`~[\]()]/g, ' ')
      .replace(/₹/g, ' रुपये ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) {
      if (onEnd) onEnd();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    currentUtterance = utterance;

    // Set locale
    const langCodeMap: Record<Language, string> = {
      mr: 'mr-IN',
      hi: 'hi-IN',
      en: 'en-IN',
    };
    utterance.lang = langCodeMap[lang] || 'en-IN';
    utterance.rate = 0.95; // slightly slower for better rural comprehension
    utterance.pitch = 1.0;

    // Pick best available voice if possible
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(
      (v) =>
        v.lang === langCodeMap[lang] ||
        v.lang.startsWith(langCodeMap[lang].split('-')[0])
    );
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onend = () => {
      currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis utterance error:', e);
      currentUtterance = null;
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.error('Speech synthesis failure:', err);
    if (onEnd) onEnd();
  }
};

export const startVoiceRecognition = (
  lang: Language,
  onResult: (transcript: string, isFinal: boolean) => void,
  onError: (errorMessage: string) => void,
  onStart?: () => void,
  onEnd?: () => void
): (() => void) => {
  if (!isSpeechRecognitionSupported()) {
    onError(
      lang === 'mr'
        ? 'या ब्राऊजरमध्ये व्हॉइस टायपिंग उपलब्ध नाही. कृपया कीबोर्ड वापरा.'
        : lang === 'hi'
        ? 'इस ब्राउज़र में वॉइस टाइपिंग उपलब्ध नहीं है। कृपया टाइप करें।'
        : 'Voice input not supported in this browser. Please type.'
    );
    return () => {};
  }

  try {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    activeRecognition = recognition;

    const langCodeMap: Record<Language, string> = {
      mr: 'mr-IN',
      hi: 'hi-IN',
      en: 'en-IN',
    };
    recognition.lang = langCodeMap[lang] || 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      if (onStart) onStart();
    };

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let interim = '';
      let final = '';

      for (let i = 0; i < event.results.length; ++i) {
        const res = event.results[i];
        if (res.isFinal) {
          final += res[0].transcript;
        } else {
          interim += res[0].transcript;
        }
      }

      const text = final || interim;
      if (text) {
        onResult(text, Boolean(final));
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      let errorMsg = 'Voice recognition error';
      if (event.error === 'not-allowed') {
        errorMsg =
          lang === 'mr'
            ? 'कृपया माईकची परवानगी (Microphone Permission) द्या.'
            : lang === 'hi'
            ? 'कृपया माइक्रोफ़ोन की अनुमति दें।'
            : 'Please grant microphone access.';
      } else if (event.error === 'no-speech') {
        errorMsg =
          lang === 'mr'
            ? 'आवाज आला नाही. कृपया पुन्हा बोला.'
            : lang === 'hi'
            ? 'कोई आवाज नहीं सुनाई दी, पुनः प्रयास करें।'
            : 'No speech detected, please try again.';
      }
      onError(errorMsg);
    };

    recognition.onend = () => {
      activeRecognition = null;
      if (onEnd) onEnd();
    };

    recognition.start();

    return () => {
      try {
        recognition.stop();
      } catch (e) {
        // ignore
      }
      activeRecognition = null;
    };
  } catch (err: any) {
    console.error('Failed to start speech recognition:', err);
    onError(err.message || 'Speech recognition initialization failed');
    return () => {};
  }
};
