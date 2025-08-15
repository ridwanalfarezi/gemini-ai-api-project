import { GoogleGenAI } from "@google/genai";
import cors from "cors";
import "dotenv/config";
import express from "express";
import multer from "multer";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.static("public"));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const upload = multer({ storage: multer.memoryStorage() });

// Store chat history for each session (in production, use database or Redis)
const chatSessions = new Map();

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

// Chat with conversation history
app.post("/api/chat", async (req, res) => {
  const { message, sessionId = "default", history = [] } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  try {
    // Get or create session history
    if (!chatSessions.has(sessionId)) {
      chatSessions.set(sessionId, []);
    }

    const sessionHistory = chatSessions.get(sessionId);

    // Build conversation contents with history
    const contents = [
      // Include previous conversation history
      ...sessionHistory,
      // Add current user message
      {
        role: "user",
        parts: [{ text: message }],
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
    });

    const botReply =
      response.text ||
      response.candidates?.[0]?.content?.parts?.[0]?.text ||
      "[No response]";

    // Update session history
    sessionHistory.push(
      { role: "user", parts: [{ text: message }] },
      { role: "model", parts: [{ text: botReply }] }
    );

    // Keep only last 20 messages to prevent context overflow
    if (sessionHistory.length > 40) {
      sessionHistory.splice(0, sessionHistory.length - 40);
    }

    res.json({
      reply: botReply,
      sessionId: sessionId,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Clear chat history
app.post("/api/clear-chat", (req, res) => {
  const { sessionId = "default" } = req.body;
  chatSessions.delete(sessionId);
  res.json({ message: "Chat history cleared", sessionId });
});

// Multi/single-file upload + describe with conversation history
app.post("/api/upload", upload.any(), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "At least one file is required" });
  }

  // Get custom instruction and session ID from request body
  const customInstruction = req.body.instruction || null;
  const sessionId = req.body.sessionId || "default";

  // Get or create session history
  if (!chatSessions.has(sessionId)) {
    chatSessions.set(sessionId, []);
  }

  const sessionHistory = chatSessions.get(sessionId);
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
      // text file - include conversation history
      const textContent = file.buffer.toString("utf8");
      const instruction = customInstruction || "Describe this file content";
      const userMessage = `Here is the content of ${file.originalname}:\n${textContent}\n\n${instruction}`;

      contents = [
        // Include previous conversation history
        ...sessionHistory,
        // Add current user message
        {
          role: "user",
          parts: [{ text: userMessage }],
        },
      ];
    } else {
      // media file - include conversation history
      const base64Data = file.buffer.toString("base64");
      const instruction =
        customInstruction || `Describe the content of this ${fileExt} file`;

      contents = [
        // Include previous conversation history
        ...sessionHistory,
        // Add current user message with media
        {
          role: "user",
          parts: [
            { inlineData: { mimeType, data: base64Data } },
            { text: instruction },
          ],
        },
      ];
    }

    try {
      const response = await ai.models.generateContent({ model, contents });
      const botReply =
        response.text ||
        response.candidates?.[0]?.content?.parts?.[0]?.text ||
        "[No response]";

      results.push({
        file: file.originalname,
        description: botReply,
      });

      // Update session history for this file interaction
      const userMessage =
        customInstruction || `Uploaded and analyzed ${file.originalname}`;
      sessionHistory.push(
        { role: "user", parts: [{ text: userMessage }] },
        { role: "model", parts: [{ text: botReply }] }
      );
    } catch (err) {
      results.push({ file: file.originalname, error: err.message });
    }
  }

  // Keep only last 20 messages to prevent context overflow
  if (sessionHistory.length > 40) {
    sessionHistory.splice(0, sessionHistory.length - 40);
  }

  res.json({ results, sessionId });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
