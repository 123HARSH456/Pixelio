import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

// RATE LIMITER CACHE (In-memory)
// Stores IP addresses and their last request timestamp
const rateLimitMap = new Map<string, number>();
const COOLDOWN_MS = 5000; // 5 Seconds cooldown between requests

const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

export async function POST(req: Request) {
    try {
        // --- SECURITY LAYER ---
        
        // Get Client IP (for rate limiting)
        const ip = req.headers.get("x-forwarded-for") || "unknown-ip";
        
        // Check Rate Limit
        const lastRequest = rateLimitMap.get(ip);
        const now = Date.now();
        
        if (lastRequest && (now - lastRequest < COOLDOWN_MS)) {
             const timeLeft = Math.ceil((COOLDOWN_MS - (now - lastRequest)) / 1000);
             return NextResponse.json(
                 { error: `Please wait ${timeLeft} seconds before generating again.` }, 
                 { status: 429 } // HTTP 429 = Too Many Requests
             );
        }
        
        // Update Timestamp for this IP
        rateLimitMap.set(ip, now);

        // --- LOGIC LAYER ---

        const body = await req.json();
        const { userPrompt } = body;

        // Validation
        if (!userPrompt || userPrompt.trim().length === 0) {
            return NextResponse.json({ error: "Prompt cannot be empty" }, { status: 400 });
        }

        const instructions = `
            ROLE:
            You are PIXEL-ENGINE-V9, a specialized rendering backend for retro game assets.
            Your task is to rasterize natural language prompts into a strict 32x32 integer matrix (2D Array).

            PALETTE (Strict Indexing):
            0 = Transparent/Background (Use for empty space)
            1 = Black (#000000) - Use for strong outlines
            2 = Red (#e74c3c)
            3 = Blue (#3498db)
            4 = Green (#2ecc71)
            5 = Gold/Yellow (#f1c40f)

            ARTISTIC INTELLIGENCE RULES:
            1. CENTERING: The subject must be mathematically centered in the 32x32 grid.
            2. SILHOUETTE: Ensure the subject has a distinct, readable shape against the background.
            3. OUTLINING: Use Color 1 (Black) to create a continuous border around the subject to ensure it "pops" on any background.
            4. NEGATIVE SPACE: Do not fill the entire grid. Leave at least 2-4 pixels of padding (Color 0) on all edges unless it's a texture pattern.
            5. CLEANLINESS: Avoid "stray pixels" (noise). Every non-zero pixel must connect to another non-zero pixel.

            CRITICAL OUTPUT CONSTRAINTS:
            - OUTPUT FORMAT: Pure, raw JSON 2D Array.
            - DIMENSIONS: Exactly 32 rows, each containing exactly 32 integers.
            - FORBIDDEN: Do not wrap response in \`\`\`json or \`\`\`. Do not provide explanations. Do not include newlines inside the array structure if possible.
            - FAILURE MODE: If the prompt is abstract or unrecognizable, render a generic "Question Mark Block" sprite.

            INPUT PROMPT: "${userPrompt}"
            
            GENERATE MATRIX:
        `;

        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash', 
            config: {
                systemInstruction: instructions,
                responseMimeType: 'application/json', 
            },
            contents: [{ role: 'user', parts: [{ text: userPrompt }] }]
        });

        // Safe Text Extraction 
        let text = result.text;
        if (typeof text === 'function') {
            // @ts-ignore
            text = result.text();
        }

        if (!text) {
            return NextResponse.json({ error: "AI returned empty response" }, { status: 500 });
        }

        // --- SAFETY PARSING LAYER ---
        
        // Removes markdown, newlines, and any leading/trailing weirdness
        const cleanedText = text
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .replace(/[\n\r]/g, "") 
            .trim();

        // Parsing
        let pixelArray;
        try {
            pixelArray = JSON.parse(cleanedText);
        } catch (parseError) {
            console.error("JSON Parse Failed on:", cleanedText);
            return NextResponse.json({ error: "AI generated invalid JSON. Please try again." }, { status: 500 });
        }

        // Structure Validation 
        if (!Array.isArray(pixelArray) || pixelArray.length !== 32) {
             console.error("Invalid Grid Size:", pixelArray.length);
             return NextResponse.json({ error: "AI generated a malformed grid." }, { status: 500 });
        }

        return NextResponse.json({ data: pixelArray });
    }
    catch (error: any) {
        console.error("AI Critical Error:", error);
        return NextResponse.json({ error: "Server Error", details: error.message }, { status: 500 });
    }
}