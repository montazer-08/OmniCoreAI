'use client';

import { useState } from 'react';
import { aiChat } from '@/ai/flows/ai-chat';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function AiChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [overclock, setOverclock] = useState(false);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    const assistantMessage: Message = { role: 'assistant', content: '' };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setInput('');
    setLoading(true);

    try {
      const { response } = await aiChat({
        query: userMessage.content,
        overclock,
      });

      const reader = response.getReader();
      let content = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        // ✅ value هو string
        content += value;

        setMessages(prev =>
          prev.map((msg, index) =>
            index === prev.length - 1
              ? { ...msg, content }
              : msg
          )
        );
      }
    } catch (err) {
      console.error(err);
      setMessages(prev =>
        prev.map((msg, index) =>
          index === prev.length - 1
            ? { ...msg, content: '❌ حدث خطأ أثناء توليد الرد' }
            : msg
        )
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-screen p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">AI Chat</h1>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg ${
              msg.role === 'user'
                ? 'bg-blue-600 text-white self-end'
                : 'bg-gray-200 text-black self-start'
            }`}
          >
            {msg.content}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          className="flex-1 border rounded px-3 py-2"
          placeholder="اكتب سؤالك..."
        />

        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded"
        >
          {loading ? '...' : 'إرسال'}
        </button>
      </div>

      <label className="mt-2 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={overclock}
          onChange={e => setOverclock(e.target.checked)}
        />
        النسخة الخارقة (Gemini 2.5 Flash)
      </label>
    </div>
  );
}
