import React, { useState, useEffect, useRef } from 'react';
import { TasklyDashboardView } from './TasklyDashboardView';
import {
  FolderKanban,
  Search,
  Bell,
  Settings,
  X,
  Menu,
  Sparkles,
  Plus,
  Home,
  CheckSquare,
  Calendar,
  Users,
  BarChart2,
  Check,
} from 'lucide-react';

interface TasklyAdminProps {
  onExit?: () => void;
}

export const TasklyAdmin: React.FC<TasklyAdminProps> = ({ onExit }) => {
  const [activeNav, setActiveNav] = useState<string>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState<boolean>(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState<boolean>(false);

  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Keyboard shortcut: Cmd+K or Ctrl+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative min-h-screen w-full admin-bg-natural text-[#1E1B4B] font-['Plus_Jakarta_Sans',sans-serif] selection:bg-[#6C5CE7]/20 selection:text-[#1E1B4B] p-2.5 xs:p-3 sm:p-5 lg:p-7 overflow-x-hidden">
      {/* Mobile Header Bar */}
      <div className="lg:hidden flex items-center justify-between p-2.5 xs:p-3 mb-3 xs:mb-4 rounded-2xl xs:rounded-3xl admin-glass-sidebar sticky top-2 xs:top-3 z-40 bg-white">
        <div className="flex items-center gap-2.5 xs:gap-3">
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 rounded-2xl bg-[#F0F2F9] border border-[#E5E4F0] text-[#1E1B4B] transition-all cursor-pointer shadow-xs"
            title="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl clay-icon-box-purple flex items-center justify-center shrink-0 shadow-sm">
              <Check className="w-4 h-4 text-white stroke-[3.5]" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-[#1E1B4B]">Taskly</h1>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsNewTaskModalOpen(true)}
          className="admin-glow-btn px-3.5 py-1.5 rounded-full text-white text-xs font-semibold cursor-pointer shadow-sm"
        >
          <span>+ New</span>
        </button>
      </div>

      {/* Mobile Drawer Backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Main Layout: Left Floating Sidebar + Right Content Canvas */}
      <div className="relative z-10 flex flex-col lg:flex-row items-start gap-5 max-w-[1920px] mx-auto">
        {/* ========================================================= */}
        {/* 1. LEFT FLOATING CAPSULE SIDEBAR (1:1 Taskly 3D Style)   */}
        {/* ========================================================= */}
        <aside
          className={`
            fixed lg:sticky top-0 lg:top-7 left-0 h-full lg:h-[calc(100vh-3.5rem)]
            ${isSidebarCollapsed ? 'w-20' : 'w-72 lg:w-60'} shrink-0
            admin-glass-sidebar rounded-none lg:rounded-[32px] ${isSidebarCollapsed ? 'p-3 items-center' : 'p-5'} flex flex-col justify-between
            z-50 lg:z-30 transition-all duration-300 ease-in-out overflow-y-auto no-scrollbar bg-white
            ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <div className="space-y-6 w-full">
            {/* Top Brand Logo */}
            <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl clay-icon-box-purple flex items-center justify-center shrink-0 shadow-md">
                  <Check className="w-5 h-5 text-white stroke-[3.5]" />
                </div>
                {!isSidebarCollapsed && (
                  <h1 className="text-xl font-extrabold tracking-tight text-[#1E1B4B]">
                    Taskly
                  </h1>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="lg:hidden p-1.5 rounded-full hover:bg-black/5 text-[#71788E] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Primary Navigation Stack */}
            <nav className="space-y-1 w-full">
              {/* 1. Dashboard (Active Indented Pill) */}
              <button
                type="button"
                onClick={() => setActiveNav('dashboard')}
                title="Dashboard"
                className={`w-full ${isSidebarCollapsed ? 'px-2 py-3 justify-center' : 'px-3.5 py-2.5 justify-start'} rounded-2xl text-xs font-semibold transition-all flex items-center cursor-pointer group ${
                  activeNav === 'dashboard'
                    ? 'bg-[#F0EEFE] text-[#6C5CE7] border border-[#E4E0FE] shadow-xs'
                    : 'text-[#71788E] hover:text-[#1E1B4B] hover:bg-black/[0.02]'
                }`}
              >
                <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                  <Home className={`w-4.5 h-4.5 stroke-[2.2] ${activeNav === 'dashboard' ? 'text-[#6C5CE7]' : 'text-[#8E8AA7]'}`} />
                  {!isSidebarCollapsed && <span>Dashboard</span>}
                </div>
              </button>

              {/* 2. Tasks */}
              <button
                type="button"
                onClick={() => setActiveNav('tasks')}
                title="Tasks"
                className={`w-full ${isSidebarCollapsed ? 'px-2 py-3 justify-center' : 'px-3.5 py-2.5 justify-start'} rounded-2xl text-xs font-medium transition-all flex items-center cursor-pointer group ${
                  activeNav === 'tasks'
                    ? 'bg-[#F0EEFE] text-[#6C5CE7] border border-[#E4E0FE] shadow-xs font-semibold'
                    : 'text-[#71788E] hover:text-[#1E1B4B] hover:bg-black/[0.02]'
                }`}
              >
                <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                  <CheckSquare className="w-4.5 h-4.5 stroke-[2] text-[#8E8AA7] group-hover:text-[#6C5CE7]" />
                  {!isSidebarCollapsed && <span>Tasks</span>}
                </div>
              </button>

              {/* 3. Calendar */}
              <button
                type="button"
                onClick={() => setActiveNav('calendar')}
                title="Calendar"
                className={`w-full ${isSidebarCollapsed ? 'px-2 py-3 justify-center' : 'px-3.5 py-2.5 justify-start'} rounded-2xl text-xs font-medium transition-all flex items-center cursor-pointer group ${
                  activeNav === 'calendar'
                    ? 'bg-[#F0EEFE] text-[#6C5CE7] border border-[#E4E0FE] shadow-xs font-semibold'
                    : 'text-[#71788E] hover:text-[#1E1B4B] hover:bg-black/[0.02]'
                }`}
              >
                <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                  <Calendar className="w-4.5 h-4.5 stroke-[2] text-[#8E8AA7] group-hover:text-[#6C5CE7]" />
                  {!isSidebarCollapsed && <span>Calendar</span>}
                </div>
              </button>

              {/* 4. Projects */}
              <button
                type="button"
                onClick={() => setActiveNav('projects')}
                title="Projects"
                className={`w-full ${isSidebarCollapsed ? 'px-2 py-3 justify-center' : 'px-3.5 py-2.5 justify-start'} rounded-2xl text-xs font-medium transition-all flex items-center cursor-pointer group ${
                  activeNav === 'projects'
                    ? 'bg-[#F0EEFE] text-[#6C5CE7] border border-[#E4E0FE] shadow-xs font-semibold'
                    : 'text-[#71788E] hover:text-[#1E1B4B] hover:bg-black/[0.02]'
                }`}
              >
                <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                  <FolderKanban className="w-4.5 h-4.5 stroke-[2] text-[#8E8AA7] group-hover:text-[#6C5CE7]" />
                  {!isSidebarCollapsed && <span>Projects</span>}
                </div>
              </button>

              {/* 5. Team */}
              <button
                type="button"
                onClick={() => setActiveNav('team')}
                title="Team"
                className={`w-full ${isSidebarCollapsed ? 'px-2 py-3 justify-center' : 'px-3.5 py-2.5 justify-start'} rounded-2xl text-xs font-medium transition-all flex items-center cursor-pointer group ${
                  activeNav === 'team'
                    ? 'bg-[#F0EEFE] text-[#6C5CE7] border border-[#E4E0FE] shadow-xs font-semibold'
                    : 'text-[#71788E] hover:text-[#1E1B4B] hover:bg-black/[0.02]'
                }`}
              >
                <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                  <Users className="w-4.5 h-4.5 stroke-[2] text-[#8E8AA7] group-hover:text-[#6C5CE7]" />
                  {!isSidebarCollapsed && <span>Team</span>}
                </div>
              </button>

              {/* 6. Reports */}
              <button
                type="button"
                onClick={() => setActiveNav('reports')}
                title="Reports"
                className={`w-full ${isSidebarCollapsed ? 'px-2 py-3 justify-center' : 'px-3.5 py-2.5 justify-start'} rounded-2xl text-xs font-medium transition-all flex items-center cursor-pointer group ${
                  activeNav === 'reports'
                    ? 'bg-[#F0EEFE] text-[#6C5CE7] border border-[#E4E0FE] shadow-xs font-semibold'
                    : 'text-[#71788E] hover:text-[#1E1B4B] hover:bg-black/[0.02]'
                }`}
              >
                <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                  <BarChart2 className="w-4.5 h-4.5 stroke-[2] text-[#8E8AA7] group-hover:text-[#6C5CE7]" />
                  {!isSidebarCollapsed && <span>Reports</span>}
                </div>
              </button>

              {/* 7. Settings */}
              <button
                type="button"
                onClick={() => setActiveNav('settings')}
                title="Settings"
                className={`w-full ${isSidebarCollapsed ? 'px-2 py-3 justify-center' : 'px-3.5 py-2.5 justify-start'} rounded-2xl text-xs font-medium transition-all flex items-center cursor-pointer group ${
                  activeNav === 'settings'
                    ? 'bg-[#F0EEFE] text-[#6C5CE7] border border-[#E4E0FE] shadow-xs font-semibold'
                    : 'text-[#71788E] hover:text-[#1E1B4B] hover:bg-black/[0.02]'
                }`}
              >
                <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                  <Settings className="w-4.5 h-4.5 stroke-[2] text-[#8E8AA7] group-hover:text-[#6C5CE7]" />
                  {!isSidebarCollapsed && <span>Settings</span>}
                </div>
              </button>
            </nav>

            {/* 3D "Upgrade to Pro" Card Widget with Cute 3D Yellow Star */}
            {!isSidebarCollapsed ? (
              <div className="relative rounded-[28px] p-4 pt-7 text-center bg-gradient-to-b from-[#FAF9FE] to-[#F3EFFE] border border-white shadow-[0_10px_25px_rgba(160,165,200,0.18)] mt-6">
                {/* 3D Cute Chubby Yellow Star */}
                <div className="w-13 h-13 mx-auto -mt-12 mb-2 filter drop-shadow-[0_8px_14px_rgba(245,158,11,0.38)] hover:scale-110 transition-transform">
                  <svg className="w-full h-full" viewBox="0 0 48 48" fill="none">
                    <defs>
                      <linearGradient id="star3DGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FFE066" />
                        <stop offset="45%" stopColor="#FFC837" />
                        <stop offset="100%" stopColor="#F59E0B" />
                      </linearGradient>
                      <linearGradient id="starHighlight" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
                        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M24 5 C24.8 5 25.5 5.5 25.8 6.3 L29.8 15.6 C30.1 16.3 30.8 16.8 31.6 16.9 L41.5 18 C42.5 18.1 43 19.4 42.2 20.1 L34.7 26.8 C34.1 27.4 33.8 28.2 34 29 L36 38.8 C36.2 39.8 35.1 40.6 34.2 40.1 L25.5 35.1 C24.8 34.7 23.2 34.7 22.5 35.1 L13.8 40.1 C12.9 40.6 11.8 39.8 12 38.8 L14 29 C14.2 28.2 13.9 27.4 13.3 26.8 L5.8 20.1 C5 19.4 5.5 18.1 6.5 18 L16.4 16.9 C17.2 16.8 17.9 16.3 18.2 15.6 L22.2 6.3 C22.5 5.5 23.2 5 24 5 Z"
                      fill="url(#star3DGrad)"
                      stroke="#EAB308"
                      strokeWidth="1.2"
                      strokeLinejoin="round"
                    />
                    <ellipse cx="23" cy="16" rx="5" ry="3" fill="url(#starHighlight)" />
                    <circle cx="24" cy="24" r="3" fill="#FFFFFF" opacity="0.25" />
                  </svg>
                </div>

                <div className="text-[14px] font-bold text-[#1E1B4B] leading-tight">
                  Upgrade to Pro
                </div>
                <p className="text-[11px] text-[#71788E] mt-1 leading-relaxed px-1 font-medium">
                  Unlock more features and boost productivity.
                </p>

                <button
                  type="button"
                  onClick={() => setIsUpgradeModalOpen(true)}
                  className="admin-glow-btn w-full mt-3.5 py-2.5 px-3 rounded-2xl text-xs font-bold text-white shadow-md cursor-pointer transition-transform hover:scale-[1.02]"
                >
                  Upgrade Now
                </button>
              </div>
            ) : (
              <div className="flex justify-center py-2">
                <div
                  onClick={() => setIsUpgradeModalOpen(true)}
                  title="Upgrade to Pro"
                  className="w-10 h-10 rounded-2xl bg-[#EDE9FE] flex items-center justify-center text-[#6C5CE7] cursor-pointer shadow-xs hover:scale-105"
                >
                  <Sparkles className="w-5 h-5 text-[#F59E0B]" />
                </div>
              </div>
            )}

            {/* Bottom Collapse Link */}
            <div className={`pt-3 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-start'} text-xs text-[#8E8AA7]`}>
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="flex items-center gap-1.5 hover:text-[#1E1B4B] transition-colors cursor-pointer font-medium text-[11px]"
                title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              >
                <span>{isSidebarCollapsed ? '»' : '« Collapse'}</span>
              </button>
            </div>
          </div>
        </aside>

        {/* ========================================================= */}
        {/* 2. MAIN CONTENT WORKSPACE (Right Floating White Canvas)   */}
        {/* ========================================================= */}
        <div className="flex-1 min-w-0 w-full admin-workspace-card p-4 xs:p-6 sm:p-8 space-y-4 sm:space-y-6">
          {/* Top Floating Navigation Bar (Taskly Capsule Style) */}
          <header className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Pill Input (Clean debossed sunken shape) */}
            <div className="relative flex-1 max-w-lg">
              <div className="taskly-search-input flex items-center w-full px-4 py-2.5">
                <Search className="w-4 h-4 text-[#8E95A9] mr-2.5 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tasks, projects..."
                  className="w-full bg-transparent text-xs text-[#1E1B4B] placeholder:text-[#9A9FB1] focus:outline-none font-medium"
                />
              </div>
            </div>

            {/* Right Status Controls: Bell + User Capsule */}
            <div className="flex items-center gap-2.5 xs:gap-3 self-end sm:self-center">
              {/* Notification Bell with Pink "1" Badge */}
              <button
                type="button"
                className="relative p-2.5 rounded-2xl bg-[#F0F2F9] border border-[#E5E8F3] hover:bg-white text-[#71788E] hover:text-[#1E1B4B] transition-all cursor-pointer shadow-xs"
                title="1 New Notification"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF477E] text-white text-[9px] flex items-center justify-center font-bold shadow-xs">
                  1
                </span>
              </button>

              {/* User Avatar + Name (Alex Smith / Product Designer) */}
              <div className="flex items-center gap-2.5 pl-1.5 py-1 pr-3.5 rounded-2xl bg-[#F0F2F9] border border-[#E5E8F3] shadow-xs">
                <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-xs shrink-0 bg-[#DCE7F7] flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 40 40" fill="none">
                    <circle cx="20" cy="20" r="20" fill="#E2E8F0" />
                    <path d="M7 40 C7 31 13 28 20 28 C27 28 33 31 33 40 Z" fill="#2563EB" />
                    <path d="M15 28 C15 31 25 31 25 28 Z" fill="#1D4ED8" />
                    <rect x="17" y="22" width="6" height="7" rx="3" fill="#FBBF24" opacity="0.85" />
                    <ellipse cx="20" cy="18" rx="8" ry="9" fill="#FDE68A" />
                    <circle cx="11.5" cy="18" r="2" fill="#FCD34D" />
                    <circle cx="28.5" cy="18" r="2" fill="#FCD34D" />
                    <path d="M12 17 C12 11 15 8 20 8 C25 8 28 11 28 16 C28 13 26 10 20 10 C15 10 13 14 12 17 Z" fill="#78350F" />
                    <path d="M12 15 C13 11 17 9 22 9 C26 9 28 11 28 14 C27 12 25 11 22 11 C17 11 14 13 12 15 Z" fill="#92400E" />
                    <circle cx="17" cy="17" r="1.1" fill="#1F2937" />
                    <circle cx="23" cy="17" r="1.1" fill="#1F2937" />
                    <path d="M18 20.5 Q20 22.5 22 20.5" stroke="#92400E" strokeWidth="1" strokeLinecap="round" fill="none" />
                    <circle cx="15.5" cy="19" r="1.2" fill="#F87171" opacity="0.4" />
                    <circle cx="24.5" cy="19" r="1.2" fill="#F87171" opacity="0.4" />
                  </svg>
                </div>
                <div className="hidden sm:block text-left pr-1">
                  <div className="text-xs font-bold text-[#1E1B4B] leading-none">Alex Smith</div>
                  <div className="text-[10px] text-[#71788E] font-medium leading-tight mt-0.5">Product Designer</div>
                </div>
              </div>
            </div>
          </header>

          {/* Hero Greeting & Action Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pt-1">
            <div>
              <h2 className="text-xl xs:text-2xl sm:text-3xl font-extrabold text-[#1E1B4B] tracking-tight flex items-center gap-2">
                Good morning, Alex! <span className="inline-block">👋</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#71788E] mt-0.5 font-medium">
                Here's what's happening with your tasks today.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsNewTaskModalOpen(true)}
                className="admin-glow-btn px-4 xs:px-5 py-2 xs:py-2.5 min-h-[38px] rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>+ New Task</span>
              </button>
            </div>
          </div>

          {/* Main Taskly 3D Dashboard Content */}
          <div className="w-full pt-1">
            <TasklyDashboardView
              onNavigateTab={() => {}}
              onNewProject={() => setIsNewTaskModalOpen(true)}
              searchQuery={searchQuery}
              isNewTaskModalOpen={isNewTaskModalOpen}
              setIsNewTaskModalOpen={setIsNewTaskModalOpen}
            />
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-white rounded-[32px] p-6 text-center shadow-[0_24px_55px_rgba(108,92,231,0.25)] border border-white space-y-4 animate-scaleUp">
            <div className="w-16 h-16 mx-auto filter drop-shadow-[0_10px_16px_rgba(245,158,11,0.4)]">
              <Sparkles className="w-full h-full text-[#F59E0B]" />
            </div>
            <h3 className="text-lg font-bold text-[#1E1B4B]">Taskly Pro Plan</h3>
            <p className="text-xs text-[#71788E]">
              Unlock unlimited AI task automations, cloud sync, team collaboration, and premium 3D widgets.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setIsUpgradeModalOpen(false)}
                className="admin-glow-btn py-2.5 rounded-2xl text-xs font-bold text-white shadow-md cursor-pointer"
              >
                Start 14-Day Free Trial
              </button>
              <button
                type="button"
                onClick={() => setIsUpgradeModalOpen(false)}
                className="py-2 text-xs font-semibold text-[#8E8AA7] hover:text-[#1E1B4B]"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasklyAdmin;
