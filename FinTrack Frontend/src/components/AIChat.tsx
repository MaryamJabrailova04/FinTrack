import React from 'react';
import { useRef, useState } from 'react';
import { X, Send, Paperclip } from 'lucide-react';
import { chat as chatApi, parseReceipt, commitReceipt } from '../services/aiService';

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
}

export function AIChat({ isOpen, onClose }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hello! I'm your AI assistant. How can I help you today?", sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSend = () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now(),
      text: input,
      sender: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    void sendToBackend(userMessage.text);
  };

  async function sendToBackend(text: string) {
    setLoading(true);
    try {
      const res = await chatApi(text);
      const aiMessage: Message = {
        id: Date.now() + 1,
        text: res.reply || '',
        sender: 'ai'
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (e: any) {
      const detail = e?.response?.data?.detail || e?.response?.data || 'Sorry, something went wrong contacting AI.';
      const err: Message = { id: Date.now() + 2, text: String(detail), sender: 'ai' };
      setMessages(prev => [...prev, err]);
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleFileSelected(file: File) {
    if (!file || loading) return;
    setLoading(true);
    try {
      const parsed = await parseReceipt(file);
      let reply = `Parsed receipt (job ${parsed.id}).`;
      if (parsed.parsed?.items?.length) {
        const commit = await commitReceipt(parsed.id, parsed.parsed.items);
        reply += ` Imported ${commit.created_expense_ids.length} expense(s).`;
      } else {
        reply += ' No line items detected.';
      }
      setMessages(prev => [...prev, { id: Date.now() + 3, text: reply, sender: 'ai' }]);
    } catch (e: any) {
      const detail = e?.response?.data?.error || e?.response?.data?.detail || 'Failed to parse the receipt image.';
      setMessages(prev => [...prev, { id: Date.now() + 4, text: String(detail), sender: 'ai' }]);
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl h-[600px] bg-gray-900 rounded-2xl shadow-2xl shadow-blue-600/20 border border-gray-800 flex flex-col m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-xl text-white tracking-wider">AI Assistant</h2>
            <p className="text-sm text-gray-400 mt-1">Chat with AI</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] p-4 rounded-2xl ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-gray-800 text-gray-100 rounded-bl-sm'
                }`}
              >
                <p>{message.text}</p>
              </div>
            </div>
          ))}

          {/* Typing indicator while AI is thinking */}
          {loading && (
            <div className="flex justify-start">
              <div className="max-w-[70%] p-4 rounded-2xl bg-gray-800 text-gray-100 rounded-bl-sm">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full border-2 border-gray-600 border-t-transparent animate-spin" />
                  <div className="flex items-end gap-1">
                    <span className="block w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="block w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '100ms' }} />
                    <span className="block w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-6 border-t border-gray-800">
          <div className="flex gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white p-3 rounded-xl border border-gray-700 hover:border-blue-600 transition-colors"
            >
              <Paperclip size={20} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleFileSelected(f);
                e.currentTarget.value = '';
              }}
            />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-blue-600 focus:outline-none transition-colors placeholder:text-gray-500"
            />
            <button
              onClick={handleSend}
              className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl transition-colors shadow-lg shadow-blue-600/30 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? (
                <div className="h-5 w-5 rounded-full border-2 border-white/60 border-t-transparent animate-spin" />
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
