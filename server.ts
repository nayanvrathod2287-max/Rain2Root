import express, { Request, Response } from "express";
import path from "node:path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import fs from "node:fs";
const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini SDK with telemetry header
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// In-memory persistent synchronized storage for demonstration & real-time sync
interface SyncRecord {
  id: string;
  type: "assessment" | "recharge_log" | "water_quality" | "consult_note";
  farmerName: string;
  village: string;
  data: any;
  createdAt: string;
  syncedAt: string;
  status: "synced";
}

const dataDirectory = path.join(process.cwd(), "data");
const dataFile = path.join(dataDirectory, "sync-records.json");

if (!fs.existsSync(dataDirectory)) {
  fs.mkdirSync(dataDirectory, { recursive: true });
}

let syncStore: SyncRecord[];

if (fs.existsSync(dataFile)) {
  try {
    syncStore = JSON.parse(fs.readFileSync(dataFile, "utf-8"));
  } catch {
    console.error("Could not read saved records. Starting with demo records.");
    syncStore = [];
  }
} else {
  syncStore = [];
}

function saveSyncStore() {
  fs.writeFileSync(dataFile, JSON.stringify(syncStore, null, 2), "utf-8");
}

if (syncStore.length === 0 && !fs.existsSync(dataFile)) {
  syncStore = [ 
  {
    id: "sample-rec-1",
    type: "assessment",
    farmerName: "रामराव पाटील (Ramrao Patil)",
    village: "पंढरपूर (Pandharpur, Solapur)",
    data: {
      catchmentAreaSqFt: 4356, // 4 Gunthas
      surfaceType: "Inverted Umbrella + Farm Tin Shed",
      annualRainfallMm: 650,
      annualYieldLiters: 215000,
      recommendedStructure: "Inverted Umbrella Silt Chamber + Recharge Borewell",
      estimatedCostInr: 42000,
      subsidyScheme: "Atal Bhujal Yojana (60% Subsidy)",
    },
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    syncedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: "synced",
  },
  {
    id: "sample-rec-2",
    type: "recharge_log",
    farmerName: "सुरेश गायकवाड (Suresh Gaikwad)",
    village: "बारामती (Baramati, Pune)",
    data: {
      date: new Date(Date.now() - 86400000).toISOString(),
      rechargedLiters: 18500,
      filterCleaned: true,
      waterTableRiseFt: 1.8,
    },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    syncedAt: new Date(Date.now() - 86400000).toISOString(),
    status: "synced",
  },
];
}

// Health Check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "healthy",
    service: "Inverted Umbrella Groundwater Recharge Platform",
    team: "Team 4 - Vaishnavi, Prajay, Nayan, Shruti",
    timestamp: new Date().toISOString(),
  });
});

