import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', String(collapsed));
  }, [collapsed]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-surface-bg flex text-text-primary">
      {/* Fixed Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        <Header collapsed={collapsed} setCollapsed={setCollapsed} />

        {/* Scrollable page area */}
        <main className="flex-1 overflow-y-auto min-w-0 custom-scrollbar">
          <div className="p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
