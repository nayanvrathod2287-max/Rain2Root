import React, { useState } from 'react';
import { 
  Calculator, 
  Droplets, 
  Truck, 
  TrendingUp, 
  ShieldCheck, 
  Volume2, 
  Save, 
  FileText, 
  CheckCircle2, 
  ArrowRight,
  Home,
  Building2,
  Tractor,
  School,
  Sparkles,
  HelpCircle,
  Percent,
  MapPin,
  Navigation,
  History,
  PlusCircle,
  RotateCcw,
  Compass,
  Satellite,
  X,
  AlertCircle
} from 'lucide-react';
import { 
  Language, 
  AppTheme, 
  TextScale, 
  CatchmentUnit, 
  SurfaceType, 
  SoilType, 
  FarmAssessment,
  PropertyType,
  GeoLocationData
} from '../types';
import { getTranslation } from '../utils/translations';
import { 
  DISTRICTS, 
  SOIL_TYPES_DATA, 
  SURFACE_RUNOFF_COEFFICIENTS,
  DistrictInfo 
} from '../data/soilAndDistricts';
import { speak } from '../utils/speech';
import { GpsLocationMapModal } from './GpsLocationMapModal';
import { PreviousAssessmentsModal } from './PreviousAssessmentsModal';

interface CalculatorViewProps {
  lang: Language;
  theme: AppTheme;
  textScale: TextScale;
  assessments: FarmAssessment[];
  onSaveAssessment: (assessment: FarmAssessment) => void;
  onDeleteAssessment?: (id: string) => void;
  onNavigateToModel: () => void;
  onNavigateToReport: () => void;
  onOpenCustomPrompt: () => void;
}

