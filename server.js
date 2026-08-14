require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { seed, buildContextBlock, searchLocal } = require('./knowledgeBase');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// A short list of free OpenRouter models to try in order. Rate limits are usually
// per-model, so if the first one is exhausted, the next one often still works.
// Edit this list any time — put your preferred model first.
const OPENROUTER_MODELS = (process.env.OPENROUTER_MODELS || process.env.OPENROUTER_MODEL || 'openrouter/free,meta-llama/llama-3.3-70b-instruct:free')
  .split(',')
  .map((m) => m.trim())
  .filter(Boolean);

// Strips visible "thinking out loud" preambles that some free/smaller models produce
// even when asked not to (and even when reasoning.exclude is set, as a safety net).
// Looks for common patterns like "Here's a thinking process:" ... "Draft:" or similar,
// and tries to keep only the actual final answer.
function stripReasoning(text) {
  if (!text) return text;

  // If the model wrapped its real answer after a clear marker, keep what's after it.
  const finalMarkers = [
    /final answer[:\s]*/i,
    /\bdraft[:\s]*/i,
    /\bresponse[:\s]*\n/i,
    /\bhere'?s (the|my) (response|answer|reply)[:\s]*/i
  ];
  for (const marker of finalMarkers) {
    const match = text.split(marker);
    if (match.length > 1) {
      // Use the LAST split segment — the actual answer usually comes after the last marker
      const candidate = match[match.length - 1].trim();
      if (candidate.length > 20) return candidate;
    }
  }

  // If the text starts with an obvious reasoning preamble, cut everything before
  // the first line that looks like real prose addressed to the student.
  const reasoningStarters = /^(here'?s a thinking process|let me think|thinking process|step \d|analyze|1\.\s*analyze)/i;
  if (reasoningStarters.test(text.trim())) {
    const lines = text.split('\n');
    // Find the first line that looks like a normal sentence (not a numbered/bulleted planning step)
    const idx = lines.findIndex(
      (l) => l.trim().length > 30 && !/^(\d+[\.\)]|[-*•]|check|analyze|formulate|draft)/i.test(l.trim())
    );
    if (idx > 0) return lines.slice(idx).join('\n').trim();
  }

  return text;
}

function buildSystemPrompt(contextBlock) {
  return `You are the official Admission Assistant chatbot for Somali National University (SNU).

Answer ONLY using the knowledge base below. If the question is unrelated to SNU admissions, or the answer
is not in the knowledge base, say clearly and politely that you don't have that information and direct the
student to contact the admissions office (https://snu.edu.so/admission/ or the relevant faculty office) — do NOT guess or
invent facts about deadlines, fees, or requirements.

IMPORTANT: Respond with ONLY the final answer, addressed directly to the student. Do NOT show your
reasoning, analysis, thinking process, or drafts. Do NOT include phrases like "here's my thinking" or
"step 1" or "draft:" — just give the finished answer as if you were texting the student directly.

CRITICAL FOR SOMALI: If replying in Somali, copy the Somali text from the "A (Somali)" field in the
knowledge base EXACTLY as written — do not translate, paraphrase, or rewrite it yourself, and do not
add any steps, requirements, or details that are not explicitly written there. Your own Somali
generation is not reliable enough to be trusted for official admission information.

Reply in the same language the student used (English or Somali). Keep answers concise and friendly.

--- SNU ADMISSION KNOWLEDGE BASE ---
${contextBlock}
--- END KNOWLEDGE BASE ---`;
}

