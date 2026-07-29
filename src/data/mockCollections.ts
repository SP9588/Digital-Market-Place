export interface FeaturedCollection {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  bannerImage: string;
  targetCategory?: string;
  targetTag?: string;
  itemCount: number;
  gradient: string;
}

export const FEATURED_COLLECTIONS: FeaturedCollection[] = [
  {
    id: 'col-cyberpunk-sci-fi',
    title: 'Cyberpunk & Sci-Fi Game Engine Suite',
    subtitle: 'AAA 3D Mech models, analog synthwave stems, and game-ready environment assets.',
    badge: 'SEASONAL CURATION',
    bannerImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
    targetTag: 'cyberpunk',
    itemCount: 8,
    gradient: 'from-purple-900/80 via-slate-900/90 to-slate-950',
  },
  {
    id: 'col-ai-founder',
    title: 'Next-Gen AI Founder & SaaS Starter',
    subtitle: 'Enterprise prompt engineering, Next.js 15 starter kits, and scale-up ebooks.',
    badge: 'CREATOR PICK',
    bannerImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800',
    targetTag: 'ai',
    itemCount: 12,
    gradient: 'from-cyan-900/80 via-slate-900/90 to-slate-950',
  },
  {
    id: 'col-fintech-ui',
    title: 'Fintech & Mobile UI Design Systems',
    subtitle: 'Pixel-perfect Figma kits, crypto banking layouts, and responsive web templates.',
    badge: 'TRENDING NOW',
    bannerImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800',
    targetTag: 'ui-kit',
    itemCount: 10,
    gradient: 'from-emerald-900/80 via-slate-900/90 to-slate-950',
  },
  {
    id: 'col-audio-stems',
    title: 'Cinematic Audio Stems & Synth Loops',
    subtitle: 'Lossless 24-bit WAV stems, analog modular pads, and royalty-free soundtracks.',
    badge: 'AUDIO ESSENTIALS',
    bannerImage: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=800',
    targetTag: 'stems',
    itemCount: 6,
    gradient: 'from-amber-900/80 via-slate-900/90 to-slate-950',
  },
  {
    id: 'col-photo-presets',
    title: 'Editorial Film & Moody Presets',
    subtitle: 'Professional Lightroom desktop & mobile presets, cinematic LUTs, and photo profiles.',
    badge: 'PRO PHOTO PACK',
    bannerImage: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=800',
    targetTag: 'lightroom',
    itemCount: 9,
    gradient: 'from-rose-900/80 via-slate-900/90 to-slate-950',
  },
];
