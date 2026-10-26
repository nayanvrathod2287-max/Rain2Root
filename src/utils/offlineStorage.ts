/**
 * Local Caching & Offline Synchronization Engine for Rural Connectivity
 * Handles offline storage of farm assessments, recharge logs, and sync queues
 */

import { FarmAssessment, UserProfile } from '../types';

const STORAGE_KEYS = {
  ASSESSMENTS: 'iu_assessments_v1',
  SYNC_QUEUE: 'iu_sync_queue_v1',
  USER_PROFILE: 'iu_user_profile_v1',
  LAST_SYNC: 'iu_last_sync_timestamp',
  ACCOUNTS_REGISTRY: 'iu_accounts_registry_v1',
};

export interface StoredAccountData {
  identifier: string;
  authType: 'email' | 'mobile';
  profile: UserProfile;
  assessments: FarmAssessment[];
  lastLoginAt: string;
}

export const normalizeUserIdentifier = (raw: string): string => {
  if (!raw) return '';
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed.includes('@')) {
    // Phone number: keep only last 10 digits or digits
    const digits = trimmed.replace(/[^0-9]/g, '');
    return digits.length > 10 ? digits.slice(-10) : digits;
  }
  return trimmed;
};

// Seed demo accounts if registry is empty
const getInitialRegistry = (): Record<string, StoredAccountData> => {
  const now = new Date().toISOString();
  return {
    'society@pune.org': {
      identifier: 'society@pune.org',
      authType: 'email',
      profile: {
        name: 'गोकुळ गृहनिर्माण संस्था (Gokul Society)',
        identifier: 'society@pune.org',
        authType: 'email',
        email: 'society@pune.org',
        propertyType: 'building',
        village: 'कोथरूड, पुणे',
        district: 'पुणे',
        pin: '1234',
        privacyAnonymize: false,
        isLoggedIn: true,
      },
      assessments: [
        {
          id: 'fa-demo-society-1',
          farmerName: 'गोकुळ गृहनिर्माण संस्था (Gokul Society)',
          propertyType: 'building',
          village: 'कोथरूड',
          district: 'पुणे (Pune)',
          landArea: 5000,
          landUnit: 'sqft',
          areaInSqFt: 5000,
          surfaceType: 'rcc_terrace',
          annualRainfallMm: 750,
          runoffCoefficient: 0.85,
          harvestedLiters: 296116,
          tankersSaved: 59,
          dailyRechargeCapacityLiters: 6580,
          recommendedStructure: 'इमारत रूफटॉप फर्स्ट-फ्लश + मल्टी-स्टॅक वाळू फिल्टर + तळघर संप टाकी साठा व बोअरवेल रिचार्ज',
          estimatedCostInr: 54000,
          subsidyAmountInr: 5400,
          netCostInr: 48600,
          soilType: 'black_cotton',
          createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          syncStatus: 'synced',
        },
      ],
      lastLoginAt: now,
    },
    '9850123456': {
      identifier: '9850123456',
      authType: 'mobile',
      profile: {
        name: 'रामराव पाटील (शेतकरी मित्र)',
        identifier: '9850123456',
        authType: 'mobile',
        mobile: '9850123456',
        propertyType: 'farm',
        village: 'पंढरपूर',
        district: 'सोलापूर',
        pin: '1234',
        privacyAnonymize: false,
        isLoggedIn: true,
      },
      assessments: [
        {
          id: 'fa-demo-farmer-1',
          farmerName: 'रामराव पाटील (शेतकरी)',
          propertyType: 'farm',
          village: 'पंढरपूर',
          district: 'सोलापूर (Solapur)',
          landArea: 4,
          landUnit: 'guntha',
          areaInSqFt: 4356,
          surfaceType: 'inverted_umbrella',
          annualRainfallMm: 520,
          runoffCoefficient: 0.95,
          harvestedLiters: 199650,
          tankersSaved: 40,
          dailyRechargeCapacityLiters: 4436,
          recommendedStructure: 'उलट छत्री फनेल कॅनोपी + व्हॉर्टेक्स गाळ कुंडी + व्ही-वायर विना-चोक बोअरवेल इंजेक्शन',
          estimatedCostInr: 54553,
          subsidyAmountInr: 35459,
          netCostInr: 19094,
          soilType: 'black_cotton',
          createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
          syncStatus: 'synced',
        },
      ],
      lastLoginAt: now,
    },
    'vaishnavinaikwadi2627@gmail.com': {
      identifier: 'vaishnavinaikwadi2627@gmail.com',
      authType: 'email',
      profile: {
        name: 'वैष्णवी नाईकवाडी (Vaishnavi Naikwadi)',
        identifier: 'vaishnavinaikwadi2627@gmail.com',
        authType: 'email',
        email: 'vaishnavinaikwadi2627@gmail.com',
        propertyType: 'building',
        village: 'पुणे (Pune)',
        district: 'पुणे',
        pin: '2627',
        privacyAnonymize: false,
        isLoggedIn: true,
      },
      assessments: [
        {
          id: 'fa-demo-vaishnavi-1',
          farmerName: 'वैष्णवी नाईकवाडी (Vaishnavi - Project Lead)',
          propertyType: 'building',
          village: 'पुणे (Pune)',
          district: 'पुणे (Pune)',
          landArea: 4500,
          landUnit: 'sqft',
          areaInSqFt: 4500,
          surfaceType: 'rcc_terrace',
          annualRainfallMm: 750,
          runoffCoefficient: 0.85,
          harvestedLiters: 266504,
          tankersSaved: 53,
          dailyRechargeCapacityLiters: 5922,
          recommendedStructure: 'इमारत रूफटॉप फर्स्ट-फ्लश + मल्टी-स्टॅक वाळू फिल्टर + तळघर संप टाकी साठा व बोअरवेल रिचार्ज',
          estimatedCostInr: 52100,
          subsidyAmountInr: 5210,
          netCostInr: 46890,
          soilType: 'black_cotton',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          syncStatus: 'synced',
        },
      ],
      lastLoginAt: now,
    },
  };
};

