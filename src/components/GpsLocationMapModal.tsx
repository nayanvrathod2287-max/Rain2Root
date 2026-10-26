// Source: Google Maps Platform Code Assist
import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  Layers, 
  ExternalLink, 
  Check, 
  X, 
  Compass, 
  Volume2, 
  CloudRain, 
  AlertCircle,
  Satellite,
  Search
} from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { Language, AppTheme, GeoLocationData, PropertyType } from '../types';
import { DISTRICTS, findNearestDistrict, DistrictInfo } from '../data/soilAndDistricts';
import { speak } from '../utils/speech';

interface GpsLocationMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  theme: AppTheme;
  propertyType: PropertyType;
  currentDistrictId: string;
  onSelectLocation: (
    district: DistrictInfo, 
    villageOrCityName: string, 
    geoData: GeoLocationData
  ) => void;
}

export const GpsLocationMapModal: React.FC<GpsLocationMapModalProps> = ({
  isOpen,
  onClose,
  lang,
  theme,
  propertyType,
  currentDistrictId,
  onSelectLocation,
}) => {
  const isContrastLight = theme === 'contrast-light-black';
  const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';

  // Initial Coordinates based on current selected district
  const initialDistrict = DISTRICTS.find((d) => d.id === currentDistrictId) || DISTRICTS[0];
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: initialDistrict.lat,
    lng: initialDistrict.lng,
  });
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid'>('hybrid');
  const [nearestDistrict, setNearestDistrict] = useState<DistrictInfo>(initialDistrict);
  const [customPlaceName, setCustomPlaceName] = useState(initialDistrict.names[lang] || initialDistrict.names.en);

  useEffect(() => {
    if (isOpen) {
      const dist = DISTRICTS.find((d) => d.id === currentDistrictId) || DISTRICTS[0];
      setCoords({ lat: dist.lat, lng: dist.lng });
      setNearestDistrict(dist);
      setCustomPlaceName(dist.names[lang] || dist.names.en);
    }
  }, [isOpen, currentDistrictId, lang]);

  if (!isOpen) return null;

  // Real GPS Geolocation fetch
  const handleDetectGPS = () => {
    if (!('geolocation' in navigator)) {
      setLocError(lang === 'mr' ? 'आपल्या ब्राउझरमध्ये GPS सेवा उपलब्ध नाही.' : 'Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const acc = position.coords.accuracy;

        setCoords({ lat, lng });
        setAccuracy(Math.round(acc));
        setIsLocating(false);

        // Find closest district in Maharashtra database
        const detected = findNearestDistrict(lat, lng);
        setNearestDistrict(detected);
        const name = `${detected.names[lang] || detected.names.en} (GPS Verified)`;
        setCustomPlaceName(name);

        const speechMsg = lang === 'mr'
          ? `तुमचे अचूक स्थान मिळाले आहे. जवळचा जल संवर्धन जिल्हा: ${detected.names.mr}. वार्षिक पाऊस: ${detected.annualRainfallMm} मिलिमीटर.`
          : `GPS Location detected. Nearest hydrology district: ${detected.names.en} with ${detected.annualRainfallMm} mm annual rainfall.`;
        speak(speechMsg, lang);
      },
      (error) => {
        setIsLocating(false);
        let errorMsg = lang === 'mr' ? 'GPS स्थान मिळवता आले नाही. कृपया नकाशावर थेट क्लिक करा.' : 'Unable to retrieve GPS. Please tap on the map to pin.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = lang === 'mr' ? 'GPS परवानगी नाकारली आहे. कृपया स्थान परवानगी चालू करा किंवा खालील नकाशावर क्लिक करा.' : 'Location permission denied. Please enable GPS or tap the map.';
        }
        setLocError(errorMsg);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 10000,
      }
    );
  };

  // Handle map click
  const handleMapClick = (e: any) => {
    if (e.detail?.latLng) {
      const lat = e.detail.latLng.lat;
      const lng = e.detail.latLng.lng;
      setCoords({ lat, lng });
      const matched = findNearestDistrict(lat, lng);
      setNearestDistrict(matched);
      setCustomPlaceName(matched.names[lang] || matched.names.en);
    }
  };

  const handleApplyLocation = () => {
    const geoData: GeoLocationData = {
      latitude: coords.lat,
      longitude: coords.lng,
      accuracy: accuracy || undefined,
      districtId: nearestDistrict.id,
      districtName: nearestDistrict.names[lang] || nearestDistrict.names.en,
      villageOrCity: customPlaceName,
      source: accuracy ? 'gps' : 'map_pin',
      detectedAt: new Date().toISOString(),
    };

    onSelectLocation(nearestDistrict, customPlaceName, geoData);
    onClose();
  };

  const googleMapsUrl = `https://www.google.com/maps?q=${coords.lat},${coords.lng}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div
        className={`w-full max-w-3xl rounded-3xl border shadow-2xl overflow-hidden my-auto transition-all ${
          isContrastLight
            ? 'bg-white border-2 border-black text-black'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`p-4 sm:p-5 border-b flex items-center justify-between ${
            isContrastLight
              ? 'bg-black border-b-2 border-black text-white'
              : 'bg-emerald-900 border-emerald-800 text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-400 text-slate-950">
                  GPS & Google Maps
                </span>
                <span className="text-xs font-semibold opacity-85">
                  {propertyType === 'building' ? '🏢 Building / Rooftop Pin' : propertyType === 'house' ? '🏠 House Roof Pin' : '🌾 Farm Plot Pin'}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black">
                {lang === 'mr' ? 'स्थान शोधा व गुगल मॅपवर निश्चित करा' : 'Find Location & Pin on Google Map'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Controls Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          {/* GPS Auto-Detect Button */}
          <button
            id="btn-detect-gps"
            onClick={handleDetectGPS}
            disabled={isLocating}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm shadow-sm transition-all active:scale-95 ${
              isLocating
                ? 'bg-amber-400 text-slate-950 animate-pulse'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white'
            }`}
          >
            <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
            <span>
              {isLocating
                ? (lang === 'mr' ? 'GPS शोधत आहे...' : 'Detecting GPS...')
                : (lang === 'mr' ? 'माझे अचूक GPS स्थान शोधा (One-Tap GPS)' : 'Find My Precise Location (GPS)')}
            </span>
          </button>

          {/* Map View Toggle (Roadmap vs Satellite/Hybrid) */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-300">
            <button
              onClick={() => setMapType('hybrid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                mapType === 'hybrid' || mapType === 'satellite'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Satellite className="w-3.5 h-3.5" />
              <span>{lang === 'mr' ? 'उपग्रह (Satellite)' : 'Satellite'}</span>
            </button>
            <button
              onClick={() => setMapType('roadmap')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                mapType === 'roadmap'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{lang === 'mr' ? 'नकाशा (Roadmap)' : 'Roadmap'}</span>
            </button>
          </div>
        </div>

        {locError && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{locError}</span>
          </div>
        )}

        {/* Map Container Area */}
        <div className="relative w-full h-[360px] sm:h-[400px] bg-slate-100">
          {apiKey ? (
            <APIProvider apiKey={apiKey}>
              <Map
                id="inverted-umbrella-gmap"
                mapId="DEMO_MAP_ID"
                internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
                center={coords}
                zoom={accuracy ? 16 : 12}
                mapTypeId={mapType}
                onClick={handleMapClick}
                style={{ width: '100%', height: '100%' }}
                gestureHandling="greedy"
              >
                <AdvancedMarker position={coords}>
                  <Pin
                    background="#059669"
                    borderColor="#064e3b"
                    glyphColor="#fef08a"
                  />
                </AdvancedMarker>
              </Map>
            </APIProvider>
          ) : (
            /* Interactive Satellite Coordinate Preview when API Key is pending or in preview */
            <div className="w-full h-full relative overflow-hidden bg-slate-900 flex flex-col items-center justify-center p-6 text-white text-center">
              <div 
                className="absolute inset-0 opacity-40 bg-cover bg-center"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1524813686514-a57563d77d66?auto=format&fit=crop&w=1200&q=80')`
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent"></div>

              <div className="relative z-10 space-y-3 max-w-md">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-300 animate-pulse">
                  <Compass className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-black text-lg text-emerald-300">
                    {lang === 'mr' ? 'GPS स्थान ट्रॅकिंग व उपग्रह मॅपिंग' : 'GPS Location & Satellite Mapping'}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    {lang === 'mr'
                      ? 'आपल्या डिव्हाइसच्या अचूक GPS द्वारे अक्षांश-रेखांश निश्चित केले आहेत. खालील बटणाने थेट Google Maps ॲपमध्ये देखील पाहू शकता.'
                      : 'Coordinates determined via live GPS / District center. You can also open directly in the Google Maps app.'}
                  </p>
                </div>

                {/* Coordinate Badge */}
                <div className="p-2.5 rounded-xl bg-black/60 border border-white/20 font-mono text-xs flex items-center justify-center gap-4 text-amber-300">
                  <span>Lat: {coords.lat.toFixed(5)}° N</span>
                  <span>Lng: {coords.lng.toFixed(5)}° E</span>
                  {accuracy && <span className="text-emerald-400">±{accuracy}m</span>}
                </div>

                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/30 text-xs font-bold text-white transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{lang === 'mr' ? 'गुगल मॅप्स ॲपमध्ये उघडा' : 'Open in Google Maps'}</span>
                </a>
              </div>
            </div>
          )}

          {/* Coordinate Overlay Banner on Map */}
          <div className="absolute top-3 left-3 z-10 p-2.5 rounded-xl bg-slate-900/90 backdrop-blur-md text-white border border-white/20 text-xs shadow-lg space-y-0.5">
            <div className="font-mono text-amber-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>{coords.lat.toFixed(4)}°N, {coords.lng.toFixed(4)}°E</span>
            </div>
            <div className="text-[11px] text-slate-300">
              {lang === 'mr' ? 'नकाशावर टॅप करून पिन हलवता येते' : 'Tap anywhere on map to reposition pin'}
            </div>
          </div>
        </div>

        {/* Selected District & Hydrology Details */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-black uppercase text-slate-500 block">
                {lang === 'mr' ? 'स्थान / गाव / शहराचे नाव' : 'Location / Village / Town'}
              </span>
              <input
                type="text"
                value={customPlaceName}
                onChange={(e) => setCustomPlaceName(e.target.value)}
                placeholder="Village / Town / Society Name"
                className="mt-1 w-full px-3 py-1.5 rounded-lg border border-slate-300 font-bold text-sm bg-white text-slate-900 focus:outline-emerald-600"
              />
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-black uppercase text-emerald-800 block">
                  {lang === 'mr' ? 'जवळचा जल संवर्धन जिल्हा' : 'Nearest Hydrology District'}
                </span>
                <div className="text-base font-black mt-0.5">
                  {nearestDistrict.names[lang] || nearestDistrict.names.en}
                </div>
                <div className="text-xs font-semibold text-emerald-800">
                  {nearestDistrict.zone}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold uppercase text-emerald-700 block">
                  {lang === 'mr' ? 'वार्षिक पाऊस' : 'Annual Rain'}
                </span>
                <span className="text-lg font-black text-emerald-700">
                  {nearestDistrict.annualRainfallMm} mm
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-slate-600 hover:text-emerald-700 flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{lang === 'mr' ? 'पूर्ण Google Map मध्ये पाहा' : 'View in full Google Maps'}</span>
            </a>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-black hover:bg-slate-100"
              >
                {lang === 'mr' ? 'रद्द करा' : 'Cancel'}
              </button>

              <button
                type="button"
                id="btn-apply-location"
                onClick={handleApplyLocation}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-black shadow-md transition-all active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>{lang === 'mr' ? 'हे स्थान हिशोबासाठी लागू करा' : 'Apply Location to Assessment'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
