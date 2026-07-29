import { ProductBundle } from '../types/marketplace';

export const INITIAL_BUNDLES: ProductBundle[] = [
  {
    id: 'bundle-gamedev-audio',
    title: 'Cyberpunk Game Dev & Audio Stems Power Pack',
    description: 'Combine AAA Cyberpunk 3D Mech models with Analog Cyber Synthwave loops for total game engine immersion.',
    productIds: ['prod-3d-01', 'prod-music-01'],
    discountPercentage: 25,
    badge: 'GAMEDEV SAVER (25% OFF)',
    bannerImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'bundle-ai-developer',
    title: 'Ultimate AI Founder & SaaS Starter Suite',
    description: 'Get the Enterprise AI Prompt Library, Next.js 15 Marketplace Starter Kit, and Dr. Vance\'s AI SaaS Playbook eBook.',
    productIds: ['prod-ai-01', 'prod-web-01', 'prod-books-01'],
    discountPercentage: 30,
    badge: 'AI FOUNDER SUITE (30% OFF)',
    bannerImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'bundle-design-editorial',
    title: 'Fintech UI Design System & Editorial Lightroom Suite',
    description: 'Pair the Mobile Banking Figma UI Kit with Moody Editorial Film Presets for high-converting client presentations.',
    productIds: ['prod-templates-01', 'prod-photo-01'],
    discountPercentage: 20,
    badge: 'CREATIVE PRO PACK (20% OFF)',
    bannerImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800',
  },
];
