import React, { useState } from 'react';
import { Bot, Send } from 'lucide-react';
import { aiService } from '../services/api';

const AIChatPage = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "👋 **Welcome to Ethara Spatial AI Assistant!**\n\nI can answer questions regarding seat locations, project assignments, floor vacancies, and unallocated joiners.",
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
    <div className="max-w-4xl mx-auto space-y-5 pb-12">
      <div className="clay-card p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[75vh]">
        <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-slate-900">Spatial AI Assistant</h2>
              <p className="text-[11px] text-slate-500 font-medium">Natural language seat & workforce query engine</p>
            </div>
          </div>
        </div>

        {/* Quick Prompts Bar */}
        <div className="p-2 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">Prompts:</span>
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-medium rounded-md border border-slate-200 whitespace-nowrap transition-colors"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Chat History */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#f8fafc]">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-xl text-xs leading-relaxed font-medium shadow-2xs ${
                  msg.sender === 'user'
                    ? 'bg-slate-900 text-white rounded-br-none'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>
                <span className="text-[9px] font-semibold opacity-60 block mt-1.5 text-right">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-500 w-fit">
              <Bot className="w-4 h-4 text-slate-700 animate-spin" />
              <span>Processing query...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-100 bg-white">
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
              className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
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
