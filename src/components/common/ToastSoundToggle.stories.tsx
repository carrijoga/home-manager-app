import type { Meta, StoryObj } from '@storybook/react-vite';

import { ToastSoundToggle } from '@/components/common/ToastSoundToggle';

/**
 * Liga e desliga o som dos toasts. A preferência vive fora do React
 * (o hook a persiste), então o estado sobrevive à troca de story —
 * clique uma vez e navegue para ver.
 *
 * Não precisa de `AppProvider`: o `useToastNotifications` é construído
 * sobre o `sonner`, que não tem provider próprio. O `<Toaster />` já
 * está montado globalmente no preview.
 */
const meta = {
  title: 'Common/ToastSoundToggle',
  component: ToastSoundToggle,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof ToastSoundToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
