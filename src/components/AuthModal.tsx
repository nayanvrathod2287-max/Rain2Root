import React, { useState } from 'react';
import { X, ShieldCheck, Lock, User, MapPin, Eye, EyeOff, Check } from 'lucide-react';
import { Language, AppTheme, UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  theme: AppTheme;
  userProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  lang,
  theme,
  userProfile,
  onSaveProfile,
}) => {
  if (!isOpen) return null;

  const isContrastLight = theme === 'contrast-light-black';
  const [name, setName] = useState(userProfile.name);
  const [village, setVillage] = useState(userProfile.village);
  const [district, setDistrict] = useState(userProfile.district);
  const [pin, setPin] = useState(userProfile.pin);
  const [anonymize, setAnonymize] = useState(userProfile.privacyAnonymize);
  const [success, setSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      name,
      village,
      district,
      pin,
      privacyAnonymize: anonymize,
      isLoggedIn: true,
    });
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div
        className={`w-full max-w-md rounded-3xl border-2 shadow-2xl p-6 space-y-5 transition-all ${
          isContrastLight
            ? 'bg-white border-2 border-black text-black'
            : 'bg-white border-slate-300 text-slate-900'
        }`}
      >
        <div className="flex items-center justify-between border-b pb-3 border-current/15">
          <div className="flex items-center gap-2 font-black text-lg">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>
              {lang === 'mr'
                ? 'शेतकरी ओळख व डेटा सुरक्षा'
                : 'Farmer Profile & Privacy Shield'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-black/5 hover:bg-black/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-black uppercase tracking-wider mb-1">
              {lang === 'mr' ? 'शेतकऱ्याचे नाव' : 'Farmer Name'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl font-bold border border-slate-300 bg-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-black uppercase tracking-wider mb-1">
                {lang === 'mr' ? 'गाव' : 'Village'}
              </label>
              <input
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl font-bold border border-slate-300 bg-white"
                required
              />
            </div>
            <div>
              <label className="block font-black uppercase tracking-wider mb-1">
                {lang === 'mr' ? 'जिल्हा' : 'District'}
              </label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3 py-2 rounded-xl font-bold border border-slate-300 bg-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-black uppercase tracking-wider mb-1">
              {lang === 'mr' ? 'सुरक्षा पिन (४ अंकी)' : 'Security PIN (4 digits)'}
            </label>
            <input
              type="password"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full px-3 py-2 rounded-xl font-black text-center tracking-widest text-base border border-slate-300 bg-white"
              placeholder="1234"
              required
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between">
            <span className="font-bold text-xs">
              {lang === 'mr' ? 'डेटा एनॉनिमाइज करा (गुप्त ठेवा)' : 'Anonymize personal data'}
            </span>
            <input
              type="checkbox"
              checked={anonymize}
              onChange={(e) => setAnonymize(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded"
            />
          </div>

          {success ? (
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white font-black text-center flex items-center justify-center gap-2">
              <Check className="w-4 h-4" />
              <span>{lang === 'mr' ? 'माहिती सुरक्षित जतन झाली!' : 'Saved Successfully!'}</span>
            </div>
          ) : (
            <button
              type="submit"
              className={`w-full py-3 rounded-xl font-black text-sm transition-all ${
                isContrastLight
                  ? 'bg-black text-white hover:bg-slate-900 border-2 border-black'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {lang === 'mr' ? 'जतन करा व पुढे जा' : 'Save & Secure'}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