// Alerts Endpoint (Weather, Silt, Water Table alerts)
app.get("/api/alerts", (_req: Request, res: Response) => {
  const alerts = [
    {
      id: "alt-01",
      severity: "high",
      type: "monsoon_prep",
      title: {
        en: "Monsoon Surge Alert: Pre-Rains Filter Flushing Needed",
        mr: "पावसाळा पूर्व सूचना: पहिल्या पावसापूर्वी गाळणी व पाईप स्वच्छ करा",
        hi: "मानसून पूर्व चेतावनी: बारिश से पहले फिल्टर और पाइपलाइन की सफाई करें",
      },
      message: {
        en: "Heavy cyclonic precipitation forecast in western and central zones. Clean the first-flush diverter and silt vortex chamber to prevent clogging.",
        mr: "आगामी ३ दिवसांत मुसळधार पावसाचा अंदाज आहे. बोअरवेलमध्ये माती जाऊ नये म्हणून पहिली घाण बाहेर काढणारा व्हॉल्व्ह (First Flush) तपासा.",
        hi: "अगले 3 दिनों में भारी बारिश का अनुमान है। भूजल पुनर्भरण बोरवेल में गाद जाने से रोकने के लिए फिल्टर चैंबर साफ रखें।",
      },
      actionCode: "CLEAN_FILTER",
      date: new Date().toISOString(),
    },
    {
      id: "alt-02",
      severity: "warning",
      type: "silt_alarm",
      title: {
        en: "Silt Trapper Saturation Warning (Desilting Required)",
        mr: "गाळ कुंडी (Desilting Chamber) भरल्याचा इशारा",
        hi: "सिल्ट चैंबर सफाई चेतावनी",
      },
      message: {
        en: "Hydro-cyclone desilting chamber reaches 75% capacity after 3 storm cycles. Open drainage valve to purge accumulated agricultural clay.",
        mr: "गेल्या पावसात जमा झालेला गाळ काढून टाका, अन्यथा गाळणीची पाणी मुरवण्याची गती मंदावेल.",
        hi: "एकत्रित कीचड़ और बालू को ड्रेन वाल्व खोलकर बाहर निकालें ताकि पानी आसानी से जमीन में उतरे।",
      },
      actionCode: "PURGE_SILT",
      date: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: "alt-03",
      severity: "info",
      type: "subsidy_open",
      title: {
        en: "Atal Bhujal Yojana & Jal Jeevan Mission Recharge Subsidy",
        mr: "अटल भूजल योजना व जल जीवन मिशन पुनर्भरण अनुदान उपलब्ध",
        hi: "अटल भूजल योजना पुनर्भरण अनुदान चालू",
      },
      message: {
        en: "Gram Panchayat subsidy grants available up to ₹35,000 for verified farm rainwater harvesting and injection wells.",
        mr: "शेतकऱ्यांसाठी कृत्रिम भूजल पुनर्भरण व उलट छत्री संरचनेसाठी ७०% पर्यंत शासकीय अनुदान उपलब्ध आहे.",
        hi: "किसानों के लिए भूजल पुनर्भरण व रूफटॉप हार्वेस्टिंग के लिए ग्राम पंचायत स्तर पर अनुदान सहायता।",
      },
      actionCode: "VIEW_SUBSIDY",
      date: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
  ];

  res.json({ alerts, count: alerts.length });
});

// Real-time Data Synchronization endpoint with local cache queue reconciliation
app.post("/api/sync", (req: Request, res: Response) => {
  try {
    const { clientRecords = [], lastSyncedAt } = req.body;

    const newlySynced: SyncRecord[] = [];

    if (Array.isArray(clientRecords)) {
      for (const item of clientRecords) {
        if (!item || !item.id) continue;
        const existingIdx = syncStore.findIndex((r) => r.id === item.id);
        const record: SyncRecord = {
          id: item.id,
          type: item.type || "assessment",
          farmerName: item.farmerName || "शेतकरी मित्र (Farmer)",
          village: item.village || "ग्रामीण विभाग (Rural)",
          data: item.data || {},
          createdAt: item.createdAt || new Date().toISOString(),
          syncedAt: new Date().toISOString(),
          status: "synced",
        };

        if (existingIdx >= 0) {
          syncStore[existingIdx] = record;
        } else {
          syncStore.unshift(record);
        }
        newlySynced.push(record);
      }
    }

    res.json({
      success: true,
      serverTime: new Date().toISOString(),
      syncedCount: newlySynced.length,
      allServerRecords: syncStore,
    });
  } catch (err: any) {
    console.error("Sync error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// AI Water Hydrologist & Recharge Consultant Endpoint
app.post("/api/consult", async (req: Request, res: Response) => {
  try {
    const { query, language = "mr", farmContext = {} } = req.body;

    if (!query || typeof query !== "string") {
      res.status(400).json({ error: "Query is required" });
      return;
    }

    const ai = getGeminiClient();

    if (!ai) {
      // Fallback smart rule-based guidance if Gemini API Key is not set in this container
      const offlineResponses: Record<string, string> = {
        mr: `**उलट छत्री जल पुनर्भरण सल्लागार (Inverted Umbrella Advisory):**
- **तुमची जमीन व क्षेत्र:** ${farmContext.catchmentArea || "शेत जमीन"}
- **महत्त्वाचा सल्ला:** पावसाचे पाणी थेट बोअरवेलमध्ये सोडण्यापूर्वी '३-स्तरीय गाळणी' (मोटे खडे, बारीक खडी, जाड वाळू आणि ॲक्टिव्हेटेड चारकोल) मधून जाणे अनिवार्य आहे.
- **उलट छत्री तंत्रज्ञान:** उलट छत्री कॅचमेंटमुळे मोकळ्या जागेतील ९०% पाणी वाहून न जाता मध्यवर्ती व्हॉर्टेक्स चेंबरमध्ये खेचले जाते.
- **गाळ स्वच्छता:** पहिल्या १० मिनिटांचे पाणी (First Flush) बाहेर सोडून द्यावे जेणेकरून माती गाळणीत साचणार नाही.
- **अनुदान:** अटल भूजल योजनेअंतर्गत ग्रामपंचायत स्तरावर कृत्रिम पुनर्भरणासाठी अर्ज करू शकता.`,
        hi: `**उल्टा छाता भूजल पुनर्भरण सलाहकार (Inverted Umbrella Advisory):**
- **क्षेत्र विवरण:** ${farmContext.catchmentArea || "कृषि भूमि"}
- **सलाह:** वर्षा जल को सीधे नलकूप (Borewell) में डालने से पहले 3-चरणीय फिल्टर (पत्थर, बजरी, रेत और लकड़ी का कोयला) से गुजारना जरूरी है।
- **उल्टा छाता प्रणाली:** यह मॉडल खुले खेतों और छतों के पानी को सेंट्रलाइज्ड फिल्टर द्वारा शुद्ध कर भूजल स्तर को तेजी से बढ़ाता है।
- **सफाई:** पहली बारिश के पानी को फर्स्ट फ्लश वाल्व से बाहर निकालें ताकि सिल्ट जमा न हो।`,
        en: `**Inverted Umbrella Hydrological Advisory:**
- **Catchment Profile:** ${farmContext.catchmentArea || "Farm / Rooftop Area"}
- **Engineering Recommendation:** Rainwater must pass through our 3-stage modular filtration (Boulders 40mm -> Gravel 20mm -> Coarse Sand -> Activated Charcoal) before direct aquifer recharge.
- **Inverted Umbrella Innovation:** Central vortex hydro-cyclone desilting chamber removes 94% of suspended solids, preventing borewell silt-choking.
- **Maintenance:** Purge first flush runoff during the initial 15 minutes of every downpour.
- **Government Schemes:** Eligible under Atal Bhujal Yojana & Jal Jeevan Mission recharge subsidies.`,
      };

      res.json({
        advice:
          offlineResponses[language] || offlineResponses.mr || offlineResponses.en,
        source: "expert_rule_engine",
      });
      return;
    }

    const langInstruction =
      language === "mr"
        ? "Respond in simple, clear Marathi (मराठी) that a farmer can easily read and understand. Use bullet points and warm tone."
        : language === "hi"
        ? "Respond in simple, clear Hindi (हिंदी) that a farmer or rural citizen can easily understand. Use bullet points."
        : "Respond in clear, accessible English with practical hydrology engineering guidance and rural terminology.";

    const systemPrompt = `You are the Senior Hydrologist and Rainwater Harvesting Consultant for the "Inverted Umbrella" Rainwater Treatment & Artificial Recharge Platform (CEP Capstone Team 4: Vaishnavi, Prajay, Nayan, Shruti).
The platform caters to:
1. Urban Buildings, Housing Societies & Apartments (Rooftop terraces, rainwater sumps, municipal property tax 5-10% rebate compliance, groundwater injection shafts).
2. Independent Houses & Bungalows (RCC roofs, tin sheds, compact wall-mounted dual-chamber filters, household storage).
3. Commercial & Educational Institutions (Schools, factories, paved courtyards).
4. Agricultural Farms (Inverted Umbrella modular funnels, vortex silt chambers, borewell recharge without choking, Atal Bhujal Yojana subsidies).

Key components:
- Hydrodynamic First-Flush diverter & leaf screen.
- Vortex hydro-cyclone desilting chamber (spins out 94% heavy sediment without power).
- 4-Tier graded sand-gravel-charcoal depth filtration.
- V-wire continuous slot non-clogging aquifer injection casing.

Context:
- User Target / Catchment: ${farmContext.catchmentArea || "Building / House / Rooftop / Farm"}
- Region: ${farmContext.region || "Maharashtra & Indian drought-prone / urban regions"}

Instructions:
${langInstruction}
Keep the advice clear, highly practical, and actionable. Include cost-effective maintenance, water storage tips, and local authority incentives where applicable.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: query,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    res.json({
      advice: response.text || "No response generated.",
      source: "gemini_ai",
    });
  } catch (err: any) {
    console.error("Consult API Error:", err);
    res.status(500).json({
      error: "Consultation service temporarily unavailable",
      fallbackAdvice:
        "पावसाचे पाणी बोअरवेलमध्ये सोडण्यापूर्वी गाळ कुंडी व वाळू-खडी फिल्टर बसवणे अत्यावश्यक आहे.",
    });
  }
});

// Start Server with Vite or Static
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Inverted Umbrella Server running on port ${PORT}`);
  });
}

startServer()
