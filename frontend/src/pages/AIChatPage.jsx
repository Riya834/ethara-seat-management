import React, { useState } from 'react';
import { Bot, Send, Sparkles, MapPin, Search } from 'lucide-react';
import { aiService } from '../services/api';

const AIChatPage = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "👋 **Welcome to Ethara Spatial AI 2.0 Assistant!**\n\nI can answer questions regarding seat locations, project assignments, floor vacancies, and unallocated new joiners.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [loading, setLoading] = useState(false);

  const samplePrompts = [
    "Where is Rahul seated?",
    "Show vacant seats on Floor 2",
    "Employees in Project Alpha",
    "Employees without seats",
    "Who occupies seat F1-ZA004?",
    "Which project has maximum employees?"
  ];

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
          text: "⚠️ Issue querying Ethara AI engine.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="clay-card p-6 bg-white/90 backdrop-blur-md rounded-3xl border border-black/[0.04] shadow-clay flex flex-col h-[75vh]">
        <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 font-extrabold flex items-center justify-center shadow-sm">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg text-slate-900">Spatial AI Assistant</h2>
              <p className="text-xs text-slate-500 font-semibold">Natural language seat & workforce query engine</p>
            </div>
          </div>
        </div>

        {/* Quick Prompts Bar */}
        <div className="p-3 bg-amber-50/60 border-b border-amber-100 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-600" /> Prompts:
          </span>
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              className="px-3 py-1 bg-white hover:bg-amber-100 text-slate-700 text-xs font-semibold rounded-full border border-amber-200 shadow-2xs whitespace-nowrap transition-colors"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Chat History */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#f8f7f4]">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-4 rounded-3xl text-xs leading-relaxed font-medium shadow-xs ${
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
              <span>Ethara AI is processing query...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-100 bg-white">
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
              placeholder="Ask AI: Where is Employee EMP-1004? or Show vacant seats on Floor 2"
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-full text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-xs rounded-full shadow-md transition-transform active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIChatPage;
