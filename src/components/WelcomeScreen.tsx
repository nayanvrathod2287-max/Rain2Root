
/** @jsxRuntime classic */
// @ts-ignore React's runtime package is installed without its declaration types.
import React from 'react';
import { Umbrella, Globe } from 'lucide-react';
import { Language } from '../types';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elementName: string]: any;
    }
  }
}

interface WelcomeScreenProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  onContinue: () => void;
}

export function WelcomeScreen({
  lang,
  onLanguageChange,
  onContinue,
}: WelcomeScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-green-100 p-6">
      <div className="w-full max-w-lg rounded-3xl border border-emerald-100 bg-white p-8 text-center shadow-xl sm:p-12">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg">
          <Umbrella className="h-11 w-11" />
        </div>

        <p className="mb-2 text-sm font-bold uppercase tracking-widest text-emerald-700">
          Rain2Root
        </p>

        <h1 className="mb-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
          {lang === 'mr'
            ? 'जलसंचयमध्ये आपले स्वागत आहे'
            : lang === 'hi'
            ? 'Rain2Root में आपका स्वागत है'
            : 'Welcome to Rain2Root'}
        </h1>

        <p className="mb-8 text-slate-600">
          {lang === 'mr'
            ? 'पावसाचे पाणी साठवा. भूजलाचे संरक्षण करा.'
            : lang === 'hi'
            ? 'वर्षा जल बचाएं। भूजल का संरक्षण करें।'
            : 'Harvest rainwater. Protect groundwater.'}
        </p>

        <label
          htmlFor="welcome-language"
          className="mb-2 flex items-center justify-center gap-2 font-semibold text-slate-700"
        >
          <Globe className="h-5 w-5 text-emerald-700" />
          {lang === 'mr'
            ? 'आपली भाषा निवडा'
            : lang === 'hi'
            ? 'अपनी भाषा चुनें'
            : 'Choose your language'}
        </label>

        <select
          id="welcome-language"
          value={lang}
          onChange={(event: { target: { value: string } }) =>
            onLanguageChange(event.target.value as Language)
          }
          className="mb-6 w-full rounded-xl border border-emerald-200 bg-white p-3 text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="en">English</option>
          <option value="mr">मराठी</option>
          <option value="hi">हिन्दी</option>
        </select>

        <button
          type="button"
          onClick={onContinue}
          className="w-full rounded-xl bg-emerald-600 px-6 py-4 font-bold text-white shadow-md transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          {lang === 'mr'
            ? 'पुढे चला'
            : lang === 'hi'
            ? 'आगे बढ़ें'
            : 'Get Started'}
        </button>
        type="button"

        <p className="mt-6 text-xs text-slate-500">
          Rainwater harvesting • Groundwater recharge • Sustainable farming
        </p>
      </div>
    </div>
  );
}
