const QUESTIONS = [
    "What is the load weight you need to lift (in tons)?",
    "What is the required lifting height?",
    "What is the working radius?",
    "What is the terrain type? (soft, muddy, plain, rocky, indoor)",
    "Are there any obstructions like buildings or powerlines?",
    "What is the site access condition? (wide, narrow, indoor)",
    "Do you have any preferred crane type? (mobile, crawler, tower, none)",
    "Where is the project location?",
    "What are the wind conditions? (low, medium, high)"
];
module.exports.aiHome = (req, res) => {
    req.session.ai = { step: 0, answers: {} };
    res.json({
        message: "AI Assistant Ready",
        nextQuestion: QUESTIONS[0]
    });
};
module.exports.processMessage = async (req, res) => {
    if (!req.session.ai) {
        req.session.ai = { step: 0, answers: {} };
    }

    const { answer } = req.body;
    const step = req.session.ai.step;

    // Store answer in session
    req.session.ai.answers[QUESTIONS[step]] = answer;

    // Move to next question
    req.session.ai.step++;

    // If all questions answered → send to Gemini
    if (req.session.ai.step >= QUESTIONS.length) {
        return await finalizeAI(req, res);
    }

    // Return next question
    res.json({
        message: "Next question",
        nextQuestion: QUESTIONS[req.session.ai.step]
    });
};

module.exports.resetAI = (req, res) => {
    req.session.ai = null;
    res.json({ message: "AI session cleared" });
};

const { GoogleGenerativeAI } = require("@google/generative-ai");

const finalizeAI = async (req, res) => {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `
You are a professional crane recommendation system.
Based on this user's answers, suggest the ideal crane models.

User Answers:
${JSON.stringify(req.session.ai.answers, null, 2)}

Provide:
- Best recommended crane model(s)
- 2 alternative cranes
- Technical explanation
- Capacity safety notes
- Any warnings (wind, terrain, radius)
- Suggested boom configuration
Return output in structured JSON format:
{
  "recommended": [...],
  "alternatives": [...],
  "reasoning": "...",
  "warnings": [...],
  "idealSpecs": {...}
}
  in no more than 100 words
`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        res.json({
            done: true,
            answers: req.session.ai.answers,
            recommendations: JSON.parse(text)
        });

        // Clear AI session if desired:
        req.session.ai = null;

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "AI processing failed" });
    }
};
