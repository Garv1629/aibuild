/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, Check, BookOpen, Calendar, Clock } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext.tsx';
import { JournalEntry } from '../../utils/portfolio.ts';

const SAMPLE_JOURNAL_IMAGES = [
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
];

export const JournalManager: React.FC = () => {
  const { data, addJournalEntry, updateJournalEntry, deleteJournalEntry } = usePortfolio();
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<JournalEntry>>({});

  const handleStartCreate = () => {
    const newId = `journal-${Date.now()}`;
    const initial: JournalEntry = {
      id: newId,
      title: 'New Editorial Insight & Creative Exploration',
      slug: 'new-editorial-insight',
      readTime: '4 min read',
      date: 'Oct 2026',
      image: SAMPLE_JOURNAL_IMAGES[0],
      excerpt: 'Exploring modern workflows, digital product design, and creative generation frameworks.',
      category: 'Web Development',
    };
    setFormData(initial);
    setIsCreating(true);
    setEditingEntry(null);
  };

  const handleStartEdit = (entry: JournalEntry) => {
    setFormData({ ...entry });
    setEditingEntry(entry);
    setIsCreating(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.category) return;

    if (isCreating) {
      addJournalEntry(formData as JournalEntry);
    } else if (editingEntry) {
      updateJournalEntry(editingEntry.id, formData);
    }
    setEditingEntry(null);
    setIsCreating(false);
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-2xl liquid-glass">
        <div>
          <h4 className="text-sm font-medium text-white">Journal Thoughts & Articles</h4>
          <p className="text-xs text-muted">Manage articles featured in the Journal section.</p>
        </div>

        <button
          type="button"
          onClick={handleStartCreate}
          className="liquid-glass-button bg-sky-500/25 border-sky-400/50 hover:bg-sky-500/35 text-white font-medium text-xs font-mono px-4 py-2 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_16px_rgba(56,189,248,0.3)] transition-all"
        >
          <Plus className="w-4 h-4 text-sky-300" />
          <span>Add Article</span>
        </button>
      </div>

      {/* Journal Entries List */}
      <div className="space-y-3">
        {data.journalEntries.map((entry) => (
          <div
            key={entry.id}
            className="liquid-glass-card rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/10 hover:border-white/25 transition-all group"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border border-white/15 relative bg-black/40">
                <img
                  src={entry.image}
                  alt={entry.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-sky-300">
                    {entry.category}
                  </span>
                  <span className="text-white/40 text-[10px] font-mono">• {entry.date}</span>
                  <span className="text-white/40 text-[10px] font-mono">• {entry.readTime}</span>
                </div>
                <h4 className="text-sm sm:text-base font-medium text-text-primary truncate">
                  {entry.title}
                </h4>
                <p className="text-xs text-muted line-clamp-1 mt-0.5 max-w-xl">
                  {entry.excerpt}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-0 border-white/10">
              <button
                type="button"
                onClick={() => handleStartEdit(entry)}
                className="p-2 rounded-xl liquid-glass-pill hover:bg-white/20 text-white cursor-pointer transition-colors"
                title="Edit Article"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setConfirmDeleteId(entry.id)}
                className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/20 cursor-pointer transition-colors"
                title="Delete Article"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="liquid-glass-modal rounded-2xl max-w-sm w-full p-6 text-center space-y-4">
            <h4 className="text-lg font-medium text-white">Delete Article?</h4>
            <p className="text-xs text-muted">
              Are you sure you want to remove this article from the journal list?
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 rounded-xl liquid-glass-pill text-xs font-mono text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteJournalEntry(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-mono text-white font-medium cursor-pointer shadow-lg transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Article Modal */}
      {(isCreating || editingEntry) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl overflow-y-auto">
          <div className="liquid-glass-modal rounded-3xl max-w-2xl w-full p-5 sm:p-8 space-y-6 my-auto max-h-[92vh] overflow-y-auto scrollbar-none border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-sky-400" />
                <h3 className="text-lg sm:text-xl font-medium text-white">
                  {isCreating ? 'Create Journal Article' : `Edit: ${editingEntry?.title}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingEntry(null);
                }}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-xs font-mono text-white/80 mb-1.5">Article Title</label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none"
                  placeholder="e.g. The Architecture of Viral UGC Videos"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono text-white/80 mb-1.5">Category</label>
                  <select
                    value={formData.category || 'Web Development'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full liquid-glass-input rounded-xl px-3 py-2 text-sm text-white focus:outline-none cursor-pointer bg-neutral-900"
                  >
                    <option value="Web Development">Web Development</option>
                    <option value="AI Videos">AI Videos</option>
                    <option value="UGC Videos">UGC Videos</option>
                    <option value="E-books">E-books</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-white/80 mb-1.5">Date</label>
                  <input
                    type="text"
                    value={formData.date || 'Oct 2026'}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full liquid-glass-input rounded-xl px-3 py-2 text-sm text-white focus:outline-none font-mono"
                    placeholder="e.g. Oct 2026"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-white/80 mb-1.5">Read Time</label>
                  <input
                    type="text"
                    value={formData.readTime || '4 min read'}
                    onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                    className="w-full liquid-glass-input rounded-xl px-3 py-2 text-sm text-white focus:outline-none font-mono"
                    placeholder="e.g. 5 min read"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-white/80 mb-1.5">Cover Image URL</label>
                <input
                  type="url"
                  required
                  value={formData.image || ''}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none"
                  placeholder="https://images.unsplash.com/..."
                />
                {formData.image && (
                  <div className="mt-2.5 w-full h-28 rounded-xl overflow-hidden border border-white/15">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-mono text-white/80 mb-1.5">Article Excerpt</label>
                <textarea
                  rows={3}
                  required
                  value={formData.excerpt || ''}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full liquid-glass-input rounded-xl p-3 text-xs leading-relaxed text-white focus:outline-none"
                  placeholder="Summarize key takeaway for readers..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingEntry(null);
                  }}
                  className="px-5 py-2.5 rounded-xl liquid-glass-pill text-xs font-mono text-white hover:bg-white/10 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-xs font-mono text-white font-medium cursor-pointer shadow-[0_0_20px_rgba(56,189,248,0.4)] hover:brightness-110 transition-all flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Article</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
