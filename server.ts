import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy load Gemini Client to handle cases where GEMINI_API_KEY might be absent on startup
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("GEMINI_API_KEY environment variable is missing.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Global paint catalog definition to share color databases with mockup calculations
const LOCAL_CATALOG = [
  { id: "obsidian", name: "Imperial Obsidian", code: "GARG-8090", type: "Ultra Matte / Architectural Dark", price: "₹880/L", tone: "deep dark charcoal grey with rich velvet undertones", finish: "luxury velvet matte" },
  { id: "cashmere", name: "Royal Cashmere", code: "GARG-1022", type: "Satin Elegance / Warm Neutral", price: "₹620/L", tone: "creamy ivory-beige with sub-warm golden sheen", finish: "smooth high-end satin" },
  { id: "marrakesh", name: "Marrakesh Dunes", code: "GARG-4085", type: "Textured Clay / Earth Tone", price: "₹590/L", tone: "burnt terracotta clay with modern rustic warmth", finish: "textured earthy premium" },
  { id: "emerald", name: "Emerald Palace", code: "GARG-5560", type: "Rich Gloss / Regal Accent", price: "₹740/L", tone: "deep organic forest emerald with sophisticated depth", finish: "high-gloss jewel reflections" },
  { id: "pearl", name: "Seashell Pearl", code: "GARG-1010", type: "Reflective Silk / Light Breezy", price: "₹520/L", tone: "pure luminous off-white with fine micro-crushed quartz dust", finish: "light reflecting smooth finish" },
  { id: "gold_metallic", name: "Brushed Gold Ore", code: "GARG-2077", type: "Liquid Metallic Accent", price: "₹1,250/L", tone: "genuine warm refined gold leaf pigment dispersion", finish: "luxurious metallic shimmer" },
  { id: "calm_teal", name: "Vedic Teal", code: "GARG-6034", type: "Satin Solace / Calm Wellness", price: "₹680/L", tone: "calming deep teal balanced with muted slate-blue hues", finish: "velvety rich lustre" },
  { id: "nordic_mist", name: "Nordic Mist", code: "GARG-7012", type: "Matte Cool / Modern Minimal", price: "₹560/L", tone: "airy light stone grey with crisp glacial undertones", finish: "clean flat matte" }
];

// API endpoint to analyze wall colors and room presets via Gemini AI
app.post('/api/ai/visualize', async (req, res) => {
  const { type, presetName, wallColorName, wallColorHex, accentColorName, finishRule, userQuery, hasCustomImage } = req.body;

  const client = getGeminiClient();

  if (!client) {
    // Elegant local fallback generating premium responses if API key is not present
    console.log("No Gemini API client initialized. Generating premium mock advisory...");
    const matchedPaint = LOCAL_CATALOG.find(p => p.name.toLowerCase().includes((wallColorName || "").toLowerCase())) || LOCAL_CATALOG[1];
    
    // Custom recommendation heuristics
    const moodAnalysis = `The combination of ${wallColorName || "your selected color"} (${wallColorHex || "#D4AF37"}) with a ${finishRule || "luxury matte"} finish creates a truly breathtaking aura. It emphasizes architectural clean structures and draws in positive atmospheric energy.`;
    const lightReview = `In standard lighting conditions, this tone exhibits high sophic contrast. A ${finishRule || "matte"} finish will diffuse spotlight glares, preserving the deep rich layers of pigment without glare.`;
    const paletteName = `${wallColorName || "Sartorial Prestige"} Synergy`;
    const complementaryColors = [
      accentColorName || "Brushed Gold Ore",
      "Nordic Mist (#7012)",
      "Royal Cashmere (#1022)"
    ];
    const decorAdvice = `To enhance the architectural flow of this ${presetName || "room"}, pair with brushed brass electrical panels, thin velvet drapes in contrasting hues, and raw concrete or dark oak flooring accents.`;
    const gargProducts = [
      { name: matchedPaint.name, code: matchedPaint.code, type: matchedPaint.type, priceEst: matchedPaint.price },
      { name: "Brushed Gold Ore", code: "GARG-2077", type: "Liquid Metallic Accent", priceEst: "₹1,250/L" },
      { name: "Garg Premium Undercoat Primer", code: "PR-303", type: "High-Adhesion Base", priceEst: "₹280/L" }
    ];

    return res.json({
      moodAnalysis,
      lightReview,
      paletteName,
      complementaryColors,
      decorAdvice,
      gargProducts,
      disclaimer: "Running in local simulation mode. Configure GEMINI_API_KEY secret to unlock real-time Deep-AI analysis."
    });
  }

  try {
    const prompt = `
      You are an elite interior color architect and top-tier color consultant for "Garg Hardware Store", a luxury paint studio.
      Review the following paint customization requirements:
      - Design Category: ${type || 'Interior'}
      - Space / Structure Template: ${presetName || 'Modern Room'}
      - Chosen Wall Paint Color: ${wallColorName || 'Premium Base'} (${wallColorHex || '#E5E5E5'})
      - Trim/Accent Painted Accent: ${accentColorName || 'None Selected'}
      - Finish Level: ${finishRule || 'Luxury Velvet Matte'}
      ${userQuery ? `- Special User Requests: "${userQuery}"` : ''}
      ${hasCustomImage ? "- Note: The user has uploaded a custom room photograph." : ''}

      Provide a high-end architectural feedback panel in standard JSON. Your thoughts must reflect premium, professional vocabulary, evoking the aesthetic quality of Apple or Tesla architecture. Analyze how light interacts with this color, the emotional tone of the space, suggest secondary accents, layout advice, and recommend actual product SKU matches from Garg Hardware Store.
    `;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            moodAnalysis: {
              type: Type.STRING,
              description: "Elegant analysis of the atmospheric vibes and emotional character of the painting choice."
            },
            lightReview: {
              type: Type.STRING,
              description: "Technical feedback on light reflection, shadow depth, and look under daylight and spot LEDs."
            },
            paletteName: {
              type: Type.STRING,
              description: "A tailored, high-end, luxury name for this custom color layout/palette."
            },
            complementaryColors: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "2-3 high-end designer matching secondary accent colors or material finishes."
            },
            decorAdvice: {
              type: Type.STRING,
              description: "Architectural styling advice: furniture materials, drapery texture, lighting temperature to matching the theme."
            },
            gargProducts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Garg Hardware boutique paint range name" },
                  code: { type: Type.STRING, description: "Color code, e.g. GARG-XXXX" },
                  type: { type: Type.STRING, description: "Grade description" },
                  priceEst: { type: Type.STRING, description: "Estimated price in INR, e.g. Rs.750/L" }
                }
              },
              description: "A curated list of 2 to 3 paint/primer products from the boutique inventory."
            }
          },
          required: ["moodAnalysis", "lightReview", "paletteName", "complementaryColors", "decorAdvice", "gargProducts"]
        }
      }
    });

    const parsedResponse = JSON.parse(response.text || '{}');
    return res.json(parsedResponse);

  } catch (error: any) {
    console.error("Gemini request failed:", error);
    res.status(500).json({ error: "Architectural consulting server encountered an issue.", details: error.message });
  }
});

