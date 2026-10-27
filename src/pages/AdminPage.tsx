/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  BookOpen,
  Compass,
  Layers,
  Settings,
  ExternalLink,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  Check,
  AlertCircle,
  Copy,
  Menu,
  X,
  Plus,
  Clock,
  Columns2,
  Maximize2,
  Smartphone,
  Tablet,
  Monitor,
  RefreshCw,
  Eye,
  Zap,
  Star,
  MessageSquareHeart,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext.tsx';
import { PortfolioHome } from './PortfolioHome.tsx';
import { ProjectsManager } from '../components/Admin/ProjectsManager.tsx';
import { JournalManager } from '../components/Admin/JournalManager.tsx';
import { ExplorationsManager } from '../components/Admin/ExplorationsManager.tsx';
import { ServicesManager } from '../components/Admin/ServicesManager.tsx';
import { BrandSettingsManager } from '../components/Admin/BrandSettingsManager.tsx';
import { ReviewsManager } from '../components/Admin/ReviewsManager.tsx';

type AdminTab = 'overview' | 'projects' | 'journal' | 'explorations' | 'services' | 'brand' | 'reviews';
type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

class PreviewErrorBoundary extends React.Component<
  { children: React.ReactNode; onRetry?: () => void },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; onRetry?: () => void }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: any) {
    console.error('Preview error caught:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full flex flex-col items-center justify-center p-6 text-center text-white/70 space-y-3 font-mono">
          <p className="text-red-400 font-medium text-xs">Preview encountered a render issue</p>
          <p className="text-[11px] text-white/50 max-w-sm truncate">{this.state.error?.message}</p>
          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              this.props.onRetry?.();
            }}
            className="px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-black text-xs font-semibold cursor-pointer shadow-md transition-all"
          >
            Retry Preview
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { tab } = useParams<{ tab?: string }>();
  const {
    data,
    resetToDefaults,
    exportDataJSON,
    importDataJSON,
  } = usePortfolio();

  const [activeTab, setActiveTab] = useState<AdminTab>(() => {
    const validTabs: AdminTab[] = ['overview', 'projects', 'journal', 'explorations', 'services', 'brand', 'reviews'];
    if (tab && validTabs.includes(tab as AdminTab)) {
      return tab as AdminTab;
    }
    return 'overview';
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Split-screen Live Preview States - active by default on desktop, clean full-width on mobile
  const [isSplitPreviewOpen, setIsSplitPreviewOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');
  const [previewKey, setPreviewKey] = useState<number>(1);
  const [isLiveSyncBlinking, setIsLiveSyncBlinking] = useState(false);
  const [isLiveSyncPaused, setIsLiveSyncPaused] = useState(false);

  // Adjustable Split Ratio (percentage: 20% to 80%, default 50%)
  const [splitRatio, setSplitRatio] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ai_build_split_ratio');
      if (saved) {
        const num = parseFloat(saved);
        if (!isNaN(num) && num >= 20 && num <= 80) return num;
      }
    }
    return 50;
  });
  const [isDraggingSplit, setIsDraggingSplit] = useState(false);

  // Container refs for measuring drag width
  const mainWorkspaceRef = useRef<HTMLDivElement>(null);
  const previewScrollContainerRef = useRef<HTMLDivElement>(null);

  // Optimized deferred rendering for live preview to guarantee 0ms typing latency
  const deferredData = React.useDeferredValue(data);

  useEffect(() => {
    if (tab) {
      const validTabs: AdminTab[] = ['overview', 'projects', 'journal', 'explorations', 'services', 'brand', 'reviews'];
      if (validTabs.includes(tab as AdminTab)) {
        setActiveTab(tab as AdminTab);
      }
    }
  }, [tab]);

  // Flash live sync indicator whenever data updates in real-time
  useEffect(() => {
    if (isLiveSyncPaused) return;
    setIsLiveSyncBlinking(true);
    const timer = setTimeout(() => setIsLiveSyncBlinking(false), 400);
    return () => clearTimeout(timer);
  }, [data, isLiveSyncPaused]);

  // Dragging divider handler for adjustable split screen
  useEffect(() => {
    if (!isDraggingSplit) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!mainWorkspaceRef.current) return;
      const rect = mainWorkspaceRef.current.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const newRatio = (relativeX / rect.width) * 100;
      const clamped = Math.max(20, Math.min(80, Math.round(newRatio)));
      setSplitRatio(clamped);
      localStorage.setItem('ai_build_split_ratio', String(clamped));
    };

    const handleMouseUp = () => {
      setIsDraggingSplit(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDraggingSplit]);

  const handleScrollPreviewTo = (sectionId: string) => {
    if (!previewScrollContainerRef.current) return;
    if (sectionId === 'hero') {
      previewScrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const target = previewScrollContainerRef.current.querySelector(`#${sectionId}`);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleSelectTab = (newTab: AdminTab) => {
    setActiveTab(newTab);
    setIsMobileMenuOpen(false);
    if (newTab === 'overview') {
      navigate('/admin');
    } else {
      navigate(`/admin/${newTab}`);
    }

    // Auto-scroll the live preview to the relevant section!
    setTimeout(() => {
      if (newTab === 'projects') handleScrollPreviewTo('work');
      else if (newTab === 'journal') handleScrollPreviewTo('journal');
      else if (newTab === 'explorations') handleScrollPreviewTo('explorations');
      else if (newTab === 'services') handleScrollPreviewTo('work');
      else if (newTab === 'brand') handleScrollPreviewTo('hero');
      else if (newTab === 'reviews') handleScrollPreviewTo('reviews');
    }, 100);
  };

  const handleRefreshPreview = () => {
    setPreviewKey((prev) => prev + 1);
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(exportDataJSON());
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  const handleDownloadJSON = () => {
    const jsonStr = exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDoImport = () => {
    if (!importJsonText.trim()) return;
    const res = importDataJSON(importJsonText);
    if (res.success) {
      setShowImportModal(false);
      setImportJsonText('');
      setImportError(null);
      handleRefreshPreview();
    } else {
      setImportError(res.error || 'Failed to import JSON data');
    }
  };

  return (
    <div className="h-screen w-screen bg-[#07090e] text-text-primary flex flex-col font-body selection:bg-sky-500/30 selection:text-white overflow-hidden">
      {/* Top Application Header */}
      <header className="shrink-0 z-40 bg-[#0b0e17]/95 backdrop-blur-xl border-b border-white/10 px-3 sm:px-5 py-2.5 flex items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link
            to="/"
            className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center text-white font-display italic text-xs shadow-[0_0_12px_rgba(56,189,248,0.5)] hover:scale-105 active:scale-95 transition-transform"
            title="Return to Public Website"
          >
            AB
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-semibold text-white tracking-tight leading-none">
                {data.brandName} Studio CMS
              </h1>
              <span className={`inline-flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 rounded-full border transition-all ${
                isLiveSyncBlinking
                  ? 'bg-emerald-500/40 text-emerald-100 border-emerald-400 scale-105'
                  : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Real-Time Sync
              </span>
            </div>
          </div>
        </div>

        {/* Center / Preview Split Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Split Screen Toggle */}
          <button
            type="button"
            onClick={() => setIsSplitPreviewOpen(!isSplitPreviewOpen)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-all border ${
              isSplitPreviewOpen
                ? 'bg-sky-500/20 text-sky-300 border-sky-400/40 shadow-[0_0_15px_rgba(56,189,248,0.25)]'
                : 'liquid-glass-pill text-white/70 hover:text-white border-white/10 hover:bg-white/10'
            }`}
            title="Toggle Live Split-Screen Preview"
          >
            <Columns2 className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Split Screen Preview</span>
            <span className="sm:hidden">Preview</span>
          </button>

          {/* Device selector (when split is open) */}
          {isSplitPreviewOpen && (
            <div className="hidden lg:flex items-center bg-black/50 border border-white/10 rounded-xl p-0.5">
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={`p-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 ${
                  previewDevice === 'desktop' ? 'bg-sky-500 text-black font-medium shadow-sm' : 'text-white/60 hover:text-white'
                }`}
                title="Desktop View (Fluid 100%)"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="text-[10px] font-mono pr-0.5">Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('tablet')}
                className={`p-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 ${
                  previewDevice === 'tablet' ? 'bg-sky-500 text-black font-medium shadow-sm' : 'text-white/60 hover:text-white'
                }`}
                title="Tablet View (768px iPad)"
              >
                <Tablet className="w-3.5 h-3.5" />
                <span className="text-[10px] font-mono pr-0.5">Tablet</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`p-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 ${
                  previewDevice === 'mobile' ? 'bg-sky-500 text-black font-medium shadow-sm' : 'text-white/60 hover:text-white'
                }`}
                title="Mobile View (390px iPhone)"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="text-[10px] font-mono pr-0.5">Mobile</span>
              </button>
            </div>
          )}

          <div className="w-px h-4 bg-white/15 mx-1 hidden sm:block" />

          {/* View Website (New tab) */}
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="liquid-glass-button text-xs font-mono px-3 py-1.5 rounded-xl text-white flex items-center gap-1.5 cursor-pointer hover:bg-white/20 transition-all shadow-md"
            title="Open website in standalone new tab"
          >
            <span className="hidden md:inline">Live Site</span>
            <ExternalLink className="w-3 h-3 text-sky-400" />
          </Link>

          {/* Export JSON */}
          <button
            type="button"
            onClick={() => setShowExportModal(true)}
            className="liquid-glass-pill text-xs font-mono px-2.5 py-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 flex items-center gap-1 cursor-pointer transition-colors"
            title="Export JSON Backup"
          >
            <Download className="w-3 h-3 text-sky-400" />
            <span className="hidden xl:inline">Export</span>
          </button>

          {/* Import JSON */}
          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            className="liquid-glass-pill text-xs font-mono px-2.5 py-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 flex items-center gap-1 cursor-pointer transition-colors"
            title="Import JSON Backup"
          >
            <Upload className="w-3 h-3 text-sky-400" />
            <span className="hidden xl:inline">Import</span>
          </button>

          {/* Reset Defaults */}
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="liquid-glass-pill text-xs font-mono px-2.5 py-1.5 rounded-xl text-amber-300/80 hover:text-amber-300 hover:bg-amber-400/10 flex items-center gap-1 cursor-pointer transition-colors"
            title="Reset to Factory Defaults"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden xl:inline">Reset</span>
          </button>
        </div>
      </header>

      {/* Main Workspace: Left Sidebar + Center Editor + Right Live Real-Time Website Preview */}
      <div ref={mainWorkspaceRef} className="flex-1 flex overflow-hidden relative z-10">
        {/* Left Navigation Sidebar */}
        <aside
          className={`shrink-0 w-56 bg-[#0a0d14]/95 backdrop-blur-xl border-r border-white/10 flex flex-col justify-between p-3 fixed md:static top-[49px] bottom-0 z-30 transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <div className="space-y-4 overflow-y-auto pr-1">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 px-3">
                Workspace
              </span>

              <button
                type="button"
                onClick={() => handleSelectTab('overview')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === 'overview'
                    ? 'liquid-glass-pill-active text-white font-semibold shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="w-3.5 h-3.5 text-sky-400" />
                  <span>Overview</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectTab('projects')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === 'projects'
                    ? 'liquid-glass-pill-active text-white font-semibold shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FolderKanban className="w-3.5 h-3.5 text-sky-400" />
                  <span>Projects (Bento)</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 font-mono">
                  {data.projects.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectTab('journal')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === 'journal'
                    ? 'liquid-glass-pill-active text-white font-semibold shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                  <span>Journal</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 font-mono">
                  {data.journalEntries.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectTab('explorations')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === 'explorations'
                    ? 'liquid-glass-pill-active text-white font-semibold shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Compass className="w-3.5 h-3.5 text-sky-400" />
                  <span>Visual Playground</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 font-mono">
                  {data.explorations.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectTab('services')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === 'services'
                    ? 'liquid-glass-pill-active text-white font-semibold shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-sky-400" />
                  <span>4 Core Services</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 font-mono">
                  {data.services.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectTab('brand')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === 'brand'
                    ? 'liquid-glass-pill-active text-white font-semibold shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-3.5 h-3.5 text-sky-400" />
                  <span>Brand & Identity</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectTab('reviews')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === 'reviews'
                    ? 'liquid-glass-pill-active text-white font-semibold shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Star className="w-3.5 h-3.5 text-amber-400" />
                  <span>Client Reviews</span>
                </div>
                <div className="flex items-center gap-1">
                  {data.reviews && data.reviews.filter((r) => r.status === 'pending').length > 0 && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/30 text-amber-300 font-mono border border-amber-500/40 animate-pulse">
                      {data.reviews.filter((r) => r.status === 'pending').length} new
                    </span>
                  )}
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 font-mono">
                    {data.reviews?.length || 0}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Bottom Sidebar Status */}
          <div className="pt-3 border-t border-white/10 space-y-2">
            <div className="p-2 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-white/70">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-emerald-400" />
                  <span>Live Split Mirror</span>
                </span>
                <span className="text-emerald-400 font-semibold">Active</span>
              </div>
              <p className="text-[9px] text-white/40 leading-relaxed font-mono">
                Updates appear in the live view instantaneously as you type.
              </p>
            </div>
          </div>
        </aside>

        {/* Mobile menu backdrop */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Center / Left Pane: Editor Workspace */}
        <section
          style={{ width: isSplitPreviewOpen && typeof window !== 'undefined' && window.innerWidth >= 1024 ? `${splitRatio}%` : '100%' }}
          className={`overflow-y-auto p-4 sm:p-6 transition-[width] duration-75 shrink-0 ${
            isSplitPreviewOpen ? 'w-full lg:w-auto lg:border-r border-white/10' : 'w-full'
          }`}
        >
          {/* Breadcrumb row */}
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 mb-4 border-b border-white/10">
            <div className="flex items-center gap-2 text-xs font-mono text-white/50">
              <Link to="/admin" onClick={() => handleSelectTab('overview')} className="hover:text-white transition-colors">
                Admin
              </Link>
              <span>/</span>
              <span className="text-sky-300 font-medium capitalize">{activeTab}</span>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono text-white/40">
              <Clock className="w-3 h-3 text-sky-400/70" />
              <span>Real-Time Editor</span>
            </div>
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-sky-500/10 via-blue-600/10 to-transparent border border-sky-400/20 shadow-2xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-400/10 border border-sky-400/20 text-sky-300 text-xs font-mono">
                  <Sparkles className="w-3 h-3" />
                  <span>{data.brandName} Live Studio</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-display font-medium text-white tracking-tight">
                  Split-Screen Real-Time Editor
                </h2>
                <p className="text-xs sm:text-sm text-muted leading-relaxed font-body">
                  Edit projects, journal entries, services, and branding. Your live website on the right split screen updates in real time on every keystroke.
                </p>
                <div className="pt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectTab('projects')}
                    className="px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-black text-xs font-mono font-semibold transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Edit Projects</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectTab('brand')}
                    className="px-3.5 py-1.5 rounded-xl liquid-glass-pill text-white text-xs font-mono hover:bg-white/15 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Settings className="w-3.5 h-3.5 text-sky-300" />
                    <span>Brand Settings</span>
                  </button>
                </div>
              </div>

              {/* Overview Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div
                  onClick={() => handleSelectTab('projects')}
                  className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-mono text-white/50">Projects</span>
                    <FolderKanban className="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-2xl font-display text-white">{data.projects.length}</div>
                  <p className="text-[10px] text-muted font-mono">Featured items</p>
                </div>

                <div
                  onClick={() => handleSelectTab('journal')}
                  className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-mono text-white/50">Journal</span>
                    <BookOpen className="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-2xl font-display text-white">{data.journalEntries.length}</div>
                  <p className="text-[10px] text-muted font-mono">Articles</p>
                </div>

                <div
                  onClick={() => handleSelectTab('explorations')}
                  className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-mono text-white/50">Explorations</span>
                    <Compass className="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-2xl font-display text-white">{data.explorations.length}</div>
                  <p className="text-[10px] text-muted font-mono">Canvas experiments</p>
                </div>

                <div
                  onClick={() => handleSelectTab('services')}
                  className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-mono text-white/50">Services</span>
                    <Layers className="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-2xl font-display text-white">{data.services.length}</div>
                  <p className="text-[10px] text-muted font-mono">Agency packages</p>
                </div>

                <div
                  onClick={() => handleSelectTab('reviews')}
                  className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 transition-all cursor-pointer group col-span-2 sm:col-span-1"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-mono text-white/50">Client Reviews</span>
                    <Star className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-display text-white">{data.reviews?.length || 0}</span>
                    {data.reviews && data.reviews.filter((r) => r.status === 'pending').length > 0 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-amber-500/25 text-amber-300 border border-amber-500/40">
                        {data.reviews.filter((r) => r.status === 'pending').length} pending
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted font-mono">Verify & approve</p>
                </div>
              </div>

              {/* Projects Quick Preview */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-medium text-white">Current Projects</h3>
                  <button
                    type="button"
                    onClick={() => handleSelectTab('projects')}
                    className="text-[11px] font-mono text-sky-400 hover:text-sky-300"
                  >
                    Manage all →
                  </button>
                </div>
                <div className="space-y-2">
                  {data.projects.slice(0, 3).map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleSelectTab('projects')}
                      className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 flex items-center justify-between gap-3 cursor-pointer group transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {p.image && (
                          <img src={p.image} alt={p.title} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                        )}
                        <span className="text-xs text-white group-hover:text-sky-300 truncate font-medium">
                          {p.title}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/10 text-white/60 shrink-0">
                        {p.category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'projects' && <ProjectsManager />}
          {activeTab === 'journal' && <JournalManager />}
          {activeTab === 'explorations' && <ExplorationsManager />}
          {activeTab === 'services' && <ServicesManager />}
          {activeTab === 'brand' && <BrandSettingsManager />}
          {activeTab === 'reviews' && <ReviewsManager />}
        </section>

        {/* Draggable Resizer Divider Bar */}
        {isSplitPreviewOpen && (
          <div
            onMouseDown={() => setIsDraggingSplit(true)}
            className={`hidden lg:flex w-2.5 hover:w-3.5 bg-white/5 hover:bg-sky-500/50 cursor-col-resize transition-all shrink-0 z-30 items-center justify-center group select-none relative ${
              isDraggingSplit ? 'bg-sky-500 w-3.5 shadow-[0_0_20px_rgba(56,189,248,0.8)]' : ''
            }`}
            title="Drag left/right to adjust split width (or click quick presets 35% / 50% / 65%)"
          >
            <div className="w-1 h-9 rounded-full bg-white/30 group-hover:bg-white flex flex-col justify-between py-1.5 items-center pointer-events-none">
              <span className="w-0.5 h-0.5 rounded-full bg-white" />
              <span className="w-0.5 h-0.5 rounded-full bg-white" />
              <span className="w-0.5 h-0.5 rounded-full bg-white" />
            </div>
          </div>
        )}

        {/* Right Split: NATIVE REAL-TIME LIVE WEBSITE PREVIEW */}
        {isSplitPreviewOpen && (
          <aside
            style={{ width: typeof window !== 'undefined' && window.innerWidth >= 1024 ? `${100 - splitRatio}%` : '100%' }}
            className="flex-1 bg-[#05070a] flex flex-col overflow-hidden relative border-t lg:border-t-0 border-white/10 min-w-0 lg:min-w-[320px]"
          >
            {/* Live Preview Toolbar Header */}
            <div className="shrink-0 bg-[#0c1018] border-b border-white/10 px-3 py-2 flex items-center justify-between gap-2 shadow-md flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-2 min-w-0">
                {/* Live Sync Status Toggle */}
                <button
                  type="button"
                  onClick={() => setIsLiveSyncPaused(!isLiveSyncPaused)}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isLiveSyncPaused
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  }`}
                  title={isLiveSyncPaused ? 'Live Sync is paused. Click to resume real-time sync.' : 'Real-time Live Sync active. Click to pause if editing large text.'}
                >
                  <span className="relative flex h-2 w-2">
                    {!isLiveSyncPaused && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />}
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${isLiveSyncPaused ? 'bg-amber-400' : 'bg-emerald-500'}`} />
                  </span>
                  <span>{isLiveSyncPaused ? 'Sync Paused' : 'Live Sync'}</span>
                </button>

                {/* Quick Split Ratio Presets */}
                <div className="hidden xl:flex items-center gap-0.5 bg-white/5 p-0.5 rounded-lg text-[10px] font-mono text-white/60">
                  <button
                    type="button"
                    onClick={() => { setSplitRatio(35); localStorage.setItem('ai_build_split_ratio', '35'); }}
                    className={`px-1.5 py-0.5 rounded hover:text-white transition-colors cursor-pointer ${splitRatio === 35 ? 'bg-sky-500 text-black font-semibold' : ''}`}
                    title="35% Editor / 65% Preview"
                  >
                    35%
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSplitRatio(50); localStorage.setItem('ai_build_split_ratio', '50'); }}
                    className={`px-1.5 py-0.5 rounded hover:text-white transition-colors cursor-pointer ${splitRatio === 50 ? 'bg-sky-500 text-black font-semibold' : ''}`}
                    title="50% Balanced Split"
                  >
                    50%
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSplitRatio(65); localStorage.setItem('ai_build_split_ratio', '65'); }}
                    className={`px-1.5 py-0.5 rounded hover:text-white transition-colors cursor-pointer ${splitRatio === 65 ? 'bg-sky-500 text-black font-semibold' : ''}`}
                    title="65% Editor / 35% Preview"
                  >
                    65%
                  </button>
                </div>

                {/* Anchor Jump Buttons */}
                <div className="hidden sm:flex items-center gap-1 ml-1">
                  <button
                    type="button"
                    onClick={() => handleScrollPreviewTo('hero')}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 hover:bg-white/15 text-white/60 hover:text-white transition-colors cursor-pointer"
                  >
                    #hero
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScrollPreviewTo('work')}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 hover:bg-white/15 text-white/60 hover:text-white transition-colors cursor-pointer"
                  >
                    #work
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScrollPreviewTo('journal')}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 hover:bg-white/15 text-white/60 hover:text-white transition-colors cursor-pointer"
                  >
                    #journal
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScrollPreviewTo('explorations')}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 hover:bg-white/15 text-white/60 hover:text-white transition-colors cursor-pointer"
                  >
                    #explorations
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScrollPreviewTo('contact')}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 hover:bg-white/15 text-white/60 hover:text-white transition-colors cursor-pointer"
                  >
                    #contact
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Manual refresh button */}
                <button
                  type="button"
                  onClick={handleRefreshPreview}
                  className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Reload Live Preview"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <Link
                  to="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                  title="Expand to Full Tab"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => setIsSplitPreviewOpen(false)}
                  className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Close Split View"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Native Real-time Scrollable Viewport with Device Framing */}
            <div className="flex-1 bg-[#040608] p-3 flex items-center justify-center overflow-hidden">
              <div
                className={`transition-all duration-300 h-full flex flex-col ${
                  previewDevice === 'mobile'
                    ? 'w-[390px] max-h-[844px] rounded-[44px] border-[10px] border-[#1e2330] shadow-[0_25px_60px_rgba(0,0,0,0.9)] bg-black overflow-hidden relative ring-1 ring-white/10'
                    : previewDevice === 'tablet'
                    ? 'w-[768px] max-h-[1024px] rounded-[32px] border-[12px] border-[#1e2330] shadow-[0_25px_60px_rgba(0,0,0,0.9)] bg-black overflow-hidden relative ring-1 ring-white/10'
                    : 'w-full h-full rounded-2xl border border-white/10 shadow-2xl overflow-hidden bg-bg'
                }`}
              >
                {/* Mobile Speaker Notch */}
                {previewDevice === 'mobile' && (
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-[#1e2330] rounded-full z-30 pointer-events-none" />
                )}

                {/* Direct Native React Render: 0ms delay, instantaneous real-time sync with shared state! */}
                <div
                  key={previewKey}
                  ref={previewScrollContainerRef}
                  className="w-full h-full overflow-y-auto overflow-x-hidden relative scroll-smooth bg-bg"
                >
                  <PreviewErrorBoundary onRetry={handleRefreshPreview}>
                    <PortfolioHome isPreview={true} />
                  </PreviewErrorBoundary>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
          <div className="liquid-glass-modal rounded-3xl max-w-xl w-full p-6 space-y-4 border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-sky-400" />
                <h4 className="text-base font-medium text-white">Export Website Content</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="text-white/60 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <textarea
              readOnly
              rows={10}
              value={exportDataJSON()}
              className="w-full liquid-glass-input rounded-xl p-3 font-mono text-[11px] text-sky-200 select-all focus:outline-none"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCopyJSON}
                className="px-4 py-2 rounded-xl liquid-glass-pill text-xs font-mono text-white flex items-center gap-1.5 cursor-pointer hover:bg-white/15 transition-colors"
              >
                {copiedNotification ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy to Clipboard</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownloadJSON}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-xs font-mono text-white font-medium cursor-pointer shadow-lg hover:brightness-110 transition-all flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .JSON</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
          <div className="liquid-glass-modal rounded-3xl max-w-xl w-full p-6 space-y-4 border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-sky-400" />
                <h4 className="text-base font-medium text-white">Import Website Content (JSON)</h4>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  setImportError(null);
                }}
                className="text-white/60 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {importError && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{importError}</span>
              </div>
            )}

            <textarea
              rows={10}
              value={importJsonText}
              onChange={(e) => {
                setImportJsonText(e.target.value);
                setImportError(null);
              }}
              placeholder="Paste valid portfolio JSON here..."
              className="w-full liquid-glass-input rounded-xl p-3 font-mono text-[11px] text-white focus:outline-none"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  setImportError(null);
                }}
                className="px-4 py-2 rounded-xl liquid-glass-pill text-xs font-mono text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDoImport}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-xs font-mono text-white font-medium cursor-pointer shadow-lg hover:brightness-110 transition-all flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Import and Apply</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
          <div className="liquid-glass-modal rounded-3xl max-w-sm w-full p-6 text-center space-y-4 border border-white/20 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-medium text-white">Reset All Content?</h4>
            <p className="text-xs text-muted leading-relaxed">
              This will revert all projects, journal articles, explorations, services, and brand settings back to their original factory defaults.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl liquid-glass-pill text-xs font-mono text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  resetToDefaults();
                  setShowResetConfirm(false);
                  handleRefreshPreview();
                }}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-mono text-white font-medium cursor-pointer shadow-lg transition-colors"
              >
                Yes, Reset Defaults
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
