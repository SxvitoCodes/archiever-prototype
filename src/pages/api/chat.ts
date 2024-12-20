import type { NextApiRequest, NextApiResponse } from 'next';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: `Provide a step-by-step guide for achieving the following goal in a week: "${message}". Format the response as an array of steps, each with a title and description.`,
        },
      ],
      model: 'llama3-8b-8192',
    });

    const aiResponse = chatCompletion.choices[0]?.message?.content || 'Error generating response';
    res.status(200).json({ content: aiResponse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