export const getAccountsRegistry = (): Record<string, StoredAccountData> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACCOUNTS_REGISTRY);
    if (!raw) {
      const seeded = getInitialRegistry();
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS_REGISTRY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse accounts registry:', e);
    return getInitialRegistry();
  }
};

export const saveAccountToRegistry = (
  identifier: string,
  profile: UserProfile,
  assessments: FarmAssessment[]
) => {
  try {
    const normalized = normalizeUserIdentifier(identifier);
    if (!normalized) return;

    const registry = getAccountsRegistry();
    const existing = registry[normalized];

    registry[normalized] = {
      identifier: normalized,
      authType: profile.authType || (normalized.includes('@') ? 'email' : 'mobile'),
      profile: {
        ...profile,
        identifier: normalized,
      },
      assessments: assessments || (existing ? existing.assessments : []),
      lastLoginAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEYS.ACCOUNTS_REGISTRY, JSON.stringify(registry));
  } catch (e) {
    console.error('Failed to save account to registry:', e);
  }
};

export const restoreUserAccount = (
  rawIdentifier: string
): {
  found: boolean;
  profile: UserProfile;
  assessments: FarmAssessment[];
} => {
  const normalized = normalizeUserIdentifier(rawIdentifier);
  const registry = getAccountsRegistry();
  const existing = registry[normalized];

  if (existing) {
    // Overwrite active local storage with this user's data
    localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(existing.assessments || []));
    const activeProfile: UserProfile = {
      ...existing.profile,
      isLoggedIn: true,
      identifier: normalized,
    };
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(activeProfile));

    return {
      found: true,
      profile: activeProfile,
      assessments: existing.assessments || [],
    };
  }

  // Not found in registry: create new default profile
  const isEmail = rawIdentifier.includes('@');
  const newProfile: UserProfile = {
    name: isEmail ? rawIdentifier.split('@')[0] : `User ${rawIdentifier}`,
    identifier: normalized,
    authType: isEmail ? 'email' : 'mobile',
    email: isEmail ? rawIdentifier.trim() : undefined,
    mobile: !isEmail ? rawIdentifier.trim() : undefined,
    propertyType: 'building',
    village: 'पुणे / Maharashtra',
    district: 'पुणे',
    pin: '1234',
    privacyAnonymize: false,
    isLoggedIn: true,
  };

  const initialAssessments: FarmAssessment[] = [];
  saveAccountToRegistry(normalized, newProfile, initialAssessments);
  localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(initialAssessments));
  localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(newProfile));

  return {
    found: false,
    profile: newProfile,
    assessments: initialAssessments,
  };
};

export const logoutUserSession = (): void => {
  try {
    const currentProfile = getUserProfile();
    const currentAssessments = getStoredAssessments();

    // Persist current state to user's registry slot before clearing
    if (currentProfile.identifier) {
      saveAccountToRegistry(currentProfile.identifier, currentProfile, currentAssessments);
    }

    // Set user as logged out in active profile
    const loggedOutProfile: UserProfile = {
      ...currentProfile,
      isLoggedIn: false,
    };
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(loggedOutProfile));
  } catch (e) {
    console.error('Error logging out session:', e);
  }
};