// Tries each model in OPENROUTER_MODELS in order. Returns the reply text on first success,
// or throws after every model has failed (caller decides what to do next).
async function callOpenRouter(messages) {
  let lastError = null;

  for (const model of OPENROUTER_MODELS) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
          'X-Title': 'SNU Admission Chatbot'
        },
        body: JSON.stringify({ model, messages, max_tokens: 500 })
      });

      if (response.status === 429) {
        console.warn(`Rate limited on ${model}, trying next model...`);
        lastError = new Error(`Rate limited: ${model}`);
        continue; // try the next model in the list
      }

      if (!response.ok) {
        const errText = await response.text();
        console.error(`OpenRouter error on ${model}:`, response.status, errText);
        lastError = new Error(`OpenRouter request failed (${model}): ${response.status}`);
        continue;
      }

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content?.trim();
      if (reply) return reply; // success — stop trying further models

      lastError = new Error(`Empty response from ${model}`);
    } catch (err) {
      console.error(`Network error calling ${model}:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error('All OpenRouter models failed');
}

// A match score at or above this is trusted enough to answer directly from the
// knowledge base, verbatim, without ever sending it through the AI model. This is
// what prevents the AI from "helpfully" paraphrasing (and sometimes inventing
// details in) your carefully written English/Somali text.
const STRONG_MATCH_THRESHOLD = 3;

app.post('/api/chat', async (req, res) => {
  const { message, history = [], lang } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'message is required' });
  }

  // Prefer the language the frontend explicitly tells us (the EN/SO toggle the
  // student picked) — far more reliable than guessing from word patterns in the
  // message, which fails on short or unusual phrasing. Only fall back to a rough
  // guess if the frontend didn't send one (e.g. an older client or direct API call).
  const somaliHint = /\b(iyo|maalin|jaamacad|codsi|shuruudo|waa|maad|sidee|goorma|imisa)\b/i.test(message);
  const guessedLang = lang === 'so' || lang === 'en' ? lang : somaliHint ? 'so' : 'en';

  // STEP 1: try a confident, exact knowledge-base match first. If we're confident
  // this question matches a known FAQ, answer with the stored text directly —
  // no AI involved, so no risk of paraphrasing errors or hallucinated details.
  try {
    const match = await searchLocal(message, guessedLang);
    if (match && match.score >= STRONG_MATCH_THRESHOLD) {
      return res.json({ reply: match.answer, source: 'knowledge_base_direct' });
    }
  } catch (kbErr) {
    console.error('Local search failed, continuing to AI:', kbErr.message);
  }

  // STEP 2: no confident direct match — let the AI handle it conversationally,
  // still grounded in the same knowledge base as context.
  try {
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

    const rawReply = await callOpenRouter(messages);
    const reply = stripReasoning(rawReply);
    return res.json({ reply, source: 'ai' });
  } catch (err) {
    console.error('AI call failed, falling back to knowledge base search:', err.message);

    // STEP 3: AI failed entirely — fall back to a looser local match if we have one,
    // even below the strong-match threshold, better than nothing.
    try {
      const match = await searchLocal(message, guessedLang);
      if (match) {
        const prefix =
          guessedLang === 'so'
            ? `(Jawaab toos ah oo laga helay xogta): `
            : `(Direct answer from our knowledge base): `;
        return res.json({ reply: prefix + match.answer, source: 'knowledge_base' });
      }
    } catch (kbErr) {
      console.error('Knowledge base fallback also failed:', kbErr.message);
    }

    // STEP 4: nothing matched at all — final polite message.
    const fallbackMsg =
      guessedLang === 'so'
        ? "Waan ka xumahay, hadda ma heli karo jawaab AI ah. Fadlan la xiriir xafiiska diiwaangelinta: https://snu.edu.so/admission/"
        : "Sorry, I'm having trouble reaching my AI system right now. Please contact the SNU admissions office directly at https://snu.edu.so/admission/, or try again in a moment.";
    return res.json({ reply: fallbackMsg, source: 'fallback' });
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok', models: OPENROUTER_MODELS }));

const PORT = process.env.PORT || 3000;

async function start() {
  await seed(); // populates the knowledge base on first run if empty
  app.listen(PORT, () => console.log(`SNU Admission Chatbot running on port ${PORT}`));
}

start();