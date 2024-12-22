"use client";

import Navbar from "@/components/navbar";
import { useState } from "react";

export default function Chat() {
  const [messages, setMessages] = useState<
    { id: string; role: string; content: string | string[] }[]
  >([]);
  const [input, setInput] = useState("");
  const [deadline, setDeadline] = useState("week"); // Default is 'week'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleDeadlineChange = (newDeadline: string) => {
    setMessages([])
    setDeadline(newDeadline);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Clear previous messages after submitting a new input
    setMessages([]);

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, deadline }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch AI response");
      }

      const data = await response.json();
      const processedContent = processResponse(data.content);
      const aiMessage = {
        id: Date.now().toString(),
        role: "AI",
        content: processedContent,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  function processResponse(response: string) {
    const stepRegex = /\*\*Step \d+:/;
    const stepParts = response.split(stepRegex);

    if (stepParts.length > 1) {
      const result: string[] = [];
      if (stepParts[0].trim()) {
        result.push(stepParts[0].trim());
      }
      stepParts.slice(1).forEach((part, index) => {
        result.push(`**Step ${index + 1}: ${part.trim()}`);
      });
      return result;
    }

    const dayRegex = /\*\*Day \d+:/;
    const dayParts = response.split(dayRegex);

    const result: string[] = [];
    if (dayParts[0].trim()) {
      result.push(dayParts[0].trim());
    }
    dayParts.slice(1).forEach((part, index) => {
      result.push(`**Day ${index + 1}: ${part.trim()}`);
    });

    return result;
  }

  return (
    <>
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Navbar />
        {/* Header Section */}
        <div className="max-w-screen-lg mx-auto px-5 pt-28 lg:pt-40 text-center text-black dark:text-foreground">
          <h1 className="text-5xl lg:text-7xl">
            Get a clear <br />
            <span className="text-accent dark:text-accent"> day-to-day </span>
            <br /> plan
          </h1>
          <p className="mt-5 lg:mt-9 text-gray-800 dark:text-gray-300">
            Type your goal in this box and AI will generate habits for you to do everyday to achieve the desired plan.
          </p>
        </div>

        <div className="mt-5 lg:mt-10 px-5 pb-28 flex flex-col gap-9 lg:gap-12 w-full max-w-4xl mx-auto text-black dark:text-foreground overflow-hidden">
          {/* Error Message */}
          {error && (
            <div className="text-red-500 p-4 bg-red-100 dark:bg-red-800 dark:text-red-300 rounded-xl">
              {error}
            </div>
          )}

          {/* Deadline Selection Buttons */}
          <div className="flex md:justify-center gap-5 overflow-x-auto">
            {["week", "month", "year", "5 years", "10 years"].map((option) => (
              <button
                key={option}
                onClick={() => handleDeadlineChange(option)}
                className={`px-4 py-2 rounded-lg border ${deadline === option ? 'bg-accent text-white' : 'bg-gray-200 text-black'}`}
              >
                {option}
              </button>
            ))}
          </div>

          {/* Messages */}
          {messages.map((message) =>
            Array.isArray(message.content) ? (
              message.content.map((line, idx) => (
                <div
                  key={`${message.id}-${idx}`}
                  className="p-5 bg-black/25 dark:bg-secondary rounded-2xl shadow-lg shadow-black/25 dark:shadow-shadow"
                >
                  <span
                    dangerouslySetInnerHTML={{
                      __html: line.replace(
                        /\*\*(.*?)\*\*/g,
                        '<div class="mb-4 lg:mb-6 font-bold text-xl lg:text-3xl">$1</div>'
                      ),
                    }}
                  />
                </div>
              ))
            ) : (
              <div key={message.id} className="p-5 text-4xl">
                {message.content}
              </div>
            )
          )}

          {/* Form */}
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full mb-8 px-5">
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
              <input
                aria-label="Chat input"
                className="bg-gray-300 dark:bg-primary mx-auto px-2 w-full py-4 border border-gray-300 dark:border-gray-600 rounded-2xl shadow-lg shadow-shadow dark:bg-gray-700"
                value={input}
                placeholder="Type what you want to achieve.."
                onChange={handleInputChange}
                disabled={isLoading}
              />
              <button type="submit" disabled={isLoading} className="sr-only">
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
