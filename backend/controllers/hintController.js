const Assignment = require('../models/Assignment');

const HINT_SYSTEM_PROMPT = `You are a SQL tutor for CipherSQLStudio, an educational platform.

Your role is to provide HINTS only — never full solutions.

Rules:
1. NEVER write or complete the full SQL query for the student
2. Guide their thinking with questions or conceptual nudges
3. Point to the relevant SQL concept or clause they should look into
4. If they're on the right track, affirm what they have and suggest the next small step
5. Keep hints concise: 2-4 sentences max
6. Use friendly, encouraging language
7. If a student asks "just give me the answer", firmly decline and redirect

Format: Plain text, no code blocks, no full queries.`;

function buildHintPrompt(assignment, userQuery, previousHints) {
  return `Assignment: "${assignment.title}"
Question: ${assignment.question}
Requirements: ${assignment.requirements.join(', ')}
Tables available: ${assignment.sampleTables.map(t => t.tableName).join(', ')}

Student's current query attempt:
${userQuery || '(no query written yet)'}

${previousHints.length > 0 ? `Previous hints given: ${previousHints.slice(-2).join(' | ')}` : ''}

Provide a single helpful hint to guide the student toward the correct solution WITHOUT giving them the answer.`;
}

exports.getHint = async (req, res) => {
  const { assignmentId, userQuery, previousHints = [] } = req.body;

  if (!assignmentId) {
    return res.status(400).json({ error: 'assignmentId is required.' });
  }

  let assignment;
  try {
    assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found.' });
  } catch {
    return res.status(400).json({ error: 'Invalid assignment ID.' });
  }

  const apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'LLM service not configured.' });
  }

  try {
    let hint;
    if (process.env.OPENAI_API_KEY) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: HINT_SYSTEM_PROMPT },
            { role: 'user', content: buildHintPrompt(assignment, userQuery, previousHints) }
          ],
          max_tokens: 200,
          temperature: 0.7
        })
      });
      const data = await response.json();
      hint = data.choices?.[0]?.message?.content;
    } else if (process.env.GEMINI_API_KEY) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: HINT_SYSTEM_PROMPT }] },
            contents: [{ parts: [{ text: buildHintPrompt(assignment, userQuery, previousHints) }] }],
            generationConfig: { maxOutputTokens: 200 }
          })
        }
      );
      const data = await response.json();
      hint = data.candidates?.[0]?.content?.parts?.[0]?.text;
    }

    if (!hint) throw new Error('No hint generated');
    res.json({ hint });
  } catch (err) {
    console.error('LLM error:', err);
    res.status(500).json({ error: 'Failed to generate hint. Please try again.' });
  }
};
