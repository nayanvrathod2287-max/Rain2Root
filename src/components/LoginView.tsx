import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  KeyRound, 
  ShieldCheck, 
  LogOut, 
  LogIn, 
  CheckCircle2, 
  History, 
  Building2, 
  Home, 
  Tractor, 
  School, 
  RotateCcw, 
  Sparkles,
  ArrowRight,
  Droplets,
  Calendar,
  MapPin,
  Lock,
  Smartphone,
  Info
} from 'lucide-react';
import { 
  Language, 
  AppTheme, 
  TextScale, 
  UserProfile, 
  FarmAssessment, 
  PropertyType 
} from '../types';
import { 
  getAccountsRegistry, 
  normalizeUserIdentifier, 
  StoredAccountData 
} from '../utils/offlineStorage';
import { speak } from '../utils/speech';

interface LoginViewProps {
  lang: Language;
  theme: AppTheme;
  textScale: TextScale;
  userProfile: UserProfile;
  assessments: FarmAssessment[];
  onLogin: (
    identifier: string, 
    authType: 'email' | 'mobile', 
    profileData: Partial<UserProfile>
  ) => void;
  onLogout: () => void;
  onNavigateToCalculator: () => void;
  onNavigateToSyncCenter: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  lang,
  theme,
  textScale,
  userProfile,
  assessments,
  onLogin,
  onLogout,
  onNavigateToCalculator,
  onNavigateToSyncCenter,
}) => {
  const isContrastLight = theme === 'contrast-light-black';

  // Login Form State
  const [authMode, setAuthMode] = useState<'email' | 'mobile'>('email');
  const [emailInput, setEmailInput] = useState(userProfile.email || 'vaishnavinaikwadi2627@gmail.com');
  const [mobileInput, setMobileInput] = useState(userProfile.mobile || '9850123456');
  const [nameInput, setNameInput] = useState(userProfile.name || 'शेतकरी / रहिवासी');
  const [villageInput, setVillageInput] = useState(userProfile.village || 'पुणे (Pune)');
  const [districtInput, setDistrictInput] = useState(userProfile.district || 'पुणे');
  const [pinInput, setPinInput] = useState(userProfile.pin || '1234');
  const [propType, setPropType] = useState<PropertyType>(userProfile.propertyType || 'building');

  // Live registry preview of available previous data
  const [existingRecordCount, setExistingRecordCount] = useState<number | null>(null);
  const [existingRecordName, setExistingRecordName] = useState<string | null>(null);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Check if entered identifier exists in registry for previewing restore capability
  useEffect(() => {
    const registry = getAccountsRegistry();
    const activeIdentifier = authMode === 'email' ? emailInput : mobileInput;
    const normalized = normalizeUserIdentifier(activeIdentifier);

    if (normalized && registry[normalized]) {
      const match = registry[normalized];
      setExistingRecordCount(match.assessments ? match.assessments.length : 0);
      setExistingRecordName(match.profile.name || normalized);
    } else {
      setExistingRecordCount(null);
      setExistingRecordName(null);
    }
  }, [authMode, emailInput, mobileInput]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentId = authMode === 'email' ? emailInput.trim() : mobileInput.trim();
    if (!currentId) return;

    onLogin(currentId, authMode, {
      name: nameInput.trim() || (authMode === 'email' ? emailInput.split('@')[0] : `User ${mobileInput}`),
      village: villageInput.trim() || 'महाराष्ट्र',
      district: districtInput.trim() || 'पुणे',
      propertyType: propType,
      pin: pinInput,
      email: authMode === 'email' ? emailInput.trim() : undefined,
      mobile: authMode === 'mobile' ? mobileInput.trim() : undefined,
    });

    const msg = lang === 'mr'
      ? `यशस्वी लॉगिन! ${currentId} खात्याची सर्व माहिती व मागील हिशोब पूर्ववत (Restore) झाले आहेत.`
      : `Logged in successfully! Restored all assessments and records for ${currentId}.`;
    setNotificationMsg(msg);
    speak(msg, lang);
    setTimeout(() => setNotificationMsg(null), 5000);
  };

  const handleQuickFill = (demo: {
    identifier: string;
    type: 'email' | 'mobile';
    name: string;
    village: string;
    prop: PropertyType;
  }) => {
    setAuthMode(demo.type);
    if (demo.type === 'email') {
      setEmailInput(demo.identifier);
    } else {
      setMobileInput(demo.identifier);
    }
    setNameInput(demo.name);
    setVillageInput(demo.village);
    setPropType(demo.prop);
  };

  return (
    <div id="login-view" className="max-w-5xl mx-auto space-y-6">
      {/* Toast Notification */}
      {notificationMsg && (
        <div className="p-4 rounded-2xl bg-slate-900 text-white border border-emerald-400 shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="text-xs sm:text-sm font-black">{notificationMsg}</div>
        </div>
      )}

      {/* Hero Header */}
      <div
        className={`p-5 sm:p-7 rounded-3xl border transition-all shadow-sm ${
          isContrastLight
            ? 'bg-white border-2 border-black text-black'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black ${
                isContrastLight ? 'bg-black text-white' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              <User className="w-8 h-8 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  {lang === 'mr'
                    ? 'वापरकर्ता खाते व सुरक्षित लॉगिन'
                    : 'User Account & Secure Login'}
                </h1>
                <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                  Restore Ready
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium opacity-80 mt-0.5">
                {lang === 'mr'
                  ? 'ईमेल किंवा मोबाईल नंबरने लॉगिन करा. लॉगआउट केल्यावर पुन्हा त्याच माहितीने लॉगिन करून जुना डेटा त्वरित पूर्ववत करा.'
                  : 'Login via Email or Mobile. Logout anytime and re-login with the same credentials to instantly restore your data.'}
              </p>
            </div>
          </div>

          {userProfile.isLoggedIn && (
            <button
              id="btn-logout-header"
              type="button"
              onClick={() => {
                onLogout();
                const msg = lang === 'mr'
                  ? 'तुम्ही सुरक्षित लॉगआउट झाला आहात. तुमचा डेटा जतन आहे. पुन्हा लॉगिन करून तो पूर्ववत मिळवू शकता.'
                  : 'Logged out. Your data is safely stored. Log back in anytime with your email or mobile to restore it.';
                setNotificationMsg(msg);
                speak(msg, lang);
                setTimeout(() => setNotificationMsg(null), 5000);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black bg-red-600 hover:bg-red-700 text-white shadow-xs transition-all active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              <span>{lang === 'mr' ? 'लॉगआउट (Logout)' : 'Log Out'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Container: Logged In Account Dashboard vs Login Form */}
      {userProfile.isLoggedIn ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Active User Profile Card */}
          <div
            className={`lg:col-span-5 p-6 rounded-3xl border space-y-5 shadow-sm ${
              isContrastLight
                ? 'bg-black text-white border-2 border-black'
                : 'bg-gradient-to-br from-emerald-900 to-teal-950 text-white border-emerald-800'
            }`}
          >
            <div className="flex items-center justify-between border-b border-white/15 pb-4">
              <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded bg-white/10 text-emerald-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{lang === 'mr' ? 'सध्याचे सक्रिय खाते' : 'Active Account'}</span>
              </span>
              <span className="text-[11px] font-mono opacity-80">
                PIN: ••••
              </span>
            </div>

            <div>
              <div className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {userProfile.name}
              </div>
              <div className="flex items-center gap-2 mt-1.5 text-xs text-emerald-200">
                {userProfile.authType === 'email' ? (
                  <Mail className="w-4 h-4 text-amber-400" />
                ) : (
                  <Smartphone className="w-4 h-4 text-amber-400" />
                )}
                <span className="font-bold font-mono text-amber-300 text-sm">
                  {userProfile.identifier || userProfile.email || userProfile.mobile}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-white/15">
              <div>
                <span className="opacity-75 block">{lang === 'mr' ? 'गाव / परिसर' : 'Location'}:</span>
                <span className="font-extrabold text-white text-sm">{userProfile.village || 'पुणे'}</span>
              </div>
              <div>
                <span className="opacity-75 block">{lang === 'mr' ? 'जिल्हा' : 'District'}:</span>
                <span className="font-extrabold text-white text-sm">{userProfile.district || 'पुणे'}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="opacity-80">{lang === 'mr' ? 'जतन केलेले हिशोब' : 'Saved Records'}:</span>
                <span className="font-black text-amber-300 text-sm">{assessments.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="opacity-80">{lang === 'mr' ? 'डेटा सुरक्षितता' : 'Restore Status'}:</span>
                <span className="font-bold text-emerald-300">✅ 100% Persisted</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={onNavigateToCalculator}
                className="w-full py-3 px-4 rounded-xl font-black text-xs sm:text-sm bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
              >
                <span>{lang === 'mr' ? 'पुनर्भरण गणक उघडा (Go to Calculator)' : 'Open Rainwater Calculator'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  onLogout();
                  const msg = lang === 'mr'
                    ? 'सुरक्षित लॉगआउट केले. पुन्हा हाच ईमेल किंवा मोबाईल नंबर टाकून डेटा पूर्ववत करा.'
                    : 'Logged out. Re-login with this email/mobile anytime to restore your records.';
                  setNotificationMsg(msg);
                  speak(msg, lang);
                  setTimeout(() => setNotificationMsg(null), 5000);
                }}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs border border-white/30 hover:bg-white/10 text-white flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <LogOut className="w-4 h-4" />
                <span>{lang === 'mr' ? 'दुसऱ्या खात्यात बदल करा (Switch / Logout)' : 'Log Out / Switch Account'}</span>
              </button>
            </div>
          </div>

          {/* Right: Restored Previously Entered Info List */}
          <div
            className={`lg:col-span-7 p-6 rounded-3xl border space-y-4 shadow-sm ${
              isContrastLight
                ? 'bg-white border-2 border-black text-black'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-base">
                  {lang === 'mr' ? 'या खात्यातील पूर्ववत हिशोब (Restored Info)' : 'Restored Assessments in this Account'}
                </h3>
              </div>
              <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900">
                {assessments.length} {lang === 'mr' ? 'नोंदी' : 'Records'}
              </span>
            </div>

            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              {lang === 'mr'
                ? `या ईमेल किंवा मोबाईल खात्याशी संलग्न असलेले पूर्वीचे सर्व हिशोब खाली पूर्ववत (Restore) केले गेले आहेत:`
                : `All calculations previously stored under this email or mobile account have been restored:`}
            </p>

            {assessments.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <Droplets className="w-10 h-10 text-slate-400 mx-auto" />
                <p className="text-xs sm:text-sm font-bold text-slate-600">
                  {lang === 'mr'
                    ? 'या खात्यामध्ये अजून नवीन हिशोब जतन केलेला नाही.'
                    : 'No assessments saved in this account yet.'}
                </p>
                <button
                  type="button"
                  onClick={onNavigateToCalculator}
                  className="px-4 py-2 rounded-xl text-xs font-black bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  {lang === 'mr' ? 'पहिला हिशोब तयार करा' : 'Create First Assessment'}
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {assessments.map((a) => (
                  <div
                    key={a.id}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-500 bg-slate-50/70 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm text-slate-900">
                        {a.farmerName}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        {new Date(a.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[10px]">क्षेत्रफळ:</span>
                        <span className="font-bold text-slate-800">{a.landArea} {a.landUnit}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">जल संचयन:</span>
                        <span className="font-black text-emerald-700">{a.harvestedLiters.toLocaleString()} L</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">टँकर बचत:</span>
                        <span className="font-black text-amber-700">{a.tankersSaved} टँकर</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-xs">
                      <span className="text-[11px] text-slate-600 font-medium truncate max-w-[260px]">
                        📍 {a.village}, {a.district}
                      </span>
                      <button
                        type="button"
                        onClick={onNavigateToCalculator}
                        className="text-[11px] font-black text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                      >
                        <span>{lang === 'mr' ? 'पहा / संपादित करा' : 'Load & View'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Logged Out / Login Form with Email or Mobile Number */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Login Card (Col 1-7) */}
          <div
            className={`lg:col-span-7 p-6 sm:p-8 rounded-3xl border space-y-5 shadow-sm ${
              isContrastLight
                ? 'bg-white border-2 border-black text-black'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Tab: Login using Email vs Mobile */}
            <div className="flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200">
              <button
                type="button"
                id="tab-login-email"
                onClick={() => setAuthMode('email')}
                className={`w-1/2 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                  authMode === 'email'
                    ? 'bg-white text-emerald-900 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Mail className="w-4 h-4 text-emerald-600" />
                <span>{lang === 'mr' ? 'ईमेलने लॉगिन (Email)' : 'Login with Email'}</span>
              </button>

              <button
                type="button"
                id="tab-login-mobile"
                onClick={() => setAuthMode('mobile')}
                className={`w-1/2 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                  authMode === 'mobile'
                    ? 'bg-white text-emerald-900 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>{lang === 'mr' ? 'मोबाईल नंबरने लॉगिन (Mobile)' : 'Login with Mobile'}</span>
              </button>
            </div>

            {/* Restore Alert if previously stored records exist for this input */}
            {existingRecordCount !== null && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-start gap-3">
                <RotateCcw className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-black text-emerald-900">
                    {lang === 'mr'
                      ? `मागील डेटा सापडला! (${existingRecordCount} हिशोब जतन आहेत)`
                      : `Previous data found! (${existingRecordCount} assessments stored)`}
                  </div>
                  <div className="text-[11px] text-emerald-800 mt-0.5">
                    {lang === 'mr'
                      ? `लॉगिन केल्यावर '${existingRecordName}' यांचे सर्व हिशोब आपोआप पूर्ववत (Restore) होतील.`
                      : `Logging in will automatically restore previously entered assessments for '${existingRecordName}'.`}
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {authMode === 'email' ? (
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider mb-1 text-slate-700">
                    {lang === 'mr' ? 'ईमेल पत्ता (Email Address)' : 'Email Address'}
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      id="input-login-email"
                      type="email"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="उदा. vaishnavinaikwadi2627@gmail.com"
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl font-bold text-sm border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider mb-1 text-slate-700">
                    {lang === 'mr' ? '१०-अंकी मोबाईल नंबर (Mobile Number)' : '10-Digit Mobile Number'}
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 font-black text-slate-500 text-sm">
                      +91
                    </span>
                    <input
                      id="input-login-mobile"
                      type="tel"
                      required
                      maxLength={10}
                      pattern="[0-9]{10}"
                      value={mobileInput}
                      onChange={(e) => setMobileInput(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="9850123456"
                      className="w-full pl-14 pr-4 py-2.5 rounded-xl font-black tracking-wider text-sm border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}

              {/* Name & Security PIN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider mb-1 text-slate-700">
                    {lang === 'mr' ? 'तुमचे नाव / सोसायटी (Name)' : 'Full Name / Society'}
                  </label>
                  <input
                    id="input-login-name"
                    type="text"
                    required
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder={lang === 'mr' ? 'उदा. रामराव पाटील' : 'e.g. Ramrao Patil'}
                    className="w-full px-3.5 py-2.5 rounded-xl font-bold text-sm border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider mb-1 text-slate-700">
                    {lang === 'mr' ? 'सुरक्षा पिन / पासवर्ड (PIN)' : '4-Digit PIN / Password'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      id="input-login-pin"
                      type="password"
                      maxLength={8}
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value)}
                      placeholder="1234"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl font-black text-sm tracking-widest border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Village & Property Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider mb-1 text-slate-700">
                    {lang === 'mr' ? 'गाव / शहर (Village / City)' : 'Village / City'}
                  </label>
                  <input
                    id="input-login-village"
                    type="text"
                    value={villageInput}
                    onChange={(e) => setVillageInput(e.target.value)}
                    placeholder="उदा. पुणे / बारामती"
                    className="w-full px-3.5 py-2.5 rounded-xl font-bold text-sm border border-slate-300 bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider mb-1 text-slate-700">
                    {lang === 'mr' ? 'मालमत्ता प्रकार (Property Type)' : 'Property Category'}
                  </label>
                  <select
                    id="select-login-proptype"
                    value={propType}
                    onChange={(e) => setPropType(e.target.value as PropertyType)}
                    className="w-full px-3.5 py-2.5 rounded-xl font-bold text-sm border border-slate-300 bg-slate-50 focus:bg-white"
                  >
                    <option value="building">इमारत / सोसायटी (Building / Society)</option>
                    <option value="house">स्वतंत्र घर / बंगला (House)</option>
                    <option value="farm">शेत / कृषी जमीन (Farm)</option>
                    <option value="commercial">शाळा / कार्यालय (Commercial)</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <button
                id="btn-submit-login"
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl font-black text-sm sm:text-base bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
              >
                <LogIn className="w-5 h-5" />
                <span>
                  {existingRecordCount !== null
                    ? lang === 'mr'
                      ? 'लॉगिन करा व मागील डेटा पूर्ववत मिळवा (Login & Restore Info)'
                      : 'Login & Restore Previous Info'
                    : lang === 'mr'
                    ? 'खाते तयार करा / लॉगिन करा (Sign In)'
                    : 'Sign In / Register Account'}
                </span>
              </button>
            </form>
          </div>

          {/* Quick Demo Accounts to Test Logout & Restore (Col 8-12) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-3xl bg-slate-100 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 font-black text-xs sm:text-sm text-slate-800">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>{lang === 'mr' ? 'त्वरित चाचणी खाती (Click to Test Restore)' : 'Quick Test Accounts (Click to Test)'}</span>
              </div>
              <p className="text-xs text-slate-600">
                {lang === 'mr'
                  ? 'खालील कोणत्याही खात्यावर क्लिक करा. लॉगिन, लॉगआउट आणि पूर्ववत (Restore) प्रक्रिया लगेच तपासा:'
                  : 'Tap any demo account below to test login, logout, and automatic data restoration:'}
              </p>

              <div className="space-y-2">
                {[
                  {
                    identifier: 'vaishnavinaikwadi2627@gmail.com',
                    type: 'email' as const,
                    name: 'वैष्णवी नाईकवाडी (Vaishnavi - Project Lead)',
                    village: 'पुणे (Pune)',
                    prop: 'building' as PropertyType,
                    desc: 'Email Login • 1 Saved Assessment (4,500 sq.ft Society)',
                    icon: Building2,
                  },
                  {
                    identifier: 'society@pune.org',
                    type: 'email' as const,
                    name: 'गोकुळ गृहनिर्माण संस्था (Gokul Society)',
                    village: 'कोथरूड, पुणे',
                    prop: 'building' as PropertyType,
                    desc: 'Email Login • 1 Saved Assessment (5,000 sq.ft Terrace)',
                    icon: Building2,
                  },
                  {
                    identifier: '9850123456',
                    type: 'mobile' as const,
                    name: 'रामराव पाटील (शेतकरी मित्र)',
                    village: 'पंढरपूर, सोलापूर',
                    prop: 'farm' as PropertyType,
                    desc: 'Mobile Login • 1 Saved Assessment (4 Guntha Umbrella)',
                    icon: Tractor,
                  },
                ].map((demo) => {
                  const Icon = demo.icon;
                  return (
                    <button
                      key={demo.identifier}
                      type="button"
                      onClick={() => handleQuickFill(demo)}
                      className="w-full p-3 rounded-2xl border text-left bg-white border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-emerald-600" />
                          <span className="font-bold text-xs text-slate-900 group-hover:text-emerald-900">
                            {demo.name}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          {demo.type}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-emerald-800 font-bold mt-1">
                        {demo.identifier}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {demo.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* How Restore Works Callout */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{lang === 'mr' ? 'डेटा पूर्ववत (Restore) कसा होतो?' : 'How does Restore work?'}</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                {lang === 'mr'
                  ? 'तुम्ही हिशोब जतन करताना किंवा बदल करताना सर्व माहिती तुमच्या ईमेल किंवा मोबाईल नंबरशी जोडली जाते. लॉगआउट झाल्यावरही डेटा स्थानिक डेटाबेसमध्ये सुरक्षित राहतो. पुन्हा तोच नंबर किंवा ईमेल टाकल्यावर एका सेकंदात तुमचा जुना हिशोब पूर्ववत होतो.'
                  : 'Every calculation is tagged with your email or phone number. When you log out and log back in using the same credentials, the engine instantly matches your identifier and restores all assessments.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
