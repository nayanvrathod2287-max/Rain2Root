/**
 * Soil types, Maharashtra & Indian rainfall districts, and Inverted Umbrella filtration stages
 */

import { Language, SoilType, SurfaceType, FiltrationStage } from '../types';

export interface DistrictInfo {
  id: string;
  names: Record<Language, string>;
  annualRainfallMm: number;
  monsoonDays: number;
  waterScarcityRisk: 'severe' | 'moderate' | 'low';
  zone: string;
  lat: number;
  lng: number;
}

export const DISTRICTS: DistrictInfo[] = [
  {
    id: 'solapur',
    names: { mr: 'सोलापूर (Solapur)', hi: 'सोलापुर', en: 'Solapur' },
    annualRainfallMm: 580,
    monsoonDays: 38,
    waterScarcityRisk: 'severe',
    zone: 'Drought-Prone Deccan Rainshadow',
    lat: 17.6599,
    lng: 75.9064,
  },
  {
    id: 'ahmednagar',
    names: { mr: 'अहिल्यानगर/अहमदनगर', hi: 'अहमदनगर', en: 'Ahilyanagar (Ahmednagar)' },
    annualRainfallMm: 520,
    monsoonDays: 34,
    waterScarcityRisk: 'severe',
    zone: 'Semi-Arid Central Plateau',
    lat: 19.0948,
    lng: 74.7480,
  },
  {
    id: 'pune_rural',
    names: { mr: 'पुणे व ग्रामीण (Pune / Baramati)', hi: 'पुणे व ग्रामीण', en: 'Pune & Rural' },
    annualRainfallMm: 640,
    monsoonDays: 45,
    waterScarcityRisk: 'moderate',
    zone: 'Western Rainshadow',
    lat: 18.5204,
    lng: 73.8567,
  },
  {
    id: 'mumbai_thane',
    names: { mr: 'मुंबई / ठाणे / नवी मुंबई', hi: 'मुंबई / ठाणे', en: 'Mumbai & Thane' },
    annualRainfallMm: 2420,
    monsoonDays: 78,
    waterScarcityRisk: 'low',
    zone: 'Coastal Urban High-Precipitation',
    lat: 19.0760,
    lng: 72.8777,
  },
  {
    id: 'chhatrapati_sambhajinagar',
    names: { mr: 'छत्रपती संभाजीनगर (औरंगाबाद)', hi: 'संभाजीनगर (औरंगाबाद)', en: 'Chh. Sambhajinagar' },
    annualRainfallMm: 680,
    monsoonDays: 42,
    waterScarcityRisk: 'severe',
    zone: 'Marathwada Basin',
    lat: 19.8762,
    lng: 75.3433,
  },
  {
    id: 'beed',
    names: { mr: 'बीड (Beed - मराठवाडा)', hi: 'बीड', en: 'Beed (Marathwada)' },
    annualRainfallMm: 610,
    monsoonDays: 39,
    waterScarcityRisk: 'severe',
    zone: 'Marathwada Drought Core',
    lat: 18.9891,
    lng: 75.7601,
  },
  {
    id: 'nashik',
    names: { mr: 'नाशिक (Nashik - द्राक्ष पट्टा)', hi: 'नासिक', en: 'Nashik' },
    annualRainfallMm: 720,
    monsoonDays: 48,
    waterScarcityRisk: 'moderate',
    zone: 'Northern Maharashtra',
    lat: 19.9975,
    lng: 73.7898,
  },
  {
    id: 'satara_sangli',
    names: { mr: 'सातारा / सांगली (Satara/Sangli)', hi: 'सातारा / सांगली', en: 'Satara & Sangli' },
    annualRainfallMm: 750,
    monsoonDays: 44,
    waterScarcityRisk: 'moderate',
    zone: 'Krishna Basin Agro-Zone',
    lat: 17.6805,
    lng: 73.9997,
  },
  {
    id: 'jalgaon',
    names: { mr: 'जळगाव (खान्देश)', hi: 'जलगांव (खानदेश)', en: 'Jalgaon (Khandesh)' },
    annualRainfallMm: 690,
    monsoonDays: 42,
    waterScarcityRisk: 'moderate',
    zone: 'Tapi Basin',
    lat: 21.0077,
    lng: 75.5626,
  },
  {
    id: 'nagpur',
    names: { mr: 'नागपूर (विदर्भ)', hi: 'नागपुर (विदर्भ)', en: 'Nagpur (Vidarbha)' },
    annualRainfallMm: 1080,
    monsoonDays: 58,
    waterScarcityRisk: 'low',
    zone: 'Eastern Vidarbha',
    lat: 21.1458,
    lng: 79.0882,
  },
  {
    id: 'ratnagiri',
    names: { mr: 'रत्नागिरी (कोकण - अति पाऊस)', hi: 'रत्नागिरी (कोंकण)', en: 'Ratnagiri (Konkan)' },
    annualRainfallMm: 3150,
    monsoonDays: 92,
    waterScarcityRisk: 'low',
    zone: 'Coastal Konkan High-Runoff',
    lat: 16.9902,
    lng: 73.3120,
  },
];

