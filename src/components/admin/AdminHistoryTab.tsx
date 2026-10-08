import React, { useState, useEffect } from 'react';
import { adminStore, playStudioChime } from '../../services/adminStore';
import { CmsVersionItem } from '../../types';
import {
  History,
  RotateCcw,
  Sparkles,
  Eye,
  Check,
  Search,
  Calendar,
  User,
  Layers,
  FileText,
  Sliders,
  FolderKanban,
  Star,
  AlertTriangle,
  X,
  RefreshCw,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export const AdminHistoryTab: React.FC = () => {
  const [versions, setVersions] = useState<CmsVersionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectingVersion, setInspectingVersion] = useState<CmsVersionItem | null>(null);
  const [restoringVersion, setRestoringVersion] = useState<CmsVersionItem | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const data = await adminStore.getVersions(selectedType, 100);
      setVersions(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to load versions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [selectedType]);

  const handleConfirmRestore = async () => {
    if (!restoringVersion) return;
    setIsRestoring(true);
    setStatusMessage(null);
    try {
      await adminStore.restoreVersion(restoringVersion.id);
      playStudioChime('success');
      setStatusMessage({
        type: 'success',
        text: `Successfully restored Version #${restoringVersion.versionNumber} (${restoringVersion.title}). A new current version has been recorded.`,
      });
      setRestoringVersion(null);
      await fetchHistory();
      setTimeout(() => setStatusMessage(null), 5000);
    } catch (err: any) {
      playStudioChime('alert');
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to restore version.',
      });
    } finally {
      setIsRestoring(false);
    }
  };

  const filteredVersions = versions.filter((v) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      v.title.toLowerCase().includes(q) ||
      v.summary.toLowerCase().includes(q) ||
      v.author.toLowerCase().includes(q) ||
      v.entityType.toLowerCase().includes(q) ||
      `v${v.versionNumber}`.includes(q)
    );
  });

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'site_content':
      case 'services':
        return <FileText className="w-4 h-4 text-[#D8A9A8]" />;
      case 'project':
        return <FolderKanban className="w-4 h-4 text-emerald-600" />;
      case 'estimator':
        return <Sliders className="w-4 h-4 text-purple-600" />;
      case 'review':
        return <Star className="w-4 h-4 text-amber-500" />;
      default:
        return <Layers className="w-4 h-4 text-[#71717A]" />;
    }
  };

  const getEntityLabel = (type: string) => {
    switch (type) {
      case 'site_content':
        return 'Site Content & Hero';
      case 'project':
        return 'Project';
      case 'estimator':
        return 'Estimator & Rates';
      case 'review':
        return 'Review';
      case 'services':
        return 'Services';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 bg-white/85 p-6 sm:p-7 rounded-[32px] border border-[#E5E7EB] backdrop-blur-2xl shadow-[0_15px_40px_rgba(0,0,0,0.04)]">
        <div>
          <div className="flex items-center gap-2 text-xs font-label-small uppercase tracking-[0.14em] text-[#D8A9A8] font-medium mb-1.5">
            <History className="w-3.5 h-3.5" />
            Supabase Persistent Snapshots &amp; Audit Trail
          </div>
          <h2 className="text-2xl sm:text-3xl font-elegant font-normal text-[#202526] tracking-wide">
            Version History &amp; Time Travel
          </h2>
          <p className="text-xs sm:text-[13px] text-[#596769] mt-1.5 max-w-xl leading-relaxed font-sans-clean">
            Inspect previous versions of hero headlines, website content, projects, pricing tiers, and reviews. Restoring an older version creates a new current snapshot so no history is ever lost.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchHistory}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-full border border-[#E5E7EB] hover:bg-black/[0.04] text-xs font-btn font-medium text-[#202526] uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#596769] ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-label-small uppercase tracking-wider flex items-center gap-2 border shadow-xs animate-fadeIn ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-600" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-white/80 border border-[#E5E7EB] rounded-full backdrop-blur-xl overflow-x-auto shadow-xs">
          {[
            { id: 'all', label: 'All Entities' },
            { id: 'site_content', label: 'Site Content & Hero' },
            { id: 'project', label: 'Projects' },
            { id: 'estimator', label: 'Estimator & Pricing' },
            { id: 'review', label: 'Reviews' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedType(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-label-small uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                selectedType === cat.id
                  ? 'bg-[#202526] text-white shadow-xs font-semibold'
                  : 'text-[#596769] hover:text-[#202526] hover:bg-black/[0.04]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search version history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-full bg-white border border-[#E5E7EB] text-xs text-[#202526] focus:outline-none focus:border-[#202526] shadow-xs"
          />
        </div>
      </div>

      {/* Version Timeline List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-[#E5E7EB] shadow-xs">
            <RefreshCw className="w-6 h-6 text-[#D8A9A8] animate-spin mx-auto mb-3" />
            <p className="text-xs uppercase tracking-wider text-[#71717A]">Loading Version History from Database...</p>
          </div>
        ) : filteredVersions.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-[#E5E7EB] shadow-xs">
            <History className="w-8 h-8 text-[#D8A9A8] mx-auto mb-3 opacity-60" />
            <h4 className="text-base font-strong text-[#202526]">No Version History Found</h4>
            <p className="text-xs text-[#596769] mt-1 max-w-md mx-auto">
              Snapshots are automatically created whenever you save drafts, publish website content, update projects, or adjust pricing.
            </p>
          </div>
        ) : (
          filteredVersions.map((ver) => (
            <div
              key={ver.id}
              className="group bg-white/90 hover:bg-white p-5 sm:p-6 rounded-3xl border border-[#E5E7EB] hover:border-[#D8A9A8] transition-all shadow-xs hover:shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              {/* Left: Version badge, Title, and details */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB] flex flex-col items-center justify-center shrink-0 group-hover:border-[#D8A9A8] transition-colors">
                  <span className="text-xs font-mono font-bold text-[#202526]">v{ver.versionNumber}</span>
                  <span className="text-[9px] uppercase tracking-wider text-[#71717A] font-label-small">ver</span>
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F3F4F6] border border-[#E5E7EB] text-[10px] font-label-small uppercase tracking-wider text-[#202526] font-semibold">
                      {getEntityIcon(ver.entityType)}
                      {getEntityLabel(ver.entityType)}
                    </span>
                    <span className="text-[11px] text-[#71717A] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#A1A1AA]" />
                      {new Date(ver.createdAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="text-[11px] text-[#71717A] flex items-center gap-1">
                      <User className="w-3 h-3 text-[#A1A1AA]" />
                      {ver.author}
                    </span>
                  </div>

                  <h4 className="text-sm sm:text-base font-strong text-[#202526]">{ver.title}</h4>
                  <p className="text-xs text-[#596769] mt-0.5 line-clamp-2">{ver.summary}</p>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setInspectingVersion(ver)}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#F3F4F6] text-[#596769] hover:text-[#202526] border border-[#E5E7EB] text-xs font-label-small uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRestoringVersion(ver)}
                  className="px-4 py-2 rounded-xl bg-[#202526] hover:bg-[#111314] text-white text-xs font-btn font-medium uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs hover:scale-105 active:scale-95 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#D8A9A8]" />
                  <span>Restore</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Inspect Snapshot Modal */}
      {inspectingVersion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto font-sans-clean">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xl" onClick={() => setInspectingVersion(null)} />
          <div className="relative w-full max-w-3xl bg-white rounded-[32px] p-6 sm:p-8 shadow-2xl border border-[#E5E7EB] z-10 my-8 max-h-[85vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setInspectingVersion(null)}
              className="absolute top-6 right-6 p-2.5 rounded-full bg-black/[0.04] hover:bg-black/[0.08] text-[#71717A] hover:text-[#202526] border border-[#E5E7EB] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="px-3 py-1 rounded-full bg-[#F3F4F6] border border-[#E5E7EB] text-xs font-mono font-bold text-[#202526]">
                v{inspectingVersion.versionNumber}
              </div>
              <span className="text-xs font-label-small uppercase tracking-wider text-[#596769]">
                {getEntityLabel(inspectingVersion.entityType)} Snapshot
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-elegant text-[#202526] mb-1">{inspectingVersion.title}</h3>
            <p className="text-xs text-[#596769] mb-6">{inspectingVersion.summary}</p>

            <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB] overflow-x-auto font-mono text-xs text-[#202526] max-h-96">
              <pre>{JSON.stringify(inspectingVersion.content, null, 2)}</pre>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[#E5E7EB]">
              <button
                type="button"
                onClick={() => setInspectingVersion(null)}
                className="px-5 py-2.5 rounded-full border border-[#E5E7EB] hover:bg-black/[0.04] text-xs font-btn font-medium text-[#596769] hover:text-[#202526] uppercase tracking-wider cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = inspectingVersion;
                  setInspectingVersion(null);
                  setRestoringVersion(target);
                }}
                className="px-6 py-2.5 rounded-full bg-[#202526] hover:bg-[#111314] text-white text-xs font-btn font-medium uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-all"
              >
                <RotateCcw className="w-4 h-4 text-[#D8A9A8]" />
                <span>Proceed to Restore</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Confirmation Modal */}
      {restoringVersion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto font-sans-clean">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xl" onClick={() => !isRestoring && setRestoringVersion(null)} />
          <div className="relative w-full max-w-lg bg-white rounded-[32px] p-6 sm:p-8 shadow-2xl border border-[#E5E7EB] z-10 my-8">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>

            <h3 className="text-xl sm:text-2xl font-elegant text-[#202526] mb-2">
              Restore Version #{restoringVersion.versionNumber}?
            </h3>

            <p className="text-xs sm:text-[13px] text-[#596769] leading-relaxed mb-4">
              You are about to restore snapshot <strong className="text-[#202526]">&quot;{restoringVersion.title}&quot;</strong> recorded on {new Date(restoringVersion.createdAt).toLocaleDateString()}.
            </p>

            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-900 mb-6 space-y-1">
              <div className="font-strong flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" /> Safe Time Travel Guarantee
              </div>
              <p className="text-[11px] text-emerald-800 leading-normal">
                Restoring will update the active CMS data and create a <strong>new current version entry</strong>. Your intervening version history will remain 100% preserved and intact.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isRestoring}
                onClick={() => setRestoringVersion(null)}
                className="px-5 py-2.5 rounded-full border border-[#E5E7EB] hover:bg-black/[0.04] text-xs font-btn font-medium text-[#596769] hover:text-[#202526] uppercase tracking-wider cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isRestoring}
                onClick={handleConfirmRestore}
                className="px-6 py-2.5 rounded-full bg-[#202526] hover:bg-[#111314] text-white text-xs font-btn font-medium uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                <RotateCcw className={`w-4 h-4 text-[#D8A9A8] ${isRestoring ? 'animate-spin' : ''}`} />
                <span>{isRestoring ? 'Restoring Version...' : 'Confirm & Restore'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
