import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import ProfileMenu from '@/components/common/ProfileMenu';
import type { AppUser } from '@/types';

const mockUser: AppUser = {
  id: 'user-1',
  name: 'Gabriel Carrijo',
  callmeby: 'Gabriel',
  email: 'gabriel@ninho.local',
};

/**
 * Menu de perfil no canto da navbar. Recebe o usuário por prop — não lê
 * do `AppContext` — então funciona isolado sem provider de aplicação.
 *
 * Clique no avatar para abrir o dropdown. O submenu de tema fica dentro
 * de "Aparência".
 */
const meta = {
  title: 'Common/ProfileMenu',
  component: ProfileMenu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    currentTheme: {
      control: 'inline-radio',
      options: ['light', 'dark', 'system'],
    },
    user: { table: { disable: true } },
  },
  args: {
    user: mockUser,
    currentTheme: 'system',
    onThemeChange: fn(),
    onProfileClick: fn(),
    onSettingsClick: fn(),
    onLogoutClick: fn(),
  },
} satisfies Meta<typeof ProfileMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Com foto — o `AvatarImage` substitui as iniciais. */
export const WithAvatar: Story = {
  args: {
    user: { ...mockUser, avatar: 'https://i.pravatar.cc/80?img=12' },
  },
};

/** Nome de uma palavra só: a inicial única ainda funciona no fallback. */
export const SingleName: Story = {
  args: {
    user: { ...mockUser, name: 'Gabriel', callmeby: 'Gabriel' },
  },
};

export const DarkThemeSelected: Story = {
  args: { currentTheme: 'dark' },
};