/**
 * Finds nearest district based on GPS coordinates using Haversine formula
 */
export function findNearestDistrict(lat: number, lng: number): DistrictInfo {
  let nearest = DISTRICTS[0];
  let minDistance = Infinity;

  for (const d of DISTRICTS) {
    const dLat = (d.lat - lat) * (Math.PI / 180);
    const dLng = (d.lng - lng) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat * (Math.PI / 180)) *
        Math.cos(d.lat * (Math.PI / 180)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = 6371 * c; // Earth radius in km

    if (distanceKm < minDistance) {
      minDistance = distanceKm;
      nearest = d;
    }
  }

  return nearest;
}


export interface SoilMetadata {
  id: SoilType;
  name: Record<Language, string>;
  description: Record<Language, string>;
  infiltrationRateMmHr: number;
  suitabilityNote: Record<Language, string>;
  rechargeMethodRecommended: Record<Language, string>;
  colorHex: string;
}

export const SOIL_TYPES_DATA: Record<SoilType, SoilMetadata> = {
  black_cotton: {
    id: 'black_cotton',
    name: {
      mr: 'काळी कसदार माती (रेगूर / Black Cotton)',
      hi: 'काली कपास मिट्टी (रेगुर)',
      en: 'Black Cotton Heavy Clay (Regur)',
    },
    description: {
      mr: 'पाणी धरून ठेवणारी, पण सुकल्यावर भेगा पडणारी व पाणी आत सहज न जिरवणारी माती.',
      hi: 'उच्च जल-धारण क्षमता वाली, किंतु सूखने पर दरारें उत्पन्न करने वाली भारी मिट्टी।',
      en: 'Heavy montmorillonite clay with very low natural percolation and high swelling.',
    },
    infiltrationRateMmHr: 4,
    suitabilityNote: {
      mr: 'थेट शेतात पाणी जिरत नाही, म्हणून उलट छत्री व बोअरवेल पुनर्भरण शाफ्ट अत्यंत उपयुक्त!',
      hi: 'सतह से पानी कम रिसता है, इसलिए गहरा बोरवेल रिचार्ज शाफ्ट सबसे उत्तम है।',
      en: 'Low natural infiltration; requires deep gravel-packed recharge borewells to penetrate beneath clay layer.',
    },
    rechargeMethodRecommended: {
      mr: 'उलट छत्री + व्हॉर्टेक्स गाळ कुंडी + बोअरवेल पुनर्भरण पाईप',
      hi: 'उल्टा छाता + सिल्ट चैंबर + नलकूप पुनर्भरण शाफ्ट',
      en: 'Inverted Umbrella + Silt Vortex + Direct Borewell Injection Shaft',
    },
    colorHex: '#332924',
  },
  red_loam: {
    id: 'red_loam',
    name: {
      mr: 'तांबडी पाझरणारी माती (Red Loam)',
      hi: 'लाल दोमट मिट्टी',
      en: 'Red Loamy Soil',
    },
    description: {
      mr: 'सच्छिद्र व पाण्याचा निचरा वेगाने करणारी उत्तम माती.',
      hi: 'अच्छी पारगम्यता वाली मिट्टी, पानी तेजी से नीचे उतरता है।',
      en: 'Porous ferruginous soil with moderate-to-high natural infiltration.',
    },
    infiltrationRateMmHr: 22,
    suitabilityNote: {
      mr: 'शेततळे, पुनर्भरण खड्डे (Percolation Pits) आणि विहीर पुनर्भरण उत्तम काम करते.',
      hi: 'परकोलेशन पिट और कुआं पुनर्भरण के लिए अत्यंत अनुकूल।',
      en: 'Ideal for percolation pits, recharge trenches, and dug-well recharge.',
    },
    rechargeMethodRecommended: {
      mr: 'पुनर्भरण खड्डा (Recharge Pit) व विहीर जोडणी',
      hi: 'रिचार्ज पिट व कुआं फिल्टर प्रणाली',
      en: 'Graded Media Recharge Pit & Open Well Diverter',
    },
    colorHex: '#a03e2c',
  },
  sandy_loam: {
    id: 'sandy_loam',
    name: {
      mr: 'रेताड / गाळाची माती (Sandy Loam)',
      hi: 'रेतीली दोमट मिट्टी',
      en: 'Sandy Loam / Alluvial Soil',
    },
    description: {
      mr: 'पाण्याचा निचरा सर्वात जलद करणारी नदीकाठची अथवा वालुकामय माती.',
      hi: 'अत्यधिक जल अवशोषण क्षमता वाली रेतीली मिट्टी।',
      en: 'High porosity and rapid drainage, common near riverbanks and plains.',
    },
    infiltrationRateMmHr: 45,
    suitabilityNote: {
      mr: 'पाणी वेगाने जिरते. फक्त शेतातील गाळ विहिरीत जाऊ नये म्हणून साधी गाळणी आवश्यक.',
      hi: 'पानी जल्दी नीचे जाता है, केवल गाद रोकने के लिए फिल्टर की जरूरत होती है।',
      en: 'Very rapid natural absorption; requires simple silt trap to prevent aquifer contamination.',
    },
    rechargeMethodRecommended: {
      mr: 'कंटूर ट्रेंच + इन-लाइन गाळणी (Silt Trap)',
      hi: 'कंटूर ट्रेंच + सिल्ट ट्रैप',
      en: 'Contour Recharge Trench + Inverted Catchment',
    },
    colorHex: '#c79659',
  },
  rocky_basalt: {
    id: 'rocky_basalt',
    name: {
      mr: 'खडकाळ काळा पाषाण (Basalt Bedrock)',
      hi: 'कठोर बेसाल्ट चट्टान',
      en: 'Hard Basalt Bedrock / Murrum',
    },
    description: {
      mr: 'जमिनीखाली कठीण खडक असून नैसर्गिक पाणी जिरण्याची क्षमता जवळजवळ शून्य.',
      hi: 'कठोर चट्टानी परत जहां पानी सतह पर ही बहकर बर्बाद हो जाता है।',
      en: 'Impermeable hard volcanic basalt bedrock where rainwater runs off wastefully.',
    },
    infiltrationRateMmHr: 1.5,
    suitabilityNote: {
      mr: 'पाणी खडकावरून वाहून जाते. यासाठी खडक भेदून भूजल पाझर भेगांपर्यंत (Fractures) पाणी पोहोचवणे गरजेचे आहे.',
      hi: 'पानी सतह पर बह जाता है। नलकूप रिचार्ज के जरिए जल सीधे जलभृत (Aquifer) तक पहुंचाना अनिवार्य है।',
      en: 'Rainwater rapidly runs off on surface. Must be pressure-injected into deep fractured basalt aquifer zones.',
    },
    rechargeMethodRecommended: {
      mr: 'उलट छत्री व्हॉर्टेक्स गाळणी + खोल बोअरवेल इंजेक्शन वेल',
      hi: 'उल्टा छाता सिल्ट चैंबर + डीप बोरवेल इंजेक्शन',
      en: 'Inverted Umbrella High-Pressure Silt Filter + Deep Aquifer Injection Well',
    },
    colorHex: '#4b5563',
  },
};

