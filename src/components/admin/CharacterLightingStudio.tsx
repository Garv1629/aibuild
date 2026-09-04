import React, { useState } from 'react';
import {
  Sun,
  Sparkles,
  Zap,
  RotateCcw,
  Check,
  Eye,
  Flame,
  Layers,
  Sliders,
  ShieldAlert,
  Moon,
  Sunrise,
  Activity,
  Gauge,
} from 'lucide-react';
import {
  CharacterLightingSettings,
  CharacterLightingPresetId,
  CharacterLightingPreset,
} from '../../types';
import {
  LIGHTING_PRESETS,
  LIGHTING_PRESET_LIST,
  getLightingPreset,
  DEFAULT_LIGHTING_PRESET,
} from '../../utils/lightingPresets';
import { playStudioChime } from '../../services/adminStore';

interface CharacterLightingStudioProps {
  settings?: CharacterLightingSettings;
  portraitUrl?: string;
  onChange: (updated: CharacterLightingSettings) => void;
}

export const CharacterLightingStudio: React.FC<CharacterLightingStudioProps> = ({
  settings = {
    activePreset: DEFAULT_LIGHTING_PRESET,
    customIntensity: 1.0,
    rimLightBoost: 1.0,
    enableSpecularHotspot: true,
    enableFresnelRim: true,
    enablePerformanceMode: true,
    performanceModeBehavior: 'adaptive',
  },
  portraitUrl = 'https://shrug-person-78902957.figma.site/_components/v2/d24c01ad3a56fc65e942a1f501eb73db42d7cf9a/Rectangle_40443.81459862.png',
  onChange,
}) => {
  const safePortraitUrl =
    (portraitUrl && portraitUrl.trim()) ||
    'https://shrug-person-78902957.figma.site/_components/v2/d24c01ad3a56fc65e942a1f501eb73db42d7cf9a/Rectangle_40443.81459862.png';

  const currentPresetId = settings.activePreset || DEFAULT_LIGHTING_PRESET;
  const currentConfig = getLightingPreset(currentPresetId);

  // Interactive mouse reflection preview coordinates
  const [mousePos, setMousePos] = useState({ x: 50, y: 35 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setMousePos({ x, y });
  };

  const handleSelectPreset = (presetId: CharacterLightingPresetId) => {
    playStudioChime('click');
    onChange({
      ...settings,
      activePreset: presetId,
    });
  };

  const handleIntensityChange = (val: number) => {
    onChange({
      ...settings,
      customIntensity: val,
    });
  };

  const handleRimBoostChange = (val: number) => {
    onChange({
      ...settings,
      rimLightBoost: val,
    });
  };

  const handleToggleSpecular = () => {
    playStudioChime('click');
    onChange({
      ...settings,
      enableSpecularHotspot: !settings.enableSpecularHotspot,
    });
  };

  const handleToggleRim = () => {
    playStudioChime('click');
    onChange({
      ...settings,
      enableFresnelRim: !settings.enableFresnelRim,
    });
  };

  const handleTogglePerformanceMode = () => {
    playStudioChime('click');
    onChange({
      ...settings,
      enablePerformanceMode: !settings.enablePerformanceMode,
    });
  };

  const handleChangePerfBehavior = (behavior: 'adaptive' | 'always' | 'off') => {
    playStudioChime('click');
    onChange({
      ...settings,
      performanceModeBehavior: behavior,
      enablePerformanceMode: behavior !== 'off',
    });
  };

  const handleResetToPresetDefault = () => {
    playStudioChime('click');
    onChange({
      activePreset: currentPresetId,
      customIntensity: currentConfig.baseIntensity,
      rimLightBoost: 1.0,
      enableSpecularHotspot: true,
      enableFresnelRim: true,
      enablePerformanceMode: true,
      performanceModeBehavior: 'adaptive',
    });
  };

  const intensityVal = settings.customIntensity ?? 1.0;
  const rimBoostVal = settings.rimLightBoost ?? 1.0;
  const enableSpecular = settings.enableSpecularHotspot !== false;
  const enableRim = settings.enableFresnelRim !== false;
  const perfBehavior = settings.performanceModeBehavior || (settings.enablePerformanceMode !== false ? 'adaptive' : 'off');

  return (
    <div className="space-y-8 font-sans-clean">
      {/* Overview Banner */}
      <div className="bg-[#202526] text-white p-6 sm:p-7 rounded-3xl relative overflow-hidden shadow-lg border border-black/20">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-[#D8A9A8]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D8A9A8] animate-pulse" />
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#D8A9A8] font-bold">
                Studio Character Shader Engine
              </span>
            </div>
            <h4 className="text-lg sm:text-xl font-elegant font-normal tracking-wide text-white">
              3D Character Lighting Presets & Optical Shaders
            </h4>
            <p className="text-xs text-white/70 max-w-xl leading-relaxed">
              Switch between calibrated lighting profiles (Studio Soft, Cinematic Dramatic, Morning Light, Neon Cyber) to dynamically adjust real-time Key Light, Specular Hotspots, and Volumetric Fresnel Rim highlights.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
            <span
              className="w-3.5 h-3.5 rounded-full shadow-inner border border-white/30"
              style={{ backgroundColor: currentConfig.previewColors.key }}
            />
            <span className="text-xs font-mono text-white/90">
              Active: <strong className="text-[#D8A9A8]">{currentConfig.name}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Preset Selection Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs uppercase tracking-wider font-label-small font-semibold text-[#202526] flex items-center gap-1.5">
            <Sun className="w-4 h-4 text-[#D8A9A8]" />
            Choose Lighting Preset (4 Available Profiles)
          </label>
          <span className="text-xs text-[#596769]">
            Click any profile to instantly switch & preview
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {LIGHTING_PRESET_LIST.map((preset) => {
            const isSelected = currentPresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset.id)}
                className={`group relative p-5 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-white border-[#202526] shadow-md ring-2 ring-[#202526]/10 scale-[1.02]'
                    : 'bg-white/80 border-[#E5E7EB] hover:border-[#D8A9A8] hover:bg-white shadow-xs'
                }`}
              >
                {/* Active Pill Badge */}
                {isSelected && (
                  <div className="absolute -top-2.5 right-4 bg-[#202526] text-white px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold flex items-center gap-1 shadow-sm">
                    <Check className="w-3 h-3 text-[#D8A9A8]" /> Active
                  </div>
                )}

                <div className="space-y-3">
                  {/* Color Swatches */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 p-1 bg-black/[0.04] rounded-xl border border-black/5">
                      <div
                        className="w-4 h-4 rounded-lg shadow-xs border border-white/50"
                        style={{ backgroundColor: preset.previewColors.key }}
                        title="Key Light Tint"
                      />
                      <div
                        className="w-4 h-4 rounded-lg shadow-xs border border-white/50"
                        style={{ backgroundColor: preset.previewColors.rim }}
                        title="Rim Light Highlight"
                      />
                      <div
                        className="w-4 h-4 rounded-lg shadow-xs border border-white/50"
                        style={{ backgroundColor: preset.previewColors.ambient }}
                        title="Ambient Fill"
                      />
                    </div>

                    <span className="text-[10px] font-mono text-[#596769] uppercase tracking-wider">
                      {preset.id}
                    </span>
                  </div>

                  <div>
                    <h5 className="font-semibold text-sm text-[#202526] group-hover:text-black transition-colors">
                      {preset.name}
                    </h5>
                    <p className="text-xs text-[#596769] mt-1 leading-snug">
                      {preset.description}
                    </p>
                  </div>
                </div>

                {/* Preset specs */}
                <div className="mt-4 pt-3 border-t border-[#E5E7EB]/70 flex items-center justify-between text-[11px] text-[#596769]">
                  <span className="font-mono">Intensity: {(preset.baseIntensity * 100).toFixed(0)}%</span>
                  <span className="font-mono capitalize">{preset.blendMode}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Real-time Interactive Preview & Fine Tuning Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Fine Tuning Sliders & Switches */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-3xl border border-[#E5E7EB] shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3.5">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#D8A9A8]" />
              <h5 className="font-semibold text-sm text-[#202526]">
                Optical Shader Parameters ({currentConfig.name})
              </h5>
            </div>
            <button
              type="button"
              onClick={handleResetToPresetDefault}
              className="text-xs text-[#596769] hover:text-[#202526] flex items-center gap-1 font-medium transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Reset to Profile Defaults
            </button>
          </div>

          {/* Master Intensity */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-[#202526] flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-[#D8A9A8]" /> Key Light Master Intensity
              </span>
              <span className="font-mono font-bold text-[#202526]">
                {(intensityVal * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0.3"
              max="1.6"
              step="0.05"
              value={intensityVal}
              onChange={(e) => handleIntensityChange(parseFloat(e.target.value))}
              className="w-full accent-[#202526] cursor-pointer h-2 bg-black/[0.08] rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-[#596769] font-mono">
              <span>30% (Subtle Studio)</span>
              <span>100% (Balanced)</span>
              <span>160% (High Specular)</span>
            </div>
          </div>

          {/* Rim Light Boost */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-[#202526] flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#D8A9A8]" /> Volumetric Fresnel Rim Boost
              </span>
              <span className="font-mono font-bold text-[#202526]">
                {(rimBoostVal * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0.4"
              max="2.0"
              step="0.05"
              value={rimBoostVal}
              onChange={(e) => handleRimBoostChange(parseFloat(e.target.value))}
              className="w-full accent-[#202526] cursor-pointer h-2 bg-black/[0.08] rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-[#596769] font-mono">
              <span>40% (Soft Edge)</span>
              <span>100% (Natural Contour)</span>
              <span>200% (Intense Halo)</span>
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Specular Hotspot */}
            <div
              onClick={handleToggleSpecular}
              className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between ${
                enableSpecular
                  ? 'bg-black/[0.02] border-[#202526]'
                  : 'bg-white border-[#E5E7EB] opacity-60'
              }`}
            >
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-[#202526] block">
                  Ray-traced Hotspot
                </span>
                <span className="text-[11px] text-[#596769] block">
                  Interactive specular sheen
                </span>
              </div>
              <div
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  enableSpecular ? 'bg-[#202526]' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    enableSpecular ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>
            </div>

            {/* Fresnel Edge Rim Lighting */}
            <div
              onClick={handleToggleRim}
              className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between ${
                enableRim
                  ? 'bg-black/[0.02] border-[#202526]'
                  : 'bg-white border-[#E5E7EB] opacity-60'
              }`}
            >
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-[#202526] block">
                  Fresnel Edge Rim
                </span>
                <span className="text-[11px] text-[#596769] block">
                  Volumetric 3D outline
                </span>
              </div>
              <div
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  enableRim ? 'bg-[#202526]' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    enableRim ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>
            </div>

            {/* Performance Mode & Adaptive Scroll LOD */}
            <div className="p-4 rounded-2xl border border-[#E5E7EB] bg-black/[0.02] space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-[#202526] flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-[#D8A9A8]" />
                    Performance Scroll Mode
                  </span>
                  <span className="text-[11px] text-[#596769] block">
                    Switches to lower-fidelity LOD & reduces AO on active scroll
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'adaptive', label: 'Adaptive', icon: Zap, desc: 'Auto on scroll' },
                  { id: 'always', label: 'Always LOD', icon: Gauge, desc: 'Maximum speed' },
                  { id: 'off', label: 'High Quality', icon: Sparkles, desc: 'Always full passes' },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = perfBehavior === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleChangePerfBehavior(item.id as 'adaptive' | 'always' | 'off')}
                      className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#202526] text-white border-[#202526] shadow-xs'
                          : 'bg-white text-[#596769] border-[#E5E7EB] hover:text-[#202526] hover:bg-black/[0.03]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Icon className="w-3.5 h-3.5" />
                        {isSelected && <Check className="w-3 h-3 text-emerald-400" />}
                      </div>
                      <span className="text-[11px] font-semibold">{item.label}</span>
                      <span className={`text-[9px] ${isSelected ? 'text-white/70' : 'text-[#8A9A9C]'}`}>
                        {item.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Live Interactive Preview Card */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-[#E5E7EB] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
            <div className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-[#D8A9A8]" />
              <h5 className="font-semibold text-xs uppercase tracking-wider text-[#202526]">
                Interactive 3D Shader Sandbox
              </h5>
            </div>
            <span className="text-[10px] font-mono text-[#596769] bg-black/[0.04] px-2 py-0.5 rounded-md">
              Move cursor over character
            </span>
          </div>

          {/* Interactive Character Canvas Preview */}
          <div
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
              setIsHovered(false);
              setMousePos({ x: 50, y: 35 });
            }}
            className="relative h-72 sm:h-80 w-full rounded-2xl bg-gradient-to-b from-[#F9FAFB] to-[#ECEEF0] border border-[#E5E7EB] flex items-center justify-center overflow-hidden cursor-crosshair group shadow-inner"
          >
            {/* Background Studio Light Disc */}
            <div
              className="absolute w-44 h-44 rounded-full blur-2xl opacity-50 transition-all duration-300"
              style={{
                backgroundColor: currentConfig.previewColors.key,
                left: `calc(${mousePos.x}% - 88px)`,
                top: `calc(${mousePos.y}% - 88px)`,
              }}
            />

            {/* Character Image & Masked Lighting */}
            <div
              className="relative w-48 h-auto max-h-[85%] flex items-center justify-center"
              style={{
                isolation: 'isolate',
                transform: isHovered
                  ? `perspective(800px) rotateY(${(mousePos.x - 50) * 0.25}deg) rotateX(${-(mousePos.y - 50) * 0.25}deg)`
                  : 'none',
                transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <img
                src={safePortraitUrl}
                alt="Character Lighting Preview"
                className="w-full h-auto object-contain drop-shadow-xl select-none pointer-events-none block"
              />

              {/* Masked Lighting Group */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  WebkitMaskImage: `url("${safePortraitUrl}")`,
                  maskImage: `url("${safePortraitUrl}")`,
                  WebkitMaskSize: 'contain',
                  maskSize: 'contain',
                  WebkitMaskRepeat: 'no-repeat',
                  maskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center',
                  maskPosition: 'center',
                  isolation: 'isolate',
                }}
              >
                {/* 1. Dynamic Key Light Layer */}
                <div
                  className="absolute inset-0 pointer-events-none transition-all duration-150"
                  style={{
                    background: `radial-gradient(ellipse 90% 80% at ${mousePos.x}% ${mousePos.y}%, ${currentConfig.keyLightRgba.replace('0.45', `${0.45 * intensityVal}`)} 0%, ${currentConfig.keyLightAccentRgba.replace('0.28', `${0.28 * intensityVal}`)} 35%, ${currentConfig.diffuseRgba} 65%, transparent 100%)`,
                    mixBlendMode: currentConfig.blendMode || 'soft-light',
                    opacity: isHovered ? 0.95 : 0.65,
                  }}
                />

                {/* 2. Interactive Specular Hotspot */}
                {enableSpecular && (
                  <div
                    className="absolute inset-0 pointer-events-none transition-all duration-150"
                    style={{
                      background: `radial-gradient(circle 120px at ${mousePos.x}% ${mousePos.y}%, ${currentConfig.keyLightRgba.replace('0.45', `${0.85 * intensityVal}`)} 0%, ${currentConfig.keyLightAccentRgba.replace('0.28', `${0.45 * intensityVal}`)} 40%, transparent 100%)`,
                      mixBlendMode: 'overlay',
                      opacity: isHovered ? 0.9 : 0.5,
                    }}
                  />
                )}

                {/* 3. Fresnel Edge Rim */}
                {enableRim && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: `linear-gradient(135deg, ${currentConfig.rimLightRgba.replace('0.45', `${0.45 * rimBoostVal}`)} 0%, ${currentConfig.rimLightAccentRgba.replace('0.2', `${0.2 * rimBoostVal}`)} 25%, transparent 50%, ${currentConfig.rimLightAccentRgba.replace('0.2', `${0.25 * rimBoostVal}`)} 80%, ${currentConfig.rimLightRgba.replace('0.45', `${0.4 * rimBoostVal}`)} 100%)`,
                      mixBlendMode: 'screen',
                      opacity: intensityVal * 0.9,
                    }}
                  />
                )}
              </div>
            </div>

            {/* Position indicator */}
            <div className="absolute bottom-2 right-2 bg-black/75 text-white/90 text-[9px] font-mono px-2 py-0.5 rounded-md backdrop-blur-xs">
              Cursor Light: {mousePos.x.toFixed(0)}%, {mousePos.y.toFixed(0)}%
            </div>
          </div>

          <div className="text-[11px] text-[#596769] space-y-1">
            <p className="flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              Real-time sync to all visitor screens when saved.
            </p>
            <p className="flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              Seamless blend with light/dark ambient sections.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
