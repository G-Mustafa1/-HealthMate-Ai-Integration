const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const buildPromptForReport = () => `
You will receive a file (PDF or image).
Read it carefully and return ONLY a JSON object (no extra commentary) with this structure:
{
  "title": "short title or subject of the document",
  "date": "any visible or implied date",
  "summary": "concise explanation of what this file is about",
  "explanation_en": "a simple paragraph in English explaining it for a general reader",
  "explanation_ro": "translate explanation_en to Roman Urdu using Latin letters",
  "suggested_questions": ["user questions they might ask about this file"]
}
If the file is not medical, still summarize it accurately.
If some fields are not available, leave them blank or empty array.
`;

async function analyzeFileBase64(fileBase64, mimeType = "application/pdf") {
    try {
        const contents = [
            {
                role: "user",
                parts: [
                    { text: buildPromptForReport() },
                    { inlineData: { mimeType, data: fileBase64 } }
                ]
            }
        ];

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", // ✅ faster & higher limits
            contents,
        });

        const rawText = response.candidates?.[0]?.content?.parts?.[0]?.text || "";

        console.log("🧾 Gemini Raw Response:", rawText.slice(0, 200));

        let parsed = null;
        try {
            const start = rawText.indexOf("{");
            const end = rawText.lastIndexOf("}");
            if (start !== -1 && end !== -1) {
                parsed = JSON.parse(rawText.slice(start, end + 1));
            }
        } catch (jsonErr) {
            console.warn("⚠️ JSON Parse Error:", jsonErr.message);
        }

        return {
            ok: !!parsed,
            parsed: parsed || {
                title: "Untitled Report",
                date: "",
                summary: rawText || "No structured data found.",
                explanation_en: rawText,
                explanation_ro: "",
                suggested_questions: []
            },
            rawText
        };
    } catch (err) {
        console.error("❌ Gemini AI Error:", err.message);
        return {
            ok: false,
            parsed: {
                title: "Error",
                date: "",
                summary: "Error analyzing report.",
                explanation_en: err.message,
                explanation_ro: "",
                suggested_questions: []
            },
            rawText: ""
        };
    }
}

module.exports = { analyzeFileBase64 };
