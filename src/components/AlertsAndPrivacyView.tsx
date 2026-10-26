import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  Info, 
  CheckCircle, 
  Volume2,
  Sliders
} from 'lucide-react';
import { Language, AppTheme, TextScale, HydrologicalAlert, UserProfile } from '../types';
import { getTranslation } from '../utils/translations';
import { speak } from '../utils/speech';

interface AlertsAndPrivacyViewProps {
  lang: Language;
  theme: AppTheme;
  textScale: TextScale;
  userProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
}

export const AlertsAndPrivacyView: React.FC<AlertsAndPrivacyViewProps> = ({
  lang,
  theme,
  textScale,
  userProfile,
  onUpdateProfile,
}) => {
  const isContrastLight = theme === 'contrast-light-black';
  const [alerts, setAlerts] = useState<HydrologicalAlert[]>([]);
  const [pinInput, setPinInput] = useState('');
  const [pinMessage, setPinMessage] = useState('');
  const [anonymize, setAnonymize] = useState(userProfile.privacyAnonymize);

  useEffect(() => {
    // Fetch live alerts from API or fallback
    fetch('/api/alerts')
      .then((res) => res.json())
      .then((data) => {
        if (data.alerts) setAlerts(data.alerts);
      })
      .catch((err) => {
        console.warn('Using offline cached alerts:', err);
        setAlerts([
          {
            id: 'alt-01',
            severity: 'high',
            type: 'monsoon_prep',
            title: {
              mr: 'पावसाळा पूर्व सूचना: पहिल्या पावसापूर्वी गाळणी स्वच्छ करा',
              hi: 'मानसून पूर्व चेतावनी: बारिश से पहले फिल्टर की सफाई करें',
              en: 'Monsoon Alert: Clean first flush diverter before rains',
            },
            message: {
              mr: 'बोअरवेलमध्ये घाण जाऊ नये म्हणून पहिली घाण बाहेर काढणारा व्हॉल्व्ह तपासा.',
              hi: 'बोरवेल में गाद जाने से रोकने के लिए फिल्टर चैंबर साफ रखें।',
              en: 'Ensure first-flush diverter is purged to avoid borewell clogging.',
            },
            actionCode: 'CLEAN_FILTER',
            date: new Date().toISOString(),
          },
          {
            id: 'alt-02',
            severity: 'warning',
            type: 'silt_alarm',
            title: {
              mr: 'गाळ कुंडी (Desilting Chamber) भरल्याचा इशारा',
              hi: 'सिल्ट चैंबर सफाई चेतावनी',
              en: 'Silt Chamber Saturation Alarm',
            },
            message: {
              mr: 'गेल्या पावसात जमा झालेला गाळ काढून टाका, अन्यथा पाणी मुरवण्याचा वेग मंदावेल.',
              hi: 'एकत्रित कीचड़ और बालू को ड्रेन वाल्व खोलकर बाहर निकालें।',
              en: 'Flush bottom purge valve to clear accumulated farm sediment.',
            },
            actionCode: 'PURGE_SILT',
            date: new Date().toISOString(),
          },
        ]);
      });
  }, []);

  const handleToggleAnonymize = () => {
    const newVal = !anonymize;
    setAnonymize(newVal);
    onUpdateProfile({
      ...userProfile,
      privacyAnonymize: newVal,
    });
  };

  const handleSetPin = () => {
    if (pinInput.length < 4) {
      setPinMessage(lang === 'mr' ? 'किमान ४ अंकी पिन टाका' : 'Enter 4-digit PIN');
      return;
    }
    onUpdateProfile({
      ...userProfile,
      pin: pinInput,
      isLoggedIn: true,
    });
    setPinMessage(lang === 'mr' ? 'पिन सुरक्षित जतन झाला!' : 'PIN saved successfully!');
    setTimeout(() => setPinMessage(''), 3000);
  };

  const handleSpeakAlert = (alert: HydrologicalAlert) => {
    const text = `${alert.title[lang] || alert.title.en}. ${alert.message[lang] || alert.message.en}`;
    speak(text, lang);
  };

  return (
    <div id="alerts-privacy-view" className="space-y-6">
      {/* Header Banner */}
      <div
        className={`p-5 sm:p-6 rounded-2xl border transition-all shadow-sm ${
          isContrastLight
            ? 'bg-white border-2 border-black text-black'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isContrastLight ? 'bg-black text-white' : 'bg-red-100 text-red-800'
            }`}
          >
            <Bell className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              {getTranslation('alertsTitle', lang)}
            </h2>
            <p className="text-xs sm:text-sm font-medium opacity-85 mt-0.5">
              {lang === 'mr'
                ? 'पावसाचा अंदाज, गाळ काढण्याच्या आठवणी आणि शेतकरी डेटा सुरक्षा नियंत्रणे'
                : 'Hydrological storm warnings, silt filter cleaning alarms, and farmer data privacy shields.'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Alerts Feed (Col 1-7) */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-600 px-1 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>{lang === 'mr' ? 'सक्रिय जल सूचना (Active Alerts):' : 'Active Water & Weather Alerts:'}</span>
          </h3>

          {alerts.map((alt) => {
            const isHigh = alt.severity === 'high';
            return (
              <div
                key={alt.id}
                className={`p-5 rounded-2xl border transition-all shadow-sm ${
                  isHigh
                    ? isContrastLight
                      ? 'bg-white border-2 border-black text-black ring-1 ring-black'
                      : 'bg-red-50 border-red-300 text-red-950'
                    : isContrastLight
                    ? 'bg-slate-50 border-2 border-slate-300 text-black'
                    : 'bg-amber-50/70 border-amber-200 text-amber-950'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isHigh ? 'bg-red-600 text-white' : 'bg-amber-500 text-black font-black'
                      }`}
                    >
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm sm:text-base leading-snug">
                        {alt.title[lang] || alt.title.en}
                      </h4>
                      <p className="text-xs sm:text-sm font-medium opacity-90 mt-1 leading-relaxed">
                        {alt.message[lang] || alt.message.en}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSpeakAlert(alt)}
                    className="p-2 rounded-lg bg-black/5 hover:bg-black/10 text-current transition-all shrink-0"
                    title="Listen aloud"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Data Privacy & Secure Authentication Shield (Col 8-12) */}
        <div className="lg:col-span-5 space-y-4">
          <div
            className={`p-6 rounded-2xl border shadow-sm space-y-5 ${
              isContrastLight
                ? 'bg-white border-2 border-black text-black'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2 border-b pb-3 border-current/15">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="font-black text-base uppercase tracking-wide">
                {getTranslation('privacyTitle', lang)}
              </h3>
            </div>

            {/* Anonymize Switch */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-black text-xs sm:text-sm text-slate-900">
                  {getTranslation('anonymizeToggle', lang)}
                </span>
                <button
                  id="btn-toggle-anonymize"
                  onClick={handleToggleAnonymize}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                    anonymize ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                      anonymize ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <p className="text-[11px] font-medium text-slate-600 leading-relaxed">
                {getTranslation('anonymizeDesc', lang)}
              </p>
              <div className="text-[11px] font-bold text-emerald-800 flex items-center gap-1 pt-1">
                {anonymize ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>
                  {anonymize
                    ? lang === 'mr'
                      ? 'डेटा सुरक्षित व एनॉनिमाइज्ड आहे'
                      : 'Data anonymization ACTIVE'
                    : lang === 'mr'
                    ? 'वैयक्तिक माहिती दाखवली जाईल'
                    : 'Personal details shared'}
                </span>
              </div>
            </div>

            {/* Farmer Simple PIN Lock */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-black text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <span>{getTranslation('quickPinAuth', lang)}</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  {userProfile.isLoggedIn ? 'Locked & Active' : 'Setup PIN'}
                </span>
              </div>

              <p className="text-[11px] text-slate-600 font-medium">
                {lang === 'mr'
                  ? 'गावातील सामायिक किंवा कुटुंबाच्या फोनवर शेताचा हिशोब सुरक्षित ठेवण्यासाठी ४ अंकी पिन सेट करा.'
                  : 'Set a simple 4-digit passcode to protect your farm records on shared mobile devices.'}
              </p>

              <div className="flex items-center gap-2">
                <input
                  id="input-farmer-pin"
                  type="password"
                  maxLength={4}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="उदा. 1234"
                  className={`w-28 px-3 py-2 rounded-xl text-center font-black tracking-widest text-base border focus:outline-none focus:ring-2 ${
                    isContrastLight
                      ? 'border-2 border-black bg-white text-black focus:ring-black'
                      : 'border-slate-300 bg-white text-slate-900 focus:ring-emerald-500'
                  }`}
                />
                <button
                  id="btn-save-pin"
                  onClick={handleSetPin}
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                    isContrastLight
                      ? 'bg-black text-white hover:bg-slate-900 border-2 border-black'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {lang === 'mr' ? 'पिन जतन करा' : 'Set PIN'}
                </button>
              </div>

              {pinMessage && (
                <div className="text-xs font-bold text-emerald-700">{pinMessage}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
