/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Star,
  Plus,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  X,
  Sparkles,
  AlertCircle,
  Filter,
  Check,
  RotateCcw,
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext.tsx';
import { Review } from '../../utils/portfolio.ts';

type FilterStatus = 'all' | 'pending' | 'approved';

export const ReviewsManager: React.FC = () => {
  const { data, addReview, updateReview, verifyReview, deleteReview } = usePortfolio();

  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form state for edit/create modal
  const [formData, setFormData] = useState<Omit<Review, 'id' | 'date'>>({
    name: '',
    role: '',
    company: '',
    category: 'Web Development',
    rating: 5,
    content: '',
    verified: true,
    status: 'approved',
  });

  const reviews = data.reviews || [];

  const pendingCount = reviews.filter((r) => r.status === 'pending').length;
  const approvedCount = reviews.filter((r) => r.status !== 'pending').length;

  const filteredReviews = reviews.filter((r) => {
    const isPending = r.status === 'pending';
    if (statusFilter === 'pending' && !isPending) return false;
    if (statusFilter === 'approved' && isPending) return false;
    if (categoryFilter !== 'All' && r.category !== categoryFilter) return false;
    return true;
  });

  const handleOpenCreate = () => {
    setIsCreating(true);
    setEditingReview(null);
    setFormData({
      name: '',
      role: 'Client',
      company: '',
      category: 'Web Development',
      rating: 5,
      content: '',
      verified: true,
      status: 'approved',
    });
  };

  const handleOpenEdit = (review: Review) => {
    setIsCreating(false);
    setEditingReview(review);
    setFormData({
      name: review.name,
      role: review.role,
      company: review.company || '',
      category: review.category,
      rating: review.rating,
      content: review.content,
      verified: review.verified ?? true,
      status: review.status || 'approved',
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.content.trim()) return;

    if (isCreating) {
      addReview({
        ...formData,
        date: 'Today',
      });
      setIsCreating(false);
    } else if (editingReview) {
      updateReview(editingReview.id, {
        ...formData,
      });
      setEditingReview(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-medium text-white">Client Reviews & Moderation</h3>
            {pendingCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                <Clock className="w-3 h-3" />
                {pendingCount} Pending Verification
              </span>
            )}
          </div>
          <p className="text-xs text-muted">
            All visitor reviews require verification before appearing live on the website. You can edit, approve, or add official reviews here.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="liquid-glass-button px-4 py-2 rounded-xl text-xs font-mono text-white flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-lg shrink-0"
        >
          <Plus className="w-4 h-4 text-sky-400" />
          <span>Add Official Review</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="liquid-glass rounded-2xl p-4 border border-white/10">
          <div className="text-[11px] font-mono text-muted">Total Reviews</div>
          <div className="text-2xl font-display font-medium text-white mt-1">{reviews.length}</div>
        </div>

        <div className={`liquid-glass rounded-2xl p-4 border transition-all ${
          pendingCount > 0 ? 'border-amber-500/40 bg-amber-500/[0.05]' : 'border-white/10'
        }`}>
          <div className="text-[11px] font-mono text-amber-400 flex items-center justify-between">
            <span>Pending Review</span>
            {pendingCount > 0 && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />}
          </div>
          <div className="text-2xl font-display font-medium text-amber-300 mt-1">{pendingCount}</div>
        </div>

        <div className="liquid-glass rounded-2xl p-4 border border-white/10">
          <div className="text-[11px] font-mono text-emerald-400">Live & Approved</div>
          <div className="text-2xl font-display font-medium text-emerald-300 mt-1">{approvedCount}</div>
        </div>

        <div className="liquid-glass rounded-2xl p-4 border border-white/10">
          <div className="text-[11px] font-mono text-sky-400">Avg Rating</div>
          <div className="text-2xl font-display font-medium text-white mt-1 flex items-center gap-1.5">
            <span>
              {reviews.length > 0
                ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                : '5.0'}
            </span>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400 inline" />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl liquid-glass-subtle border border-white/10">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`text-xs font-mono px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
              statusFilter === 'all'
                ? 'liquid-glass-pill-active text-white font-medium'
                : 'text-muted hover:text-white'
            }`}
          >
            All ({reviews.length})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('pending')}
            className={`text-xs font-mono px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'pending'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-medium'
                : 'text-amber-400/70 hover:text-amber-300'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending ({pendingCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('approved')}
            className={`text-xs font-mono px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'approved'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-medium'
                : 'text-emerald-400/70 hover:text-emerald-300'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Live ({approvedCount})</span>
          </button>
        </div>

        {/* Category selector */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-muted hidden sm:inline">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="liquid-glass-input rounded-xl px-2.5 py-1 text-xs text-text-primary focus:outline-none cursor-pointer"
          >
            <option value="All" className="bg-[#12141a] text-white">All Services</option>
            <option value="Web Development" className="bg-[#12141a] text-white">Web Development</option>
            <option value="AI Videos" className="bg-[#12141a] text-white">AI Videos</option>
            <option value="UGC Videos" className="bg-[#12141a] text-white">UGC Videos</option>
            <option value="E-books" className="bg-[#12141a] text-white">E-books</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {filteredReviews.length === 0 ? (
          <div className="p-8 text-center rounded-2xl liquid-glass border border-white/10 text-muted font-mono text-xs">
            No reviews match the current filter.
          </div>
        ) : (
          filteredReviews.map((review) => {
            const isPending = review.status === 'pending';

            return (
              <div
                key={review.id}
                className={`p-4 sm:p-5 rounded-2xl liquid-glass border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isPending
                    ? 'border-amber-500/40 bg-amber-500/[0.03] shadow-[0_0_15px_rgba(245,158,11,0.08)]'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                {/* Left Content */}
                <div className="space-y-2 max-w-2xl">
                  {/* Badges row */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Status Badge */}
                    {isPending ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        Pending Verification
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <Check className="w-3 h-3" />
                        Verified & Live
                      </span>
                    )}

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full liquid-glass-subtle text-sky-300 border border-sky-400/20">
                      {review.category}
                    </span>

                    {/* Stars */}
                    <div className="flex items-center gap-0.5 ml-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-white/20'
                          }`}
                        />
                      ))}
                    </div>

                    <span className="text-[11px] font-mono text-muted ml-auto sm:ml-2">
                      {review.date}
                    </span>
                  </div>

                  {/* Review Text */}
                  <p className="text-sm text-text-primary leading-relaxed font-sans">
                    "{review.content}"
                  </p>

                  {/* Reviewer details */}
                  <div className="flex items-center gap-2 text-xs font-mono text-muted">
                    <span className="text-white font-medium">{review.name}</span>
                    <span>•</span>
                    <span>{review.role}{review.company ? ` @ ${review.company}` : ''}</span>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
                  {/* Approve / Verify Button */}
                  {isPending ? (
                    <button
                      type="button"
                      onClick={() => verifyReview(review.id, true)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-md"
                      title="Verify and make live on website"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verify & Publish</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => verifyReview(review.id, false)}
                      className="px-3 py-1.5 rounded-xl liquid-glass text-muted hover:text-amber-300 text-xs font-mono flex items-center gap-1 cursor-pointer transition-colors"
                      title="Unpublish (move to pending)"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span className="hidden md:inline">Unpublish</span>
                    </button>
                  )}

                  {/* Edit Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(review)}
                    className="p-2 rounded-xl liquid-glass text-muted hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    title="Edit review details"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Delete review from "${review.name}"?`)) {
                        deleteReview(review.id);
                      }
                    }}
                    className="p-2 rounded-xl liquid-glass text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Delete review"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit / Create Modal */}
      {(isCreating || editingReview) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
          <div className="liquid-glass-modal rounded-3xl max-w-lg w-full p-6 space-y-4 border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <h4 className="text-base font-medium text-white">
                  {isCreating ? 'Add Official Client Review' : 'Edit Review & Details'}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingReview(null);
                }}
                className="text-white/60 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs font-sans">
              {/* Rating stars picker */}
              <div>
                <label className="font-mono text-muted block mb-1">Star Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="cursor-pointer p-0.5 transition-transform hover:scale-125"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= formData.rating
                            ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]'
                            : 'text-white/20'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="font-mono text-amber-300 ml-2">{formData.rating} Stars</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-muted block mb-1">Client Name *</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full liquid-glass-input rounded-xl px-3 py-2 text-text-primary focus:outline-none"
                    placeholder="e.g. Alex Morgan"
                  />
                </div>

                <div>
                  <label className="font-mono text-muted block mb-1">Role / Title</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full liquid-glass-input rounded-xl px-3 py-2 text-text-primary focus:outline-none"
                    placeholder="e.g. VP Marketing"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-muted block mb-1">Company / Brand</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full liquid-glass-input rounded-xl px-3 py-2 text-text-primary focus:outline-none"
                    placeholder="e.g. Zenith Media"
                  />
                </div>

                <div>
                  <label className="font-mono text-muted block mb-1">Service Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full liquid-glass-input rounded-xl px-3 py-2 text-text-primary focus:outline-none cursor-pointer"
                  >
                    <option value="Web Development" className="bg-[#12141a] text-white">Web Development</option>
                    <option value="AI Videos" className="bg-[#12141a] text-white">AI Videos</option>
                    <option value="UGC Videos" className="bg-[#12141a] text-white">UGC Videos</option>
                    <option value="E-books" className="bg-[#12141a] text-white">E-books</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-mono text-muted block mb-1">Review Content *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full liquid-glass-input rounded-xl px-3 py-2 text-text-primary focus:outline-none resize-none leading-relaxed"
                  placeholder="Review comments and testimonials..."
                />
              </div>

              {/* Status and Verification Toggles */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl liquid-glass-subtle">
                <div>
                  <label className="font-mono text-muted block mb-1">Publishing Status</label>
                  <select
                    value={formData.status || 'approved'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full liquid-glass-input rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none cursor-pointer"
                  >
                    <option value="approved" className="bg-[#12141a] text-white">✓ Approved (Live on Site)</option>
                    <option value="pending" className="bg-[#12141a] text-white">⏳ Pending (Hidden from Site)</option>
                  </select>
                </div>

                <div>
                  <label className="font-mono text-muted block mb-1">Verified Client Badge</label>
                  <label className="inline-flex items-center gap-2 mt-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.verified !== false}
                      onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                      className="rounded accent-sky-400 cursor-pointer"
                    />
                    <span className="text-white text-xs">Show Verified checkmark</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingReview(null);
                  }}
                  className="px-4 py-2 rounded-xl liquid-glass text-muted hover:text-white font-mono text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl liquid-glass-button text-white font-mono text-xs cursor-pointer flex items-center gap-1.5 shadow-lg"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isCreating ? 'Save & Add Review' : 'Update Review'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
