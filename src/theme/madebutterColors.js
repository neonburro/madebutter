// src/theme/madebutterColors.js
// SENTINEL: MADEBUTTER_COLORS_V1
// Single source of truth for all madebutter. colors.
// Change a hex here and mirror it in src/index.css :root vars (one-to-one).

export const madebutterColors = {
  surface: {
    base: '#FFFFFF',
    paper: '#FAF8F2',
    cream: '#FFF7E6',
    raised: '#F5F1E8',
    line: 'rgba(22,20,18,0.08)',
    lineStrong: 'rgba(22,20,18,0.16)',
  },
  text: {
    primary: '#161412',
    secondary: '#5E554C',
    muted: '#9A9188',
    inverse: '#FFFFFF',
  },
  accent: {
    butter: '#F6D66B',
    butterHover: '#F2B94B',
    butterSoft: '#FFF1B8',
    toast: '#B8792D',
  },
  dark: {
    base: '#0F0E0D',
    raised: '#1A1714',
    line: 'rgba(255,255,255,0.10)',
    text: '#FFFDF8',
    muted: '#C9BFAF',
    accent: '#FFE08A',
  },
  category: {
    donuts: '#F6D66B',
    kolaches: '#B8792D',
    rolls: '#D99A4E',
    vegan: '#A8B89A',
    coffee: '#6B4A32',
    strawberry: '#F4B7C3',
  },
};

export default madebutterColors;
