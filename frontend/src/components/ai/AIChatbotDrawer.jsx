import React, { useState } from 'react';
import { X, Send, Bot, Sparkles, User, MapPin, Building, ArrowRight } from 'lucide-react';
import { aiService } from '../../services/api';

const AIChatbotDrawer = ({ isOpen, onClose }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "👋 **Hello! I am Ethara Spatial AI Assistant.**\n\nHow can I assist you with seat allocations, employee spatial queries, or floor utilization metrics today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    "Where is Rahul seated?",
    "Show vacant seats on Floor 2",
    "Employees in Project Alpha",
    "Employees without seats",
    "Who occupies seat F1-ZA004?",
    "Which project has maximum employees?"
  ];

  if (!isOpen) return null;

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg = {
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await aiService.sendPrompt(query);
      if (res.success && res.response) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: res.response.answer,
            data: res.response.data,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: "⚠️ Sorry, I ran into an issue connecting to Ethara AI engine. Please try again.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center font-extrabold shadow-md">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">Ethara Spatial AI</h3>
              <p className="text-[11px] font-semibold opacity-90">Instant Intelligent Seat Query Engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-900 hover:bg-black/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="p-3 bg-amber-50/50 border-b border-amber-100 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-600" /> Prompts:
          </span>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              className="px-2.5 py-1 bg-white hover:bg-amber-100 text-slate-700 text-[11px] font-semibold rounded-full border border-amber-200 shadow-2xs whitespace-nowrap transition-colors"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#f8f7f4]">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] p-4 rounded-3xl text-xs leading-relaxed font-medium shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-amber-400 text-slate-950 rounded-br-none font-semibold'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>
                <span className="text-[9px] font-bold opacity-60 block mt-2 text-right">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-slate-200 text-xs font-semibold text-slate-500 w-fit">
              <Bot className="w-4 h-4 text-amber-500 animate-spin" />
              <span>Ethara AI is processing spatial query...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AI: e.g. Where is Rahul seated?"
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-full text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-3 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-full shadow-md transition-transform active:scale-95 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIChatbotDrawer;
