import React, { useState } from 'react';
import { PublicMessage } from '../../types';
import { adminStore } from '../../services/adminStore';
import {
  Mail,
  Sparkles,
  Search,
  Trash2,
  CheckCircle,
  ExternalLink,
  Download,
  Building,
  DollarSign,
  Briefcase,
  X,
} from 'lucide-react';

interface AdminMessagesTabProps {
  messages: PublicMessage[];
}

export const AdminMessagesTab: React.FC<AdminMessagesTabProps> = ({ messages }) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read' | 'replied'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<PublicMessage | null>(null);

  const filteredMessages = messages.filter((m) => {
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        (m.company && m.company.toLowerCase().includes(q)) ||
        m.message.toLowerCase().includes(q) ||
        m.projectType.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const unreadCount = messages.filter((m) => m.status === 'unread').length;

  const handleSelectMessage = (msg: PublicMessage) => {
    setSelectedMessage(msg);
    if (msg.status === 'unread') {
      adminStore.updateMessageStatus(msg.id, 'read');
    }
  };

  const handleStatusChange = (id: string, status: PublicMessage['status']) => {
    adminStore.updateMessageStatus(id, status);
    if (selectedMessage && selectedMessage.id === id) {
      setSelectedMessage({ ...selectedMessage, status });
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete message from "${name}"?`)) {
      adminStore.deleteMessage(id);
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage(null);
      }
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Company', 'Service Scope', 'Budget', 'Status', 'Date', 'Message'];
    const rows = messages.map((m) => [
      m.id,
      `"${m.name.replace(/"/g, '""')}"`,
      `"${m.email.replace(/"/g, '""')}"`,
      `"${(m.company || '').replace(/"/g, '""')}"`,
      `"${m.projectType.replace(/"/g, '""')}"`,
      `"${m.budget.replace(/"/g, '""')}"`,
      m.status,
      `"${m.date.replace(/"/g, '""')}"`,
      `"${m.message.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ai_build_messages_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 font-sans-clean">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 bg-white/85 p-6 sm:p-7 rounded-[32px] border border-[#E5E7EB] backdrop-blur-2xl shadow-[0_15px_40px_rgba(0,0,0,0.04)]">
        <div>
          <div className="flex items-center gap-2 text-xs font-label-small uppercase tracking-[0.14em] text-[#D8A9A8] font-medium mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Inbound Client Inquiries &amp; Contact Submissions
          </div>
          <h2 className="text-2xl sm:text-3xl font-elegant font-normal text-[#202526] tracking-wide flex items-center gap-3">
            Public Messages &amp; Inquiries
            {unreadCount > 0 && (
              <span className="px-3 py-0.5 rounded-full text-xs font-label-small bg-[#D8A9A8] text-white font-medium animate-pulse">
                {unreadCount} new
              </span>
            )}
          </h2>
          <p className="text-xs sm:text-[13px] text-[#596769] mt-1.5 max-w-xl leading-relaxed">
            Messages received via the studio inquiry modal. Reply directly by email or export all client communications as CSV.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-5 py-2.5 rounded-full border border-[#E5E7EB] hover:bg-black/[0.04] text-xs font-btn font-medium text-[#202526] uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-[#D8A9A8]" /> Export CSV
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/80 p-2.5 rounded-2xl border border-[#E5E7EB] shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5 font-sans-clean">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-btn font-medium uppercase tracking-wider transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-[#202526] text-white shadow-xs'
                : 'text-[#596769] hover:text-[#202526] hover:bg-black/[0.04]'
            }`}
          >
            All ({messages.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('unread')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-btn font-medium uppercase tracking-wider transition-all cursor-pointer ${
              statusFilter === 'unread'
                ? 'bg-[#202526] text-white shadow-xs'
                : 'text-[#596769] hover:text-[#202526] hover:bg-black/[0.04]'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('read')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-btn font-medium uppercase tracking-wider transition-all cursor-pointer ${
              statusFilter === 'read'
                ? 'bg-[#202526] text-white shadow-xs'
                : 'text-[#596769] hover:text-[#202526] hover:bg-black/[0.04]'
            }`}
          >
            Read ({messages.filter((m) => m.status === 'read').length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('replied')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-btn font-medium uppercase tracking-wider transition-all cursor-pointer ${
              statusFilter === 'replied'
                ? 'bg-[#202526] text-white shadow-xs'
                : 'text-[#596769] hover:text-[#202526] hover:bg-black/[0.04]'
            }`}
          >
            Replied ({messages.filter((m) => m.status === 'replied').length})
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-[#596769] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search name, email, project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl pl-9 pr-3.5 py-2 text-xs text-[#202526] placeholder:text-[#596769]/50 focus:outline-none focus:border-[#D8A9A8] focus:bg-white"
          />
        </div>
      </div>

      {/* Main Split Layout: List & Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Messages List Column */}
        <div className={`space-y-3.5 ${selectedMessage ? 'lg:col-span-5' : 'lg:col-span-12'}`}>
          {filteredMessages.length === 0 ? (
            <div className="p-12 text-center bg-white/60 rounded-3xl border border-dashed border-[#E5E7EB] text-[#596769]">
              No messages found.
            </div>
          ) : (
            filteredMessages.map((msg) => {
              const isSelected = selectedMessage?.id === msg.id;
              const isUnread = msg.status === 'unread';

              return (
                <div
                  key={msg.id}
                  onClick={() => handleSelectMessage(msg)}
                  className={`p-5 rounded-[28px] border transition-all cursor-pointer flex flex-col justify-between gap-3 shadow-[0_10px_30px_rgba(0,0,0,0.03)] ${
                    isSelected
                      ? 'bg-white border-[#202526] shadow-[0_15px_35px_rgba(0,0,0,0.08)]'
                      : isUnread
                      ? 'bg-white/95 border-[#D8A9A8] hover:border-[#D8A9A8]'
                      : 'bg-white/80 border-[#E5E7EB] hover:border-black/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          isUnread ? 'bg-[#D8A9A8] animate-pulse shadow-[0_0_6px_#D8A9A8]' : 'bg-black/10'
                        }`}
                      />
                      <div>
                        <h4 className="text-sm font-praise text-[#202526] tracking-wide flex items-center gap-2">
                          {msg.name}
                          {msg.company && (
                            <span className="text-xs font-sans-clean font-normal text-[#596769]">
                              &bull; {msg.company}
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-[#D8A9A8] font-sans-clean">{msg.email}</p>
                      </div>
                    </div>

                    <span className="text-[10px] text-[#596769] font-strong shrink-0">
                      {msg.date}
                    </span>
                  </div>

                  <p className="text-xs text-[#596769] line-clamp-2 font-sans-clean leading-relaxed">
                    {msg.message}
                  </p>

                  <div className="flex items-center justify-between pt-2.5 border-t border-[#E5E7EB] text-[11px]">
                    <span className="px-2.5 py-0.5 rounded-md bg-black/[0.04] text-[#596769] font-label-small uppercase tracking-wider text-[10px] truncate max-w-[200px]">
                      {msg.projectType}
                    </span>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-label-small font-medium uppercase tracking-wider ${
                        msg.status === 'unread'
                          ? 'bg-[#D8A9A8]/20 text-[#202526]'
                          : msg.status === 'replied'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-black/[0.04] text-[#596769]'
                      }`}
                    >
                      {msg.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Message Detail Column */}
        {selectedMessage && (
          <div className="lg:col-span-7 bg-white/90 border border-[#E5E7EB] rounded-[32px] p-6 sm:p-8 backdrop-blur-2xl flex flex-col justify-between space-y-6 shadow-[0_20px_50px_rgba(0,0,0,0.06)] relative">
            <button
              type="button"
              onClick={() => setSelectedMessage(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-black/[0.04] hover:bg-black/[0.08] text-[#596769] hover:text-[#202526] border border-[#E5E7EB] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-6">
              {/* Header */}
              <div className="border-b border-[#E5E7EB] pb-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-label-small uppercase tracking-wider font-medium bg-[#D8A9A8]/20 text-[#202526] border border-[#D8A9A8]">
                    Inbound Lead Inquiry
                  </span>
                  <span className="text-xs text-[#596769] font-strong">{selectedMessage.date}</span>
                </div>
                <h3 className="text-2xl font-praise text-[#202526] tracking-wide">
                  {selectedMessage.name}
                </h3>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-[#596769]">
                  <a
                    href={`mailto:${selectedMessage.email}`}
                    className="text-[#D8A9A8] hover:underline flex items-center gap-1 font-sans-clean font-medium"
                  >
                    <Mail className="w-3 h-3" /> {selectedMessage.email}
                  </a>
                  {selectedMessage.company && (
                    <span className="flex items-center gap-1">
                      <Building className="w-3 h-3 text-[#596769]" /> {selectedMessage.company}
                    </span>
                  )}
                </div>
              </div>

              {/* Project Scope & Budget Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB]">
                  <span className="text-[10px] font-label-small uppercase text-[#596769] tracking-wider flex items-center gap-1 mb-1.5">
                    <Briefcase className="w-3 h-3 text-[#D8A9A8]" /> Requested Service Scope
                  </span>
                  <div className="text-sm font-strong text-[#202526]">
                    {selectedMessage.projectType}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB]">
                  <span className="text-[10px] font-label-small uppercase text-[#596769] tracking-wider flex items-center gap-1 mb-1.5">
                    <DollarSign className="w-3 h-3 text-emerald-600" /> Target Budget
                  </span>
                  <div className="text-sm font-strong text-emerald-700">
                    {selectedMessage.budget}
                  </div>
                </div>
              </div>

              {/* Full Message Body */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB] space-y-2">
                <span className="text-[10px] font-label-small uppercase text-[#596769] tracking-wider">
                  Client Brief &amp; Project Description
                </span>
                <p className="text-sm text-[#202526] leading-relaxed whitespace-pre-wrap font-sans-clean">
                  {selectedMessage.message}
                </p>
              </div>
            </div>

            {/* Footer Quick Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#596769] uppercase tracking-wider font-label-small font-medium">
                  Status:
                </span>
                <select
                  value={selectedMessage.status}
                  onChange={(e) =>
                    handleStatusChange(selectedMessage.id, e.target.value as PublicMessage['status'])
                  }
                  className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-3 py-1.5 text-xs text-[#202526] focus:outline-none focus:border-[#D8A9A8]"
                >
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleDelete(selectedMessage.id, selectedMessage.name)}
                  className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                  title="Delete message"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <a
                  href={`mailto:${selectedMessage.email}?subject=RE: ${encodeURIComponent(
                    selectedMessage.projectType
                  )} - AI Build Studio&body=Hi ${encodeURIComponent(
                    selectedMessage.name
                  )},\n\nThank you for reaching out to AI Build regarding your project.`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => handleStatusChange(selectedMessage.id, 'replied')}
                  className="px-6 py-3 rounded-full bg-[#202526] hover:bg-[#111314] text-white text-xs font-btn font-medium uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-all"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Reply via Email
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
