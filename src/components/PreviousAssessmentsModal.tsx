import React, { useState } from 'react';
import { 
  History, 
  X, 
  RotateCcw, 
  FileText, 
  Trash2, 
  Search, 
  MapPin, 
  Droplets, 
  Truck, 
  Calendar, 
  Building2, 
  Home, 
  Tractor, 
  School,
  ExternalLink,
  Volume2,
  CheckCircle2
} from 'lucide-react';
import { Language, AppTheme, FarmAssessment, PropertyType } from '../types';
import { speak } from '../utils/speech';

interface PreviousAssessmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  theme: AppTheme;
  assessments: FarmAssessment[];
  onLoadAssessment: (assessment: FarmAssessment) => void;
  onViewReport: (assessment: FarmAssessment) => void;
  onDeleteAssessment?: (id: string) => void;
}

export const PreviousAssessmentsModal: React.FC<PreviousAssessmentsModalProps> = ({
  isOpen,
  onClose,
  lang,
  theme,
  assessments,
  onLoadAssessment,
  onViewReport,
  onDeleteAssessment,
}) => {
  const isContrastLight = theme === 'contrast-light-black';
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filtered = assessments.filter((a) => {
    const matchesSearch =
      a.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.village.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.district.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      filterType === 'all' || (a.propertyType || 'building') === filterType;

    return matchesSearch && matchesType;
  });

  const getPropertyIcon = (propType?: PropertyType) => {
    switch (propType) {
      case 'house':
        return <Home className="w-4 h-4 text-amber-500" />;
      case 'farm':
        return <Tractor className="w-4 h-4 text-emerald-600" />;
      case 'commercial':
        return <School className="w-4 h-4 text-blue-500" />;
      case 'building':
      default:
        return <Building2 className="w-4 h-4 text-indigo-500" />;
    }
  };

  const getPropertyLabel = (propType?: PropertyType) => {
    switch (propType) {
      case 'house':
        return lang === 'mr' ? 'स्वतंत्र घर' : 'Independent House';
      case 'farm':
        return lang === 'mr' ? 'शेतजमीन' : 'Farm Land';
      case 'commercial':
        return lang === 'mr' ? 'वाणिज्य / शाळा' : 'Commercial / School';
      case 'building':
      default:
        return lang === 'mr' ? 'इमारत / सोसायटी' : 'Building / Society';
    }
  };

  const handleSpeakItem = (a: FarmAssessment) => {
    const msg =
      lang === 'mr'
        ? `${a.farmerName}, ${a.village}, ${a.district}. वार्षिक पावसाचे पाणी: ${a.harvestedLiters.toLocaleString('mr-IN')} लिटर. ${a.tankersSaved} टँकर बचत. अंदाजे खर्च: ₹${a.netCostInr.toLocaleString()}.`
        : `${a.farmerName}, ${a.village}, ${a.district}. Harvested water: ${a.harvestedLiters.toLocaleString()} liters. Saved ${a.tankersSaved} water tankers. Net cost: ₹${a.netCostInr.toLocaleString()}.`;

    speak(msg, lang);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div
        className={`w-full max-w-3xl rounded-3xl border shadow-2xl overflow-hidden my-auto transition-all ${
          isContrastLight
            ? 'bg-white border-2 border-black text-black'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 sm:p-5 border-b flex items-center justify-between ${
            isContrastLight
              ? 'bg-black border-b-2 border-black text-white'
              : 'bg-slate-900 border-slate-800 text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
              <History className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500 text-white">
                  {assessments.length} {lang === 'mr' ? 'नोंदी जतन' : 'Records Saved'}
                </span>
                <span className="text-xs font-semibold opacity-85">
                  {lang === 'mr' ? 'स्थानिक व ऑफलाइन डेटा' : 'Offline & Cached Data'}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black">
                {lang === 'mr' ? 'मागील जतन केलेले हिशोब (Previous Assessments Accessed)' : 'Previous Assessments Accessed'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={lang === 'mr' ? 'नाव, गाव किंवा जिल्ह्याने शोधा...' : 'Search by name, village, or district...'}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold bg-white text-slate-900 focus:outline-emerald-600"
            />
          </div>

          {/* Filter by Property Type */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {[
              { id: 'all', label: lang === 'mr' ? 'सर्व' : 'All' },
              { id: 'building', label: lang === 'mr' ? 'इमारती' : 'Buildings' },
              { id: 'house', label: lang === 'mr' ? 'घरे' : 'Houses' },
              { id: 'farm', label: lang === 'mr' ? 'शेती' : 'Farms' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`px-3 py-1.5 rounded-lg font-bold border transition-all ${
                  filterType === f.id
                    ? 'bg-emerald-700 text-white border-emerald-800'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* List of Previous Assessments */}
        <div className="p-4 sm:p-5 max-h-[460px] overflow-y-auto space-y-3">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-500 space-y-2">
              <History className="w-10 h-10 mx-auto opacity-40 text-slate-400" />
              <p className="font-bold text-sm">
                {lang === 'mr' ? 'कोणताही जुना हिशोब आढळला नाही.' : 'No matching previous assessments found.'}
              </p>
              <p className="text-xs">
                {lang === 'mr'
                  ? 'डॅशबोर्डवर हिशोब करून "हिशोब जतन करा" बटण दाबा.'
                  : 'Calculate on the dashboard and tap "Save Assessment" to record it.'}
              </p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-emerald-400 shadow-xs transition-all space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                      {getPropertyIcon(item.propertyType)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-sm sm:text-base text-slate-900">
                          {item.farmerName}
                        </h4>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {getPropertyLabel(item.propertyType)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{item.village}, {item.district}</span>
                        {item.geoLocation && (
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-mono">
                            GPS Verified ({item.geoLocation.latitude.toFixed(3)}°, {item.geoLocation.longitude.toFixed(3)}°)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleSpeakItem(item)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-slate-100"
                      title="Listen"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Metrics Pill Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-black text-slate-500 uppercase block">
                      {lang === 'mr' ? 'क्षेत्रफळ' : 'Area'}
                    </span>
                    <span className="font-black text-xs text-slate-800">
                      {item.landArea} {item.landUnit}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-cyan-50 border border-cyan-100 text-cyan-950">
                    <span className="text-[10px] font-black uppercase block">
                      {lang === 'mr' ? 'पाऊस साठा' : 'Harvested'}
                    </span>
                    <span className="font-black text-xs text-cyan-800">
                      {item.harvestedLiters.toLocaleString()} L
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-950">
                    <span className="text-[10px] font-black uppercase block">
                      {lang === 'mr' ? 'टँकर बचत' : 'Tankers'}
                    </span>
                    <span className="font-black text-xs text-emerald-700">
                      {item.tankersSaved} {lang === 'mr' ? 'टँकर' : 'tankers'}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-amber-50 border border-amber-100 text-amber-950">
                    <span className="text-[10px] font-black uppercase block">
                      {lang === 'mr' ? 'अंदाजे खर्च' : 'Net Cost'}
                    </span>
                    <span className="font-black text-xs text-amber-800">
                      ₹{item.netCostInr.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Actions: Load to Calculator or View Certificate */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      onViewReport(item);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>{lang === 'mr' ? 'प्रमाणपत्र पाहा' : 'View Certificate'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onLoadAssessment(item);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black shadow-xs transition-all active:scale-95"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{lang === 'mr' ? 'कॅल्क्युलेटरमध्ये भरा (Load)' : 'Load into Calculator'}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-semibold">
            {lang === 'mr'
              ? 'हे सर्व हिशोब तुमच्या फोन किंवा कॉम्प्युटरमध्ये सुरक्षित जतन आहेत.'
              : 'All records are securely persisted in local device memory.'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-black"
          >
            {lang === 'mr' ? 'बंद करा' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
