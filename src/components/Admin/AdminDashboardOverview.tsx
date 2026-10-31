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
  Star,
  Plus,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Check,
  AlertCircle,
  Cloud,
  HardDrive,
  Upload,
  Clock,
  ShieldCheck,
  Send,
  Zap,
  MessageSquareText,
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { isSupabaseConfigured } from '../../services/supabase.ts';

interface AdminDashboardOverviewProps {
  onSelectTab: (tab: any) => void;
}

export const AdminDashboardOverview: React.FC<AdminDashboardOverviewProps> = ({ onSelectTab }) => {
  const { data, publishAllChanges } = usePortfolio();
  const { user } = useAuth();
  const [publishedToast, setPublishedToast] = useState(false);

  const projects = data.projects || [];
  const publishedProjects = projects.filter((p) => p.isPublished !== false).length;
  const draftProjects = projects.length - publishedProjects;

  const journalEntries = data.journalEntries || [];
  const publishedArticles = journalEntries.filter((j) => j.isPublished !== false).length;
  const draftArticles = journalEntries.length - publishedArticles;

  const reviews = data.reviews || [];
  const pendingReviews = reviews.filter((r) => r.status === 'pending').length;
  const approvedReviews = reviews.filter((r) => r.status === 'approved').length;

  const mediaCount = data.mediaAssets?.length || 0;
  const activityLogs = data.activityLogs || [];
  const inquiries = data.inquiries || [];
  const newInquiries = inquiries.filter((i) => i.status === 'new').length;

  const handlePublishAll = () => {
    publishAllChanges();
    setPublishedToast(true);
    setTimeout(() => setPublishedToast(false), 3000);
  };

  const formatPublishDate = (isoStr?: string) => {
    if (!isoStr) return 'Not yet published';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn font-body">
      {/* Top System Health & Publish Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-sky-500/15 via-blue-600/10 to-transparent border border-sky-400/25 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center text-white font-display italic text-xs shadow-[0_0_12px_rgba(56,189,248,0.5)]">
              AB
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight">
                  {data.brandName} Control Center
                </h2>
                {isSupabaseConfigured ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <Cloud className="w-3 h-3 text-emerald-400" />
                    <span>Supabase Connected</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <HardDrive className="w-3 h-3 text-amber-400" />
                    <span>Persistent Local Storage</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-muted font-mono mt-0.5">
                Logged in as <strong className="text-white/80">{user?.email || (user?.isAdmin ? 'Studio Owner' : 'Authenticated User')}</strong> • Last published: {formatPublishDate(data.lastPublishedAt)}
              </p>
            </div>
          </div>

          {/* Global Publish Button */}
          <div className="flex items-center gap-2.5">
            {publishedToast && (
              <span className="text-xs font-mono px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 animate-pulse">
                <Check className="w-3.5 h-3.5" />
                <span>All Changes Published!</span>
              </span>
            )}

            <button
              type="button"
              onClick={handlePublishAll}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold flex items-center gap-2 cursor-pointer shadow-lg transition-all ${
                data.hasUnpublishedChanges
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black animate-pulse shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                  : 'liquid-glass-button bg-white/10 hover:bg-white/20 text-white'
              }`}
              title="Publish all pending drafts and updates to live site"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{data.hasUnpublishedChanges ? 'Publish Unsaved Changes' : 'Publish to Live Site'}</span>
            </button>
          </div>
        </div>

        {data.hasUnpublishedChanges && (
          <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs font-mono flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>You have unpublished content edits in draft mode. Click "Publish to Live Site" to push updates.</span>
            </div>
            <button
              type="button"
              onClick={handlePublishAll}
              className="px-2.5 py-1 rounded-lg bg-amber-400 text-black text-[11px] font-semibold hover:bg-amber-300 transition-colors"
            >
              Publish Now
            </button>
          </div>
        )}
      </div>

      {/* 6 Core Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {/* Card 1: Client Inquiries / Leads (High Priority) */}
        <div
          onClick={() => onSelectTab('inquiries')}
          className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-white/[0.03] to-transparent hover:bg-white/[0.07] border border-emerald-500/30 hover:border-emerald-400/50 transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-emerald-300 font-medium">Inquiries</span>
            <MessageSquareText className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-display text-white">{inquiries.length}</div>
            <div className="flex items-center gap-1.5 mt-1 text-[10px] font-mono">
              <span className={newInquiries > 0 ? 'text-emerald-400 font-bold animate-pulse' : 'text-emerald-400'}>
                {newInquiries} New
              </span>
              <span className="text-white/40">• {inquiries.length - newInquiries} Handled</span>
            </div>
          </div>
        </div>

        {/* Card 2: Projects */}
        <div
          onClick={() => onSelectTab('projects')}
          className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-white/20 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-white/50">Projects</span>
            <FolderKanban className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-display text-white">{projects.length}</div>
            <div className="flex items-center gap-1.5 mt-1 text-[10px] font-mono">
              <span className="text-emerald-400">{publishedProjects} Live</span>
              {draftProjects > 0 && <span className="text-amber-400">• {draftProjects} Draft</span>}
            </div>
          </div>
        </div>

        {/* Card 3: Journal */}
        <div
          onClick={() => onSelectTab('journal')}
          className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-white/20 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-white/50">Journal</span>
            <BookOpen className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-display text-white">{journalEntries.length}</div>
            <div className="flex items-center gap-1.5 mt-1 text-[10px] font-mono">
              <span className="text-emerald-400">{publishedArticles} Live</span>
              {draftArticles > 0 && <span className="text-amber-400">• {draftArticles} Draft</span>}
            </div>
          </div>
        </div>

        {/* Card 4: Explorations */}
        <div
          onClick={() => onSelectTab('explorations')}
          className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-white/20 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-white/50">Explorations</span>
            <Compass className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-display text-white">{data.explorations.length}</div>
            <p className="text-[10px] text-muted font-mono mt-1">Parallax Canvas</p>
          </div>
        </div>

        {/* Card 5: Reviews */}
        <div
          onClick={() => onSelectTab('reviews')}
          className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-white/20 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-white/50">Reviews</span>
            <Star className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-display text-white">{reviews.length}</div>
            <div className="flex items-center gap-1.5 mt-1 text-[10px] font-mono">
              <span className="text-emerald-400">{approvedReviews} Live</span>
              {pendingReviews > 0 && (
                <span className="text-amber-400 font-semibold">• {pendingReviews} New</span>
              )}
            </div>
          </div>
        </div>

        {/* Card 6: Media Library */}
        <div
          onClick={() => onSelectTab('media')}
          className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-white/20 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-white/50">Media</span>
            <Upload className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-display text-white">{mediaCount}</div>
            <p className="text-[10px] text-muted font-mono mt-1">Files & Videos</p>
          </div>
        </div>
      </div>

      {/* Quick Actions Launchpad */}
      <div className="liquid-glass rounded-3xl p-5 sm:p-6 border border-white/10 space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-sky-300 flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-sky-400" />
          <span>Quick Management Shortcuts</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            type="button"
            onClick={() => onSelectTab('inquiries')}
            className="p-3.5 rounded-2xl bg-white/[0.02] hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/30 flex flex-col items-center justify-center text-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <MessageSquareText className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-white">Client Inbox</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('projects')}
            className="p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 flex flex-col items-center justify-center text-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-white">Add Project</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('media')}
            className="p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 flex flex-col items-center justify-center text-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-white">Upload Media</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('journal')}
            className="p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 flex flex-col items-center justify-center text-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-white">New Article</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('reviews')}
            className="p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 flex flex-col items-center justify-center text-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Star className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-white">Moderate Reviews</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('brand')}
            className="p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 flex flex-col items-center justify-center text-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-white">Brand & Texts</span>
          </button>
        </div>
      </div>

      {/* Latest Client Inquiries / Leads Banner */}
      <div className="liquid-glass rounded-3xl p-5 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquareText className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-mono uppercase tracking-wider text-emerald-300">
              Recent Client Inquiries
            </h3>
            {newInquiries > 0 && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold animate-pulse">
                {newInquiries} New Lead{newInquiries > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => onSelectTab('inquiries')}
            className="text-[11px] font-mono text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>View All Leads ({inquiries.length})</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {inquiries.length === 0 ? (
          <div className="p-4 rounded-xl bg-white/[0.02] border border-dashed border-white/10 text-center text-xs text-white/50 font-mono">
            No client inquiries yet. When visitors click &quot;Say hi&quot; or &quot;Start a Conversation&quot;, their submissions will appear here.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {inquiries.slice(0, 3).map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectTab('inquiries')}
                className="p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 hover:border-emerald-500/30 transition-all cursor-pointer space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white group-hover:text-emerald-300 truncate">
                    {item.name}
                  </span>
                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${
                    item.status === 'new'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 animate-pulse'
                      : 'bg-white/10 text-white/60 border-white/10'
                  }`}>
                    {item.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-[11px] text-white/70 line-clamp-2 leading-relaxed font-mono">
                  &quot;{item.ideaDescription}&quot;
                </p>
                <div className="flex items-center justify-between text-[10px] font-mono text-white/40 pt-1 border-t border-white/5">
                  <span className="text-sky-300">{item.serviceType}</span>
                  <span>{new Date((item.submittedAt || item.createdAt || Date.now())).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Two Column Section: Recent Activity Audit Feed + Project Overview */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Recent Activity Log */}
        <div className="liquid-glass rounded-3xl p-5 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-wider text-sky-300 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Recent Changes & Activity Log</span>
            </h3>
            <span className="text-[10px] font-mono text-white/40">{activityLogs.length} events</span>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {activityLogs.slice(0, 7).map((log) => {
              const actionColors: Record<string, string> = {
                publish: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
                unpublish: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
                create: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
                update: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
                delete: 'bg-red-500/20 text-red-300 border-red-500/30',
                upload: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
                reorder: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
              };

              return (
                <div
                  key={log.id}
                  className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border shrink-0 ${actionColors[log.action] || 'bg-white/10 text-white'}`}>
                      {log.action}
                    </span>
                    <span className="text-white/90 truncate font-medium">{log.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-white/40 shrink-0">{log.timestamp}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Featured Projects Summary */}
        <div className="liquid-glass rounded-3xl p-5 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-wider text-sky-300 flex items-center gap-2">
              <FolderKanban className="w-3.5 h-3.5" />
              <span>Current Featured Projects</span>
            </h3>
            <button
              type="button"
              onClick={() => onSelectTab('projects')}
              className="text-[11px] font-mono text-sky-400 hover:text-sky-300 flex items-center gap-1"
            >
              <span>Manage ({projects.length})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {projects.slice(0, 4).map((p, idx) => (
              <div
                key={p.id}
                onClick={() => onSelectTab('projects')}
                className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 flex items-center justify-between gap-3 cursor-pointer group transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-[10px] font-mono text-white/40 w-4">#{idx + 1}</span>
                  {p.image && (
                    <img src={p.image} alt={p.title} className="w-9 h-9 rounded-lg object-cover shrink-0" />
                  )}
                  <div className="min-w-0">
                    <h5 className="text-xs text-white group-hover:text-sky-300 truncate font-medium">
                      {p.title}
                    </h5>
                    <span className="text-[10px] font-mono text-white/50">{p.category}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${
                    p.isPublished !== false
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}>
                    {p.isPublished !== false ? 'Published' : 'Draft'}
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-white/60">
                    {p.span} Col
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
