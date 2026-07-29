import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini Client
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', platform: 'Open Ocean Digital Marketplace', time: new Date().toISOString() });
  });

  // Gemini AI Digital Asset Assistant
  app.post('/api/ai/assistant', async (req, res) => {
    try {
      const { prompt, userRole = 'buyer', currency = 'USD' } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.json({
          response: `Welcome to Open Ocean! Based on your request ("${prompt}"), I recommend exploring our **Software & Development**, **Templates**, and **Graphics** taxonomy. Please ensure your GEMINI_API_KEY is configured in Settings > Secrets for live intelligent asset matching!`,
          suggestedCategories: ['software', 'templates', 'graphics', 'ai_products'],
        });
      }

      const systemInstruction = `You are the expert Digital Asset Assistant for Open Ocean (the global digital products marketplace).
Open Ocean hosts 24 categories of digital goods: Books & Publications, Education, Music, Audio, Video, Photography, Graphics, Templates, Software & Development, Website Assets, AI Products, Design Resources, Business Resources, Productivity, Gaming, 3D Assets, AR/VR Assets, Marketing Assets, NFTs & Digital Collectibles, Digital Gift Cards & Vouchers, Creative Assets, Digital Services, Memberships & Subscriptions, and Licensed Digital Content.

Respond warmly and clearly to user queries. Offer specific product recommendations, file formats, and license recommendations (Personal vs. Commercial vs. Enterprise) suited to their goal.
Keep response concise, structured, and helpful. Do not mention API keys or system internals.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const replyText = response.text || 'I recommend browsing Open Ocean catalogue categories for your project.';

      res.json({
        response: replyText,
        suggestedCategories: ['templates', 'software', 'ai_products', 'design_resources'],
      });
    } catch (err: any) {
      console.error('Gemini Assistant API Error:', err);
      res.status(500).json({
        error: 'Failed to generate recommendations.',
        details: err?.message || 'Server error',
      });
    }
  });

  // Marketplace Express Checkout API Simulation
  app.post('/api/checkout', (req, res) => {
    try {
      const { items, paymentGateway = 'stripe', currency = 'USD', buyerEmail = 'customer@openocean.io' } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Cart is empty' });
      }

      const subtotal = items.reduce((acc: number, item: any) => acc + (item.price * (item.quantity || 1)), 0);
      const openOceanFee = Math.round(subtotal * 0.10 * 100) / 100; // 10% marketplace commission
      const estimatedTax = Math.round(subtotal * 0.05 * 100) / 100; // 5% VAT
      const total = subtotal + estimatedTax;

      const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
      const invoiceNumber = 'INV-2026-' + Math.floor(1000 + Math.random() * 9000);

      const licenseKeys: Record<string, string> = {};
      const downloadLinks: Record<string, string> = {};

      items.forEach((item: any) => {
        const pId = item.product?.id || 'item-' + Math.random();
        licenseKeys[pId] = 'LIC-' + Math.random().toString(36).substring(2, 10).toUpperCase() + '-OPENOCEAN';
        downloadLinks[pId] = `https://openocean.io/vault/download/${pId}?token=${Math.random().toString(36).substring(2)}`;
      });

      res.json({
        success: true,
        orderId,
        invoiceNumber,
        subtotal,
        marketplaceFee: openOceanFee,
        netPayoutToSellers: subtotal - openOceanFee,
        tax: estimatedTax,
        total,
        currency,
        paymentGateway,
        buyerEmail,
        licenseKeys,
        downloadLinks,
        message: `Order completed successfully via ${paymentGateway.toUpperCase()}. Funds routed according to Open Ocean Marketplace Fee structure.`,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Checkout processing failed' });
    }
  });

  // Vite middleware in Development mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Open Ocean Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
