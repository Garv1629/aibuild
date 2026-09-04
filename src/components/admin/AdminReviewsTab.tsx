import React, { useState } from 'react';
import { PublicReview } from '../../types';
import { adminStore } from '../../services/adminStore';
import { MediaUploader } from './MediaUploader';
import {
  Star,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  Clock,
  X,
  Check,
  Search,
  Award,
  Filter,
  Upload,
} from 'lucide-react';

interface AdminReviewsTabProps {
  reviews: PublicReview[];
}

export const AdminReviewsTab: React.FC<AdminReviewsTabProps> = ({ reviews }) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'pending' | 'featured'>('all');
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<PublicReview | null>(null);

  const [formData, setFormData] = useState<Omit<PublicReview, 'id' | 'date'>>({
    author: '',
    role: '',
    company: '',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    comment: '',
    status: 'approved',
    isFeatured: false,
    projectReferenced: '',
  });

  const stats = adminStore.getAverageRating();

  const filteredReviews = reviews.filter((r) => {
    if (filterStatus === 'approved' && r.status !== 'approved') return false;
    if (filterStatus === 'pending' && r.status !== 'pending') return false;
    if (filterStatus === 'featured' && !r.isFeatured) return false;
    if (ratingFilter !== 'all' && r.rating !== ratingFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        r.author.toLowerCase().includes(q) ||
        r.company.toLowerCase().includes(q) ||
        r.comment.toLowerCase().includes(q) ||
        (r.role && r.role.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const openNewReview = () => {
    setEditingReview(null);
    setFormData({
      author: '',
      role: 'Founder & CEO',
      company: '',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      rating: 5,
      comment: '',
      status: 'approved',
      isFeatured: true,
      projectReferenced: 'AI Product Build',
    });
    setIsModalOpen(true);
  };

  const openEditReview = (r: PublicReview) => {
    setEditingReview(r);
    setFormData({
      author: r.author,
      role: r.role,
      company: r.company,
      avatar: r.avatar,
      rating: r.rating,
      comment: r.comment,
      status: r.status,
      isFeatured: r.isFeatured,
      projectReferenced: r.projectReferenced || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingReview) {
      adminStore.updateReview(editingReview.id, formData);
    } else {
      adminStore.addReview(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, author: string) => {
    if (window.confirm(`Delete review from "${author}"?`)) {
      adminStore.deleteReview(id);
    }
  };

  const toggleStatus = (r: PublicReview) => {
    const nextStatus = r.status === 'approved' ? 'pending' : 'approved';
    adminStore.updateReview(r.id, { status: nextStatus });
  };

  const toggleFeatured = (r: PublicReview) => {
    adminStore.updateReview(r.id, { isFeatured: !r.isFeatured });
  };

  return (
    <div className="space-y-8">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 bg-white/85 p-6 sm:p-7 rounded-[32px] border border-[#E5E7EB] backdrop-blur-2xl shadow-[0_15px_40px_rgba(0,0,0,0.04)]">
        <div>
          <div className="flex items-center gap-2 text-xs font-label-small uppercase tracking-[0.14em] text-[#D8A9A8] font-medium mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Client Reviews, Ratings &amp; Testimonials
          </div>
          <h2 className="text-2xl sm:text-3xl font-elegant font-normal text-[#202526] tracking-wide">
            Public Reviews &amp; Rating Feed
          </h2>
          <p className="text-xs sm:text-[13px] text-[#596769] mt-1.5 max-w-xl leading-relaxed font-sans-clean">
            Monitor incoming client feedback, track satisfaction ratings, approve reviews for the live website, and curate featured testimonials.
          </p>
        </div>
        <button
          type="button"
          onClick={openNewReview}
          className="px-5 py-3 rounded-full bg-[#202526] hover:bg-[#111314] text-white text-xs font-btn font-medium uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add Client Review
        </button>
      </div>

      {/* Ratings Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Big Rating Card */}
        <div className="bg-white/85 border border-[#E5E7EB] rounded-[28px] p-6 backdrop-blur-2xl flex flex-col justify-between shadow-[0_15px_40px_rgba(0,0,0,0.04)]">
          <span className="text-xs uppercase font-label-small tracking-[0.14em] text-[#596769] font-medium">
            Overall Client Rating
          </span>
          <div className="flex items-baseline gap-3 my-3">
            <span className="text-5xl font-strong font-normal text-[#202526] tracking-tight">{stats.average}</span>
            <span className="text-sm font-label-small text-[#D8A9A8]">/ 5.0</span>
          </div>
          <div className="flex items-center gap-1 text-amber-500">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-5 h-5 ${
                  s <= Math.round(stats.average) ? 'fill-amber-400 text-amber-500' : 'text-black/10'
                }`}
              />
            ))}
            <span className="text-xs font-sans-clean text-[#596769] ml-2">
              Based on {stats.count} verified reviews
            </span>
          </div>
        </div>

        {/* 5-Star Breakdown */}
        <div className="md:col-span-2 bg-white/85 border border-[#E5E7EB] rounded-[28px] p-6 backdrop-blur-2xl flex flex-col justify-center space-y-2.5 shadow-[0_15px_40px_rgba(0,0,0,0.04)]">
          <span className="text-xs uppercase font-label-small tracking-[0.14em] text-[#596769] font-medium mb-1">
            Rating Distribution
          </span>
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = stats.breakdown[stars] || 0;
            const pct = stats.count > 0 ? (count / stats.count) * 100 : 0;
            return (
              <div key={stars} className="flex items-center gap-3 text-xs font-sans-clean">
                <span className="w-12 text-[#202526] flex items-center gap-1 shrink-0 font-strong">
                  {stars} <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                </span>
                <div className="flex-1 h-2 rounded-full bg-black/[0.06] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#D8A9A8] to-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-10 text-right text-[#596769] text-[11px] font-strong">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/80 p-3.5 rounded-2xl border border-[#E5E7EB] shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5 font-sans-clean">
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-btn font-medium uppercase tracking-wider transition-all cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-[#202526] text-white shadow-xs'
                : 'text-[#596769] hover:text-[#202526] hover:bg-black/[0.04]'
            }`}
          >
            All ({reviews.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('approved')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-btn font-medium uppercase tracking-wider transition-all cursor-pointer ${
              filterStatus === 'approved'
                ? 'bg-[#202526] text-white shadow-xs'
                : 'text-[#596769] hover:text-[#202526] hover:bg-black/[0.04]'
            }`}
          >
            Approved ({reviews.filter((r) => r.status === 'approved').length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('pending')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-btn font-medium uppercase tracking-wider transition-all cursor-pointer ${
              filterStatus === 'pending'
                ? 'bg-[#202526] text-white shadow-xs'
                : 'text-[#596769] hover:text-[#202526] hover:bg-black/[0.04]'
            }`}
          >
            Pending ({reviews.filter((r) => r.status === 'pending').length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('featured')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-btn font-medium uppercase tracking-wider transition-all cursor-pointer ${
              filterStatus === 'featured'
                ? 'bg-[#202526] text-white shadow-xs'
                : 'text-[#596769] hover:text-[#202526] hover:bg-black/[0.04]'
            }`}
          >
            Featured ({reviews.filter((r) => r.isFeatured).length})
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-[#596769] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search author, company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl pl-9 pr-3.5 py-2 text-xs text-[#202526] placeholder:text-[#596769]/50 focus:outline-none focus:border-[#D8A9A8] focus:bg-white"
          />
        </div>
      </div>

      {/* Reviews List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans-clean">
        {filteredReviews.length === 0 ? (
          <div className="md:col-span-2 p-16 text-center bg-white/60 rounded-[28px] border border-dashed border-[#E5E7EB] text-[#596769]">
            No reviews match your filters.
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white/85 border border-[#E5E7EB] hover:border-[#D8A9A8] rounded-[28px] p-6 backdrop-blur-2xl flex flex-col justify-between gap-4 group transition-all shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_35px_rgba(0,0,0,0.06)]"
            >
              {/* Header */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-3.5">
                  <div className="flex items-center gap-3">
                    {rev.avatar && rev.avatar.trim() ? (
                      <img
                        src={rev.avatar}
                        alt={rev.author}
                        className="w-12 h-12 rounded-full object-cover border border-[#E5E7EB] shadow-xs"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#CBDCDE] border border-[#E5E7EB] shadow-xs flex items-center justify-center text-sm font-strong text-[#202526]">
                        {rev.author ? rev.author.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                    <div>
                      <h4 className="text-base font-praise font-normal text-[#202526] tracking-wide">{rev.author}</h4>
                      <p className="text-xs text-[#596769]">
                        {rev.role} &bull; <span className="text-[#D8A9A8] font-medium">{rev.company}</span>
                      </p>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= rev.rating ? 'fill-amber-400 text-amber-500' : 'text-black/10'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Comment Text */}
                <p className="text-xs sm:text-[13px] text-[#596769] leading-relaxed italic bg-[#F8F9FA] p-4 rounded-2xl border border-[#E5E7EB]">
                  &ldquo;{rev.comment}&rdquo;
                </p>

                {rev.projectReferenced && (
                  <div className="mt-3 text-xs font-label-small uppercase tracking-wider text-[#D8A9A8] flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-[#D8A9A8]" /> Project: {rev.projectReferenced}
                  </div>
                )}
              </div>

              {/* Footer Controls */}
              <div className="flex items-center justify-between pt-3.5 border-t border-[#E5E7EB] text-xs">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleStatus(rev)}
                    className={`px-3 py-1 rounded-full text-[10px] font-label-small font-medium uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors ${
                      rev.status === 'approved'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {rev.status === 'approved' ? (
                      <>
                        <CheckCircle className="w-3 h-3" /> Live on Site
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3" /> Pending Review
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleFeatured(rev)}
                    className={`p-1.5 rounded-full border text-[10px] cursor-pointer transition-colors ${
                      rev.isFeatured
                        ? 'bg-[#D8A9A8]/20 text-[#202526] border-[#D8A9A8]'
                        : 'bg-black/[0.03] text-[#596769] border-[#E5E7EB] hover:text-[#202526]'
                    }`}
                    title={rev.isFeatured ? 'Featured on Homepage' : 'Mark as Featured'}
                  >
                    <Award className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-[#596769] font-strong mr-2">{rev.date}</span>
                  <button
                    type="button"
                    onClick={() => openEditReview(rev)}
                    className="p-2 rounded-xl bg-black/[0.03] hover:bg-black/[0.07] text-[#596769] hover:text-[#202526] border border-[#E5E7EB] transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(rev.id, rev.author)}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Review Edit / Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto font-sans-clean">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-md"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative w-full max-w-xl bg-white/95 border border-[#E5E7EB] rounded-[36px] p-6 sm:p-8 shadow-[0_30px_90px_rgba(0,0,0,0.15)] backdrop-blur-2xl z-10 my-8 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2.5 rounded-full bg-black/[0.04] hover:bg-black/[0.08] text-[#596769] hover:text-[#202526] border border-[#E5E7EB] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-6">
              <span className="text-xs font-label-small uppercase tracking-[0.14em] text-[#D8A9A8] font-medium">
                {editingReview ? 'Client Testimonial Revision' : 'New Client Testimonial'}
              </span>
              <h3 className="text-2xl sm:text-3xl font-elegant font-normal text-[#202526] mt-1.5">
                {editingReview ? `Review: ${editingReview.author}` : 'Publish Client Review'}
              </h3>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-label-small font-medium text-[#596769] mb-1.5">
                    Client Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="e.g. Alexandre Renard"
                    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#202526] focus:outline-none focus:border-[#D8A9A8] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-label-small font-medium text-[#596769] mb-1.5">
                    Role &amp; Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g. Founder & CEO"
                    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#202526] focus:outline-none focus:border-[#D8A9A8] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-label-small font-medium text-[#596769] mb-1.5">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. HyperQuant AI"
                    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#202526] focus:outline-none focus:border-[#D8A9A8] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-label-small font-medium text-[#596769] mb-1.5">
                    Star Rating (1 to 5)
                  </label>
                  <div className="flex items-center gap-2 pt-1">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: num })}
                        className={`p-2 rounded-xl border transition-all cursor-pointer ${
                          formData.rating >= num
                            ? 'bg-amber-100 border-amber-400 text-amber-600'
                            : 'bg-black/[0.03] border-[#E5E7EB] text-black/20'
                        }`}
                      >
                        <Star className="w-5 h-5 fill-current" />
                      </button>
                    ))}
                    <span className="text-xs font-strong text-amber-600 ml-1">
                      {formData.rating} / 5
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <MediaUploader
                  label="Upload Client Avatar Photo"
                  acceptType="image"
                  value={formData.avatar}
                  onChange={(val) => setFormData({ ...formData, avatar: val })}
                  helperText="Upload profile photo or company representative avatar"
                  previewHeight="h-24"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-label-small font-medium text-[#596769] mb-1.5">
                  Client Testimonial / Feedback
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  placeholder="The speed and visual fidelity produced by AI Build is extraordinary..."
                  className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#202526] resize-none focus:outline-none focus:border-[#D8A9A8] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-label-small font-medium text-[#596769] mb-1.5">
                    Referenced Project (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.projectReferenced || ''}
                    onChange={(e) => setFormData({ ...formData, projectReferenced: e.target.value })}
                    placeholder="e.g. TrustAI India"
                    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#202526] focus:outline-none focus:border-[#D8A9A8] focus:bg-white"
                  />
                </div>
                <div className="flex items-center gap-4 pt-5">
                  <label className="text-xs text-[#202526] font-label-small font-medium uppercase tracking-wider flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    />
                    Feature on Homepage
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-[#E5E7EB] hover:bg-black/[0.04] text-xs font-btn font-medium text-[#596769] hover:text-[#202526] uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#202526] hover:bg-[#111314] text-white text-xs font-btn font-medium uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-all"
                >
                  <Check className="w-4 h-4" />
                  {editingReview ? 'Update Review' : 'Publish Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
