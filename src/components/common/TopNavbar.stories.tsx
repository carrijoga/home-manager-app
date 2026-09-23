import type { Meta, StoryObj } from '@storybook/react-vite';

import { TopNavbar } from '@/components/common/TopNavbar';
import { SidebarProvider } from '@/components/ui/sidebar';

/**
 * Barra superior do app: busca (⌘K), sino de notificações e menu de perfil.
 *
 * É o primeiro componente das stories a depender de verdade do
 * `AppContext` — daí o `parameters: { app: true }`, que liga o
 * `AppProvider` e o `MemoryRouter` no decorator do preview. Os dados
 * vêm de `src/mocks` porque o Storybook roda com `VITE_DATA_MODE=mock`.
 *
 * O componente retorna `null` enquanto `user` for nulo, então ele
 * aparece só depois que o provider resolve a sessão — um instante
 * após a montagem.
 *
 * O `SidebarProvider` é necessário pelo `SidebarTrigger`, visível apenas
 * na largura mobile.
 */
const meta = {
  title: 'Common/TopNavbar',
  component: TopNavbar,
  parameters: {
    layout: 'fullscreen',
    app: true,
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <SidebarProvider>
        <div className="w-full">
          <Story />
        </div>
      </SidebarProvider>
    ),
  ],
} satisfies Meta<typeof TopNavbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Na largura mobile o trigger da sidebar aparece e a busca some. */
export const Mobile: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
};
