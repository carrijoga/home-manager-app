import {
  AlertCircle,
  Briefcase,
  Building,
  Calendar,
  Car,
  CheckSquare,
  Coffee,
  DollarSign,
  Flower2,
  Heart,
  Home,
  Leaf,
  type LucideIcon,
  Music,
  Package,
  Settings,
  ShoppingCart,
  Smile,
  Star,
  Sun,
  Sunset,
  TreePine,
  Users,
  Utensils,
} from 'lucide-react';
import type React from 'react';

import { KOBOYO_AVATAR_NAMES, KOBOYO_FACE_SLUGS } from '@/constants/koboyoAvatars';
import { cn } from '@/lib/utils';

/** Map from icon name string to Lucide component */
export const NEST_ICON_MAP: Record<string, LucideIcon> = {
  Home,
  Heart,
  Settings,
  Package,
  DollarSign,
  ShoppingCart,
  Calendar,
  CheckSquare,
  AlertCircle,
  Star,
  Users,
  Briefcase,
  Building,
  Car,
  Coffee,
  Utensils,
  Music,
  Sun,
  Sunset,
  Leaf,
  Flower2,
  TreePine,
  Smile,
};

/** Curated list of Lucide icons for nests */
export const CURATED_NEST_ICONS: { name: string; label: string }[] = [
  { name: 'Home', label: 'Casa' },
  { name: 'Heart', label: 'Coração' },
  { name: 'Users', label: 'Família' },
  { name: 'Briefcase', label: 'Trabalho' },
  { name: 'Building', label: 'Prédio' },
  { name: 'Car', label: 'Carro' },
  { name: 'Coffee', label: 'Café' },
  { name: 'Utensils', label: 'Cozinha' },
  { name: 'ShoppingCart', label: 'Compras' },
  { name: 'DollarSign', label: 'Finanças' },
  { name: 'Calendar', label: 'Agenda' },
  { name: 'CheckSquare', label: 'Tarefas' },
  { name: 'Package', label: 'Pacote' },
  { name: 'Music', label: 'Música' },
  { name: 'Star', label: 'Estrela' },
  { name: 'Sun', label: 'Sol' },
  { name: 'Sunset', label: 'Pôr do sol' },
  { name: 'Leaf', label: 'Natureza' },
  { name: 'Flower2', label: 'Flor' },
  { name: 'TreePine', label: 'Árvore' },
  { name: 'Smile', label: 'Sorriso' },
  { name: 'Settings', label: 'Configurações' },
  { name: 'AlertCircle', label: 'Alerta' },
];

/** Ícones de Passarinhos e Aves específicos do Koboyo */
export const BIRD_KOBOYO_SLUGS = [
  { slug: 'canary', label: 'Canário 🐤' },
  { slug: 'goldfinch', label: 'Pintassilgo 🐣' },
  { slug: 'bullfinch', label: 'Dom-fafe 🐦' },
  { slug: 'chaffinch', label: 'Tentilhão 🎶' },
  { slug: 'greenfinch', label: 'Verdilhão 🌿' },
  { slug: 'blackbird', label: 'Melro 🐦‍⬛' },
  { slug: 'hummingbird', label: 'Beija-flor 🌸' },
  { slug: 'chick-postbag', label: 'Pintinho Correio ✉️' },
  { slug: 'chick-spanner', label: 'Pintinho Construtor 🔧' },
  { slug: 'chick-mascot-clapping', label: 'Pintinho Palmas 👏' },
  { slug: 'chick-mascot-shrugging', label: 'Pintinho Dúvida 🤷‍♂️' },
  { slug: 'chick-mascot-surfboard', label: 'Pintinho Surf 🏄‍♂️' },
  { slug: 'feather', label: 'Pena 🪶' },
  { slug: 'feather-token', label: 'Amuleto 🪶' },
];

/** Lista completa de ícones Koboyo disponíveis para Ninhos (Passarinhos primeiro) */
export const KOBOYO_NEST_ICONS: { name: string; slug: string; label: string }[] = [
  ...BIRD_KOBOYO_SLUGS.map(({ slug, label }) => ({
    name: `koboyo:${slug}`,
    slug,
    label,
  })),
  ...KOBOYO_FACE_SLUGS.map((slug) => ({
    name: `koboyo:${slug}`,
    slug,
    label: KOBOYO_AVATAR_NAMES[slug] || slug,
  })),
];

export function isKoboyoNestIcon(name?: string | null): boolean {
  if (!name) return false;
  return (
    name.startsWith('koboyo:') ||
    name.startsWith('http') ||
    KOBOYO_FACE_SLUGS.includes(name) ||
    BIRD_KOBOYO_SLUGS.some((b) => b.slug === name)
  );
}

export function extractKoboyoSlug(name: string): string {
  return name
    .replace(/^koboyo:/, '')
    .replace('https://koboyo.com/icons/svg/', '')
    .replace('.svg', '');
}

/** Resolves an icon name string to a component (Lucide or Koboyo SVG), falling back to Home */
export function getIconComponent(
  name?: string | null
): React.ComponentType<{ className?: string }> {
  if (name && isKoboyoNestIcon(name)) {
    const slug = extractKoboyoSlug(name);
    const KoboyoIconComponent = ({ className }: { className?: string }) => (
      <img
        src={`https://koboyo.com/icons/svg/${slug}.svg`}
        alt=""
        className={cn(
          'rounded-xs inline-block shrink-0 border border-slate-200 bg-white object-contain p-[1px]',
          className
        )}
      />
    );
    KoboyoIconComponent.displayName = `KoboyoIcon(${slug})`;
    return KoboyoIconComponent;
  }

  if (name && NEST_ICON_MAP[name]) {
    return NEST_ICON_MAP[name];
  }
  return Home;
}
