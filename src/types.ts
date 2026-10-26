/**
 * Inverted Umbrella - Rainwater Treatment & Artificial Recharge Platform
 * Types definition file
 * Supports Buildings, Rooftops, Houses, Commercial & Agricultural catchments
 */

export type Language = 'mr' | 'hi' | 'en';

export type AppTheme = 'contrast-light-black' | 'emerald-fresh' | 'night-calm' | 'high-contrast-solar';

export type TextScale = 'normal' | 'large' | 'xl';

export type CatchmentUnit = 'sqft' | 'sqm' | 'guntha' | 'acre';

export type PropertyType = 'house' | 'building' | 'commercial' | 'farm';

export type SurfaceType = 
  | 'rcc_terrace'
  | 'tin_shed'
  | 'tiled_roof'
  | 'inverted_umbrella'
  | 'paved_courtyard'
  | 'open_farmland'
  | 'polyhouse';

export type SoilType = 
  | 'black_cotton'
  | 'red_loam'
  | 'sandy_loam'
  | 'rocky_basalt';

export interface GeoLocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  districtId?: string;
  districtName?: string;
  villageOrCity?: string;
  source: 'gps' | 'manual' | 'map_pin';
  detectedAt?: string;
}

export interface FarmAssessment {
  id: string;
  farmerName: string; // Used for resident / society secretary / farmer name
  propertyType?: PropertyType;
  phoneOrPin?: string;
  village: string; // Village / City / Town
  district: string;
  landArea: number;
  landUnit: CatchmentUnit;
  areaInSqFt: number;
  surfaceType: SurfaceType;
  annualRainfallMm: number;
  runoffCoefficient: number;
  harvestedLiters: number;
  tankersSaved: number;
  dailyRechargeCapacityLiters: number;
  recommendedStructure: string;
  estimatedCostInr: number;
  subsidyAmountInr: number;
  netCostInr: number;
  soilType: SoilType;
  createdAt: string;
  syncStatus: 'synced' | 'pending' | 'local_only';
  geoLocation?: GeoLocationData;
}

export interface HydrologicalAlert {
  id: string;
  severity: 'high' | 'warning' | 'info';
  type: string;
  title: Record<Language, string>;
  message: Record<Language, string>;
  actionCode: string;
  date: string;
}

export interface FiltrationStage {
  id: number;
  name: Record<Language, string>;
  purpose: Record<Language, string>;
  components: Record<Language, string>;
  maintenanceFrequency: Record<Language, string>;
  efficiency: string;
  iconName: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  source?: 'gemini_ai' | 'expert_rule_engine';
  isAudioPlaying?: boolean;
}

export interface UserProfile {
  id?: string;
  name: string;
  identifier?: string; // Email or Mobile Number
  authType?: 'email' | 'mobile';
  email?: string;
  mobile?: string;
  propertyType?: PropertyType;
  village: string;
  district: string;
  pin: string;
  privacyAnonymize: boolean;
  isLoggedIn: boolean;
  savedAt?: string;
}
