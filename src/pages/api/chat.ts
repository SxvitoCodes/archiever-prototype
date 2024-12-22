import type { NextApiRequest, NextApiResponse } from "next";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message, deadline } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const deadlinePrompt = `
Provide a step-by-step guide to achieving the following goal within the next ${deadline}: "${message}". 
The steps should be clearly numbered and formatted as follows:
1. **Step X: Title of the step (Day/Week/Month X)**
   - Description of the action/task to complete for that day/week/month.

The steps should be actionable and focused on daily tasks for short deadlines (week, month), and for longer deadlines (year, 10 years), break them down into actionable milestones or daily tasks that can be accomplished within each timeframe. 

For example:
- For a one-week deadline, break it down into daily tasks.
- For a one-month deadline, break it down into weekly tasks, with daily actions for each week.
- For a one-year deadline, break it into monthly milestones, with smaller tasks for each month.
- For a ten-year deadline, break it into yearly milestones and yearly tasks, but still provide actionable daily or weekly tasks within each year.

Ensure that the goal is clear and feasible within the selected deadline. If it's unrealistic, provide a warning explaining why, and offer advice on adjusting the approach to make it more achievable.

The titles of each step should reflect the appropriate deadline unit (Day, Week, Month, Year), and each step should be a concrete task to help achieve the overall goal.

If the goal is unrealistic or unclear for the specified timeframe, please include a warning and offer suggestions on how to adjust the goal to be more achievable. 
Do not proceed with vague or unachievable steps.

Do not include any additional information beyond the steps or warning.
`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: deadlinePrompt,
        },
      ],
      model: "llama3-8b-8192",
    });

    const aiResponse =
      chatCompletion.choices[0]?.message?.content ||
      "Error generating response";
    res.status(200).json({ content: aiResponse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}
