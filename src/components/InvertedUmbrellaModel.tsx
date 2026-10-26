import React, { useState } from 'react';
import { 
  Umbrella, 
  RotateCcw, 
  Layers, 
  Droplets, 
  Volume2, 
  ShieldCheck, 
  Wrench, 
  Sparkles, 
  Info,
  Check,
  Building2,
  Home,
  Tractor
} from 'lucide-react';
import { Language, AppTheme, TextScale, PropertyType } from '../types';
import { FILTRATION_STAGES } from '../data/soilAndDistricts';
import { speak } from '../utils/speech';

interface InvertedUmbrellaModelProps {
  lang: Language;
  theme: AppTheme;
  textScale: TextScale;
}

export const InvertedUmbrellaModel: React.FC<InvertedUmbrellaModelProps> = ({
  lang,
  theme,
  textScale,
}) => {
  const isSolar = theme === 'high-contrast-solar';
  const [activeStageId, setActiveStageId] = useState<number>(2); // default to filtration core (stage 2)
  const [modelType, setModelType] = useState<PropertyType>('building');

  const activeStage =
    FILTRATION_STAGES.find((s) => s.id === activeStageId) || FILTRATION_STAGES[0];

  const handleSpeakStage = () => {
    const text =
      lang === 'mr'
        ? `${activeStage.name.mr}. काम: ${activeStage.purpose.mr}. घटक: ${activeStage.components.mr}. देखभाल: ${activeStage.maintenanceFrequency.mr}. कार्यक्षमता: ${activeStage.efficiency}.`
        : lang === 'hi'
        ? `${activeStage.name.hi}. उद्देश्य: ${activeStage.purpose.hi}. घटक: ${activeStage.components.hi}. रखरखाव: ${activeStage.maintenanceFrequency.hi}.`
        : `${activeStage.name.en}. Purpose: ${activeStage.purpose.en}. Maintenance: ${activeStage.maintenanceFrequency.en}.`;

    speak(text, lang);
  };

  return (
    <div id="inverted-umbrella-model" className="space-y-6">
      {/* Filtration Architecture Banner */}
      <div
        className={`p-5 sm:p-6 rounded-2xl border transition-all shadow-sm ${
          isSolar
            ? 'bg-black text-amber-300 border-black'
            : 'bg-emerald-900 text-white border-emerald-800'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-400 text-black flex items-center justify-center font-black transform rotate-180">
              <Umbrella className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold px-2 py-0.5 rounded bg-amber-400 text-black">
                  {lang === 'mr' ? 'प्रगत गाळणी तंत्रज्ञान' : 'Advanced Filtration System'}
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black tracking-tight mt-1">
                {lang === 'mr'
                  ? 'उलट छत्री: इमारती, घरे व शेतासाठी गाळणी व पुनर्भरण मॉडेल'
                  : lang === 'hi'
                  ? 'उल्टा छाता: भवनों, मकानों व खेतों हेतु जल उपचार एवं पुनर्भरण प्रणाली'
                  : 'Inverted Umbrella: Buildings, Houses & Farm Multi-Stage Treatment'}
              </h2>
            </div>
          </div>

          <button
            onClick={handleSpeakStage}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
              isSolar
                ? 'bg-amber-300 text-black border-black hover:bg-amber-200'
                : 'bg-emerald-700 hover:bg-emerald-600 text-white border-emerald-500'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>{lang === 'mr' ? 'या टप्प्याची माहिती ऐका' : 'Listen to Active Stage'}</span>
          </button>
        </div>
      </div>

      {/* Model Setup Switcher: Building vs House vs Farm */}
      <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-black uppercase tracking-wider text-slate-500 px-2">
          {lang === 'mr' ? 'प्रणाली मॉडेल निवडा:' : 'System Setup View:'}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {[
            {
              id: 'building',
              label: lang === 'mr' ? '🏢 इमारत / सोसायटी (Society Sump & Borewell)' : '🏢 Building / Society',
              desc: 'Rooftop downpipes + Central desilter + Underground tank',
            },
            {
              id: 'house',
              label: lang === 'mr' ? '🏠 स्वतंत्र घर / बंगला (House Compact Filter)' : '🏠 House / Bungalow',
              desc: 'Wall-mounted dual chamber filter + Domestic storage',
            },
            {
              id: 'farm',
              label: lang === 'mr' ? '🌾 शेतजमीन (Farm Inverted Canopy)' : '🌾 Farm Land',
              desc: '10m x 10m Inverted Umbrella micro-catchment',
            },
          ].map((item) => {
            const isSelected = modelType === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setModelType(item.id as PropertyType)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black border transition-all ${
                  isSelected
                    ? isSolar
                      ? 'bg-black text-amber-300 border-black ring-2 ring-amber-400'
                      : 'bg-emerald-700 text-white border-emerald-800 ring-2 ring-emerald-500 shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Visualization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Cross-Section Diagram (Col 1-7) */}
        <div
          className={`lg:col-span-7 p-6 rounded-2xl border shadow-sm flex flex-col justify-between ${
            isSolar
              ? 'bg-amber-50 border-black text-black'
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-black uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-600" />
                <span>
                  {lang === 'mr' ? 'रचनेचे ४ मुख्य भाग (खालील भागावर क्लिक करा)' : 'System Cross-Section (Tap to Inspect)'}
                </span>
              </h3>
              <span className="text-xs font-bold text-slate-500">
                {modelType === 'building' ? 'Terrace to Sump & Aquifer' : modelType === 'house' ? 'Roof to Tank' : 'Farm to Borewell'}
              </span>
            </div>

            {/* Visual Interactive Stack Diagram */}
            <div className="space-y-3 relative">
              {/* Rainfall / Catchment Surface Banner */}
              <div className="text-center py-2.5 px-4 rounded-xl bg-cyan-100 border border-cyan-300 text-cyan-950 flex items-center justify-center gap-3">
                <Droplets className="w-5 h-5 text-cyan-600 animate-bounce" />
                <span className="font-extrabold text-xs sm:text-sm">
                  {modelType === 'building'
                    ? lang === 'mr' ? '🏢 इमारतीची आरसीसी गच्ची (Terrace Downpipes Collect Runoff)' : '🏢 Society Terrace Downpipes Collect Runoff'
                    : modelType === 'house'
                    ? lang === 'mr' ? '🏠 घराचे पक्के छत / कौलारू छत (Roof Catchment)' : '🏠 Independent House Roof Catchment'
                    : lang === 'mr' ? '🌾 शेतातील पाऊस (Farm Runoff)' : '🌾 Open Farm Land Precipitation'}
                </span>
                <Droplets className="w-5 h-5 text-cyan-600 animate-bounce" />
              </div>

              {/* Catchment Collector Banner */}
              <div className="relative py-4 px-3 bg-slate-900 rounded-xl text-center text-white overflow-hidden shadow-inner">
                <div className="absolute inset-0 bg-radial from-emerald-500/10 to-transparent"></div>
                <div className="flex items-center justify-center gap-2 font-black text-sm text-amber-300">
                  {modelType === 'farm' ? (
                    <Umbrella className="w-5 h-5 transform rotate-180 text-amber-400" />
                  ) : modelType === 'building' ? (
                    <Building2 className="w-5 h-5 text-amber-400" />
                  ) : (
                    <Home className="w-5 h-5 text-amber-400" />
                  )}
                  <span>
                    {modelType === 'building'
                      ? lang === 'mr' ? 'सेंट्रलाइज्ड रूफटॉप गटर व मॅनहोल चेंबर' : 'Centralized Rooftop Manhole Header'
                      : modelType === 'house'
                      ? lang === 'mr' ? 'वॉल-माउंटेड कॉम्पॅक्ट रेन हार्वेस्टर' : 'Wall-Mounted Compact Rain Inverted Funnel'
                      : lang === 'mr' ? 'उलट छत्री कॅनोपी (10m x 10m Modular Funnel)' : 'Inverted Umbrella Micro-Catchment Canopy'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  {modelType === 'building'
                    ? lang === 'mr' ? 'इमारतीच्या सर्व ड्रेन पाईप्सचे पाणी एका ठिकाणी आणून गाळणी कक्षात सोडले जाते.' : 'Consolidates multiple rooftop rainwater downspouts into a single treatment chamber.'
                    : modelType === 'house'
                    ? lang === 'mr' ? 'किमान जागेत बसणारा व भिंतीवर लटकणारा सुलभ गाळणी संच.' : 'Compact wall-hanging unit requiring zero ground footprint.'
                    : lang === 'mr' ? 'मोकळ्या शेतातील ९५% पाणी मध्यभागी खेचून एका पाईपमध्ये गोळा करते.' : 'Funnels 95% surface runoff directly into central intake pipe.'}
                </p>
              </div>

              {/* 4 Clickable Filtration & Recharge Stages */}
              {FILTRATION_STAGES.map((stage) => {
                const isSelected = activeStageId === stage.id;
                return (
                  <button
                    key={stage.id}
                    id={`stage-card-${stage.id}`}
                    onClick={() => setActiveStageId(stage.id)}
                    className={`w-full p-4 rounded-xl border text-left transition-all relative overflow-hidden ${
                      isSelected
                        ? isSolar
                          ? 'bg-black text-amber-300 border-black ring-4 ring-amber-400 shadow-md'
                          : 'bg-emerald-50 border-emerald-600 text-emerald-950 ring-2 ring-emerald-500 shadow-md'
                        : isSolar
                        ? 'bg-white border-black text-black hover:bg-amber-100'
                        : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
                            isSelected
                              ? isSolar
                                ? 'bg-amber-400 text-black'
                                : 'bg-emerald-600 text-white'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {stage.id}
                        </div>
                        <div>
                          <div className="font-black text-sm sm:text-base leading-tight">
                            {stage.name[lang] || stage.name.en}
                          </div>
                          <div className="text-xs font-semibold opacity-75 mt-0.5">
                            {stage.components[lang] || stage.components.en}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[11px] font-black px-2 py-0.5 rounded ${
                          isSelected
                            ? isSolar
                              ? 'bg-amber-300 text-black'
                              : 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {stage.efficiency}
                      </span>
                    </div>
                  </button>
                );
              })}

              {/* Deep Aquifer Discharge Layer */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-950 text-white text-center font-extrabold text-xs flex items-center justify-center gap-2 shadow-inner">
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span>
                  {modelType === 'building'
                    ? lang === 'mr' ? 'तळघरातील पाण्याच्या टाक्या (Sump Tank) + बोअरवेल पुनर्भरण' : 'Underground Sump Tank Storage + Aquifer Injection'
                    : modelType === 'house'
                    ? lang === 'mr' ? 'घरगुती साठवण टाकी (Domestic Sump) + विहीर पुनर्भरण' : 'Domestic Clean Water Tank + Borewell Recharge'
                    : lang === 'mr' ? 'खोल भूजल साठा (Confined Deep Aquifer) - पाण्याचा कायमस्वरूपी साठा' : 'Deep Aquifer Recharge'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t text-xs font-bold opacity-75 flex items-center gap-2 text-emerald-800">
            <Info className="w-4 h-4" />
            <span>
              {lang === 'mr'
                ? 'या तंत्रज्ञानामुळे बोअरवेल व पाण्याच्या टाक्यांमध्ये गाळ साचण्याचा धोका ०% होतो.'
                : 'Zero-clogging multi-stage vortex mechanism prevents silt choking completely across houses, buildings & farms.'}
            </span>
          </div>
        </div>

        {/* Right Column: Detailed Stage Inspector & Farmer Advice (Col 8-12) */}
        <div className="lg:col-span-5 space-y-4">
          <div
            className={`p-6 rounded-2xl border shadow-sm space-y-4 ${
              isSolar
                ? 'bg-amber-100 border-black text-black'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between border-b pb-3 border-current/15">
              <span className="text-xs font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
                {lang === 'mr' ? `टप्पा क्रमांक ${activeStage.id}` : `Stage ${activeStage.id} Inspection`}
              </span>
              <button
                onClick={handleSpeakStage}
                className="text-xs font-bold flex items-center gap-1 text-emerald-700 hover:text-emerald-900"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{lang === 'mr' ? 'ऐका' : 'Listen'}</span>
              </button>
            </div>

            {/* Stage Name */}
            <div>
              <h4 className="text-lg sm:text-xl font-black text-emerald-950 leading-tight">
                {activeStage.name[lang] || activeStage.name.en}
              </h4>
            </div>

            {/* Purpose */}
            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 block">
                {lang === 'mr' ? 'हे काय काम करते?' : lang === 'hi' ? 'यह क्या काम करता है?' : 'What does this do?'}
              </span>
              <p className="text-sm sm:text-base font-bold text-slate-800 leading-relaxed">
                {activeStage.purpose[lang] || activeStage.purpose.en}
              </p>
            </div>

            {/* Components */}
            <div className="space-y-1 p-3.5 rounded-xl bg-slate-100 border border-slate-200">
              <span className="text-xs font-black uppercase tracking-wider text-slate-600 block">
                {lang === 'mr' ? 'यात काय साहित्य असते?' : lang === 'hi' ? 'इसमें क्या सामग्री है?' : 'Components & Materials'}
              </span>
              <p className="text-xs sm:text-sm font-semibold text-slate-800">
                {activeStage.components[lang] || activeStage.components.en}
              </p>
            </div>

            {/* Maintenance Routine */}
            <div className="space-y-1 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950">
              <span className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5" />
                <span>
                  {lang === 'mr' ? 'देखभाल कशी करावी?' : lang === 'hi' ? 'रखरखाव कैसे करें?' : 'Routine Maintenance'}
                </span>
              </span>
              <p className="text-xs sm:text-sm font-bold leading-relaxed">
                {activeStage.maintenanceFrequency[lang] || activeStage.maintenanceFrequency.en}
              </p>
            </div>

            {/* Efficiency Highlight */}
            <div className="p-3 rounded-xl bg-emerald-600 text-white flex items-center justify-between font-black text-sm">
              <span>{lang === 'mr' ? 'गाळणी परिणामकारकता:' : 'Filtration Efficiency:'}</span>
              <span className="text-amber-300">{activeStage.efficiency}</span>
            </div>
          </div>

          {/* Quick Municipal Tax & Society Benefit Card */}
          <div
            className={`p-5 rounded-2xl border shadow-sm ${
              isSolar
                ? 'bg-black text-amber-300 border-black'
                : 'bg-emerald-950 text-emerald-100 border-emerald-900'
            }`}
          >
            <div className="flex items-center gap-2 mb-2 font-black text-sm text-emerald-300">
              <ShieldCheck className="w-4 h-4" />
              <span>
                {lang === 'mr'
                  ? 'सोसायटी व घरांसाठी मालमत्ता कर सवलत (Tax Rebate)'
                  : 'Municipal Tax Rebate & Sump Safety'}
              </span>
            </div>
            <p className="text-xs font-medium opacity-90 leading-relaxed">
              {lang === 'mr'
                ? 'पुणे, मुंबई आणि पिंपरी चिंचवड महानगरपालिकेमध्ये ज्या सोसायट्या रेन वॉटर हार्वेस्टिंग यंत्रणा कार्यान्वित ठेवतात, त्यांना सामान्य मालमत्ता करात ५% ते १०% थेट सवलत मिळते. तसेच उन्हाळ्यात टँकरचे हजारो रुपये वाचतात.'
                : 'Housing societies with operational rainwater harvesting qualify for 5% to 10% annual Property Tax rebates from Municipal Corporations, alongside massive cuts in summer tanker expenditures.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
