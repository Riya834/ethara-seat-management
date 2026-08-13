import React, { useState } from 'react';
import { Bot, Send, X, Sparkles, Loader2, CornerDownRight, MessageSquare } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  toolCalled?: string;
  timestamp: string;
}

interface AIChatWidgetProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const AIChatWidget: React.FC<AIChatWidgetProps> = ({ isOpen, onToggle }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: `Hello ${user?.name || 'there'}! I am Ethara's AI Workplace Assistant. Ask me anything about employee seating, available floor capacity, project utilization, or new joiner status.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const samplePrompts = [
    'Where does Priya Sharma sit?',
    'How many free seats on Floor 2?',
    "What's the utilization for Project Atlas?",
    'Has the new joiner starting Monday been allocated a seat?'
  ];

  const handleSend = async (textToSend?: string) => {
    const prompt = textToSend || inputPrompt;
    if (!prompt.trim() || loading) return;

    const userMsg: Message = {
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputPrompt('');
    setLoading(true);

    try {
      const res = await api.post('/ai/query', { prompt });
      const assistantMsg: Message = {
        sender: 'assistant',
        text: res.data.response,
        toolCalled: res.data.toolCalled,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: `Sorry, I encountered an error executing your query: ${err.response?.data?.message || err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Permanent Bottom-Right Floating AI Assistant Icon Button */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2 group">
        {/* Hover Label */}
        <span className="hidden group-hover:inline-block px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-lg opacity-90 transition-opacity">
          Ask Ethara AI
        </span>

        <button
          onClick={onToggle}
          title="Open AI Workplace Assistant"
          className="w-14 h-14 rounded-full bg-[#FBC48B] hover:bg-[#f7b674] text-slate-900 border-2 border-white shadow-xl shadow-amber-900/20 flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 relative"
        >
          <Bot className="w-7 h-7 text-slate-900" />
          {/* Notification pulse badge */}
          <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-900 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-slate-900 border-2 border-white"></span>
          </span>
        </button>
      </div>

      {/* Floating Chat Modal Drawer */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-full max-w-md bg-white rounded-[32px] shadow-2xl border border-[#EFE8DC] flex flex-col h-[560px] overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#FBC48B] text-slate-900 flex items-center justify-center font-bold shadow-xs">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-none flex items-center gap-1.5">
                  Ethara AI Assistant
                  <Sparkles className="w-3.5 h-3.5 text-[#FBC48B] fill-[#FBC48B]" />
                </h3>
                <span className="text-[10px] text-slate-300">Live 5,000 Workforce RAG Engine</span>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#FAF7F2]/50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs font-medium leading-relaxed shadow-2xs ${
                    msg.sender === 'user'
                      ? 'bg-slate-900 text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-[#EFE8DC] rounded-bl-xs'
                  }`}
                >
                  {msg.toolCalled && (
                    <div className="mb-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 text-[10px] font-bold border border-amber-200">
                      <CornerDownRight className="w-3 h-3" />
                      <span>Tool: {msg.toolCalled}</span>
                    </div>
                  )}
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-slate-600 text-xs py-2 px-3 bg-white rounded-xl border border-[#EFE8DC] w-fit">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-900" />
                <span>Querying 5,000 workforce records...</span>
              </div>
            )}
          </div>

          {/* Suggested Chips */}
          <div className="p-2.5 bg-white border-t border-[#EFE8DC] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {samplePrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => handleSend(p)}
                className="shrink-0 px-2.5 py-1 text-[11px] font-semibold bg-[#FAF7F2] hover:bg-[#FBC48B] hover:text-slate-900 text-slate-700 rounded-lg transition-colors border border-[#EFE8DC]"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-[#EFE8DC] flex items-center gap-2"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ask AI workplace query..."
              className="flex-1 px-3 py-2 text-xs bg-[#FAF7F2] border border-[#EFE8DC] rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900"
            />
            <button
              type="submit"
              disabled={!inputPrompt.trim() || loading}
              className="p-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-[#FBC48B] rounded-xl transition-colors shrink-0 font-bold"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
