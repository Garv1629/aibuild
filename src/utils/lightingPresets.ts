import { CharacterLightingPreset, CharacterLightingPresetId } from '../types';

export const LIGHTING_PRESETS: Record<CharacterLightingPresetId, CharacterLightingPreset> = {
  'studio-soft': {
    id: 'studio-soft',
    name: 'Studio Soft',
    badge: 'Neutral Daylight',
    description: 'Balanced studio illumination with soft warm-pink key highlights and cool cyan edge fill.',
    previewColors: {
      key: '#FFFFFF',
      rim: '#D8A9A8',
      ambient: '#CBDCDE',
    },
    keyLightRgba: 'rgba(255, 255, 255, 0.45)',
    keyLightAccentRgba: 'rgba(216, 169, 168, 0.28)',
    rimLightRgba: 'rgba(255, 255, 255, 0.45)',
    rimLightAccentRgba: 'rgba(203, 220, 222, 0.25)',
    diffuseRgba: 'rgba(216, 169, 168, 0.15)',
    baseIntensity: 0.7,
    rimIntensity: 0.8,
    blendMode: 'overlay',
  },
  'cinematic-dramatic': {
    id: 'cinematic-dramatic',
    name: 'Cinematic Dramatic',
    badge: 'High Contrast',
    description: 'Hollywood-grade contrast with rich amber key light, deep shadows, and crimson rim accent.',
    previewColors: {
      key: '#F59E0B',
      rim: '#EF4444',
      ambient: '#1E1B4B',
    },
    keyLightRgba: 'rgba(255, 235, 210, 0.65)',
    keyLightAccentRgba: 'rgba(245, 158, 11, 0.45)',
    rimLightRgba: 'rgba(255, 255, 255, 0.75)',
    rimLightAccentRgba: 'rgba(239, 68, 68, 0.4)',
    diffuseRgba: 'rgba(245, 158, 11, 0.22)',
    baseIntensity: 0.95,
    rimIntensity: 1.15,
    blendMode: 'overlay',
  },
  'morning-light': {
    id: 'morning-light',
    name: 'Morning Light',
    badge: 'Warm Golden Hour',
    description: 'Golden sunrise rays glancing across surfaces with celestial sky-blue refraction rim.',
    previewColors: {
      key: '#FEF08A',
      rim: '#FBBF24',
      ambient: '#BAE6FD',
    },
    keyLightRgba: 'rgba(254, 240, 138, 0.6)',
    keyLightAccentRgba: 'rgba(251, 191, 36, 0.35)',
    rimLightRgba: 'rgba(186, 230, 253, 0.65)',
    rimLightAccentRgba: 'rgba(253, 224, 71, 0.45)',
    diffuseRgba: 'rgba(254, 240, 138, 0.28)',
    baseIntensity: 0.8,
    rimIntensity: 0.9,
    blendMode: 'screen',
  },
  'neon-cyber': {
    id: 'neon-cyber',
    name: 'Neon Cyber',
    badge: 'Synthwave Glow',
    description: 'Electrifying cyberpunk aesthetic featuring hot magenta specular beam and vivid cyan rim.',
    previewColors: {
      key: '#EC4899',
      rim: '#A855F7',
      ambient: '#06B6D4',
    },
    keyLightRgba: 'rgba(236, 72, 153, 0.6)',
    keyLightAccentRgba: 'rgba(168, 85, 247, 0.45)',
    rimLightRgba: 'rgba(6, 182, 212, 0.75)',
    rimLightAccentRgba: 'rgba(192, 132, 252, 0.5)',
    diffuseRgba: 'rgba(168, 85, 247, 0.28)',
    baseIntensity: 1.0,
    rimIntensity: 1.25,
    blendMode: 'screen',
  },
};

export const LIGHTING_PRESET_LIST: CharacterLightingPreset[] = Object.values(LIGHTING_PRESETS);

export const DEFAULT_LIGHTING_PRESET: CharacterLightingPresetId = 'studio-soft';

export function getLightingPreset(id?: CharacterLightingPresetId): CharacterLightingPreset {
  if (id && LIGHTING_PRESETS[id]) {
    return LIGHTING_PRESETS[id];
  }
  return LIGHTING_PRESETS[DEFAULT_LIGHTING_PRESET];
}
