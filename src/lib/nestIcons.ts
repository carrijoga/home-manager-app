/**
 * Curated list of lucide icons available for nests.
 * Icons are stored as string names in the API, resolved to components at runtime.
 */
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

/** Curated list for the icon picker */
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

/** Resolves an icon name string to a Lucide component, falling back to Home */
export function getIconComponent(name?: string | null): LucideIcon {
  if (name && NEST_ICON_MAP[name]) return NEST_ICON_MAP[name];
  return Home;
}
