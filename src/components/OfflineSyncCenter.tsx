import React, { useState } from 'react';
import { 
  Database, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  FileText, 
  Printer, 
  CheckCircle2, 
  Clock, 
  Download, 
  ShieldCheck, 
  Award,
  Umbrella
} from 'lucide-react';
import { Language, AppTheme, TextScale, FarmAssessment } from '../types';
import { getTranslation } from '../utils/translations';
import { getLastSyncTime } from '../utils/offlineStorage';

interface OfflineSyncCenterProps {
  lang: Language;
  theme: AppTheme;
  textScale: TextScale;
  assessments: FarmAssessment[];
  isOnline: boolean;
  isSyncing: boolean;
  onManualSync: () => void;
  syncMessage: string;
}

export const OfflineSyncCenter: React.FC<OfflineSyncCenterProps> = ({
  lang,
  theme,
  textScale,
  assessments,
  isOnline,
  isSyncing,
  onManualSync,
  syncMessage,
}) => {
  const isContrastLight = theme === 'contrast-light-black';
  const [selectedAssessmentForPrint, setSelectedAssessmentForPrint] = useState<FarmAssessment | null>(
    assessments[0] || null
  );

  const lastSync = getLastSyncTime();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="offline-sync-center" className="space-y-6">
      {/* Header Banner */}
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
              <Database className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                  {lang === 'mr'
                    ? 'स्थानिक डेटा व रिअल-टाइम सिंक केंद्र'
                    : 'Rural Offline Data & Real-Time Sync Hub'}
                </h2>
                <span
                  className={`text-xs font-black px-2.5 py-0.5 rounded flex items-center gap-1 ${
                    isOnline
                      ? 'bg-emerald-100 text-emerald-900'
                      : 'bg-red-100 text-red-900 animate-pulse'
                  }`}
                >
                  {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
                  <span>{isOnline ? 'Online (सिंक सक्रिय)' : 'Offline (स्थानिक सुरक्षित)'}</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium opacity-85 mt-0.5">
                {lang === 'mr'
                  ? 'शेत किंवा दुर्गम भागात इंटरनेट नसतानाही संपूर्ण ॲप सुरळीत चालते. इंटरनेट आल्यावर आपोआप सर्व्हरशी सिंक होते.'
                  : 'Zero connectivity local caching enables farmers to compute runoff and save plans offline in remote fields.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-trigger-sync"
              onClick={onManualSync}
              disabled={isSyncing}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 shadow-sm transition-all active:scale-95 ${
                isContrastLight
                  ? 'bg-black text-white hover:bg-slate-900 border-2 border-black'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'सिंक होत आहे...' : getTranslation('syncNow', lang)}</span>
            </button>
          </div>
        </div>

        {syncMessage && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-950 font-bold text-xs">
            {syncMessage}
          </div>
        )}
      </div>

      {/* Grid: Saved Records on Left, Printable Panchayat Audit Certificate on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Saved Records List (Col 1-5) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-600">
              {lang === 'mr' ? 'जतन केलेले शेत हिशोब:' : 'Saved Farm Assessments:'}
            </h3>
            <span className="text-xs font-bold text-slate-500">
              {assessments.length} {lang === 'mr' ? 'नोंदी' : 'records'}
            </span>
          </div>

          {assessments.length === 0 ? (
            <div className="p-8 rounded-2xl border text-center text-slate-500 bg-white space-y-2">
              <Database className="w-8 h-8 mx-auto opacity-40" />
              <p className="font-bold text-sm">
                {lang === 'mr'
                  ? 'अद्याप कोणताही हिशोब जतन केलेला नाही. गणक (Calculator) मध्ये जाऊन "जतन करा" दाबा.'
                  : 'No offline records yet. Calculate and tap "Save Assessment Offline".'}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {assessments.map((item) => {
                const isSelected = selectedAssessmentForPrint?.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedAssessmentForPrint(item)}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${
                      isSelected
                        ? isContrastLight
                          ? 'bg-black text-white border-2 border-black ring-2 ring-black'
                          : 'bg-emerald-50 border-emerald-600 text-emerald-950 ring-2 ring-emerald-500 shadow-sm'
                        : isContrastLight
                        ? 'bg-white border-2 border-slate-300 text-black hover:bg-slate-50'
                        : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-black text-sm sm:text-base">
                          {item.farmerName} - {item.village}
                        </div>
                        <div className="text-xs font-semibold opacity-75 mt-0.5">
                          {item.landArea} {item.landUnit} ({item.district})
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                          item.syncStatus === 'synced'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.syncStatus === 'synced' ? 'Synced' : 'Pending'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-current/15 text-xs font-bold">
                      <span>{item.harvestedLiters.toLocaleString()} L</span>
                      <span className="text-emerald-700">{item.tankersSaved} {lang === 'mr' ? 'टँकर' : 'Tankers'}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Sync Architecture Details */}
          <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 space-y-1">
            <span className="font-black block uppercase text-slate-900">
              {lang === 'mr' ? 'स्थानिक कॅशिंग कार्यपद्धती:' : 'Offline Sync Protocol:'}
            </span>
            <p className="leading-relaxed">
              {lang === 'mr'
                ? 'सर्व कॅल्क्युलेशन्स, मातीचे डेटाबेस व शेताचे अहवाल फोनच्या मेमरीमध्ये (Local Storage) राहतात. शेतात नेटवर्क नसले तरी अहवाल तत्काळ जनरेट करता येतो.'
                : 'All hydrology calculations and assessments reside in secure client-side storage, transmitting to server when bandwidth resumes.'}
            </p>
          </div>
        </div>

        {/* Right Column: Printable Panchayat Certificate (Col 6-12) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>
                {lang === 'mr' ? 'ग्रामपंचायत व बँक पुनर्भरण प्रमाणपत्र:' : 'Panchayat & Subsidy Audit Certificate:'}
              </span>
            </h3>

            <button
              id="btn-print-action"
              onClick={handlePrint}
              disabled={!selectedAssessmentForPrint}
              className={`px-3 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 border shadow-sm transition-all ${
                isContrastLight
                  ? 'bg-black text-white border-2 border-black hover:bg-slate-900'
                  : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-300'
              }`}
            >
              <Printer className="w-3.5 h-3.5 text-emerald-600" />
              <span>{lang === 'mr' ? 'प्रिंट करा (Print/PDF)' : 'Print Certificate'}</span>
            </button>
          </div>

          {selectedAssessmentForPrint ? (
            <div
              id="printable-certificate"
              className="p-6 rounded-2xl border-2 border-slate-300 bg-white text-slate-900 shadow-md space-y-4 font-sans"
            >
              {/* Header Certificate Seal */}
              <div className="text-center border-b-2 border-emerald-900 pb-3 space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black uppercase">
                  <Award className="w-3.5 h-3.5" />
                  <span>Jal Jeevan Mission & Atal Bhujal Yojana Aligned</span>
                </div>
                <h4 className="text-lg sm:text-xl font-black text-emerald-950 uppercase tracking-wide">
                  {lang === 'mr'
                    ? 'उलट छत्री - कृत्रिम भूजल पुनर्भरण तांत्रिक मूल्यमापन प्रमाणपत्र'
                    : 'Inverted Umbrella - Artificial Recharge Technical Audit Certificate'}
                </h4>
                <p className="text-xs text-slate-600 font-bold">
                  प्रकल्प क्र. ४ (सीईपी कॅपस्टोन व पेटंट आर्किटेक्चर) | ग्रामपंचायत व कृषी अनुदान सादरतेसाठी
                </p>
              </div>

              {/* Certificate Details */}
              <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                <div>
                  <span className="text-slate-500 font-bold block text-[11px]">शेतकऱ्याचे नाव / लाभार्थी:</span>
                  <span className="font-black text-slate-900">{selectedAssessmentForPrint.farmerName}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block text-[11px]">गाव व जिल्हा:</span>
                  <span className="font-black text-slate-900">
                    {selectedAssessmentForPrint.village}, {selectedAssessmentForPrint.district}
                  </span>
                  {selectedAssessmentForPrint.geoLocation && (
                    <span className="block text-[10px] text-emerald-800 font-mono mt-0.5">
                      📍 GPS: {selectedAssessmentForPrint.geoLocation.latitude.toFixed(4)}°N, {selectedAssessmentForPrint.geoLocation.longitude.toFixed(4)}°E
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-slate-500 font-bold block text-[11px]">कॅचमेंट क्षेत्रफळ:</span>
                  <span className="font-black text-slate-900">
                    {selectedAssessmentForPrint.landArea} {selectedAssessmentForPrint.landUnit} (
                    {selectedAssessmentForPrint.areaInSqFt.toLocaleString()} sq.ft)
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block text-[11px]">पृष्ठभाग प्रकार:</span>
                  <span className="font-black text-slate-900">
                    {selectedAssessmentForPrint.surfaceType}
                  </span>
                </div>
              </div>

              {/* Core Audit Metrics Highlight */}
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
                <div>
                  <span className="text-[11px] font-bold text-slate-600 block">वार्षिक जल संचयन:</span>
                  <span className="text-base sm:text-lg font-black text-emerald-900">
                    {selectedAssessmentForPrint.harvestedLiters.toLocaleString()} L
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-600 block">पाण्याचे टँकर बचत:</span>
                  <span className="text-base sm:text-lg font-black text-amber-600">
                    {selectedAssessmentForPrint.tankersSaved} टँकर
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-[11px] font-bold text-slate-600 block">शासकीय अनुदान (६५%):</span>
                  <span className="text-base sm:text-lg font-black text-emerald-700">
                    ₹{selectedAssessmentForPrint.subsidyAmountInr.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Structure Recommendation & Specifications */}
              <div className="text-xs space-y-1 border-t pt-2 border-slate-200">
                <span className="font-black text-slate-800 block">शिफारस केलेली पुनर्भरण रचना:</span>
                <p className="font-bold text-emerald-900">
                  {selectedAssessmentForPrint.recommendedStructure}
                </p>
                <div className="flex items-center justify-between pt-1 text-slate-600">
                  <span>शेतकऱ्याचा प्रत्यक्ष खर्च: ₹{selectedAssessmentForPrint.netCostInr.toLocaleString()}</span>
                  <span>दिनांक: {new Date(selectedAssessmentForPrint.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Footer Signatures for Gram Panchayat */}
              <div className="pt-4 flex items-center justify-between border-t border-dashed border-slate-300 text-[11px] font-bold text-slate-500">
                <div>
                  <span>तांत्रिक अभियंता स्वाक्षरी</span>
                  <div className="h-6"></div>
                  <span>(टीम ४ - इनव्हर्टेड अम्ब्रेला)</span>
                </div>
                <div className="text-right">
                  <span>ग्रामसेवक / सरपंच स्वाक्षरी व शिक्का</span>
                  <div className="h-6"></div>
                  <span>(ग्रामपंचायत कार्यालय)</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl border text-center text-slate-500 bg-white">
              {lang === 'mr' ? 'कोणतीही नोंद निवडलेली नाही.' : 'Select an assessment to preview certificate.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
