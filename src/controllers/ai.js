require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");

/* =========================
   GEMINI CLIENT
========================= */

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

/* =========================
   AI QUESTIONS CONFIG
========================= */

const QUESTIONS = [
  { key: "load", q: "What is the load weight you need to lift (in tons)?" },
  { key: "height", q: "What is the required lifting height?" },
  { key: "radius", q: "What is the working radius?" },
  { key: "terrain", q: "What is the terrain type? (soft, muddy, plain, rocky, indoor)" },
  { key: "obstructions", q: "Are there any obstructions like buildings or powerlines?" },
  { key: "access", q: "What is the site access condition? (wide, narrow, indoor)" },
  { key: "preference", q: "Do you have any preferred crane type? (mobile, crawler, tower, none)" },
  { key: "location", q: "Where is the project location?" },
  { key: "wind", q: "What are the wind conditions? (low, medium, high)" }
];

/* =========================
   START AI SESSION
========================= */

module.exports.aiHome = (req, res) => {
  req.session.ai = { step: 0, answers: {} };

  res.json({
    message: "AI Assistant Ready",
    nextQuestion: QUESTIONS[0].q
  });
};

/* =========================
   PROCESS USER ANSWER
========================= */

module.exports.processMessage = async (req, res) => {
  if (!req.session.ai) {
    req.session.ai = { step: 0, answers: {} };
  }

  const { answer } = req.body;
  const step = req.session.ai.step;

  if (!QUESTIONS[step]) {
    return res.status(400).json({ error: "Invalid AI step" });
  }

  // Store answer
  const currentQuestion = QUESTIONS[step];
  req.session.ai.answers[currentQuestion.key] = answer;
  req.session.ai.step++;

  // Final step → call AI
  if (req.session.ai.step >= QUESTIONS.length) {
    return finalizeAI(req, res);
  }

  res.json({
    message: "Next question",
    nextQuestion: QUESTIONS[req.session.ai.step].q
  });
};

/* =========================
   RESET AI SESSION
========================= */

module.exports.resetAI = (req, res) => {
  req.session.ai = null;
  res.json({ message: "AI session cleared" });
};

/* =========================
   FINALIZE & CALL GEMINI
========================= */

async function finalizeAI(req, res) {
  try {
    const prompt = `
You are a professional crane recommendation system.

STRICT RULES:
- Return ONLY valid JSON
- No markdown
- No explanations outside JSON
- No trailing commas

User Answers:
${JSON.stringify(req.session.ai.answers, null, 2)}

Return EXACTLY in this format:
{
  "recommended": ["Crane Model"],
  "alternatives": ["Alt 1", "Alt 2"],
  "reasoning": "Short explanation",
  "warnings": ["warning1"],
  "idealSpecs": {
    "capacity": "",
    "boomLength": "",
    "radius": ""
  }
}
`;

    // ✅ OFFICIAL API CALL (matches Google docs)
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });

    const text = response.text;

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      return res.status(500).json({
        error: "AI returned invalid JSON",
        rawResponse: text
      });
    }

    res.json({
      done: true,
      answers: req.session.ai.answers,
      recommendations: parsed
    });

    req.session.ai = null;

  } catch (err) {
    console.error("AI ERROR:", err);
    res.status(500).json({ error: "AI processing failed" });
  }
}
