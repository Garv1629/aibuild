/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  MessageSquareText,
  Mail,
  Clock,
  CheckCircle2,
  Trash2,
  Search,
  Filter,
  ExternalLink,
  ChevronDown,
  Sparkles,
  ArrowRight,
  Download,
  AlertCircle,
  FileText,
  User,
  Calendar,
  Layers,
  Send,
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext.tsx';
import { ClientInquiry } from '../../utils/portfolio.ts';
import { Button } from '../Button.tsx';

export const InquiriesManager: React.FC = () => {
  const { data, updateInquiryStatus, deleteInquiry } = usePortfolio();
  const inquiries = data.inquiries || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'contacted' | 'in_progress' | 'archived'>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesInput, setNotesInput] = useState<string>('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Metrics
  const totalCount = inquiries.length;
  const newCount = inquiries.filter((i) => i.status === 'new').length;
  const contactedCount = inquiries.filter((i) => i.status === 'contacted').length;
  const inProgressCount = inquiries.filter((i) => i.status === 'in_progress').length;
  const archivedCount = inquiries.filter((i) => i.status === 'archived').length;

  // Filtered inquiries
  const filteredInquiries = useMemo(() => {
    return inquiries.filter((item) => {
      // Status filter
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;

      // Service filter
      if (serviceFilter !== 'all' && item.serviceType !== serviceFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchEmail = item.email.toLowerCase().includes(q);
        const matchService = item.serviceType.toLowerCase().includes(q);
        const matchDesc = item.ideaDescription.toLowerCase().includes(q);
        const matchNotes = item.notes?.toLowerCase().includes(q) ?? false;
        return matchName || matchEmail || matchService || matchDesc || matchNotes;
      }

      return true;
    });
  }, [inquiries, statusFilter, serviceFilter, searchQuery]);

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  const handleStatusChange = async (id: string, newStatus: ClientInquiry['status']) => {
    await updateInquiryStatus(id, newStatus);
    showToast(`Inquiry marked as ${newStatus.replace('_', ' ')}`);
  };

  const handleSaveNotes = async (id: string) => {
    await updateInquiryStatus(id, inquiries.find((i) => i.id === id)?.status || 'new', notesInput);
    setEditingNotesId(null);
    showToast('Internal notes updated');
  };

  const handleDelete = async (id: string) => {
    await deleteInquiry(id);
    setDeleteConfirmId(null);
    showToast('Inquiry deleted from database');
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(inquiries, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ai_build_inquiries_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Inquiries exported successfully');
  };

  const getStatusBadge = (status: ClientInquiry['status']) => {
    switch (status) {
      case 'new':
        return (
          <span className="text-2xs font-mono px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 flex items-center gap-1.5 shadow-[0_0_8px_rgba(56,189,248,0.25)]">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            <span>NEW ENQUIRY</span>
          </span>
        );
      case 'contacted':
        return (
          <span className="text-2xs font-mono px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>CONTACTED</span>
          </span>
        );
      case 'in_progress':
        return (
          <span className="text-2xs font-mono px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            <span>IN DISCUSSION</span>
          </span>
        );
      case 'archived':
        return (
          <span className="text-2xs font-mono px-2.5 py-0.5 rounded-full bg-white/10 text-white/50 border border-white/20 flex items-center gap-1.5">
            <span>ARCHIVED</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn font-body">
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-3.5 rounded-2xl bg-sky-500 text-black font-mono text-xs font-semibold shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Stats Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl liquid-glass border border-white/10 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-accent uppercase tracking-widest font-semibold flex items-center gap-1.5">
              <MessageSquareText className="w-4 h-4 text-accent" />
              <span>Studio Client Inquiries</span>
            </span>
            {newCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-sky-400/20 text-sky-300 text-2xs font-mono border border-sky-400/30 animate-pulse">
                {newCount} New
              </span>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-medium text-white tracking-tight">
            Client Conversations &amp; Leads
          </h2>
          <p className="text-xs text-muted max-w-xl leading-relaxed">
            Every time a prospective client clicks &quot;Say hi&quot; or &quot;Start a Conversation&quot; and submits their project concept, it appears instantly here in your studio inbox.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="glass"
            size="sm"
            onClick={handleExportJSON}
            className="text-xs gap-1.5"
            title="Download client leads backup"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Leads</span>
          </Button>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl liquid-glass-subtle border border-white/10">
          <span className="text-2xs font-mono text-white/50 uppercase tracking-widest block">Total Inquiries</span>
          <span className="text-2xl sm:text-3xl font-display font-medium text-white mt-1 block">{totalCount}</span>
        </div>
        <div className="p-4 rounded-2xl liquid-glass-subtle border border-sky-400/20 bg-sky-500/[0.04]">
          <span className="text-2xs font-mono text-sky-400 uppercase tracking-widest block">New / Unread</span>
          <span className="text-2xl sm:text-3xl font-display font-medium text-sky-300 mt-1 block">{newCount}</span>
        </div>
        <div className="p-4 rounded-2xl liquid-glass-subtle border border-amber-400/20">
          <span className="text-2xs font-mono text-amber-400 uppercase tracking-widest block">Contacted</span>
          <span className="text-2xl sm:text-3xl font-display font-medium text-amber-300 mt-1 block">{contactedCount}</span>
        </div>
        <div className="p-4 rounded-2xl liquid-glass-subtle border border-purple-400/20">
          <span className="text-2xs font-mono text-purple-400 uppercase tracking-widest block">In Discussion</span>
          <span className="text-2xl sm:text-3xl font-display font-medium text-purple-300 mt-1 block">{inProgressCount}</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 rounded-2xl liquid-glass border border-white/10">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client name, email, service..."
            className="w-full liquid-glass-input rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-white placeholder-white/40 focus:outline-none"
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {(['all', 'new', 'contacted', 'in_progress', 'archived'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-sky-500 text-black font-semibold shadow-md'
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              {st === 'all' ? 'All' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Inquiry List */}
      <div className="space-y-3.5">
        {filteredInquiries.length === 0 ? (
          <div className="p-12 rounded-3xl liquid-glass border border-white/10 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-white/5 mx-auto flex items-center justify-center text-white/40">
              <MessageSquareText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-display text-white">No inquiries found</h3>
            <p className="text-xs text-muted max-w-sm mx-auto leading-relaxed">
              {searchQuery || statusFilter !== 'all' || serviceFilter !== 'all'
                ? 'Try clearing your search filters to see all client inquiries.'
                : 'When prospective clients submit the "Start a Conversation" modal on your website, their notes will be saved and listed here.'}
            </p>
          </div>
        ) : (
          filteredInquiries.map((inq) => {
            const isExpanded = expandedId === inq.id;
            const isEditingNotes = editingNotesId === inq.id;
            const isDeleting = deleteConfirmId === inq.id;

            return (
              <div
                key={inq.id}
                className={`rounded-2xl transition-all border p-4 sm:p-5 liquid-glass-card ${
                  inq.status === 'new'
                    ? 'border-sky-400/40 bg-sky-950/10 shadow-[0_0_24px_rgba(56,189,248,0.15)]'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                {/* Main Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  {/* Client Info */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-400/30 to-blue-600/30 border border-sky-400/40 flex items-center justify-center text-white font-display text-base shrink-0 shadow-inner">
                      {inq.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base font-medium text-white tracking-tight">{inq.name}</h4>
                        {getStatusBadge(inq.status)}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-muted mt-1">
                        <a
                          href={`mailto:${inq.email}?subject=Regarding your inquiry on AI Build Studio&body=Hi ${encodeURIComponent(inq.name)},\n\nThank you for reaching out to AI Build Studio regarding your ${encodeURIComponent(inq.serviceType)} project.\n\n`}
                          className="text-sky-300 hover:text-white flex items-center gap-1 underline underline-offset-2"
                        >
                          <Mail className="w-3 h-3 text-sky-400" />
                          <span>{inq.email}</span>
                        </a>
                        <span className="flex items-center gap-1 text-white/40">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(inq.createdAt)}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Status Dropdown */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Status Dropdown */}
                    <select
                      value={inq.status}
                      onChange={(e) => handleStatusChange(inq.id, e.target.value as any)}
                      className="liquid-glass-input text-xs font-mono px-3 py-1.5 rounded-xl text-white bg-black/60 focus:outline-none cursor-pointer"
                    >
                      <option value="new" className="bg-[#0b0e14] text-sky-300">New</option>
                      <option value="contacted" className="bg-[#0b0e14] text-amber-300">Contacted</option>
                      <option value="in_progress" className="bg-[#0b0e14] text-purple-300">In Discussion</option>
                      <option value="archived" className="bg-[#0b0e14] text-white/50">Archived</option>
                    </select>

                    {/* Direct Mailto Reply Button */}
                    <a
                      href={`mailto:${inq.email}?subject=Regarding your ${encodeURIComponent(inq.serviceType)} project with AI Build&body=Hi ${encodeURIComponent(inq.name)},\n\nThank you for reaching out through AI Build regarding your ${encodeURIComponent(inq.serviceType)} concept.\n\nWe would love to discuss your vision in detail.\n\nBest regards,\nAI Build Studio\naibuld2026@gmail.com`}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-mono text-xs font-medium flex items-center gap-1.5 shadow-md transition-all shrink-0 cursor-pointer"
                      title="Open default email client to reply"
                    >
                      <Send className="w-3 h-3" />
                      <span>Reply via Email</span>
                    </a>

                    {/* Delete Toggle */}
                    {isDeleting ? (
                      <div className="flex items-center gap-1 bg-red-950/60 p-1 rounded-xl border border-red-500/40">
                        <button
                          type="button"
                          onClick={() => handleDelete(inq.id)}
                          className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-2xs font-mono font-bold cursor-pointer"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-2xs font-mono cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(inq.id)}
                        className="p-2 text-white/40 hover:text-red-400 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                        title="Delete this inquiry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Service Requested Badge */}
                <div className="mt-3.5 flex items-center gap-2">
                  <span className="text-2xs font-mono text-white/40 uppercase tracking-widest">Service Requested:</span>
                  <span className="text-2xs font-mono px-2.5 py-0.5 rounded-full bg-white/10 text-white border border-white/15">
                    {inq.serviceType}
                  </span>
                </div>

                {/* Project Concept / Idea Description */}
                <div className="mt-3 p-3.5 rounded-xl bg-black/40 border border-white/5 text-xs text-white/90 leading-relaxed font-body whitespace-pre-wrap selection:bg-sky-500/30">
                  {inq.ideaDescription}
                </div>

                {/* Internal Notes Section */}
                <div className="mt-3 pt-3 border-t border-white/10">
                  {isEditingNotes ? (
                    <div className="space-y-2">
                      <label className="text-2xs font-mono text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
                        <FileText className="w-3 h-3" />
                        <span>Admin Private Follow-Up Notes:</span>
                      </label>
                      <textarea
                        value={notesInput}
                        onChange={(e) => setNotesInput(e.target.value)}
                        placeholder="Write follow-up notes, phone call logs, pricing quotes..."
                        rows={2}
                        className="w-full liquid-glass-input rounded-xl p-2.5 text-xs font-mono text-white placeholder-white/30 focus:outline-none"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSaveNotes(inq.id)}
                          className="px-3 py-1 bg-sky-500 hover:bg-sky-400 text-black text-2xs font-mono font-semibold rounded-lg cursor-pointer"
                        >
                          Save Notes
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingNotesId(null)}
                          className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-2xs font-mono rounded-lg cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-2xs font-mono">
                      <div className="text-white/50 flex items-center gap-1.5">
                        <FileText className="w-3 h-3 text-white/40" />
                        <span>Notes:</span>
                        <span className="text-white/80 italic">{inq.notes || 'No notes added yet'}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingNotesId(inq.id);
                          setNotesInput(inq.notes || '');
                        }}
                        className="text-sky-300 hover:text-white underline underline-offset-2 cursor-pointer"
                      >
                        {inq.notes ? 'Edit Notes' : '+ Add Note'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