export const getStoredAssessments = (): FarmAssessment[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ASSESSMENTS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read stored assessments:', e);
    return [];
  }
};

export const saveAssessmentLocally = (assessment: FarmAssessment): FarmAssessment => {
  try {
    const current = getStoredAssessments();
    const existingIdx = current.findIndex((a) => a.id === assessment.id);
    let updated: FarmAssessment[];

    if (existingIdx >= 0) {
      updated = [...current];
      updated[existingIdx] = assessment;
    } else {
      updated = [assessment, ...current];
    }

    localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(updated));

    // Update active user registry
    const profile = getUserProfile();
    if (profile && profile.identifier) {
      saveAccountToRegistry(profile.identifier, profile, updated);
    }

    // Also queue for server sync if pending
    if (assessment.syncStatus !== 'synced') {
      addToSyncQueue({
        id: assessment.id,
        type: 'assessment',
        farmerName: assessment.farmerName,
        village: assessment.village,
        data: assessment,
        createdAt: assessment.createdAt,
      });
    }

    return assessment;
  } catch (e) {
    console.error('Failed to save assessment locally:', e);
    return assessment;
  }
};

export const deleteStoredAssessment = (id: string): FarmAssessment[] => {
  try {
    const current = getStoredAssessments();
    const updated = current.filter((a) => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(updated));

    // Update active user registry
    const profile = getUserProfile();
    if (profile && profile.identifier) {
      saveAccountToRegistry(profile.identifier, profile, updated);
    }

    return updated;
  } catch (e) {
    console.error('Failed to delete stored assessment:', e);
    return getStoredAssessments();
  }
};

export const getSyncQueue = (): any[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
};

export const addToSyncQueue = (item: any) => {
  try {
    const queue = getSyncQueue();
    const filtered = queue.filter((q) => q.id !== item.id);
    filtered.push(item);
    localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to add to sync queue:', e);
  }
};

export const clearSyncQueue = () => {
  localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify([]));
};

export const getUserProfile = (): UserProfile => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (!raw) {
      return {
        name: 'रामराव पाटील (शेतकरी मित्र)',
        village: 'पंढरपूर',
        district: 'सोलापूर',
        pin: '1234',
        privacyAnonymize: false,
        isLoggedIn: false,
      };
    }
    return JSON.parse(raw);
  } catch (e) {
    return {
      name: 'शेतकरी मित्र',
      village: 'ग्रामीण विभाग',
      district: 'सोलापूर',
      pin: '1234',
      privacyAnonymize: false,
      isLoggedIn: false,
    };
  }
};

export const saveUserProfile = (profile: UserProfile) => {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save user profile:', e);
  }
};

export const getLastSyncTime = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
};

export const setLastSyncTime = (timestamp: string) => {
  localStorage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp);
};

export const syncWithServer = async (): Promise<{
  success: boolean;
  syncedCount: number;
  message: string;
}> => {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return {
      success: false,
      syncedCount: 0,
      message: 'Offline: Internet is not reachable right now.',
    };
  }

  const queue = getSyncQueue();
  const profile = getUserProfile();

  // If user enabled privacy anonymization, strip personal phone/PIN before sync
  const sanitizedQueue = queue.map((item) => {
    if (profile.privacyAnonymize && item.data) {
      return {
        ...item,
        farmerName: 'गोपनीय शेतकरी (Anonymized Farmer)',
        data: {
          ...item.data,
          farmerName: 'गोपनीय शेतकरी (Anonymized Farmer)',
          phoneOrPin: '***PROTECTED***',
        },
      };
    }
    return item;
  });

  try {
    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientRecords: sanitizedQueue,
        lastSyncedAt: getLastSyncTime(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Sync server responded with ${response.status}`);
    }

    const result = await response.json();

    // Mark local assessments as synced
    const local = getStoredAssessments();
    const updatedLocal = local.map((a) => ({
      ...a,
      syncStatus: 'synced' as const,
    }));
    localStorage.setItem(
      STORAGE_KEYS.ASSESSMENTS,
      JSON.stringify(updatedLocal)
    );

    clearSyncQueue();
    const nowStr = new Date().toISOString();
    setLastSyncTime(nowStr);

    return {
      success: true,
      syncedCount: result.syncedCount || sanitizedQueue.length,
      message: 'सर्व माहिती सर्व्हरशी सुरक्षित सिंक झाली आहे!',
    };
  } catch (err: any) {
    console.error('Sync failed:', err);
    return {
      success: false,
      syncedCount: 0,
      message: `सिंक अयशस्वी (डेटा स्थानिक सुरक्षित आहे): ${err.message}`,
    };
  }
};