export const SURFACE_RUNOFF_COEFFICIENTS: Record<SurfaceType, number> = {
  rcc_terrace: 0.85,
  tin_shed: 0.85,
  tiled_roof: 0.75,
  inverted_umbrella: 0.95,
  paved_courtyard: 0.70,
  polyhouse: 0.90,
  open_farmland: 0.35,
};

export const FILTRATION_STAGES: FiltrationStage[] = [
  {
    id: 1,
    name: {
      mr: '१. फर्स्ट-फ्लश व कचरा वेगळा करणारी जाळी',
      hi: '1. फर्स्ट फ्लश एवं मलबे की जाली',
      en: 'Stage 1: Stainless Leaf Screen & First-Flush Diverter',
    },
    purpose: {
      mr: 'पहिल्या पावसातील धुळ, पाने, काडीकचरा बोअरवेलमध्ये जाण्यापासून पूर्णपणे रोखणे.',
      hi: 'पहली बारिश की धूल, पत्तों और कचरे को फिल्टर में जाने से रोकना।',
      en: 'Intercepts airborne leaves, twigs, and initial acidic dust runoff (first 15 minutes of downpour).',
    },
    components: {
      mr: 'स्टेनलेस स्टील ८० मेश जाळी, ऑटो-ड्रेन बॉल व्हॉल्व्ह',
      hi: 'एसएस 80 मेश जाली, स्वचालित ड्रेन बॉल वाल्व',
      en: '80-mesh SS304 screen + 110mm PVC self-draining floating ball diverter.',
    },
    maintenanceFrequency: {
      mr: 'पावसाळ्यात दर १५ दिवसांनी कचरा काढावा (फक्त २ मिनिटांचे काम).',
      hi: 'बारिश के मौसम में हर 15 दिन में जाली साफ करें।',
      en: 'Inspect and flush leaf basket every 15 days during active monsoon.',
    },
    efficiency: '100% Debris Interception',
    iconName: 'Filter',
  },
  {
    id: 2,
    name: {
      mr: '२. हायड्रो-सायक्लोन व्हॉर्टेक्स गाळ कुंडी',
      hi: '2. हाइड्रो-साइक्लोन व्हॉर्टेक्स सिल्ट चैंबर',
      en: 'Stage 2: Hydro-Cyclone Vortex Desilting Chamber',
    },
    purpose: {
      mr: 'पाण्याच्या भोवऱ्याचा (Vortex) वापर करून माती व जड गाळ खाली बसवून ९४% स्वच्छ पाणी पुढे पाठवणे.',
      hi: 'घूर्णन गति (Vortex) से कीचड़ और भारी बालू को नीचे बैठाकर 94% साफ पानी आगे भेजना।',
      en: 'Leverages tangential hydrodynamic swirl to spin out 94% of suspended heavy silt without electricity.',
    },
    components: {
      mr: 'शंकू आकाराची एफआरपी/सिमेंट कुंडी, तळाशी गाळ काढणारा ड्रेन व्हॉल्व्ह',
      hi: 'शंक्वाकार कुंडी, तलहटी ड्रेन वाल्व',
      en: 'Inverted conical separator with bottom purge port and central clean-water vortex riser.',
    },
    maintenanceFrequency: {
      mr: 'महिन्यातून एकदा तळाचा व्हॉल्व्ह उघडून जमा झालेला गाळ शेतात टाका (उत्तम खत!).',
      hi: 'महीने में एक बार नीचे का वाल्व खोलकर कीचड़ निकालें (खेत के लिए उपजाऊ खाद)।',
      en: 'Open bottom purge valve once a month to drain accumulated nutrient-rich farm silt.',
    },
    efficiency: '94% Silt & Sediment Separation',
    iconName: 'RotateCcw',
  },
  {
    id: 3,
    name: {
      mr: '३. बहुस्तरीय नैसर्गिक वाळू-खडी फिल्टर बेड',
      hi: '3. बहुस्तरीय रेत एवं बजरी फिल्टर बेड',
      en: 'Stage 3: 4-Tier Graded Media Depth Filtration',
    },
    purpose: {
      mr: 'सूक्ष्म मातीचे कण, गढूळपणा काढून पाणी पिण्यायोग्य स्वच्छतेपर्यंत नेणे.',
      hi: 'महीन कण और मैलापन दूर कर पानी को पूर्णतः स्वच्छ बनाना।',
      en: 'Progressive depth filtration removing turbidity, colloidal clay, and suspended micro-particles.',
    },
    components: {
      mr: 'तळाशी ४०मिमी गोटे -> २०मिमी खडी -> २मिमी धुतलेली वाळू -> नारळाच्या करवंटीचा ॲक्टिव्हेटेड चारकोल',
      hi: 'नीचे 40mm पत्थर -> 20mm गिट्टी -> 2mm धुली रेत -> नारियल का कोयला',
      en: 'Tier 1: 40-60mm Boulders; Tier 2: 20mm Gravel; Tier 3: 2mm Silica Sand; Tier 4: Activated Coconut Charcoal.',
    },
    maintenanceFrequency: {
      mr: 'वर्षातून एकदा पावसाळा सुरू होण्यापूर्वी वरची वाळू धुवावी.',
      hi: 'वर्ष में एक बार मानसून पूर्व ऊपरी बालू धोकर सुखाएं।',
      en: 'Backwash or skim top 2 inches of silica sand annually before pre-monsoon showers.',
    },
    efficiency: 'NTU Turbidity < 5 (Near Drinking Water Purity)',
    iconName: 'Layers',
  },
  {
    id: 4,
    name: {
      mr: '४. सुरक्षित भूजल पुनर्भरण व व्ही-वायर इंजेक्शन शाफ्ट',
      hi: '4. सुरक्षित नलकूप इंजेक्शन शाफ्ट',
      en: 'Stage 4: V-Wire Non-Clogging Aquifer Injection Casing',
    },
    purpose: {
      mr: 'स्वच्छ पाणी थेट भूजल साठ्यात (Aquifer) सुरक्षितपणे दाबमुक्त पद्धतीने सोडणे, बोअरवेल कधीही चोक होणार नाही.',
      hi: 'स्वच्छ पानी सीधे भूजल स्तर तक सुरक्षित पहुंचाना, बोरवेल कभी जाम नहीं होगा।',
      en: 'Injects pristine treated water into deep confined aquifers via non-clogging continuous slot V-wire screens.',
    },
    components: {
      mr: 'स्टेनलेस स्टील व्ही-वायर स्क्रीन, नॉन-रिटर्न सेफ्टी व्हॉल्व्ह, सेंट्रलाइज्ड कॅसिंग',
      hi: 'एसएस वी-वायर स्क्रीन, नॉन-रिटर्न सेफ्टी वाल्व',
      en: 'Continuous slot SS304 V-wire screen + Non-Return Check Valve to prevent backflow and contamination.',
    },
    maintenanceFrequency: {
      mr: 'शून्य देखभाल! २५ वर्षे अखंड चालू राहणारी संरचना.',
      hi: 'शून्य रखरखाव, 25 वर्ष तक निर्बाध कार्यक्षमता।',
      en: 'Self-cleaning continuous flow, zero maintenance lifetime design.',
    },
    efficiency: 'Zero Borewell Choking Guarantee',
    iconName: 'Droplets',
  },
];
