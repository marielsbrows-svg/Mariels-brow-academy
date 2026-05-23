import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-1feb612f/health", (c) => {
  return c.json({ status: "ok" });
});

// AI Chat endpoint
app.post("/make-server-1feb612f/ai-chat", async (c) => {
  try {
    const { messages } = await c.req.json();

    if (!messages || !Array.isArray(messages)) {
      return c.json({ error: "Messages array is required" }, 400);
    }

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      console.error("ANTHROPIC_API_KEY not found in environment");
      return c.json({ error: "AI service not configured" }, 500);
    }

    // Call Claude API
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        system: "You are a helpful course assistant for Mariels Brow Academy, an online education platform teaching brow artistry and beauty business skills. Answer questions about course content, technical issues with the platform, downloading workbooks, video playback, progress tracking, and certification. Be friendly, professional, and concise. If you don't know something specific about the platform, suggest the student contact support.",
        messages: messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
        })),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Claude API error:", errorText);
      return c.json({ error: "AI service error" }, 500);
    }

    const data = await response.json();
    const assistantMessage = data.content[0].text;

    return c.json({ message: assistantMessage });
  } catch (error) {
    console.error("Error in AI chat endpoint:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

Deno.serve(app.fetch);