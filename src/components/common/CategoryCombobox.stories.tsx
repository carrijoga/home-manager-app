import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { CategoryCombobox } from '@/components/common/CategoryCombobox';
import { Label } from '@/components/ui/label';
import type { CategoryResponse } from '@/schemas/category';
import { TransactionType } from '@/schemas/enums';

const NEST_ID = '11111111-1111-4111-8111-111111111111';

const categories: CategoryResponse[] = [
  {
    categoryId: '22222222-2222-4222-8222-222222222201',
    nestId: NEST_ID,
    name: 'Mercado',
    type: TransactionType.Expense,
  },
  {
    categoryId: '22222222-2222-4222-8222-222222222202',
    nestId: NEST_ID,
    name: 'Transporte',
    type: TransactionType.Expense,
  },
  {
    categoryId: '22222222-2222-4222-8222-222222222203',
    nestId: NEST_ID,
    name: 'Moradia',
    type: TransactionType.Expense,
  },
  {
    categoryId: '22222222-2222-4222-8222-222222222204',
    nestId: NEST_ID,
    name: 'Lazer',
    type: TransactionType.Expense,
  },
  {
    categoryId: '22222222-2222-4222-8222-222222222205',
    nestId: NEST_ID,
    name: 'Salário',
    type: TransactionType.Income,
  },
];

/**
 * Combobox de categorias financeiras com criação intuitiva:
 * 1. Botão fixo no rodapé "+ Nova categoria" sempre visível ao abrir o dropdown.
 * 2. Ao digitar um termo na busca, exibe ação imediata '+ Criar "termo"'.
 * 3. Formulário inline com seletor de tipo (Despesa / Receita) e salvamento rápido.
 *
 * É o padrão do projeto para dados criados pelo usuário; enums fechados
 * usam `Select`. Recebe tudo por prop, então não precisa de `AppProvider`.
 */
const meta = {
  title: 'Common/CategoryCombobox',
  component: CategoryCombobox,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    categories: { table: { disable: true } },
    onChange: { table: { disable: true } },
    onCreateCategory: { table: { disable: true } },
  },
} satisfies Meta<typeof CategoryCombobox>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Cria a categoria em memória, imitando a resposta do serviço. */
const makeCreateHandler =
  (onCreated: (c: CategoryResponse) => void) =>
  async ({ name, type }: { name: string; type: number }): Promise<CategoryResponse> => {
    await new Promise((r) => setTimeout(r, 300));
    const created: CategoryResponse = {
      categoryId: crypto.randomUUID(),
      nestId: NEST_ID,
      name,
      type,
    };
    onCreated(created);
    return created;
  };

export const Default: Story = {
  args: {
    categories,
    value: '',
    defaultType: TransactionType.Expense,
    onChange: () => {},
    onCreateCategory: async () => categories[0],
  },
  render: function DefaultStory(args) {
    const [list, setList] = useState(args.categories);
    const [value, setValue] = useState(args.value);

    return (
      <div className="w-[280px] space-y-1.5">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Categoria</Label>
        <CategoryCombobox
          {...args}
          categories={list}
          value={value}
          onChange={setValue}
          onCreateCategory={makeCreateHandler((c) => setList((prev) => [...prev, c]))}
        />
      </div>
    );
  },
};

/** Com uma categoria já escolhida — o nome aparece em `text-foreground`. */
export const WithSelection: Story = {
  ...Default,
  args: {
    ...Default.args,
    value: '22222222-2222-4222-8222-222222222201',
  },
};

/**
 * Nenhuma categoria cadastrada. O combobox continua utilizável: dá para
 * digitar e criar a primeira, em vez de virar um bloqueio invisível.
 */
export const EmptyList: Story = {
  ...Default,
  args: {
    ...Default.args,
    categories: [],
  },
};

/** Tipo padrão de receita — muda o que a criação inline sugere. */
export const IncomeType: Story = {
  ...Default,
  args: {
    ...Default.args,
    defaultType: TransactionType.Income,
  },
};
