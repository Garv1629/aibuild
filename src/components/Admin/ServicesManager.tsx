/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Layers, Check, Edit2 } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext.tsx';
import { ServiceOffering } from '../../utils/portfolio.ts';

export const ServicesManager: React.FC = () => {
  const { data, updateService } = usePortfolio();
  const [selectedServiceId, setSelectedServiceId] = useState<string>(data.services[0]?.id || 'web-development');

  const activeService = data.services.find((s) => s.id === selectedServiceId) || data.services[0];
  const [formData, setFormData] = useState<ServiceOffering>(activeService);

  const [deliverableInput, setDeliverableInput] = useState('');
  const [toolInput, setToolInput] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // When switching service tab, update form data
  const handleSelectService = (service: ServiceOffering) => {
    setSelectedServiceId(service.id);
    setFormData({ ...service });
    setSavedSuccess(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    updateService(formData.id, formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleAddDeliverable = () => {
    const trimmed = deliverableInput.trim();
    if (!trimmed) return;
    setFormData({
      ...formData,
      deliverables: [...formData.deliverables, trimmed],
    });
    setDeliverableInput('');
  };

  const handleRemoveDeliverable = (idx: number) => {
    setFormData({
      ...formData,
      deliverables: formData.deliverables.filter((_, i) => i !== idx),
    });
  };

  const handleAddTool = () => {
    const trimmed = toolInput.trim();
    if (!trimmed) return;
    setFormData({
      ...formData,
      tools: [...formData.tools, trimmed],
    });
    setToolInput('');
  };

  const handleRemoveTool = (toolToRemove: string) => {
    setFormData({
      ...formData,
      tools: formData.tools.filter((t) => t !== toolToRemove),
    });
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="p-4 rounded-2xl liquid-glass flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-medium text-white">4 Core Offered Services</h4>
          <p className="text-xs text-muted">
            Configure deliverables, tech stacks, and tools displayed across Hero, modals, and service showcases.
          </p>
        </div>

        {savedSuccess && (
          <span className="text-xs font-mono px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 animate-pulse">
            <Check className="w-3.5 h-3.5" />
            Changes Saved!
          </span>
        )}
      </div>

      {/* Services Selector Tabs */}
      <div className="flex flex-wrap gap-2">
        {data.services.map((service) => {
          const isSelected = service.id === selectedServiceId;
          return (
            <button
              key={service.id}
              type="button"
              onClick={() => handleSelectService(service)}
              className={`px-4 py-2 rounded-xl text-xs font-mono transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                isSelected
                  ? 'liquid-glass-pill-active text-white font-semibold shadow-[0_0_16px_rgba(56,189,248,0.4)]'
                  : 'liquid-glass-pill text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{service.title}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10">
                {service.deliverables.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Service Edit Form */}
      <div className="liquid-glass rounded-3xl p-5 sm:p-7 border border-white/15">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-xs font-mono text-white/80 mb-1.5">Service Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-white/80 mb-1.5">Badge Label</label>
              <input
                type="text"
                required
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-white/80 mb-1.5">Highlight Metric / Stat Label</label>
              <input
                type="text"
                value={formData.statsLabel}
                onChange={(e) => setFormData({ ...formData, statsLabel: e.target.value })}
                className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-white/80 mb-1.5">Highlight Metric / Stat Value</label>
              <input
                type="text"
                value={formData.statsValue}
                onChange={(e) => setFormData({ ...formData, statsValue: e.target.value })}
                className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none font-mono"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-mono text-white/80 mb-1.5">Short Overview</label>
              <textarea
                rows={3}
                required
                value={formData.shortDesc}
                onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })}
                className="w-full liquid-glass-input rounded-xl p-3 text-xs leading-relaxed text-white focus:outline-none"
              />
            </div>

            {/* Tools & Tech Stack */}
            <div className="md:col-span-2">
              <label className="block text-xs font-mono text-white/80 mb-1.5">Tools & Technologies</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={toolInput}
                  onChange={(e) => setToolInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTool();
                    }
                  }}
                  className="flex-1 liquid-glass-input rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                  placeholder="Add tool (e.g. Next.js, Midjourney) and press Enter..."
                />
                <button
                  type="button"
                  onClick={handleAddTool}
                  className="px-3 py-1.5 rounded-xl liquid-glass-button text-xs font-mono text-white cursor-pointer"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {formData.tools.map((tool) => (
                  <span
                    key={tool}
                    className="inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-full bg-white/10 text-white border border-white/15"
                  >
                    {tool}
                    <button
                      type="button"
                      onClick={() => handleRemoveTool(tool)}
                      className="text-white/40 hover:text-white cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Key Deliverables */}
            <div className="md:col-span-2">
              <label className="block text-xs font-mono text-white/80 mb-1.5">Deliverables Checklist</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={deliverableInput}
                  onChange={(e) => setDeliverableInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddDeliverable();
                    }
                  }}
                  className="flex-1 liquid-glass-input rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                  placeholder="Add deliverable point and press Enter..."
                />
                <button
                  type="button"
                  onClick={handleAddDeliverable}
                  className="px-3 py-1.5 rounded-xl liquid-glass-button text-xs font-mono text-white cursor-pointer"
                >
                  Add
                </button>
              </div>

              <div className="space-y-1.5">
                {formData.deliverables.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white/90"
                  >
                    <span>✓ {item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDeliverable(idx)}
                      className="text-white/40 hover:text-red-400 cursor-pointer px-1.5"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-white/10">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-xs font-mono text-white font-medium cursor-pointer shadow-[0_0_20px_rgba(56,189,248,0.4)] hover:brightness-110 transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Save Service Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
