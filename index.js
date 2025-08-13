import { GoogleGenAI } from "@google/genai";
import cors from "cors";
import "dotenv/config";
import express from "express";
import multer from "multer";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const upload = multer({ storage: multer.memoryStorage() });

const mimeTypes = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".ogg": "audio/ogg",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".m4a": "audio/mp4",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".webm": "video/webm",
};

// Chat biasa
app.post("/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message,
    });

    res.json({
      reply:
        response.text ||
        response.candidates?.[0]?.content?.parts?.[0]?.text ||
        "[No response]",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Multi/single-file upload + describe
app.post("/upload-describe", upload.any(), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "At least one file is required" });
  }

  const results = [];

  for (const file of req.files) {
    const fileExt = path.extname(file.originalname).toLowerCase();
    const mimeType = mimeTypes[fileExt] || file.mimetype;

    let model = "gemini-2.5-flash";
    if ([".mp4", ".mov", ".webm"].includes(fileExt)) {
      model = "gemini-2.0-flash";
    }

    let contents;
    if (!mimeTypes[fileExt]) {
      // text file
      const textContent = file.buffer.toString("utf8");
      contents = `Here is the content of ${file.originalname}:\n${textContent}\nDescribe it.`;
    } else {
      // media file
      const base64Data = file.buffer.toString("base64");
      contents = [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType, data: base64Data } },
            { text: `Describe the content of this ${fileExt} file.` },
          ],
        },
      ];
    }

    try {
      const response = await ai.models.generateContent({ model, contents });
      results.push({
        file: file.originalname,
        description:
          response.text ||
          response.candidates?.[0]?.content?.parts?.[0]?.text ||
          "[No response]",
      });
    } catch (err) {
      results.push({ file: file.originalname, error: err.message });
    }
  }

  res.json({ results });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
