/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FolderKanban,
  BookOpen,
  Compass,
  Layers,
  Settings,
  X,
  ExternalLink,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  Check,
  AlertCircle,
  Copy,
  MessageSquareQuote,
  Star,
  Images,
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext.tsx';
import { ProjectsManager } from './ProjectsManager.tsx';
import { JournalManager } from './JournalManager.tsx';
import { ExplorationsManager } from './ExplorationsManager.tsx';
import { ServicesManager } from './ServicesManager.tsx';
import { BrandSettingsManager } from './BrandSettingsManager.tsx';
import { ReviewsManager } from './ReviewsManager.tsx';
import { MediaLibraryManager } from './MediaLibraryManager.tsx';

type AdminTab = 'projects' | 'journal' | 'explorations' | 'services' | 'reviews' | 'brand' | 'media';

export const AdminDashboard: React.FC = () => {
  const {
    data,
    isAdminOpen,
    setIsAdminOpen,
    resetToDefaults,
    exportDataJSON,
    importDataJSON,
  } = usePortfolio();

  const [activeTab, setActiveTab] = useState<AdminTab>('projects');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [copiedNotification, setCopiedNotification] = useState(false);

  if (!isAdminOpen) return null;

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
    link.download = `portfolio-content-backup-${new Date().toISOString().slice(0, 10)}.json`;
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
    } else {
      setImportError(res.error || 'Failed to import JSON data');
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] pointer-events-auto flex flex-col bg-[#0b0e17] text-text-primary overflow-hidden font-body animate-fadeIn">
      {/* Top visionOS Studio Header */}
      <header className="shrink-0 liquid-glass border-b border-white/15 px-4 sm:px-8 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xl relative z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center text-white font-display italic text-sm shadow-[0_0_12px_rgba(56,189,248,0.5)]">
            AB
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-medium text-white tracking-tight">
                {data.brandName} Studio CMS
              </h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Sync
              </span>
            </div>
            <p className="text-[11px] font-mono text-white/50 hidden sm:block">
              Changes reflect immediately on your live website & persist across visits.
            </p>
          </div>
        </div>

        {/* Global actions: Preview, Export/Import, Reset, Close */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setIsAdminOpen(false)}
            className="liquid-glass-button text-xs font-mono px-3.5 py-1.5 rounded-xl text-white flex items-center gap-1.5 cursor-pointer hover:bg-white/20 transition-all shadow-md"
            title="Close admin panel and view website live"
          >
            <ExternalLink className="w-3.5 h-3.5 text-sky-300" />
            <span>View Live Site</span>
          </button>

          <button
            type="button"
            onClick={() => setShowExportModal(true)}
            className="liquid-glass-pill text-xs font-mono px-3 py-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Export JSON backup"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Export</span>
          </button>

          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            className="liquid-glass-pill text-xs font-mono px-3 py-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Import JSON backup"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Import</span>
          </button>

          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="liquid-glass-pill text-xs font-mono px-3 py-1.5 rounded-xl text-amber-300/80 hover:text-amber-300 hover:bg-amber-400/10 flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Reset to default content"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAdminOpen(false)}
            className="w-8 h-8 rounded-full hover:bg-white/15 text-white/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer ml-1"
            aria-label="Close Admin Studio"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Navigation tabs & Content Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative z-10">
        {/* Sidebar / Tabs */}
        <aside className="shrink-0 w-full md:w-64 liquid-glass-nav border-r border-white/10 p-3 sm:p-4 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-y-auto scrollbar-none touch-pan-x">
          <button
            type="button"
            onClick={() => setActiveTab('projects')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-mono flex items-center justify-between transition-all cursor-pointer ${
              activeTab === 'projects'
                ? 'liquid-glass-pill-active text-white font-semibold'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FolderKanban className="w-4 h-4 text-sky-400" />
              <span>Projects (Bento)</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10">
              {data.projects.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('journal')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-mono flex items-center justify-between transition-all cursor-pointer ${
              activeTab === 'journal'
                ? 'liquid-glass-pill-active text-white font-semibold'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4 text-sky-400" />
              <span>Journal Articles</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10">
              {data.journalEntries.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('explorations')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-mono flex items-center justify-between transition-all cursor-pointer ${
              activeTab === 'explorations'
                ? 'liquid-glass-pill-active text-white font-semibold'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Compass className="w-4 h-4 text-sky-400" />
              <span>Visual Playground</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10">
              {data.explorations.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('services')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-mono flex items-center justify-between transition-all cursor-pointer ${
              activeTab === 'services'
                ? 'liquid-glass-pill-active text-white font-semibold'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-sky-400" />
              <span>4 Core Services</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10">
              {data.services.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-mono flex items-center justify-between transition-all cursor-pointer ${
              activeTab === 'reviews'
                ? 'liquid-glass-pill-active text-white font-semibold'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <MessageSquareQuote className="w-4 h-4 text-sky-400" />
              <span>Reviews & Moderation</span>
            </div>
            {(() => {
              const pending = (data.reviews || []).filter((r) => r.status === 'pending').length;
              if (pending > 0) {
                return (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-300 font-mono font-medium animate-pulse border border-amber-500/40">
                    {pending} new
                  </span>
                );
              }
              return (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10">
                  {(data.reviews || []).length}
                </span>
              );
            })()}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('media')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-mono flex items-center justify-between transition-all cursor-pointer ${
              activeTab === 'media'
                ? 'liquid-glass-pill-active text-white font-semibold'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Images className="w-4 h-4 text-sky-400" />
              <span>Media & Assets</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10">
              {(data.mediaAssets || []).length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('brand')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-mono flex items-center justify-between transition-all cursor-pointer ${
              activeTab === 'brand'
                ? 'liquid-glass-pill-active text-white font-semibold'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Settings className="w-4 h-4 text-sky-400" />
              <span>Brand & Identity</span>
            </div>
          </button>

          <div className="mt-auto hidden md:block pt-4 border-t border-white/10 text-[11px] font-mono text-white/40 space-y-1">
            <div>Shortcut: <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/80">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/80">Shift</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/80">A</kbd></div>
            <div>URL: <code className="text-sky-300/80">?admin=true</code></div>
          </div>
        </aside>

        {/* Tab View Container */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-h-[calc(100vh-4.5rem)]">
          <div className="max-w-5xl mx-auto">
            {activeTab === 'projects' && <ProjectsManager />}
            {activeTab === 'journal' && <JournalManager />}
            {activeTab === 'explorations' && <ExplorationsManager />}
            {activeTab === 'services' && <ServicesManager />}
            {activeTab === 'reviews' && <ReviewsManager />}
            {activeTab === 'media' && <MediaLibraryManager />}
            {activeTab === 'brand' && <BrandSettingsManager />}
          </div>
        </main>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
          <div className="liquid-glass-modal rounded-3xl max-w-xl w-full p-6 space-y-4 border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-sky-400" />
                <h4 className="text-base font-medium text-white">Export Website Content (JSON)</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="text-white/60 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-muted">
              Here is the complete JSON snapshot of your website. You can download it as a backup file or copy it to your clipboard.
            </p>

            <textarea
              readOnly
              rows={10}
              value={exportDataJSON()}
              className="w-full liquid-glass-input rounded-xl p-3 font-mono text-[11px] text-white/90 focus:outline-none select-all"
            />

            <div className="flex items-center justify-between pt-2">
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

            <p className="text-xs text-muted">
              Paste a previously exported JSON backup below to restore or migrate your website content.
            </p>

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
