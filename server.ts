import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route to handle Gemini API calls
  app.post("/api/chat", async (req, res) => {
    try {
      const { model, messages, apiKey: clientApiKey } = req.body;
      
      const apiKey = process.env.GEMINI_API_KEY || clientApiKey;

      if (!apiKey) {
        return res.status(401).json({ error: 'API key is required' });
      }

      const ai = new GoogleGenAI({ 
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Transfer-Encoding', 'chunked');

      // Convert standard messages array to what Gemini API expects
      // The user passes [{role: 'system', content: '...'}, {role: 'user', content: '...'}, ...]
      // We will parse this to pass system instruction separately if it's the first message
      
      let systemInstruction = undefined;
      const geminiMessages = [];
      
      for (const msg of messages) {
        if (msg.role === 'system') {
          systemInstruction = msg.content;
        } else {
          geminiMessages.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{text: msg.content}]
          });
        }
      }

      const targetModel = (!model || model === 'llama3' || model === 'gemini-3.5-flash') 
        ? 'gemini-3.8-flash' 
        : model;

      const responseStream = await ai.models.generateContentStream({
        model: targetModel,
        contents: geminiMessages,
        config: systemInstruction ? { systemInstruction } : undefined,
      });

      for await (const chunk of responseStream) {
        if (chunk.text) {
          const payload = JSON.stringify({ message: { content: chunk.text } });
          res.write(`${payload}\n`);
        }
      }
      
      res.end();
    } catch (error: any) {
      console.error('API error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: error.message });
      } else {
        const payload = JSON.stringify({ error: error.message });
        res.write(`${payload}\n`);
        res.end();
      }
    }
  });

  // Vite middleware for development
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
