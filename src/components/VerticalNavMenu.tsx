import React from 'react';
import { 
  Calculator, 
  Umbrella, 
  Layers, 
  Bot, 
  Bell, 
  Database, 
  User, 
  Sparkles, 
  X, 
  LogOut, 
  LogIn, 
  ShieldCheck, 
  CheckCircle2,
  Smartphone,
  Mail,
  ChevronRight
} from 'lucide-react';
import { Language, AppTheme, TextScale, UserProfile } from '../types';
import { getTranslation } from '../utils/translations';
import { NavTab } from '../App';

interface VerticalNavMenuProps {
  lang: Language;
  theme: AppTheme;
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  userProfile: UserProfile;
  assessmentsCount: number;
  onOpenCustomPrompt: () => void;
  onLogout: () => void;
}

export const VerticalNavMenu: React.FC<VerticalNavMenuProps> = ({
  lang,
  theme,
  activeTab,
  onSelectTab,
  isMobileOpen,
  onCloseMobile,
  userProfile,
  assessmentsCount,
  onOpenCustomPrompt,
  onLogout,
}) => {
  const isContrastLight = theme === 'contrast-light-black';

  const navItems = [
    {
      id: 'calculator' as NavTab,
      icon: Calculator,
      label: getTranslation('navCalculator', lang),
      sublabel: lang === 'mr' ? 'इमारती, घरे व शेती जल हिशोब' : 'Buildings, Houses & Farms',
    },
    {
      id: 'umbrella_model' as NavTab,
      icon: Umbrella,
      label: getTranslation('navUmbrellaModel', lang),
      sublabel: lang === 'mr' ? 'व्हॉर्टेक्स गाळ कुंडी व व्ही-वायर' : 'Vortex Desilting Tech',
      isUmbrella: true,
    },
    {
      id: 'soil_simulator' as NavTab,
      icon: Layers,
      label: getTranslation('navSoilSimulator', lang),
      sublabel: lang === 'mr' ? 'काळी, तांबडी माती व पाझर वेग' : 'Soil Infiltration Rates',
    },
    {
      id: 'voice_consult' as NavTab,
      icon: Bot,
      label: getTranslation('navVoiceConsult', lang),
      sublabel: lang === 'mr' ? 'मराठी व हिंदी संवाद' : 'AI Hydrologist Advisory',
    },
    {
      id: 'alerts_privacy' as NavTab,
      icon: Bell,
      label: getTranslation('navAlertsPrivacy', lang),
      sublabel: lang === 'mr' ? 'पाऊस सतर्कता व गाळ सूचना' : 'Storm & Cleaning Alerts',
    },
    {
      id: 'sync_center' as NavTab,
      icon: Database,
      label: getTranslation('navSyncCenter', lang),
      sublabel: lang === 'mr' ? 'ऑफलाइन डेटा व महापालिका प्रमाणपत्र' : 'Offline Data & Audit Cert',
    },
    {
      id: 'login' as NavTab,
      icon: User,
      label: getTranslation('navLogin', lang),
      sublabel: userProfile.isLoggedIn 
        ? (userProfile.identifier || (lang === 'mr' ? 'खाते सक्रिय' : 'Logged In'))
        : (lang === 'mr' ? 'ईमेल किंवा मोबाईलने पूर्ववत करा' : 'Login & Restore Data'),
      badge: userProfile.isLoggedIn ? 'Active' : 'Restore',
    },
  ];

  const handleNavClick = (tabId: NavTab) => {
    onSelectTab(tabId);
    if (isMobileOpen) {
      onCloseMobile();
    }
  };

  const menuContent = (
    <div className="flex flex-col h-full justify-between">
      {/* Top Section */}
      <div className="space-y-4">
        {/* Brand / Logo in Sidebar */}
        <div className={`flex items-center justify-between px-2 pt-1 pb-3 border-b ${
          isContrastLight ? 'border-black' : 'border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center transform rotate-180 shrink-0 ${
                isContrastLight
                  ? 'bg-black text-white'
                  : 'bg-emerald-600 text-white shadow-xs'
              }`}
            >
              <Umbrella className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="font-black text-base leading-tight tracking-tight">
                {lang === 'mr' ? 'जलसंचय' : lang === 'hi' ? 'जलसंचय' : 'Jalsanchay'}
              </div>
              <div className={`text-[11px] font-bold ${isContrastLight ? 'text-black' : 'opacity-70'}`}>
                {lang === 'mr' ? 'पर्जन्य संवर्धन व पुनर्भरण' : 'Rainwater & Recharge Suite'}
              </div>
            </div>
          </div>

          {/* Close button for Mobile Drawer */}
          {isMobileOpen && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg bg-black/10 hover:bg-black/20 text-current"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Give Custom Prompt Button directly at top of vertical menu */}
        <button
          id="btn-sidebar-custom-prompt"
          onClick={() => {
            onOpenCustomPrompt();
            if (isMobileOpen) onCloseMobile();
          }}
          className={`w-full py-2.5 px-3.5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-between gap-2 shadow-xs transition-all active:scale-98 ${
            isContrastLight
              ? 'bg-black text-white hover:bg-slate-900 border-2 border-black'
              : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-105 text-slate-950 font-black'
          }`}
          title="Give Custom Prompt to AI Hydrologist"
        >
          <div className="flex items-center gap-2">
            <Sparkles className={`w-4 h-4 fill-current ${isContrastLight ? 'text-amber-400' : 'text-slate-950'}`} />
            <span>⚡ {getTranslation('givePromptBtn', lang)}</span>
          </div>
          <ChevronRight className="w-4 h-4 opacity-75" />
        </button>

        {/* Vertical Navigation Items */}
        <div className="space-y-1">
          <div className={`px-2 py-1 text-[11px] font-black uppercase tracking-wider ${
            isContrastLight ? 'text-black font-extrabold' : 'opacity-60'
          }`}>
            {lang === 'mr' ? 'मुख्य मेनू (Navigation)' : 'Main Navigation'}
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-between text-left transition-all active:scale-98 group ${
                    isActive
                      ? isContrastLight
                        ? 'bg-black text-white shadow-md ring-2 border-2 border-black font-black'
                        : 'bg-emerald-700 text-white shadow-sm ring-1 ring-emerald-600'
                      : isContrastLight
                      ? 'text-black hover:bg-slate-200 border border-slate-300 font-extrabold'
                      : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-950'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`p-1.5 rounded-lg shrink-0 ${
                        isActive
                          ? isContrastLight
                            ? 'bg-white text-black'
                            : 'bg-emerald-800 text-white'
                          : isContrastLight
                          ? 'bg-black text-white'
                          : 'bg-slate-100 text-slate-700 group-hover:bg-emerald-100 group-hover:text-emerald-800'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 ${item.isUmbrella ? 'transform rotate-180' : ''}`}
                      />
                    </div>
                    <div className="truncate">
                      <div className="font-extrabold truncate">{item.label}</div>
                      <div
                        className={`text-[10px] truncate ${
                          isActive
                            ? isContrastLight
                              ? 'text-slate-200 font-semibold'
                              : 'text-emerald-100'
                            : isContrastLight
                            ? 'text-slate-800 font-bold'
                            : 'opacity-65'
                        }`}
                      >
                        {item.sublabel}
                      </div>
                    </div>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 ml-1 ${
                        isActive
                          ? isContrastLight
                            ? 'bg-white text-black'
                            : 'bg-amber-400 text-black'
                          : userProfile.isLoggedIn
                          ? isContrastLight
                            ? 'bg-black text-white'
                            : 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Section: User Profile Card */}
      <div className="space-y-3 pt-4 border-t border-current/15 mt-4">
        {/* User Account Status Card */}
        <div
          className={`p-3 rounded-2xl border transition-all ${
            isContrastLight
              ? 'bg-slate-100 border-2 border-black text-black'
              : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          {userProfile.isLoggedIn ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                    {userProfile.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="truncate">
                    <div className="font-black text-xs truncate text-slate-900">
                      {userProfile.name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono truncate flex items-center gap-1">
                      {userProfile.authType === 'email' ? (
                        <Mail className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Smartphone className="w-3 h-3 text-emerald-600" />
                      )}
                      <span>{userProfile.identifier || userProfile.email || userProfile.mobile}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onLogout();
                    if (isMobileOpen) onCloseMobile();
                  }}
                  title={lang === 'mr' ? 'लॉगआउट करा (डेटा सुरक्षित राहील)' : 'Log Out (Data will stay saved)'}
                  className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-all shrink-0"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                <span className="text-slate-500">
                  {assessmentsCount} {lang === 'mr' ? 'हिशोब जतन' : 'records'}
                </span>
                <button
                  onClick={() => handleNavClick('login')}
                  className="font-bold text-emerald-700 hover:underline"
                >
                  {lang === 'mr' ? 'खाते तपशील →' : 'View Account →'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{lang === 'mr' ? 'डेटा पूर्ववत (Restore) सुविधा' : 'Data Restore Ready'}</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                {lang === 'mr'
                  ? 'ईमेल किंवा मोबाईल नंबरने लॉगिन करून मागील हिशोब त्वरित मिळवा.'
                  : 'Log in with your email or mobile to restore previous assessments.'}
              </p>
              <button
                id="btn-sidebar-login"
                onClick={() => handleNavClick('login')}
                className="w-full py-2 px-3 rounded-xl font-black text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 transition-all shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{lang === 'mr' ? 'लॉगिन / खाते उघडा' : 'Sign In / Account'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Vertical Sidebar: Visible on lg (>=1024px) screens */}
      <aside
        id="desktop-vertical-nav"
        className={`hidden lg:flex flex-col w-72 shrink-0 border-r p-4 sticky top-0 h-screen overflow-y-auto no-scrollbar transition-colors z-30 ${
          isContrastLight
            ? 'bg-white border-r-2 border-black text-black'
            : 'bg-slate-50/95 border-slate-200 text-slate-900 shadow-xs'
        }`}
      >
        {menuContent}
      </aside>

      {/* Mobile Slide-Over Vertical Drawer: Triggered when hamburger is tapped */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />

          {/* Drawer Sidebar */}
          <aside
            id="mobile-vertical-nav"
            className={`relative w-4/5 max-w-sm h-full p-4 overflow-y-auto shadow-2xl flex flex-col z-50 transition-transform ${
              isContrastLight
                ? 'bg-white border-r-2 border-black text-black'
                : 'bg-white border-r border-slate-200 text-slate-900'
            }`}
          >
            {menuContent}
          </aside>
        </div>
      )}
    </>
  );
};
