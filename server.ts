import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use a generous body limit because screenshots can be large base64 strings
  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ limit: "15mb", extended: true }));

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      }
    }
  });

  // API endpoint to scan screenshot with Gemini
  app.post("/api/scan-screenshot", async (req, res) => {
    try {
      const { base64Data } = req.body;
      if (!base64Data) {
        return res.status(400).json({ error: "Missing base64 image data" });
      }

      // Clean the base64 prefix
      const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, "");

      const imagePart = {
        inlineData: {
          mimeType: "image/png",
          data: cleanBase64,
        },
      };

      const textPart = {
        text: `You are an expert payment screenshot scanner.
Analyze this payment screenshot and extract the following details if present. Return the response in raw JSON format.
JSON Schema:
{
  "amount": number or null (e.g., 500, 1000, 250),
  "transactionId": "string" or null (e.g., UPI Ref No, Txn ID, UTR number, transaction reference number),
  "paymentStatus": "SUCCESS" | "FAILED" | "PENDING" | "UNKNOWN",
  "bankName": "string" or null (e.g., Paytm, PhonePe, GPay, SBI, HDFC),
  "senderName": "string" or null,
  "receiverName": "string" or null,
  "timestamp": "string" or null (approximate date/time shown on screenshot)
}
Only output the JSON object. Do not include markdown code block formatting (like \`\`\`json) or any additional text.`,
      };

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: { parts: [imagePart, textPart] },
      });

      const rawText = response.text || "{}";
      console.log("[Gemini API] Raw OCR Text:", rawText);

      let cleanJsonText = rawText.trim();
      if (cleanJsonText.startsWith("```")) {
        cleanJsonText = cleanJsonText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
      }

      try {
        const parsed = JSON.parse(cleanJsonText);
        console.log("[Gemini API] Successfully parsed OCR data:", parsed);
        return res.json(parsed);
      } catch (jsonErr) {
        console.error("[Gemini API] JSON Parse Error. Raw text was:", cleanJsonText);
        return res.status(500).json({ error: "Failed to parse OCR response", raw: cleanJsonText });
      }
    } catch (err: any) {
      console.error("[Gemini API] Error scanning screenshot:", err);
      return res.status(500).json({ error: err.message || "Gemini scanning failed" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("[Vite] Dev middleware integrated.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("[Production] Static files serving from /dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
