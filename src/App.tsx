import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Umbrella, 
  Layers, 
  Bot, 
  Bell, 
  Database, 
  PhoneCall, 
  Volume2, 
  RefreshCw,
  Sparkles,
  HelpCircle,
  MessageSquarePlus
} from 'lucide-react';
import { 
  Language, 
  AppTheme, 
  TextScale, 
  FarmAssessment, 
  UserProfile 
} from './types';
import { t, getTranslation } from './utils/translations';
import { Header } from './components/Header';
import { VoiceAssistedBar } from './components/VoiceAssistedBar';
import { CalculatorView } from './components/CalculatorView';
import { InvertedUmbrellaModel } from './components/InvertedUmbrellaModel';
import { SoilAndGisView } from './components/SoilAndGisView';
import { VoiceConsultant } from './components/VoiceConsultant';
import { AlertsAndPrivacyView } from './components/AlertsAndPrivacyView';
import { OfflineSyncCenter } from './components/OfflineSyncCenter';
import { AuthModal } from './components/AuthModal';
import { CustomPromptModal } from './components/CustomPromptModal';
import { VerticalNavMenu } from './components/VerticalNavMenu';
import { LoginView } from './components/LoginView';
import { 
  getStoredAssessments, 
  saveAssessmentLocally, 
  deleteStoredAssessment,
  getSyncQueue, 
  getUserProfile, 
  saveUserProfile, 
  syncWithServer,
  restoreUserAccount,
  logoutUserSession
} from './utils/offlineStorage';
import { speak, stopSpeaking } from './utils/speech';

export type NavTab = 
  | 'calculator'
  | 'umbrella_model'
  | 'soil_simulator'
  | 'voice_consult'
  | 'alerts_privacy'
  | 'sync_center'
  | 'login';

