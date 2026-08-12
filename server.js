require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { seed, buildContextBlock } = require('./knowledgeBase');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'google/gemma-4-26b-a4b-it:free';

function buildSystemPrompt(contextBlock) {
  return `You are the official Admission Assistant chatbot for Somali National University (SNU).

Answer ONLY using the knowledge base below. If the question is unrelated to SNU admissions, or the answer
is not in the knowledge base, say clearly and politely that you don't have that information and direct the
student to contact the admissions office (https://snu.edu.so/admission/ or the relevant faculty office) — do NOT guess or
invent facts about deadlines, fees, or requirements.

Reply in the same language the student used (English or Somali). Keep answers concise and friendly.

--- SNU ADMISSION KNOWLEDGE BASE ---
${contextBlock}
--- END KNOWLEDGE BASE ---`;
}

app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'message is required' });
    }

    const contextBlock = await buildContextBlock();
    const systemPrompt = buildSystemPrompt(contextBlock);

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map((h) => ({
        role: h.role === 'assistant' ? 'assistant' : 'user',
        content: h.content
      })),
      { role: 'user', content: message }
    ];

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
        'X-Title': 'SNU Admission Chatbot'
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenRouter error:', response.status, errText);
      throw new Error(`OpenRouter request failed: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || "Sorry, I couldn't generate a response.";

    res.json({ reply });
  } catch (err) {
    console.error('Chat error:', err);
    res.json({
      reply:
        "Sorry, I'm having trouble reaching my knowledge system right now. Please contact the SNU admissions office directly at ai@snu.edu.so, or try again in a moment."
    });
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;

async function start() {
  await seed(); // populates the knowledge base on first run if empty
  app.listen(PORT, () => console.log(`SNU Admission Chatbot running on port ${PORT}`));
}

start();
