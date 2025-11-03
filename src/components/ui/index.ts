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
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger, SelectValue
} from './select';

// Layout Components
export {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from './card';

export { Separator } from './separator';

// Overlay Components
export {
  Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger
} from './dialog';

export {
  AlertDialog, AlertDialogAction,
  AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, AlertDialogPortal, AlertDialogTitle, AlertDialogTrigger
} from './alert-dialog';

// Display Components
export { Badge, badgeVariants } from './badge';
export type { BadgeProps } from './badge';

export { Avatar, AvatarFallback, AvatarImage } from './avatar';

// Date Components
export { Calendar } from './calendar';
export { DatePicker } from './date-picker';
export type { DatePickerProps } from './date-picker';
export { Popover, PopoverContent, PopoverTrigger } from './popover';

// Navigation Components
export {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from './accordion';

// Feedback Components
export { Checkbox } from './checkbox';

// Menu Components
export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from './dropdown-menu';

