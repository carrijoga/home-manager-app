import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import WeatherWidget from '@/components/common/WeatherWidget';

/**
 * O widget é totalmente controlado — não busca clima sozinho, quem o usa
 * passa temperatura, descrição e estado. Por isso todos os estados são
 * alcançáveis aqui sem mock de rede.
 */
const meta = {
  title: 'Common/WeatherWidget',
  component: WeatherWidget,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    mode: {
      control: 'inline-radio',
      options: ['display', 'onboarding'],
    },
    isLoading: { control: 'boolean' },
    isError: { control: 'boolean' },
    className: { table: { disable: true } },
  },
  args: {
    mode: 'display',
    temperatureLabel: '24°',
    description: 'Parcialmente nublado',
    city: 'Belo Horizonte',
    isLoading: false,
    isError: false,
    onRefresh: fn(),
    onEnable: fn(),
  },
} satisfies Meta<typeof WeatherWidget>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Sem `onRefresh` o botão de atualizar não é renderizado. */
export const WithoutRefresh: Story = {
  args: { onRefresh: undefined },
};

export const Loading: Story = {
  args: { isLoading: true },
};

/** Falha na busca — mostra "Clima indisponível" em vez de sumir. */
export const Error: Story = {
  args: { isError: true },
};

/** Primeiro acesso, antes de o usuário permitir a localização. */
export const Onboarding: Story = {
  args: { mode: 'onboarding' },
};

/** Nome de cidade longo é truncado em `max-w-[120px]`. */
export const LongCityName: Story = {
  args: {
    city: 'São José do Rio Preto',
    temperatureLabel: '31°',
    description: 'Ensolarado',
  },
};