export default function App() {
  // Localization & Theming
  const [lang, setLang] = useState<Language>('mr');
  const [theme, setTheme] = useState<AppTheme>('contrast-light-black');
  const [textScale, setTextScale] = useState<TextScale>('large'); // default large for farmer readability
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<NavTab>('calculator');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Offline & Connectivity
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [syncMessage, setSyncMessage] = useState<string>('');

  // Data & State
  const [assessments, setAssessments] = useState<FarmAssessment[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(getUserProfile());

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCustomPromptModalOpen, setIsCustomPromptModalOpen] = useState(false);

  // Connectivity Listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      triggerSync();
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial load of stored records
    const stored = getStoredAssessments();
    setAssessments(stored);
    setPendingSyncCount(getSyncQueue().length);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const triggerSync = async () => {
    if (!navigator.onLine) {
      setSyncMessage('इंटरनेट बंद आहे. डेटा स्थानिक सुरक्षित जतन आहे.');
      return;
    }

    setIsSyncing(true);
    setSyncMessage('सर्व्हरशी संपर्क साधत आहे...');

    const res = await syncWithServer();
    setIsSyncing(false);
    setSyncMessage(res.message);

    // Refresh state
    setAssessments(getStoredAssessments());
    setPendingSyncCount(getSyncQueue().length);

    setTimeout(() => {
      setSyncMessage('');
    }, 4500);
  };

  const handleSaveAssessment = (assessment: FarmAssessment) => {
    const saved = saveAssessmentLocally(assessment);
    setAssessments((prev) => [saved, ...prev.filter((a) => a.id !== saved.id)]);
    setPendingSyncCount(getSyncQueue().length);

    if (isOnline) {
      triggerSync();
    }
  };

  const handleUpdateProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    saveUserProfile(profile);
  };

  // Account Login with automatic Previous Data Restore
  const handleLogin = (
    identifier: string,
    authType: 'email' | 'mobile',
    profileData: Partial<UserProfile>
  ) => {
    const result = restoreUserAccount(identifier);
    const updatedProfile: UserProfile = {
      ...result.profile,
      ...profileData,
      identifier,
      authType,
      isLoggedIn: true,
    };
    setUserProfile(updatedProfile);
    saveUserProfile(updatedProfile);
    setAssessments(result.assessments);

    setSyncMessage(
      lang === 'mr'
        ? `पूर्ववत यशस्वी! '${updatedProfile.name}' यांचे ${result.assessments.length} जुने हिशोब पुन्हा जोडले गेले.`
        : `Restored! Loaded ${result.assessments.length} previous assessments for '${updatedProfile.name}'.`
    );

    setTimeout(() => setSyncMessage(''), 5000);
  };

  // Account Logout with data safely preserved for future restore
  const handleLogout = () => {
    logoutUserSession();
    const current = getUserProfile();
    const loggedOutProfile = {
      ...current,
      isLoggedIn: false,
    };
    setUserProfile(loggedOutProfile);

    setSyncMessage(
      lang === 'mr'
        ? 'सुरक्षित लॉगआउट झाले. तुमचा डेटा सुरक्षित आहे, पुन्हा याच माहितीने लॉगिन करून तो पूर्ववत मिळवा.'
        : 'Logged out. Your assessments stay safely saved. Re-login with this email/mobile anytime to restore.'
    );

    setTimeout(() => setSyncMessage(''), 5000);
  };

  // Dynamic voice summaries for each tab
  const getTabVoiceSummary = (tab: NavTab): string => {
    switch (tab) {
      case 'calculator':
        return lang === 'mr'
          ? 'तुम्ही जल हिशोब व डॅशबोर्ड पानावर आहात. येथे इमारत, घर किंवा शेताचे क्षेत्रफळ निवडून पाणी किती वाचेल आणि खर्च किती येईल ते त्वरित जाणून घ्या.'
          : lang === 'hi'
          ? 'आप जल संचयन कैलकुलेटर पर हैं। इमारत, मकान अथवा खेत का क्षेत्रफल चुनकर जल पुनर्भरण और लागत जानें।'
          : 'You are on the Rainwater & Recharge Calculator. Select building, house, or farm to compute rainwater yield, tanker savings, and costs.';
      case 'umbrella_model':
        return lang === 'mr'
          ? 'हे उलट छत्री तंत्रज्ञान मॉडेल आहे. यामध्ये व्हॉर्टेक्स गाळ कुंडी व व्ही-वायर स्क्रीनमुळे बोअरवेल व टाक्यांमध्ये माती जाणे पूर्णपणे थांबते.'
          : lang === 'hi'
          ? 'यह उल्टा छाता तकनीक मॉडल है। यह सिल्ट चैंबर से 94% मिट्टी अलग कर बोरवेल को जाम होने से बचाता है।'
          : 'This is the Inverted Umbrella model showcasing zero-clogging hydrodynamic desilting for houses, buildings, and farms.';
      case 'soil_simulator':
        return lang === 'mr'
          ? 'हे माती व जल प्रवाह सिम्युलेटर आहे. काळी कापसाची माती, तांबडी माती किंवा खडकाळ जमिनीत पाणी कसे मुरते ते पाहा.'
          : lang === 'hi'
          ? 'यह मिट्टी अवशोषण सिमुलेटर है। विभिन्न मिट्टी में जल संचयन की गति देखें।'
          : 'This is the Soil and GIS simulator comparing infiltration rates across soil types.';
      case 'voice_consult':
        return lang === 'mr'
          ? 'हा जल सल्लागार आहे. माईकचे बटण दाबून मराठीत बोला किंवा प्रश्न विचारा.'
          : lang === 'hi'
          ? 'यह वॉइस असिस्टेंट है। माइक दबाकर अपना सवाल बोलें।'
          : 'This is your voice-assisted AI consultant. Tap the microphone to speak your question.';
      case 'alerts_privacy':
        return lang === 'mr'
          ? 'येथे पावसाचा अंदाज, गाळ काढण्याच्या आठवणी आणि डेटा सुरक्षेची साधने उपलब्ध आहेत.'
          : lang === 'hi'
          ? 'यहाँ मौसम अलर्ट, सिल्ट सफाई चेतावनी और डेटा सुरक्षा विकल्प हैं।'
          : 'Here you can inspect rainfall storm alerts, silt cleaning reminders, and privacy controls.';
      case 'sync_center':
        return lang === 'mr'
          ? 'येथे तुमचे ऑफलाइन जतन केलेले सर्व हिशोब आणि महापालिका व ग्रामपंचायतीसाठीचे प्रमाणपत्र उपलब्ध आहे.'
          : lang === 'hi'
          ? 'यहाँ आपके ऑफलाइन सेव किए गए रिकॉर्ड और प्रमाण-पत्र उपलब्ध हैं।'
          : 'Here you can access offline stored assessments and export the municipal tax rebate and audit certificate.';
      case 'login':
        return lang === 'mr'
          ? 'हे वापरकर्ता खाते व लॉगिन पान आहे. येथे ईमेल किंवा मोबाईल नंबरने लॉगिन करा, आणि लॉगआउट केल्यावर पुन्हा त्याच माहितीने जुना डेटा पूर्ववत मिळवा.'
          : lang === 'hi'
          ? 'यह यूजर अकाउंट व लॉगिन पेज है। ईमेल या मोबाइल से लॉगिन कर पुराना डेटा पुनः प्राप्त करें।'
          : 'This is the User Account & Login page. Authenticate via email or mobile number to restore all previously entered assessments and records.';
    }
  };

  const getActiveTabLabel = (tab: NavTab): string => {
    switch (tab) {
      case 'calculator':
        return getTranslation('navCalculator', lang);
      case 'umbrella_model':
        return getTranslation('navUmbrellaModel', lang);
      case 'soil_simulator':
        return getTranslation('navSoilSimulator', lang);
      case 'voice_consult':
        return getTranslation('navVoiceConsult', lang);
      case 'alerts_privacy':
        return getTranslation('navAlertsPrivacy', lang);
      case 'sync_center':
        return getTranslation('navSyncCenter', lang);
      case 'login':
        return getTranslation('navLogin', lang);
    }
  };

  const isContrastLight = theme === 'contrast-light-black';

  // Apply typography scale class to the main wrapper
  const textScaleClass =
    textScale === 'xl' ? 'text-xl' : textScale === 'large' ? 'text-lg' : 'text-base';

  return (
    <div
      id="jalsanchay-app"
      className={`min-h-screen flex flex-col font-sans transition-colors ${textScaleClass} ${
        isContrastLight
          ? 'bg-white text-black'
          : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Universal Header */}
      <Header
        lang={lang}
        onLanguageChange={setLang}
        theme={theme}
        onThemeToggle={() =>
          setTheme((prev) => {
            if (prev === 'contrast-light-black') return 'emerald-fresh';
            return 'contrast-light-black';
          })
        }
        onSelectTheme={setTheme}
        textScale={textScale}
        onTextScaleChange={setTextScale}
        voiceEnabled={voiceEnabled}
        onVoiceToggle={() => {
          if (voiceEnabled) stopSpeaking();
          setVoiceEnabled(!voiceEnabled);
        }}
        isOnline={isOnline}
        pendingSyncCount={pendingSyncCount}
        onSyncClick={triggerSync}
        isSyncing={isSyncing}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        isLoggedIn={userProfile.isLoggedIn}
        onOpenCustomPrompt={() => setIsCustomPromptModalOpen(true)}
        onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
        onNavigateToLogin={() => {
          stopSpeaking();
          setActiveTab('login');
        }}
      />

      {/* Main Workspace Layout with Vertical Menu */}
      <div className="flex-1 flex w-full">
        {/* Vertical Navigation Menu: Permanent sidebar on Desktop, Slide-over on Mobile */}
        <VerticalNavMenu
          lang={lang}
          theme={theme}
          activeTab={activeTab}
          onSelectTab={(tab) => {
            stopSpeaking();
            setActiveTab(tab);
            if (voiceEnabled) {
              speak(getActiveTabLabel(tab), lang);
            }
          }}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          userProfile={userProfile}
          assessmentsCount={assessments.length}
          onOpenCustomPrompt={() => setIsCustomPromptModalOpen(true)}
          onLogout={handleLogout}
        />

        {/* Content Column */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Voice-Assisted Audio Accessibility Bar */}
          {voiceEnabled && (
            <VoiceAssistedBar
              lang={lang}
              theme={theme}
              pageSummaryText={getTabVoiceSummary(activeTab)}
              activeSectionName={getActiveTabLabel(activeTab)}
            />
          )}

          {/* Sync / Notification Toast */}
          {syncMessage && (
            <div className="bg-emerald-800 text-white px-4 py-2 text-center text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b border-emerald-600 transition-all">
              <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
              <span>{syncMessage}</span>
            </div>
          )}

          {/* Offline Status Alert Pill if disconnected */}
          {!isOnline && (
            <div className="bg-red-700 text-white px-4 py-2 text-center text-xs sm:text-sm font-bold flex items-center justify-center gap-2 animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-white"></span>
              <span>{getTranslation('offlineStatus', lang)}</span>
            </div>
          )}

          {/* Main Content Area */}
          <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8">
            {activeTab === 'calculator' && (
              <CalculatorView
                lang={lang}
                theme={theme}
                textScale={textScale}
                assessments={assessments}
                onSaveAssessment={handleSaveAssessment}
                onDeleteAssessment={(id) => {
                  const updated = deleteStoredAssessment(id);
                  setAssessments(updated);
                }}
                onNavigateToModel={() => setActiveTab('umbrella_model')}
                onNavigateToReport={() => setActiveTab('sync_center')}
                onOpenCustomPrompt={() => setIsCustomPromptModalOpen(true)}
              />
            )}

            {activeTab === 'umbrella_model' && (
              <InvertedUmbrellaModel
                lang={lang}
                theme={theme}
                textScale={textScale}
              />
            )}

            {activeTab === 'soil_simulator' && (
              <SoilAndGisView
                lang={lang}
                theme={theme}
                textScale={textScale}
                onSelectStructure={() => setActiveTab('calculator')}
              />
            )}

            {activeTab === 'voice_consult' && (
              <VoiceConsultant
                lang={lang}
                theme={theme}
                textScale={textScale}
                isOnline={isOnline}
              />
            )}

            {activeTab === 'alerts_privacy' && (
              <AlertsAndPrivacyView
                lang={lang}
                theme={theme}
                textScale={textScale}
                userProfile={userProfile}
                onUpdateProfile={handleUpdateProfile}
              />
            )}

            {activeTab === 'sync_center' && (
              <OfflineSyncCenter
                lang={lang}
                theme={theme}
                textScale={textScale}
                assessments={assessments}
                isOnline={isOnline}
                isSyncing={isSyncing}
                onManualSync={triggerSync}
                syncMessage={syncMessage}
              />
            )}

            {activeTab === 'login' && (
              <LoginView
                lang={lang}
                theme={theme}
                textScale={textScale}
                userProfile={userProfile}
                assessments={assessments}
                onLogin={handleLogin}
                onLogout={handleLogout}
                onNavigateToCalculator={() => setActiveTab('calculator')}
                onNavigateToSyncCenter={() => setActiveTab('sync_center')}
              />
            )}
          </main>

          {/* Floating Action Button (FAB) for Instant Custom Prompt */}
          <button
            id="btn-fab-custom-prompt"
            onClick={() => setIsCustomPromptModalOpen(true)}
            className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-slate-950 text-amber-300 hover:bg-black shadow-2xl border-2 border-amber-400/80 transition-all hover:scale-105 active:scale-95"
            title="Give Custom Prompt"
          >
            <Sparkles className="w-5 h-5 text-amber-400 fill-current animate-spin" style={{ animationDuration: '6s' }} />
            <span className="text-xs sm:text-sm font-black tracking-wide">
              {getTranslation('givePromptBtn', lang)}
            </span>
          </button>

          {/* Footer & Rural Water Scarcity Mission Statement */}
          <footer
            id="app-footer"
            className={`w-full border-t mt-12 py-8 px-4 sm:px-8 transition-colors ${
              isContrastLight
                ? 'bg-white border-t-2 border-black text-black'
                : 'bg-slate-900 border-slate-800 text-slate-300'
            }`}
          >
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-6">
              <div className="space-y-1 max-w-md">
                <div className={`flex items-center gap-2 font-black text-base ${
                  isContrastLight ? 'text-black' : 'text-white'
                }`}>
                  <Umbrella className="w-5 h-5 text-emerald-400 transform rotate-180" />
                  <span className={isContrastLight ? 'text-black font-extrabold' : 'text-white'}>
                    {lang === 'mr' ? 'जलसंचय - जल संवर्धन व पुनर्भरण' : 'Jalsanchay Rainwater & Recharge'}
                  </span>
                </div>
                <p className="text-xs opacity-80 leading-relaxed">
                  {lang === 'mr'
                    ? 'इमारती, स्वतंत्र घरे, शाळा व शेतांसाठी स्वावलंबी जल उपचार व विना-गाळ भूजल पुनर्भरण रचना.'
                    : 'Decentralized rainwater treatment & zero-clogging aquifer recharge for buildings, rooftops, houses & farms.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs font-bold">
                <a
                  href="tel:18001208040"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-black transition-all ${
                    isContrastLight
                      ? 'bg-black text-white border-black hover:bg-slate-900'
                      : 'bg-emerald-800 text-emerald-100 border-emerald-700 hover:bg-emerald-700'
                  }`}
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{lang === 'mr' ? 'जल हेल्पलाइन: 1800-120-8040' : 'Water Helpline: 1800-120-8040'}</span>
                </a>
              </div>
            </div>

            <div className="max-w-7xl mx-auto mt-4 pt-3 border-t border-current/10 flex flex-wrap items-center justify-between text-[11px] opacity-75">
              <div>
                {lang === 'mr' ? 'जलसंचय (Jalsanchay) — स्मार्ट जल संवर्धन व भूजल पुनर्भरण प्रणाली' : 'Jalsanchay — Rainwater Harvesting & Groundwater Recharge System'}
              </div>
              <div>
                {lang === 'mr' ? 'इमारती, स्वतंत्र घरे, सोसायट्या व शेतीसाठी जल सुरक्षा © 2026' : 'Sustainable Water Security for Buildings, Houses & Farms © 2026'}
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        lang={lang}
        theme={theme}
        userProfile={userProfile}
        onSaveProfile={handleUpdateProfile}
      />

      {/* Dedicated Custom Prompt Modal */}
      <CustomPromptModal
        isOpen={isCustomPromptModalOpen}
        onClose={() => setIsCustomPromptModalOpen(false)}
        lang={lang}
        theme={theme}
      />
    </div>
  );
}
