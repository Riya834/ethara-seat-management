import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import AIChatbotDrawer from '../ai/AIChatbotDrawer';

const AppLayout = () => {
  const [isAIOpen, setIsAIOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f6f5f0] text-slate-800 antialiased selection:bg-amber-100">
      {/* Left Floating Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 p-4 lg:p-6 overflow-x-hidden flex flex-col min-w-0">
        <Topbar onOpenAI={() => setIsAIOpen(true)} />

        <div className="flex-1">
          <Outlet />
        </div>
      </main>

      {/* Slide-out AI Spatial Assistant Drawer */}
      <AIChatbotDrawer isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />
    </div>
  );
};

export default AppLayout;
