import React, { useState, useEffect, useRef } from 'react';
import { AdminTab } from '../../types';
import { adminStore, AdminStoreState } from '../../services/adminStore';
import { InteractiveCursorGrid } from '../InteractiveCursorGrid';
import { AdminProjectsTab } from './AdminProjectsTab';
import { AdminContentTab } from './AdminContentTab';
import { AdminReviewsTab } from './AdminReviewsTab';
import { AdminMessagesTab } from './AdminMessagesTab';
import { AdminEstimatorTab } from './AdminEstimatorTab';
import { AdminSecurityTab } from './AdminSecurityTab';
import { AdminPreviewSection } from './AdminPreviewSection';
import { refreshSession, isSessionActive } from '../../services/security';
import {
  FolderKanban,
  Edit3,
  Star,
  Mail,
  ArrowLeft,
  Sparkles,
  ExternalLink,
  RotateCcw,
  Shield,
  Lock,
  Layers,
  Activity,
  Sliders,
  Eye,
  Columns2,
  GripVertical,
  X,
} from 'lucide-react';

interface AdminDashboardProps {
  onExit: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onExit }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('content');
  const [lastEditorTab, setLastEditorTab] = useState<AdminTab>('content');
  const [splitView, setSplitView] = useState<boolean>(false);
  const [splitRatio, setSplitRatio] = useState<number>(50); // percentage for left editor pane
  const [storeState, setStoreState] = useState<AdminStoreState>(adminStore.getState());
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isLgScreen, setIsLgScreen] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );

  const splitContainerRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef<boolean>(false);

  // Keep track of screen size for responsive split view
  useEffect(() => {
    const handleResize = () => {
      setIsLgScreen(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSelectTab = (tab: AdminTab) => {
    if (tab !== 'preview') {
      setLastEditorTab(tab);
      setActiveTab(tab);
    } else {
      // User clicked Preview: automatically enable Split Screen so they can edit & preview simultaneously!
      setSplitView(true);
      if (activeTab === 'preview') {
        setActiveTab(lastEditorTab);
      }
    }
  };

  // Draggable Divider Mouse Events
  const handleDividerMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (ev: MouseEvent) => {
      if (!isDraggingRef.current || !splitContainerRef.current) return;
      const rect = splitContainerRef.current.getBoundingClientRect();
      const offsetX = ev.clientX - rect.left;
      const pct = Math.min(Math.max((offsetX / rect.width) * 100, 20), 80);
      setSplitRatio(pct);
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Draggable Divider Touch Events
  const handleDividerTouchStart = (e: React.TouchEvent) => {
    isDraggingRef.current = true;

    const handleTouchMove = (ev: TouchEvent) => {
      if (!isDraggingRef.current || !splitContainerRef.current || !ev.touches[0]) return;
      const rect = splitContainerRef.current.getBoundingClientRect();
      const offsetX = ev.touches[0].clientX - rect.left;
      const pct = Math.min(Math.max((offsetX / rect.width) * 100, 20), 80);
      setSplitRatio(pct);
    };

    const handleTouchEnd = () => {
      isDraggingRef.current = false;
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };

    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
  };

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toTimeString().split(' ')[0] + ' UTC');
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const unsub = adminStore.subscribe((state) => {
      setStoreState(state);
    });

    // Session activity listener to refresh active session
    const handleActivity = () => {
      refreshSession();
    };

    // Check session validity periodically (every 10 seconds)
    const sessionCheck = setInterval(() => {
      if (!isSessionActive()) {
        onExit();
      }
    }, 10000);

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);

    return () => {
      unsub();
      clearInterval(sessionCheck);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
    };
  }, [onExit]);

  const unreadMessagesCount = storeState.messages.filter((m) => m.status === 'unread').length;
  const pendingReviewsCount = storeState.reviews.filter((r) => r.status === 'pending').length;
  const avgRating = adminStore.getAverageRating().average;

  const handleReset = () => {
    if (window.confirm('Reset all website projects, content, reviews, and messages to initial studio defaults?')) {
      adminStore.resetToDefaults();
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#FFFFFF] text-[#202526] font-sans-clean flex flex-col selection:bg-[#D8A9A8] selection:text-[#202526]">
      {/* Background Interactive Cursor Grid with Luxury Subtle Dots */}
      <InteractiveCursorGrid gridSize={48} holeRadius={160} pushStrength={70} />

      {/* Ambient Lighting Gradients for White Glassmorphism */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[10%] -right-[10%] w-[650px] h-[650px] rounded-full bg-[#CBDCDE]/25 blur-[140px]" />
        <div className="absolute top-[40%] -left-[15%] w-[600px] h-[600px] rounded-full bg-[#AFC7C5]/20 blur-[150px]" />
        <div className="absolute top-[80%] right-[5%] w-[550px] h-[550px] rounded-full bg-[#D8A9A8]/20 blur-[160px]" />
      </div>

      {/* 1. Executive Studio Admin Header */}
      <header className="sticky top-0 z-40 w-full frosted-header-bar px-5 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        {/* Left: Studio Brand & Breadcrumb */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onExit}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-[#F3F4F6] text-xs uppercase tracking-wider text-[#202526] font-btn font-medium border border-[#E5E7EB] transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-xs"
            title="Return to Live Website"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#596769]" />
            <span className="hidden sm:inline">Exit to Live Site</span>
          </button>

          <div className="flex items-center gap-3 pl-2 border-l border-[#E5E7EB]">
            <div className="w-2.5 h-2.5 rounded-full bg-[#D8A9A8] shadow-[0_0_10px_rgba(216,169,168,0.8)] animate-pulse" />
            <div className="flex items-center gap-2">
              <span className="font-bezoria text-lg text-[#202526] tracking-wider uppercase font-normal">
                ai.build_
              </span>
              <span className="text-[#71717A] text-xs font-label-small uppercase tracking-[0.14em]">
                / Studio Executive CMS
              </span>
            </div>
          </div>
        </div>

        {/* Center: Luxury 5-Tab Navigation Pill */}
        <nav className="flex items-center gap-1.5 p-1.5 bg-white/80 border border-[#E5E7EB] rounded-full backdrop-blur-xl overflow-x-auto max-w-full shadow-md scrollbar-none no-scrollbar touch-pan-x">
          <button
            type="button"
            onClick={() => handleSelectTab('projects')}
            className={`px-3.5 sm:px-4 py-2 rounded-full text-xs font-label-small font-medium uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'projects'
                ? 'bg-[#202526] text-white shadow-md'
                : 'text-[#596769] hover:text-[#202526] hover:bg-black/[0.04]'
            }`}
          >
            <FolderKanban className="w-3.5 h-3.5" />
            <span>Projects</span>
            <span className={`text-[11px] font-strong ${activeTab === 'projects' ? 'text-white/90' : 'text-[#71717A]'}`}>
              ({storeState.projects.length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectTab('content')}
            className={`px-3.5 sm:px-4 py-2 rounded-full text-xs font-label-small font-medium uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'content'
                ? 'bg-[#202526] text-white shadow-md'
                : 'text-[#596769] hover:text-[#202526] hover:bg-black/[0.04]'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5 text-[#D8A9A8]" />
            <span>Content &amp; What We Do</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectTab('reviews')}
            className={`px-3.5 sm:px-4 py-2 rounded-full text-xs font-label-small font-medium uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'reviews'
                ? 'bg-[#202526] text-white shadow-md'
                : 'text-[#596769] hover:text-[#202526] hover:bg-black/[0.04]'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>Reviews</span>
            {pendingReviewsCount > 0 ? (
              <span className="px-1.5 py-0.2 rounded-full bg-[#D8A9A8] text-[#202526] text-[10px] font-strong">
                {pendingReviewsCount}
              </span>
            ) : (
              <span className={`text-[11px] font-strong ${activeTab === 'reviews' ? 'text-white/90' : 'text-[#71717A]'}`}>
                ({storeState.reviews.length})
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleSelectTab('messages')}
            className={`px-3.5 sm:px-4 py-2 rounded-full text-xs font-label-small font-medium uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'messages'
                ? 'bg-[#202526] text-white shadow-md'
                : 'text-[#596769] hover:text-[#202526] hover:bg-black/[0.04]'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Inquiries</span>
            {unreadMessagesCount > 0 ? (
              <span className="px-1.5 py-0.2 rounded-full bg-[#D8A9A8] text-[#202526] text-[10px] font-strong animate-pulse">
                {unreadMessagesCount}
              </span>
            ) : (
              <span className={`text-[11px] font-strong ${activeTab === 'messages' ? 'text-white/90' : 'text-[#71717A]'}`}>
                ({storeState.messages.length})
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleSelectTab('estimator')}
            className={`px-3.5 sm:px-4 py-2 rounded-full text-xs font-label-small font-medium uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'estimator'
                ? 'bg-[#202526] text-white shadow-md'
                : 'text-[#596769] hover:text-[#202526] hover:bg-black/[0.04]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Estimator</span>
            <span className={`text-[11px] font-strong ${activeTab === 'estimator' ? 'text-white/90' : 'text-[#71717A]'}`}>
              ({(storeState.savedQuotes || []).length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectTab('security')}
            className={`px-3.5 sm:px-4 py-2 rounded-full text-xs font-label-small font-medium uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'security'
                ? 'bg-[#202526] text-white shadow-md'
                : 'text-[#596769] hover:text-[#202526] hover:bg-black/[0.04]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Security &amp; PIN</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (!splitView) {
                setSplitView(true);
                if (activeTab === 'preview') {
                  setActiveTab(lastEditorTab);
                }
              } else {
                setSplitView(false);
              }
            }}
            className={`px-3.5 sm:px-4 py-2 rounded-full text-xs font-label-small font-medium uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              splitView || activeTab === 'preview'
                ? 'bg-[#202526] text-white shadow-md'
                : 'text-[#596769] hover:text-[#202526] hover:bg-black/[0.04]'
            }`}
            title="Toggle Live Real-Time Split Screen with Adjustable Size"
          >
            <Eye className="w-3.5 h-3.5 text-[#D8A9A8]" />
            <span>{splitView ? 'Split Preview Active' : 'Live Preview'}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </button>
        </nav>

        {/* Right: Quick Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Split Screen Mode Toggle */}
          {activeTab !== 'preview' && (
            <button
              type="button"
              onClick={() => setSplitView((prev) => !prev)}
              className={`px-3 py-2 rounded-full text-xs font-label-small uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-xs border ${
                splitView
                  ? 'bg-[#202526] text-white border-[#202526]'
                  : 'bg-white hover:bg-[#F3F4F6] text-[#596769] hover:text-[#202526] border-[#E5E7EB]'
              }`}
              title="Toggle Live Real-Time Split-Screen (Edit on Left, See Preview on Right)"
            >
              <Columns2 className={`w-3.5 h-3.5 ${splitView ? 'text-[#D8A9A8]' : 'text-[#596769]'}`} />
              <span className="hidden md:inline font-medium">
                {splitView ? 'Close Split' : 'Split Screen'}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={handleReset}
            className="p-2.5 rounded-full bg-white hover:bg-[#F3F4F6] text-[#596769] hover:text-[#202526] border border-[#E5E7EB] transition-colors cursor-pointer shadow-xs"
            title="Reset All to Factory Defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onExit}
            className="px-4 py-2 rounded-full bg-[#202526] hover:bg-[#111314] text-white text-xs font-btn font-medium uppercase tracking-wider border border-[#202526] transition-all flex items-center gap-2 cursor-pointer shadow-md hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D8A9A8]" />
            <span>Exit to Site</span>
            <ExternalLink className="w-3 h-3 text-white/70" />
          </button>
        </div>
      </header>

      {/* Quick KPI Overview Bar */}
      <section className="w-full border-b border-[#E5E7EB] bg-white/60 px-5 sm:px-8 py-3 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-6 text-[#596769]">
            <div className="flex items-center gap-2">
              <span className="text-[#202526] font-strong text-sm">{storeState.projects.length}</span>
              <span className="font-label-small uppercase tracking-wider">Active Deployments</span>
            </div>
            <div className="w-px h-3.5 bg-[#E5E7EB]" />
            <div className="flex items-center gap-2">
              <span className="text-[#202526] font-strong text-sm">{unreadMessagesCount}</span>
              <span className="font-label-small uppercase tracking-wider">Pending Leads</span>
            </div>
            <div className="w-px h-3.5 bg-[#E5E7EB]" />
            <div className="flex items-center gap-2">
              <span className="text-[#202526] font-strong text-sm">{(storeState.savedQuotes || []).length}</span>
              <span className="font-label-small uppercase tracking-wider">Archived Quotes</span>
            </div>
            <div className="w-px h-3.5 bg-[#E5E7EB]" />
            <div className="flex items-center gap-2">
              <span className="text-[#202526] font-strong text-sm">{avgRating.toFixed(1)} / 5.0</span>
              <span className="font-label-small uppercase tracking-wider">Verified Rating</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-strong text-[#596769]">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-label-small uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Real-Time Edge Synced
            </span>
            <span>Clock: {currentTime}</span>
          </div>
        </div>
      </section>

      {/* 2. Main Admin Workspace Container */}
      <main className={`flex-1 w-full relative z-10 ${splitView && activeTab !== 'preview' ? 'max-w-[1920px] px-3 sm:px-6 py-6' : 'max-w-7xl mx-auto px-5 sm:px-8 py-8 sm:py-10'}`}>
        {/* Full Preview Tab */}
        {activeTab === 'preview' && !splitView && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/85 border border-[#E5E7EB] backdrop-blur-md shadow-xs">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#D8A9A8]" />
                <span className="text-xs font-mono font-bold uppercase text-[#202526]">Full Page Preview</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveTab(lastEditorTab);
                  setSplitView(true);
                }}
                className="px-3.5 py-1.5 rounded-full bg-[#202526] text-white text-xs font-btn uppercase tracking-wider flex items-center gap-1.5 shadow-xs cursor-pointer hover:bg-[#111314]"
              >
                <Columns2 className="w-3.5 h-3.5 text-[#D8A9A8]" />
                <span>Switch to Resizable Split Screen</span>
              </button>
            </div>
            <AdminPreviewSection onExitToLive={onExit} isDocked={false} />
          </div>
        )}

        {/* Split Screen View: Left Editor, Adjustable Divider Handle, Right Live Real-Time Preview */}
        {activeTab !== 'preview' && splitView && (
          <div
            ref={splitContainerRef}
            className="flex flex-col lg:flex-row w-full gap-0 items-start relative select-none"
          >
            {/* Left Editor Pane with Dynamic Adjustable Width */}
            <div
              style={{ width: isLgScreen ? `${splitRatio}%` : '100%' }}
              className="space-y-6 shrink-0 transition-[width] duration-75 pr-0 lg:pr-3"
            >
              {activeTab === 'projects' && <AdminProjectsTab projects={storeState.projects} />}
              {activeTab === 'content' && <AdminContentTab content={storeState.websiteContent} />}
              {activeTab === 'reviews' && <AdminReviewsTab reviews={storeState.reviews} />}
              {activeTab === 'messages' && <AdminMessagesTab messages={storeState.messages} />}
              {activeTab === 'estimator' && (
                <AdminEstimatorTab
                  savedQuotes={storeState.savedQuotes || []}
                  messages={storeState.messages}
                  estimatorSettings={storeState.estimatorSettings}
                />
              )}
              {activeTab === 'security' && <AdminSecurityTab onLockSession={onExit} />}
            </div>

            {/* Draggable Divider Handle (Desktop) */}
            <div
              onMouseDown={handleDividerMouseDown}
              onTouchStart={handleDividerTouchStart}
              className="hidden lg:flex flex-col items-center justify-center w-7 -mx-1 shrink-0 h-[calc(100vh-160px)] sticky top-24 cursor-col-resize z-30 group select-none"
              title="Click and drag horizontally to adjust split screen sizes"
            >
              <div className="w-1.5 h-full rounded-full bg-[#E5E7EB] group-hover:bg-[#D8A9A8] group-active:bg-[#202526] transition-colors relative flex items-center justify-center shadow-xs">
                <div className="w-6 h-12 rounded-full bg-white shadow-md border border-[#E5E7EB] group-hover:border-[#D8A9A8] group-hover:scale-105 flex items-center justify-center text-[#596769] group-hover:text-[#202526] transition-all cursor-col-resize">
                  <GripVertical className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Right Live Real-Time Preview Pane with Dynamic Adjustable Width */}
            <div
              style={{ width: isLgScreen ? `${100 - splitRatio}%` : '100%' }}
              className="shrink-0 transition-[width] duration-75 pl-0 lg:pl-3 sticky top-20 mt-6 lg:mt-0"
            >
              {/* Split Bar Quick Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 mb-3 rounded-2xl bg-white/85 border border-[#E5E7EB] backdrop-blur-md shadow-xs text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono font-bold uppercase tracking-wider text-[11px] text-[#202526]">
                    Live Preview ({Math.round(100 - splitRatio)}%)
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-[#596769] mr-1 hidden sm:inline">Size:</span>
                  {[
                    { label: '35:65', ratio: 35, title: 'Wide Preview' },
                    { label: '50:50', ratio: 50, title: 'Balanced 50/50' },
                    { label: '65:35', ratio: 65, title: 'Wide Editor' },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setSplitRatio(preset.ratio)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                        Math.abs(splitRatio - preset.ratio) < 3
                          ? 'bg-[#202526] text-white shadow-xs'
                          : 'bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#596769]'
                      }`}
                      title={preset.title}
                    >
                      {preset.label}
                    </button>
                  ))}

                  <div className="w-px h-3.5 bg-[#E5E7EB] mx-1" />

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('preview');
                      setSplitView(false);
                    }}
                    className="px-2 py-1 rounded-lg text-[10px] font-btn uppercase bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#202526] transition-colors cursor-pointer"
                    title="Expand to Full Page Preview"
                  >
                    Full
                  </button>

                  <button
                    type="button"
                    onClick={() => setSplitView(false)}
                    className="p-1 rounded-lg text-[#596769] hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Close Split Screen"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <AdminPreviewSection onExitToLive={onExit} isDocked={true} />
            </div>
          </div>
        )}

        {/* Standard Single Pane View */}
        {activeTab !== 'preview' && !splitView && (
          <>
            {activeTab === 'projects' && <AdminProjectsTab projects={storeState.projects} />}
            {activeTab === 'content' && <AdminContentTab content={storeState.websiteContent} />}
            {activeTab === 'reviews' && <AdminReviewsTab reviews={storeState.reviews} />}
            {activeTab === 'messages' && <AdminMessagesTab messages={storeState.messages} />}
            {activeTab === 'estimator' && (
              <AdminEstimatorTab
                savedQuotes={storeState.savedQuotes || []}
                messages={storeState.messages}
                estimatorSettings={storeState.estimatorSettings}
              />
            )}
            {activeTab === 'security' && <AdminSecurityTab onLockSession={onExit} />}
          </>
        )}
      </main>

      {/* 3. Streamlined Footer */}
      <footer className="w-full border-t border-[#E5E7EB] py-6 px-5 sm:px-8 bg-white/70 text-center text-xs text-[#71717A] font-label-small flex flex-col sm:flex-row items-center justify-between gap-3 max-w-7xl mx-auto relative z-10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
          <span>Production Ready &bull; Zero-Latency Dynamic Re-renders</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#D8A9A8]" />
            <span>Encrypted Session Vault</span>
          </span>
          <span className="text-[#71717A]">&bull; ai.build_ studio</span>
        </div>
      </footer>
    </div>
  );
};