// Mock Database for Consultations and Order Cart (Saved in Server Memory)
const consultations: any[] = [];
const orders: any[] = [];

app.post('/api/book-consultation', (req, res) => {
  const { fullName, email, phoneNumber, scheduledDate, preferredCategory, notes } = req.body;
  if (!fullName || !email || !phoneNumber || !scheduledDate) {
    return res.status(400).json({ success: false, error: "Please fill in all required consulting parameters." });
  }
  const token = `GARG-CONS-${Math.floor(100000 + Math.random() * 900000)}`;
  const booking = {
    token,
    fullName,
    email,
    phoneNumber,
    scheduledDate,
    preferredCategory,
    notes,
    createdAt: new Date().toISOString(),
    status: "Confirmed"
  };
  consultations.push(booking);
  res.json({ success: true, booking });
});

app.post('/api/orders', (req, res) => {
  const { clientName, address, contact, items, totalCost } = req.body;
  if (!clientName || !items || items.length === 0) {
    return res.status(400).json({ success: false, error: "Order details are empty." });
  }
  const orderId = `GARG-ORD-${Math.floor(1000 + Math.random() * 9000)}`;
  const orderRecord = {
    orderId,
    clientName,
    address,
    contact,
    items,
    totalCost,
    status: "Processing",
    date: new Date().toLocaleDateString()
  };
  orders.push(orderRecord);
  res.json({ success: true, order: orderRecord });
});

// Serve Paint catalog data
app.get('/api/catalog', (req, res) => {
  res.json(LOCAL_CATALOG);
});

// Configure Vite middleware or production build output serving
async function configureServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Garg Paint Studio boutique running on http://0.0.0.0:${PORT}`);
  });
}

configureServer();
