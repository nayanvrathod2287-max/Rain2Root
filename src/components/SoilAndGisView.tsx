import React, { useState } from 'react';
import { 
  Layers, 
  Droplets, 
  TrendingDown, 
  Sparkles, 
  Volume2, 
  MapPin, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { Language, AppTheme, TextScale, SoilType } from '../types';
import { SOIL_TYPES_DATA } from '../data/soilAndDistricts';
import { speak } from '../utils/speech';

interface SoilAndGisViewProps {
  lang: Language;
  theme: AppTheme;
  textScale: TextScale;
  onSelectStructure: (soil: SoilType) => void;
}

export const SoilAndGisView: React.FC<SoilAndGisViewProps> = ({
  lang,
  theme,
  textScale,
  onSelectStructure,
}) => {
  const isContrastLight = theme === 'contrast-light-black';
  const [selectedSoil, setSelectedSoil] = useState<SoilType>('black_cotton');
  const [isSimulating, setIsSimulating] = useState(false);

  const soilData = SOIL_TYPES_DATA[selectedSoil];

  const handleSimulateInfiltration = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
    }, 2500);
  };

  const handleSpeakSoil = () => {
    const text =
      lang === 'mr'
        ? `${soilData.name.mr}. वर्णन: ${soilData.description.mr}. पाणी जिरण्याची गती: ${soilData.infiltrationRateMmHr} मिलिमीटर प्रति तास. शिफारस: ${soilData.rechargeMethodRecommended.mr}.`
        : lang === 'hi'
        ? `${soilData.name.hi}. विवरण: ${soilData.description.hi}. अवशोषण दर: ${soilData.infiltrationRateMmHr} मिमी प्रति घंटा। अनुशंसित संरचना: ${soilData.rechargeMethodRecommended.hi}.`
        : `${soilData.name.en}. Infiltration Rate: ${soilData.infiltrationRateMmHr} mm per hour. Recommendation: ${soilData.rechargeMethodRecommended.en}.`;

    speak(text, lang);
  };

  return (
    <div id="soil-gis-view" className="space-y-6">
      {/* Top Banner */}
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
              <Layers className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                {lang === 'mr'
                  ? 'मातीचा प्रकार व जल पाझर सिम्युलेटर (GIS Soil Profiler)'
                  : lang === 'hi'
                  ? 'मिट्टी का प्रकार एवं जल अवशोषण सिमुलेटर'
                  : 'GIS Soil Strata & Infiltration Simulator'}
              </h2>
              <p className="text-xs sm:text-sm font-medium opacity-85 mt-0.5">
                {lang === 'mr'
                  ? 'विविध जमिनींची पाणी जिरवण्याची क्षमता वेगवेगळी असते. तुमच्या शेताची माती निवडून पाहा!'
                  : 'Compare soil water infiltration capacities and see why black cotton and rocky soils need artificial recharge.'}
              </p>
            </div>
          </div>

          <button
            onClick={handleSpeakSoil}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
              isContrastLight
                ? 'bg-black text-white border-2 border-black'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300'
            }`}
          >
            <Volume2 className="w-4 h-4 text-emerald-600" />
            <span>{lang === 'mr' ? 'मातीचा सल्ला ऐका' : 'Listen Advice'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Soil Selection Cards + Visual Infiltration Tank Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 4 Soil Cards (Col 1-5) */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-600 px-1">
            {lang === 'mr' ? 'शेतातील माती निवडा:' : 'Select Soil Type:'}
          </h3>

          {(Object.keys(SOIL_TYPES_DATA) as SoilType[]).map((key) => {
            const item = SOIL_TYPES_DATA[key];
            const isSelected = selectedSoil === key;
            return (
              <button
                key={key}
                id={`soil-btn-${key}`}
                onClick={() => setSelectedSoil(key)}
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
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm sm:text-base">
                    {item.name[lang] || item.name.en}
                  </span>
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/20"
                    style={{ backgroundColor: item.colorHex }}
                  ></span>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs font-bold">
                  <span className="opacity-75">
                    {lang === 'mr' ? 'पाझर गती:' : 'Infiltration:'}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-black/5 text-emerald-900 font-extrabold">
                    {item.infiltrationRateMmHr} mm/hr
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Infiltration & Water Table Simulator (Col 6-12) */}
        <div
          className={`lg:col-span-7 p-6 rounded-2xl border shadow-sm space-y-5 ${
            isContrastLight
              ? 'bg-white border-2 border-black text-black'
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          <div className="flex items-center justify-between border-b pb-3 border-current/15">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 block">
                {lang === 'mr' ? 'जल पाझर चाचणी' : 'Hydraulic Infiltration Test'}
              </span>
              <h4 className="text-lg font-black">{soilData.name[lang] || soilData.name.en}</h4>
            </div>

            <button
              id="btn-run-sim"
              onClick={handleSimulateInfiltration}
              disabled={isSimulating}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-sm transition-all ${
                isSimulating
                  ? 'bg-cyan-600 text-white animate-pulse'
                  : isContrastLight
                  ? 'bg-black text-white hover:bg-slate-900 border-2 border-black'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <Droplets className="w-4 h-4" />
              <span>
                {isSimulating
                  ? lang === 'mr'
                    ? 'पाणी वाहत आहे...'
                    : 'Water Infiltrating...'
                  : lang === 'mr'
                  ? 'पाऊस पाडून पाहा!'
                  : 'Simulate Rainfall'}
              </span>
            </button>
          </div>

          {/* Visual Infiltration Column Simulation */}
          <div className="space-y-3">
            {/* Surface Runoff vs Deep Infiltration Gauges */}
            <div className="p-4 rounded-xl bg-slate-900 text-white relative overflow-hidden shadow-inner">
              <div className="text-xs font-bold text-slate-400 mb-2 flex items-center justify-between">
                <span>{lang === 'mr' ? 'जमिनीखाली पाणी जाण्याची गती' : 'Soil Profile Percolation Depth'}</span>
                <span className="text-cyan-300 font-extrabold">{soilData.infiltrationRateMmHr} mm/hr</span>
              </div>

              {/* Graphical representation of ground soil */}
              <div className="h-28 rounded-lg relative overflow-hidden flex flex-col justify-end p-2"
                style={{ backgroundColor: soilData.colorHex }}>
                {/* Surface Runoff Stream */}
                <div 
                  className={`absolute top-0 left-0 right-0 h-4 bg-cyan-400/80 transition-all ${
                    isSimulating ? 'animate-pulse' : ''
                  }`}
                  title="Surface Water Runoff"
                ></div>

                {/* Animated Drops if Simulating */}
                {isSimulating && (
                  <div className="absolute inset-0 flex items-center justify-around opacity-60">
                    <span className="w-1.5 h-6 bg-cyan-300 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-8 bg-cyan-200 rounded-full animate-bounce delay-75"></span>
                    <span className="w-1.5 h-5 bg-cyan-300 rounded-full animate-bounce delay-150"></span>
                  </div>
                )}

                <div className="bg-black/60 backdrop-blur-xs p-2 rounded text-[11px] text-white font-medium flex items-center justify-between">
                  <span>{lang === 'mr' ? 'स्वाभाविक पाणी मुरणे:' : 'Natural Infiltration:'}</span>
                  <span className="font-extrabold text-amber-300">
                    {soilData.infiltrationRateMmHr < 10
                      ? lang === 'mr'
                        ? 'अति मंद (पाणी वाहून वाया जाते)'
                        : 'Extremely Slow (Runoff Wasted)'
                      : lang === 'mr'
                      ? 'चांगले पाझरणे'
                      : 'Good Natural Absorption'}
                  </span>
                </div>
              </div>
            </div>

            {/* Scientific Explanation for Farmers */}
            <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-600 block">
                {lang === 'mr' ? 'या जमिनीचे वैशिष्ट्य:' : 'Soil Characteristics & Diagnosis:'}
              </span>
              <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
                {soilData.description[lang] || soilData.description.en}
              </p>
              <p className="text-xs sm:text-sm font-bold text-emerald-800 leading-relaxed pt-1 border-t border-slate-200">
                {soilData.suitabilityNote[lang] || soilData.suitabilityNote.en}
              </p>
            </div>

            {/* Recommended Custom Structure */}
            <div className="p-4 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[11px] font-black uppercase text-emerald-900 tracking-wider">
                  {lang === 'mr' ? 'शिफारस केलेले मॉडेल:' : 'Recommended Structure:'}
                </span>
                <div className="text-sm sm:text-base font-extrabold text-emerald-950">
                  {soilData.rechargeMethodRecommended[lang] || soilData.rechargeMethodRecommended.en}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