export const CalculatorView: React.FC<CalculatorViewProps> = ({
  lang,
  theme,
  textScale,
  assessments,
  onSaveAssessment,
  onDeleteAssessment,
  onNavigateToModel,
  onNavigateToReport,
  onOpenCustomPrompt,
}) => {
  const isSolar = theme === 'high-contrast-solar';
  const isContrastLight = theme === 'contrast-light-black';

  // Process workflow state (for "give button to process after giving all info")
  const [isProcessed, setIsProcessed] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processedTimestamp, setProcessedTimestamp] = useState<string>(() =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );

  // Property Selection: House / Building / Commercial / Farm
  const [propertyType, setPropertyType] = useState<PropertyType>('building');

  // Form State
  const [ownerName, setOwnerName] = useState('गोकुळ गृहनिर्माण संस्था (Gokul Society)');
  const [villageOrCity, setVillageOrCity] = useState('पुणे / Baramati');
  const [areaValue, setAreaValue] = useState<number>(4500); // 4500 sq ft terrace
  const [unit, setUnit] = useState<CatchmentUnit>('sqft');
  const [surface, setSurface] = useState<SurfaceType>('rcc_terrace');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('pune_rural');
  const [soilType, setSoilType] = useState<SoilType>('black_cotton');
  const [savedSuccessMsg, setSavedSuccessMsg] = useState(false);

  // GPS & Map State
  const [geoLocation, setGeoLocation] = useState<GeoLocationData | null>(null);
  const [isGpsModalOpen, setIsGpsModalOpen] = useState(false);

  // Previous Assessments Modal State
  const [isPreviousModalOpen, setIsPreviousModalOpen] = useState(false);

  // New Assessment Choice Modal State
  const [isNewAssessmentModalOpen, setIsNewAssessmentModalOpen] = useState(false);

  // Transient Alert notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Conversion to Sq. Feet
  const getAreaInSqFt = (val: number, u: CatchmentUnit): number => {
    switch (u) {
      case 'guntha':
        return val * 1089;
      case 'acre':
        return val * 43560;
      case 'sqm':
        return val * 10.7639;
      case 'sqft':
      default:
        return val;
    }
  };

  const areaSqFt = getAreaInSqFt(areaValue, unit);
  const areaSqM = areaSqFt * 0.092903;

  const district = DISTRICTS.find((d) => d.id === selectedDistrictId) || DISTRICTS[0];
  const rainfallMm = district.annualRainfallMm;
  const runoffCoeff = SURFACE_RUNOFF_COEFFICIENTS[surface] || 0.85;

  // Hydrological Formula: Liters = Area (sq.m) * Rainfall (mm) * Runoff Coefficient
  const totalLitersHarvested = Math.round(areaSqM * rainfallMm * runoffCoeff);
  const tankersSaved = Math.round(totalLitersHarvested / 5000);
  const dailyRechargeLiters = Math.round(totalLitersHarvested / (district.monsoonDays || 45));
  const estimatedSavingsRupees = tankersSaved * 1200; // Average ₹1,200 per 5000L commercial tanker

  // Cost & Subsidy Estimation (INR)
  let baseCost = 28000;
  let subsidyPercent = 0.50; // default 50%
  let subsidyTag = 'Subsidy / Rebate';

  if (propertyType === 'building') {
    baseCost = 35000;
    subsidyPercent = 0.10; // 5-10% Property Tax Rebate annually + Society grant
    subsidyTag = lang === 'mr' ? '१०% मालमत्ता कर सवलत + सोसायटी अनुदान' : '10% Municipal Tax Rebate';
  } else if (propertyType === 'house') {
    baseCost = 22000;
    subsidyPercent = 0.30;
    subsidyTag = lang === 'mr' ? 'घर कर सवलत व जल मिशन' : 'Water Mission Subsidy';
  } else if (propertyType === 'farm') {
    baseCost = 38000;
    subsidyPercent = 0.65; // Atal Bhujal 65%
    subsidyTag = lang === 'mr' ? 'अटल भूजल योजना (६५% अनुदान)' : 'Atal Bhujal 65% Subsidy';
  } else {
    baseCost = 45000;
    subsidyPercent = 0.40;
    subsidyTag = 'Green Building Incentive';
  }

  const grossCost = Math.round(baseCost + (areaSqFt / 1000) * 3800);
  const subsidyGrant = Math.round(grossCost * subsidyPercent);
  const netOwnerCost = grossCost - subsidyGrant;

  // Tailored Recommended Structure
  const getRecommendedStructure = () => {
    switch (propertyType) {
      case 'building':
        return lang === 'mr'
          ? 'इमारत रूफटॉप फर्स्ट-फ्लश + मल्टी-स्टॅक वाळू फिल्टर + तळघर संप टाकी साठा व बोअरवेल रिचार्ज'
          : lang === 'hi'
          ? 'इमारत रूफटॉप फर्स्ट-फ्लश + मल्टी-स्टैक सैंड फिल्टर + भूमिगत टैंक व बोरवेल रिचार्ज'
          : 'Building Centralized Rooftop First-Flush + Multi-Stack Filter + Sump Storage & Borewell Injection Shaft';
      case 'house':
        return lang === 'mr'
          ? 'वॉल-माउंटेड २-स्तरीय रेन फिल्टर + ५०००L अंडरग्राउंड टाकी साठा + सांडपाणी विरहीत रिचार्ज खड्डा'
          : lang === 'hi'
          ? 'वॉल-माउंटेड 2-स्तरीय फिल्टर + अंडरग्राउंड टैंक + सुरक्षित रिचार्ज पिट'
          : 'Wall-Mounted Compact Dual-Stage Rooftop Filter + Sump Storage + Groundwater Recharge Pit';
      case 'commercial':
        return lang === 'mr'
          ? 'हाय-कॅपॅसिटी सायक्लोनिक सेपरेटर + इन्फिल्ट्रेशन ट्रेंच + सेंट्रलाइज्ड रिचार्ज बोरवेल'
          : lang === 'hi'
          ? 'हाई-कैपेसिटी साइक्लोनिक सेपरेटर + इन्फिल्ट्रेशन ट्रेंच + रिचार्ज बोरवेल'
          : 'High-Capacity Cyclonic Desilter + Infiltration Trench + Deep Aquifer Recharge Borewell';
      case 'farm':
      default:
        return lang === 'mr'
          ? 'उलट छत्री फनेल कॅनोपी + व्हॉर्टेक्स गाळ कुंडी + व्ही-वायर विना-चोक बोअरवेल इंजेक्शन'
          : lang === 'hi'
          ? 'उल्टा छाता फनल + हाइड्रो-साइक्लोन सिल्ट चैंबर + बोरवेल रिचार्ज शाफ्ट'
          : 'Inverted Umbrella Canopy Funnel + Vortex Desilting Chamber + Non-Clogging Borewell Injection';
    }
  };

  const handlePropertyChange = (newType: PropertyType) => {
    setPropertyType(newType);
    if (newType === 'building') {
      setOwnerName('गोकुळ गृहनिर्माण संस्था (Housing Society)');
      setAreaValue(5000);
      setUnit('sqft');
      setSurface('rcc_terrace');
    } else if (newType === 'house') {
      setOwnerName('राजेश देशपांडे (House Owner)');
      setAreaValue(1500);
      setUnit('sqft');
      setSurface('rcc_terrace');
    } else if (newType === 'farm') {
      setOwnerName('रामराव पाटील (शेतकरी)');
      setAreaValue(4);
      setUnit('guntha');
      setSurface('inverted_umbrella');
    } else {
      setOwnerName('आदर्श विद्यालय / संकुल (Institution)');
      setAreaValue(12000);
      setUnit('sqft');
      setSurface('tin_shed');
    }
  };

  // 1. Clear Point: Start New Assessment
  const handleStartNewAssessment = (type: PropertyType = 'building') => {
    setPropertyType(type);
    setGeoLocation(null);
    if (type === 'building') {
      setOwnerName('');
      setVillageOrCity('');
      setAreaValue(5000);
      setUnit('sqft');
      setSurface('rcc_terrace');
    } else if (type === 'house') {
      setOwnerName('');
      setVillageOrCity('');
      setAreaValue(1500);
      setUnit('sqft');
      setSurface('rcc_terrace');
    } else if (type === 'farm') {
      setOwnerName('');
      setVillageOrCity('');
      setAreaValue(2);
      setUnit('guntha');
      setSurface('inverted_umbrella');
    } else {
      setOwnerName('');
      setVillageOrCity('');
      setAreaValue(10000);
      setUnit('sqft');
      setSurface('tin_shed');
    }
    setIsNewAssessmentModalOpen(false);
    
    // Notification & Voice
    const notice = lang === 'mr' ? 'नवीन हिशोब सुरू झाला आहे! माहिती भरा.' : 'Started new assessment! Please fill details.';
    setToastMessage(notice);
    setTimeout(() => setToastMessage(null), 4000);

    const spokenText = lang === 'mr'
      ? 'नवीन हिशोब सुरू केला आहे. कृपया जागा व क्षेत्रफळ भरा.'
      : 'Started new assessment. Please enter area and details.';
    speak(spokenText, lang);

    // Smooth focus to owner input
    const el = document.getElementById('input-owner-name');
    if (el) el.focus();
  };

  // 2. Clear Point: Load Previous Assessment
  const handleLoadPreviousAssessment = (item: FarmAssessment) => {
    if (item.propertyType) setPropertyType(item.propertyType);
    setOwnerName(item.farmerName);
    setVillageOrCity(item.village);
    setAreaValue(item.landArea);
    setUnit(item.landUnit);
    setSurface(item.surfaceType);

    // match district id
    const foundDist = DISTRICTS.find(
      (d) =>
        d.id === item.district ||
        d.names.mr.toLowerCase().includes(item.district.toLowerCase()) ||
        d.names.en.toLowerCase().includes(item.district.toLowerCase())
    );
    if (foundDist) {
      setSelectedDistrictId(foundDist.id);
    }

    setSoilType(item.soilType);
    if (item.geoLocation) {
      setGeoLocation(item.geoLocation);
    }

    const notice = lang === 'mr'
      ? `मागील हिशोब (${item.farmerName}) यशस्वीरित्या लोड झाला!`
      : `Restored assessment for ${item.farmerName}!`;
    setToastMessage(notice);
    setTimeout(() => setToastMessage(null), 4000);

    speak(
      lang === 'mr'
        ? `${item.farmerName} यांचा मागील हिशोब लोड केला आहे. वार्षिक जल संचयन: ${item.harvestedLiters.toLocaleString('mr-IN')} लिटर.`
        : `Loaded previous assessment for ${item.farmerName}.`,
      lang
    );
  };

  // 3. Clear Point: GPS & Google Map Location confirmed
  const handleSelectGpsLocation = (
    districtInfo: DistrictInfo, 
    villageOrCityName: string, 
    geoData: GeoLocationData
  ) => {
    setSelectedDistrictId(districtInfo.id);
    setVillageOrCity(villageOrCityName);
    setGeoLocation(geoData);

    const notice = lang === 'mr'
      ? `GPS स्थान निश्चित: ${districtInfo.names.mr} (${geoData.latitude.toFixed(3)}°N, ${geoData.longitude.toFixed(3)}°E)`
      : `Location confirmed: ${districtInfo.names.en} (${geoData.latitude.toFixed(3)}°N, ${geoData.longitude.toFixed(3)}°E)`;
    setToastMessage(notice);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Process assessment after all info is provided (Requested by user)
  const handleProcessAssessment = () => {
    if (areaValue <= 0) {
      setToastMessage(lang === 'mr' ? 'कृपया वैध क्षेत्रफळ प्रविष्ट करा' : 'Please enter valid area (>0)');
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsProcessed(true);
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setProcessedTimestamp(timeStr);
      setToastMessage(getTranslation('processAssessmentDone', lang));
      setTimeout(() => setToastMessage(null), 4000);

      speak(
        lang === 'mr'
          ? `हिशोब प्रक्रिया पूर्ण झाली. वार्षिक संचयन ${totalLitersHarvested.toLocaleString('mr-IN')} लिटर आणि ${tankersSaved} मोफत टँकर वाचतील.`
          : `Assessment processed. Total annual yield is ${totalLitersHarvested.toLocaleString()} liters.`,
        lang
      );

      const resEl = document.getElementById('results-summary-section');
      if (resEl && window.innerWidth < 1024) {
        resEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 280);
  };

  const handleSave = () => {
    const newAssessment: FarmAssessment = {
      id: 'fa-' + Date.now(),
      farmerName: ownerName.trim() || (lang === 'mr' ? 'लाभार्थी' : 'Beneficiary'),
      propertyType,
      village: villageOrCity.trim() || (lang === 'mr' ? 'परिसर' : 'Location'),
      district: district.names[lang] || district.names.en,
      landArea: areaValue,
      landUnit: unit,
      areaInSqFt: Math.round(areaSqFt),
      surfaceType: surface,
      annualRainfallMm: rainfallMm,
      runoffCoefficient: runoffCoeff,
      harvestedLiters: totalLitersHarvested,
      tankersSaved,
      dailyRechargeCapacityLiters: dailyRechargeLiters,
      recommendedStructure: getRecommendedStructure(),
      estimatedCostInr: grossCost,
      subsidyAmountInr: subsidyGrant,
      netCostInr: netOwnerCost,
      soilType,
      createdAt: new Date().toISOString(),
      syncStatus: 'pending',
      geoLocation: geoLocation || undefined,
    };

    onSaveAssessment(newAssessment);
    setSavedSuccessMsg(true);
    setTimeout(() => setSavedSuccessMsg(false), 3500);
  };

  const handleSpeakResults = () => {
    const textToSpeak =
      lang === 'mr'
        ? `तुमच्या ${areaValue} ${unit === 'sqft' ? 'चौरस फूट' : unit} जागेवरून वर्षाला सुमारे ${totalLitersHarvested.toLocaleString('mr-IN')} लिटर पावसाचे पाणी जमा होईल. यामुळे वर्षाला ५००० लिटरचे ${tankersSaved} मोफत पाण्याचे टँकर वाचतील आणि सुमारे ₹${estimatedSavingsRupees.toLocaleString()} रुपयांची बचत होईल. यासाठी ${getRecommendedStructure()} ही रचना शिफारस केली आहे.`
        : lang === 'hi'
        ? `आपके क्षेत्र से प्रतिवर्ष ${totalLitersHarvested.toLocaleString('hi-IN')} लीटर वर्षा जल संचित होगा। इससे 5000 लीटर वाले ${tankersSaved} पानी के टैंकर बचेंगे और लगभग ₹${estimatedSavingsRupees.toLocaleString()} की बचत होगी।`
        : `Assessment complete. Your ${areaValue} ${unit} catchment can capture ${totalLitersHarvested.toLocaleString()} liters annually, saving ${tankersSaved} water tankers worth rupees ${estimatedSavingsRupees.toLocaleString()}.`;

    speak(textToSpeak, lang);
  };

  return (
    <div id="calculator-view" className="space-y-5">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 p-4 rounded-2xl bg-slate-900 text-white border border-emerald-400/80 shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-black">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 rounded-lg hover:bg-white/20 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Consolidated Concise Dashboard Command Bar */}
      <div
        className={`p-3 sm:p-4 rounded-2xl border transition-all shadow-xs flex flex-wrap items-center justify-between gap-3 ${
          isContrastLight
            ? 'bg-white border-2 border-black text-black'
            : isSolar
            ? 'bg-amber-100 border-black text-black'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isContrastLight
                ? 'bg-black text-white'
                : isSolar
                ? 'bg-black text-amber-300'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            <Calculator className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                {lang === 'mr' ? 'जलसंचय डॅशबोर्ड' : 'Jalsanchay Dashboard'}
              </h2>
              {geoLocation ? (
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                    isContrastLight
                      ? 'bg-black text-white border-black'
                      : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isContrastLight ? 'bg-white' : 'bg-emerald-500 animate-pulse'
                    }`}
                  ></span>
                  GPS: {geoLocation.latitude.toFixed(2)}°N, {geoLocation.longitude.toFixed(2)}°E
                </span>
              ) : (
                <span
                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                    isContrastLight
                      ? 'bg-black text-white'
                      : isSolar
                      ? 'bg-black text-amber-400'
                      : 'bg-emerald-100 text-emerald-900'
                  }`}
                >
                  {lang === 'mr' ? 'सुलभ हिशोब' : 'Fast Assessment'}
                </span>
              )}
            </div>
            <p
              className={`text-xs font-medium ${
                isContrastLight ? 'text-black' : 'opacity-75'
              }`}
            >
              {lang === 'mr'
                ? 'माहिती भरा आणि "हिशोब प्रक्रिया करा" बटणावर क्लिक करा.'
                : 'Fill details and click "Process Assessment" to generate results & certificate.'}
            </p>
          </div>
        </div>

        {/* Quick Action Buttons Row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Action 1: New Form */}
          <button
            id="btn-dash-new-assessment"
            type="button"
            onClick={() => setIsNewAssessmentModalOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
              isContrastLight
                ? 'bg-black text-white border-black hover:bg-slate-900'
                : isSolar
                ? 'bg-black text-amber-300 border-black hover:bg-slate-900'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-xs'
            }`}
            title="Start New Assessment Form"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{lang === 'mr' ? 'नवीन हिशोब' : 'New Form'}</span>
          </button>

          {/* Action 2: Past Records */}
          <button
            id="btn-dash-previous-records"
            type="button"
            onClick={() => setIsPreviousModalOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
              isContrastLight
                ? 'bg-white text-black border-black hover:bg-slate-100'
                : isSolar
                ? 'bg-amber-300 text-black border-black hover:bg-amber-200'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
            title="View Previous Assessments"
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>{lang === 'mr' ? 'मागील नोंदी' : 'History'}</span>
            <span
              className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                isContrastLight
                  ? 'bg-black text-white'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {assessments.length}
            </span>
          </button>

          {/* Action 3: GPS Pin */}
          <button
            id="btn-dash-gps-locate"
            type="button"
            onClick={() => setIsGpsModalOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
              isContrastLight
                ? 'bg-white text-black border-black hover:bg-slate-100'
                : isSolar
                ? 'bg-amber-300 text-black border-black hover:bg-amber-200'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
            title="Map & GPS Location"
          >
            <MapPin className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">{lang === 'mr' ? 'जीपीएस स्थान' : 'GPS Map'}</span>
          </button>

          {/* Action 4: AI Hydrologist Prompt */}
          <button
            id="btn-dash-custom-prompt"
            type="button"
            onClick={onOpenCustomPrompt}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border transition-all active:scale-95 ${
              isContrastLight
                ? 'bg-slate-100 text-black border-black hover:bg-slate-200'
                : isSolar
                ? 'bg-black text-amber-300 border-black hover:bg-slate-900'
                : 'bg-amber-100 text-amber-950 border-amber-300 hover:bg-amber-200'
            }`}
            title="Ask AI Hydrologist"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span className="hidden sm:inline">{lang === 'mr' ? 'एआय सल्ला' : 'Ask AI'}</span>
          </button>

          {/* Action 5: Audio Narration */}
          <button
            id="btn-calc-listen"
            onClick={handleSpeakResults}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              isContrastLight
                ? 'bg-white text-black border-black hover:bg-slate-100'
                : isSolar
                ? 'bg-amber-200 text-black border-black'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
            }`}
            title="Listen to Results"
          >
            <Volume2 className="w-4 h-4 text-emerald-600" />
          </button>
        </div>
      </div>

      {/* Property Category Selector (Buildings, Houses, Commercial, Farms) */}
      <div className={`p-2.5 rounded-2xl border shadow-xs ${
        isContrastLight
          ? 'bg-white border-2 border-black text-black'
          : 'bg-white border-slate-200'
      }`}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            {
              id: 'building',
              label: lang === 'mr' ? 'इमारत / सोसायटी' : 'Building / Society',
              sub: '4k - 25k sq.ft',
              icon: Building2,
            },
            {
              id: 'house',
              label: lang === 'mr' ? 'स्वतंत्र घर / बंगला' : 'House / Villa',
              sub: '800 - 3,000 sq.ft',
              icon: Home,
            },
            {
              id: 'commercial',
              label: lang === 'mr' ? 'शाळा / कार्यालय' : 'School / Office',
              sub: '5k - 50k sq.ft',
              icon: School,
            },
            {
              id: 'farm',
              label: lang === 'mr' ? 'शेत / कृषी जमीन' : 'Farm / Land',
              sub: '1 - 20 Guntha',
              icon: Tractor,
            },
          ].map((prop) => {
            const Icon = prop.icon;
            const isSelected = propertyType === prop.id;
            return (
              <button
                key={prop.id}
                id={`prop-btn-${prop.id}`}
                type="button"
                onClick={() => {
                  handlePropertyChange(prop.id as PropertyType);
                  setIsProcessed(false);
                }}
                className={`py-2 px-3 rounded-xl border text-left transition-all flex items-center justify-between active:scale-95 ${
                  isSelected
                    ? isContrastLight
                      ? 'bg-black text-white border-2 border-black ring-1 ring-black font-black'
                      : isSolar
                      ? 'bg-black text-amber-300 border-black ring-2 ring-amber-400'
                      : 'bg-emerald-50 border-emerald-600 text-emerald-950 ring-2 ring-emerald-500 shadow-xs'
                    : isContrastLight
                    ? 'bg-white border-2 border-slate-300 text-black hover:border-black font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${
                    isSelected
                      ? isContrastLight ? 'text-white' : 'text-emerald-600'
                      : isContrastLight ? 'text-black' : 'text-slate-500'
                  }`} />
                  <div className="truncate">
                    <div className="font-black text-xs leading-tight truncate">{prop.label}</div>
                    <div className="text-[10px] opacity-70 font-semibold truncate">{prop.sub}</div>
                  </div>
                </div>
                {isSelected && (
                  <span className={`w-2 h-2 rounded-full shrink-0 ml-1 ${isContrastLight ? 'bg-white' : 'bg-emerald-600'}`}></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Inputs (Left) vs Results (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Easy Inputs (Col 1-6) */}
        <div
          className={`lg:col-span-6 p-5 sm:p-6 rounded-2xl border space-y-4 shadow-sm ${
            isContrastLight
              ? 'bg-white border-2 border-black text-black'
              : isSolar
              ? 'bg-amber-50 border-black text-black'
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          {/* Owner & City with GPS Shortcut */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                {propertyType === 'building'
                  ? lang === 'mr' ? 'सोसायटीचे नाव' : 'Society / Building Name'
                  : propertyType === 'house'
                  ? lang === 'mr' ? 'घरमालकाचे नाव' : 'Homeowner Name'
                  : lang === 'mr' ? 'नाव' : 'Name'}
              </label>
              <input
                id="input-owner-name"
                type="text"
                value={ownerName}
                onChange={(e) => {
                  setOwnerName(e.target.value);
                  setIsProcessed(false);
                }}
                className={`w-full px-3 py-2 rounded-xl font-bold text-xs sm:text-sm focus:outline-none ${
                  isContrastLight
                    ? 'border-2 border-black bg-white text-black focus:ring-2 focus:ring-black'
                    : 'border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500'
                }`}
                placeholder={lang === 'mr' ? 'नाव लिहा...' : 'Enter name...'}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider">
                  {lang === 'mr' ? 'शहर / गाव' : 'City / Village'}
                </label>
                <button
                  type="button"
                  onClick={() => setIsGpsModalOpen(true)}
                  className={`text-[10px] font-extrabold flex items-center gap-1 ${
                    isContrastLight ? 'text-black underline' : 'text-emerald-700 hover:text-emerald-900'
                  }`}
                >
                  <Navigation className="w-3 h-3" />
                  <span>{lang === 'mr' ? 'GPS मॅप' : 'GPS Map'}</span>
                </button>
              </div>
              <input
                id="input-city-name"
                type="text"
                value={villageOrCity}
                onChange={(e) => {
                  setVillageOrCity(e.target.value);
                  setIsProcessed(false);
                }}
                className={`w-full px-3 py-2 rounded-xl font-bold text-xs sm:text-sm focus:outline-none ${
                  isContrastLight
                    ? 'border-2 border-black bg-white text-black focus:ring-2 focus:ring-black'
                    : 'border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500'
                }`}
                placeholder="उदा. पुणे / सोलापूर..."
              />
            </div>
          </div>

          {/* Area & Unit with Preset Buttons */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-black uppercase tracking-wider">
                {propertyType === 'building' || propertyType === 'house'
                  ? lang === 'mr' ? 'गच्ची / टेरेस क्षेत्रफळ' : 'Terrace / Roof Area'
                  : getTranslation('catchmentAreaLabel', lang)}
              </label>
              <span className={`text-xs font-extrabold px-2 py-0.5 rounded ${
                isContrastLight
                  ? 'bg-black text-white border border-black'
                  : 'text-emerald-800 bg-emerald-100'
              }`}>
                {Math.round(areaSqFt).toLocaleString()} sq.ft
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="input-catchment-area"
                type="number"
                min={1}
                value={areaValue}
                onChange={(e) => {
                  setAreaValue(Math.max(1, parseFloat(e.target.value) || 0));
                  setIsProcessed(false);
                }}
                className={`w-1/2 px-4 py-2.5 rounded-xl font-black text-base sm:text-lg focus:outline-none ${
                  isContrastLight
                    ? 'border-2 border-black bg-white text-black focus:ring-2 focus:ring-black'
                    : 'border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500'
                }`}
              />

              <select
                id="select-catchment-unit"
                value={unit}
                onChange={(e) => {
                  setUnit(e.target.value as CatchmentUnit);
                  setIsProcessed(false);
                }}
                className={`w-1/2 px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm focus:outline-none ${
                  isContrastLight
                    ? 'border-2 border-black bg-white text-black focus:ring-2 focus:ring-black'
                    : 'border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500'
                }`}
              >
                <option value="sqft">{getTranslation('unitSqFt', lang)}</option>
                <option value="sqm">{getTranslation('unitSqM', lang)}</option>
                <option value="guntha">{getTranslation('unitGuntha', lang)}</option>
                <option value="acre">{getTranslation('unitAcre', lang)}</option>
              </select>
            </div>

            {/* Smart Presets based on property */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className={`text-[11px] font-semibold ${isContrastLight ? 'text-black font-bold' : 'opacity-75'}`}>
                {lang === 'mr' ? 'क्लिक करून निवडा:' : 'Quick Presets:'}
              </span>
              {(propertyType === 'house'
                ? [800, 1200, 1800, 2500]
                : propertyType === 'building'
                ? [3000, 5000, 10000, 18000]
                : propertyType === 'farm'
                ? [1, 2, 4, 10]
                : [5000, 12000, 25000, 40000]
              ).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setAreaValue(preset);
                    if (propertyType === 'farm') setUnit('guntha');
                    else setUnit('sqft');
                    setIsProcessed(false);
                  }}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
                    areaValue === preset
                      ? isContrastLight
                        ? 'bg-black text-white border-2 border-black font-black'
                        : 'bg-emerald-700 text-white border-emerald-800'
                      : isContrastLight
                      ? 'bg-white text-black border border-black hover:bg-slate-100'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                  }`}
                >
                  {preset} {propertyType === 'farm' ? 'गुंठा' : 'sq.ft'}
                </button>
              ))}
            </div>
          </div>

          {/* Surface Type Chooser */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-1.5">
              {getTranslation('surfaceTypeLabel', lang)}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                {
                  id: 'rcc_terrace',
                  label: lang === 'mr' ? 'पक्की आरसीसी सिमेंट गच्ची' : 'Flat RCC Concrete Terrace',
                  coeff: '85% Runoff',
                },
                {
                  id: 'tin_shed',
                  label: lang === 'mr' ? 'पत्र्याचे छत / मेटल शेड' : 'Metal Sheet / Tin Roof',
                  coeff: '85% Runoff',
                },
                {
                  id: 'tiled_roof',
                  label: lang === 'mr' ? 'पारंपारिक कौलारू छत' : 'Slanted Clay Tile Roof',
                  coeff: '75% Runoff',
                },
                {
                  id: 'inverted_umbrella',
                  label: lang === 'mr' ? 'उलट छत्री कॅनोपी' : 'Inverted Umbrella Canopy',
                  coeff: '95% Runoff',
                },
                {
                  id: 'paved_courtyard',
                  label: lang === 'mr' ? 'सोसायटी आवार / पेव्हर ब्लॉक' : 'Paved Society Courtyard',
                  coeff: '70% Runoff',
                },
                {
                  id: 'open_farmland',
                  label: lang === 'mr' ? 'मोकळी शेतजमीन' : 'Open Farmland Soil',
                  coeff: '35% Runoff',
                },
              ].map((item) => {
                const isSelected = surface === item.id;
                return (
                  <button
                    key={item.id}
                    id={`surf-${item.id}`}
                    type="button"
                    onClick={() => {
                      setSurface(item.id as SurfaceType);
                      setIsProcessed(false);
                    }}
                    className={`p-2.5 rounded-xl text-left border transition-all flex items-center justify-between ${
                      isSelected
                        ? isContrastLight
                          ? 'bg-black text-white border-2 border-black ring-2 ring-black font-black'
                          : isSolar
                          ? 'bg-black text-amber-300 border-black ring-2 ring-amber-400'
                          : 'bg-emerald-50 border-emerald-600 text-emerald-950 ring-2 ring-emerald-500 shadow-xs'
                        : isContrastLight
                        ? 'bg-white border-2 border-slate-300 text-black hover:border-black'
                        : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs">{item.label}</div>
                      <div className="text-[10px] opacity-75">{item.coeff}</div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className={`w-4 h-4 shrink-0 ${isContrastLight ? 'text-white' : 'text-emerald-600'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* District & Soil */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider">
                  {getTranslation('districtLabel', lang)}
                </label>
                <button
                  type="button"
                  onClick={() => setIsGpsModalOpen(true)}
                  className={`text-[10px] font-bold flex items-center gap-0.5 ${
                    isContrastLight ? 'text-black underline' : 'text-blue-700 hover:underline'
                  }`}
                >
                  <Compass className="w-3 h-3" />
                  <span>{lang === 'mr' ? 'GPS स्थान' : 'Pin Map'}</span>
                </button>
              </div>
              <select
                id="select-district"
                value={selectedDistrictId}
                onChange={(e) => {
                  setSelectedDistrictId(e.target.value);
                  setIsProcessed(false);
                }}
                className={`w-full px-3 py-2 rounded-xl font-bold text-xs sm:text-sm ${
                  isContrastLight
                    ? 'border-2 border-black bg-white text-black focus:outline-none focus:ring-2 focus:ring-black'
                    : 'border border-slate-300 bg-slate-50 focus:bg-white'
                }`}
              >
                {DISTRICTS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.names[lang] || d.names.en} ({d.annualRainfallMm} mm)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                {lang === 'mr' ? 'माती / परिसर प्रकार' : 'Sub-soil Strata'}
              </label>
              <select
                id="select-soil-type"
                value={soilType}
                onChange={(e) => {
                  setSoilType(e.target.value as SoilType);
                  setIsProcessed(false);
                }}
                className={`w-full px-3 py-2 rounded-xl font-bold text-xs sm:text-sm ${
                  isContrastLight
                    ? 'border-2 border-black bg-white text-black focus:outline-none focus:ring-2 focus:ring-black'
                    : 'border border-slate-300 bg-slate-50 focus:bg-white'
                }`}
              >
                {(Object.keys(SOIL_TYPES_DATA) as SoilType[]).map((sKey) => {
                  const soil = SOIL_TYPES_DATA[sKey];
                  return (
                    <option key={sKey} value={sKey}>
                      {soil.name[lang] || soil.name.en}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* PROCESS ASSESSMENT BUTTON (Requested by user: "give button to process after giving all info") */}
          {/* ========================================================================= */}
          <div className={`pt-3 border-t space-y-2 ${isContrastLight ? 'border-black' : 'border-slate-200'}`}>
            <button
              id="btn-process-assessment"
              type="button"
              onClick={handleProcessAssessment}
              disabled={isProcessing}
              className={`w-full py-4 px-6 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-md transition-all active:scale-98 ${
                isProcessing
                  ? 'opacity-70 cursor-wait'
                  : isContrastLight
                  ? 'bg-black text-white hover:bg-slate-900 border-2 border-black ring-2 ring-black'
                  : isSolar
                  ? 'bg-black text-amber-300 hover:bg-slate-900 border-2 border-black ring-2 ring-amber-400'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-700/25 ring-2 ring-emerald-500'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>{lang === 'mr' ? 'हिशोब प्रक्रिया सुरू आहे...' : 'Processing Assessment...'}</span>
                </>
              ) : (
                <>
                  <Calculator className="w-5 h-5" />
                  <span>
                    {lang === 'mr' ? 'हिशोब प्रक्रिया करा (Process Assessment)' : 'Process Assessment'}
                  </span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>

            <div className="flex items-center justify-between text-xs px-1 font-bold">
              <span className={isContrastLight ? 'text-black' : 'text-slate-500'}>
                {lang === 'mr' ? 'माहिती दिल्यावर वरील बटण दाबा' : 'Click after entering information'}
              </span>
              <span className={`flex items-center gap-1 font-extrabold ${
                isProcessed
                  ? isContrastLight ? 'text-black' : 'text-emerald-700'
                  : 'text-amber-600 animate-pulse'
              }`}>
                {isProcessed ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{lang === 'mr' ? `प्रक्रिया पूर्ण (${processedTimestamp})` : `Processed (${processedTimestamp})`}</span>
                  </>
                ) : (
                  <>
                    <span>⚡ {lang === 'mr' ? 'बदल झाले - प्रक्रिया बाकी' : 'Pending Process'}</span>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Clean, Uncluttered Results (Col 7-12) */}
        <div id="results-summary-section" className="lg:col-span-6 space-y-4">
          {/* Main Hero Harvest Card */}
          <div
            className={`p-6 rounded-2xl border transition-all shadow-md ${
              isContrastLight
                ? 'bg-black text-white border-2 border-black'
                : isSolar
                ? 'bg-black text-amber-300 border-black'
                : 'bg-gradient-to-br from-emerald-800 to-teal-950 text-white border-emerald-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-extrabold uppercase tracking-wider px-2.5 py-1 rounded border ${
                isContrastLight
                  ? 'bg-white text-black border-white'
                  : 'bg-white/15 border-white/10'
              }`}>
                {getTranslation('annualYieldMetric', lang)}
              </span>
              <span className={`text-xs font-bold flex items-center gap-1 ${
                isContrastLight ? 'text-white' : 'text-emerald-300'
              }`}>
                <Droplets className="w-3.5 h-3.5 fill-current" />
                <span>१००% शुद्धीकरण</span>
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-5xl font-black tracking-tight">
                {totalLitersHarvested.toLocaleString(lang === 'mr' ? 'mr-IN' : 'en-IN')}
              </span>
              <span className="text-base sm:text-xl font-bold opacity-90">
                {lang === 'mr' ? 'लिटर / वर्ष' : 'Liters / Year'}
              </span>
            </div>

            {/* Equivalent Tankers & Money Saved */}
            <div className={`mt-4 p-3.5 rounded-xl border flex items-center justify-between ${
              isContrastLight
                ? 'bg-white/15 border-white/30 text-white'
                : 'bg-white/10 backdrop-blur-xs border-white/10'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-medium opacity-90">
                    {getTranslation('tankersEquivalent', lang)}
                  </div>
                  <div className={`text-lg font-black ${isContrastLight ? 'text-white' : 'text-amber-300'}`}>
                    {tankersSaved.toLocaleString()} {lang === 'mr' ? 'टँकर मोफत वाचले!' : 'Tankers Saved!'}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[11px] opacity-90">
                  {lang === 'mr' ? 'वार्षिक आर्थिक बचत' : 'Annual ₹ Savings'}
                </div>
                <div className={`text-base font-black ${isContrastLight ? 'text-white' : 'text-emerald-300'}`}>
                  ₹{estimatedSavingsRupees.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Water table rise & Daily Recharge */}
            <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-white/15 text-xs">
              <div>
                <span className="opacity-75 block">{lang === 'mr' ? 'पावसाळ्यातील रिचार्ज' : 'Daily Injection'}</span>
                <span className={`font-extrabold text-sm ${isContrastLight ? 'text-white' : 'text-cyan-300'}`}>
                  {dailyRechargeLiters.toLocaleString()} L/day
                </span>
              </div>
              <div>
                <span className="opacity-75 block">{lang === 'mr' ? 'भूजल पातळी वाढ' : 'Water Table Rise'}</span>
                <span className={`font-extrabold text-sm flex items-center gap-1 ${isContrastLight ? 'text-white' : 'text-emerald-300'}`}>
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+1.5 to 3 ft</span>
                </span>
              </div>
            </div>
          </div>

          {/* Recommended Setup for House / Building / Farm */}
          <div className={`p-4 sm:p-5 rounded-2xl border shadow-sm space-y-3 ${
            isContrastLight
              ? 'bg-white border-2 border-black text-black'
              : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                isContrastLight ? 'text-black' : 'text-slate-600'
              }`}>
                <ShieldCheck className={`w-4 h-4 ${isContrastLight ? 'text-black' : 'text-emerald-600'}`} />
                <span>
                  {lang === 'mr'
                    ? 'शिफारस केलेली रचना व संच'
                    : lang === 'hi'
                    ? 'अनुशंसित संरचना'
                    : 'Recommended RWH Setup'}
                </span>
              </span>
              <button
                type="button"
                onClick={onNavigateToModel}
                className={`text-xs font-bold flex items-center gap-1 ${
                  isContrastLight ? 'text-black underline font-black' : 'text-emerald-700 hover:text-emerald-900'
                }`}
              >
                <span>{lang === 'mr' ? '3D मॉडेल पाहा' : 'View 3D Model'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className={`font-black text-xs sm:text-sm leading-relaxed ${
              isContrastLight ? 'text-black' : 'text-emerald-950'
            }`}>
              {getRecommendedStructure()}
            </p>

            {/* Cost & Subsidy / Property Tax Rebate */}
            <div className={`p-3 rounded-xl border space-y-1.5 text-xs ${
              isContrastLight
                ? 'bg-slate-100 border-2 border-black text-black'
                : 'bg-slate-50 border border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className={isContrastLight ? 'text-black font-bold' : 'text-slate-600 font-medium'}>
                  {getTranslation('grossCost', lang)}
                </span>
                <span className="font-bold">₹{grossCost.toLocaleString()}</span>
              </div>
              <div className={`flex items-center justify-between font-bold ${
                isContrastLight ? 'text-black' : 'text-emerald-700'
              }`}>
                <span>{subsidyTag}</span>
                <span>- ₹{subsidyGrant.toLocaleString()}</span>
              </div>
              <div className={`flex items-center justify-between pt-1 border-t font-black text-sm ${
                isContrastLight ? 'border-black text-black' : 'border-slate-300 text-slate-950'
              }`}>
                <span>{lang === 'mr' ? 'निव्वळ खर्च (Net Cost):' : 'Net Cost:'}</span>
                <span className={isContrastLight ? 'text-black' : 'text-emerald-800'}>
                  ₹{netOwnerCost.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Save Offline + Export Certificate */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <button
              id="btn-save-assessment"
              onClick={handleSave}
              className={`w-full sm:w-1/2 py-3 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 ${
                savedSuccessMsg
                  ? 'bg-emerald-600 text-white'
                  : isContrastLight
                  ? 'bg-black text-white hover:bg-slate-900 border-2 border-black'
                  : isSolar
                  ? 'bg-black text-amber-300 hover:bg-slate-900'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {savedSuccessMsg ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{lang === 'mr' ? 'सुरक्षित जतन झाले!' : 'Saved Offline!'}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{getTranslation('saveAssessmentBtn', lang)}</span>
                </>
              )}
            </button>

            <button
              id="btn-print-certificate"
              onClick={onNavigateToReport}
              className={`w-full sm:w-1/2 py-3 px-4 rounded-xl font-black text-xs sm:text-sm border flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 ${
                isContrastLight
                  ? 'bg-white hover:bg-slate-100 text-black border-2 border-black'
                  : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-300'
              }`}
            >
              <FileText className={`w-4 h-4 ${isContrastLight ? 'text-black' : 'text-emerald-600'}`} />
              <span>{lang === 'mr' ? 'अहवाल व प्रमाणपत्र' : 'Certificate & Tax Rebate'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* 1. New Assessment Choice Modal */}
      {isNewAssessmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {lang === 'mr' ? 'नवीन हिशोब सुरू करा' : 'Start New Assessment'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {lang === 'mr' ? 'जागेचा प्रकार निवडा:' : 'Select Property Category:'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsNewAssessmentModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              {[
                { id: 'building', label: lang === 'mr' ? '🏢 इमारत / सोसायटी' : '🏢 Housing Society', sub: 'RCC 5000 sq.ft' },
                { id: 'house', label: lang === 'mr' ? '🏠 स्वतंत्र घर / बंगला' : '🏠 House / Villa', sub: 'RCC 1500 sq.ft' },
                { id: 'farm', label: lang === 'mr' ? '🌾 शेत / कृषी जमीन' : '🌾 Farm Plot', sub: '2 Guntha Canopy' },
                { id: 'commercial', label: lang === 'mr' ? '🏫 शाळा / वाणिज्य' : '🏫 School / Office', sub: 'Tin Roof 10k sq.ft' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleStartNewAssessment(opt.id as PropertyType)}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50 text-left transition-all group"
                >
                  <div className="font-black text-sm text-slate-900 group-hover:text-emerald-950">
                    {opt.label}
                  </div>
                  <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
                    {opt.sub}
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsNewAssessmentModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                {lang === 'mr' ? 'रद्द करा' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Previous Assessments Modal */}
      <PreviousAssessmentsModal
        isOpen={isPreviousModalOpen}
        onClose={() => setIsPreviousModalOpen(false)}
        lang={lang}
        theme={theme}
        assessments={assessments}
        onLoadAssessment={handleLoadPreviousAssessment}
        onViewReport={() => {
          setIsPreviousModalOpen(false);
          onNavigateToReport();
        }}
        onDeleteAssessment={onDeleteAssessment}
      />

      {/* 3. GPS Location & Google Map Modal */}
      <GpsLocationMapModal
        isOpen={isGpsModalOpen}
        onClose={() => setIsGpsModalOpen(false)}
        lang={lang}
        theme={theme}
        propertyType={propertyType}
        currentDistrictId={selectedDistrictId}
        onSelectLocation={handleSelectGpsLocation}
      />
    </div>
  );
};
