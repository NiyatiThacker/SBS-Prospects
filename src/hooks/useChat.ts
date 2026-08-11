"use client";

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

const getTimestamp = () =>
  new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export function useChat() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: "Hi! 👉 I'm CareerAI, your AI training and career assistant. How can I help you today?",
      timestamp: getTimestamp(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      const newUserMsg: Message = { role: 'user', content, timestamp: getTimestamp() };
      setMessages((prev) => [...prev, newUserMsg]);
      setIsLoading(true);
      setError(null);

      try {
        // Use our local Next.js API route
        const API_URL = ''; // Relative path so it works on any domain/localhost
        const response = await fetch(`${API_URL}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [...messages, newUserMsg] }),
        });

        if (!response.ok) {
          throw new Error('Failed to get response from the server.');
        }

        const data = await response.json();

        // Check for Redirect Command anywhere in the response text
        try {
          const jsonMatch = data.response.match(/\{[\s\S]*?"action"\s*:\s*"REDIRECT"[\s\S]*?\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);

            if (parsed.action === 'REDIRECT') {
              // Remove the JSON string from the message content
              const cleanText = data.response
                .replace(jsonMatch[0], '')
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .trim();

              // Display only the clean conversational text to the user
              if (cleanText) {
                setMessages((prev) => [
                  ...prev,
                  { role: 'model', content: cleanText, timestamp: getTimestamp() },
                ]);
              } else {
                setMessages((prev) => [
                  ...prev,
                  { role: 'model', content: `Redirecting you to ${parsed.url}...`, timestamp: getTimestamp() },
                ]);
              }

              // Instantly trigger the navigation
              router.push(parsed.url);
              return;
            }
          }
        } catch (e) {
          // Not JSON or parsing failed, fall through to normal response
        }

        setMessages((prev) => [...prev, { role: 'model', content: data.response, timestamp: getTimestamp() }]);
      } catch (err: any) {
        setError(err.message || 'An error occurred.');
        setMessages((prev) => [
          ...prev,
          {
            role: 'model',
            content: 'Sorry, I am having trouble connecting right now. Please try again later.',
            timestamp: getTimestamp(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, router]
  );

  const clearChat = () => {
    setMessages([
      {
        role: 'model',
        content: "Hi! 👉 I'm CareerAI, your AI training and career assistant. How can I help you today?",
        timestamp: getTimestamp(),
      },
    ]);
    setError(null);
  };

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
  };
}
