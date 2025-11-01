/**
 * Componentes UI baseados em shadcn/ui
 *
 * Todos os componentes são construídos sobre Radix UI e estilizados com Tailwind CSS.
 * Suportam dark mode automaticamente através do sistema de temas.
 *
 * @see https://ui.shadcn.com/docs/components
 */

// Form Components
export { Button, buttonVariants } from './button';
export type { ButtonProps } from './button';

export { Input } from './input';

export { Textarea } from './textarea';

export { Label } from './label';

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from './select';

// Layout Components
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from './card';

export { Separator } from './separator';

// Overlay Components
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './dialog';

// Display Components
export { Badge, badgeVariants } from './badge';
export type { BadgeProps } from './badge';

export { Avatar, AvatarImage, AvatarFallback } from './avatar';

// Date Components
export { Calendar } from './calendar';
export { Popover, PopoverTrigger, PopoverContent } from './popover';
export { DatePicker } from './date-picker';
export type { DatePickerProps } from './date-picker';
