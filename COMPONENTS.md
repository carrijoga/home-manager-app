# 📦 Guia de Componentes UI

Este documento lista todos os componentes UI disponíveis no projeto Ninho, baseados em [shadcn/ui](https://ui.shadcn.com).

## 🎨 Importação

Todos os componentes podem ser importados de forma centralizada:

```typescript
import { Button, Input, Card, Badge } from '@/components/ui';
```

Ou individualmente:

```typescript
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
```

## 📋 Componentes Disponíveis

### 1. Button

Botão com múltiplas variantes e tamanhos.

**Variantes:**
- `default` - Botão primário (padrão)
- `destructive` - Ações destrutivas (excluir, remover)
- `outline` - Botão com borda
- `secondary` - Botão secundário
- `ghost` - Botão sem fundo
- `link` - Estilo de link

**Tamanhos:**
- `default` - Tamanho padrão (h-9)
- `sm` - Pequeno (h-8)
- `lg` - Grande (h-10)
- `icon` - Apenas ícone (9x9)

**Exemplo:**

```tsx
import { Button } from '@/components/ui';

function Example() {
  return (
    <div className="flex gap-2">
      <Button>Default</Button>
      <Button variant="destructive">Excluir</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>

      <Button size="sm">Pequeno</Button>
      <Button size="lg">Grande</Button>
      <Button size="icon">🔍</Button>
    </div>
  );
}
```

---

### 2. Input

Campo de entrada de texto com suporte a diferentes tipos.

**Props:**
- `type` - text, email, password, number, etc.
- `placeholder` - Texto de ajuda
- `disabled` - Desabilita o input
- Todas as props HTML padrão de input

**Exemplo:**

```tsx
import { Input, Label } from '@/components/ui';

function Example() {
  return (
    <div className="space-y-2">
      <Label htmlFor="name">Nome</Label>
      <Input id="name" placeholder="Digite seu nome" />

      <Label htmlFor="email">E-mail</Label>
      <Input id="email" type="email" placeholder="seu@email.com" />

      <Label htmlFor="password">Senha</Label>
      <Input id="password" type="password" />
    </div>
  );
}
```

---

### 3. Textarea

Área de texto para conteúdo maior.

**Props:**
- `placeholder` - Texto de ajuda
- `rows` - Número de linhas visíveis
- `disabled` - Desabilita o textarea
- Todas as props HTML padrão de textarea

**Exemplo:**

```tsx
import { Textarea, Label } from '@/components/ui';

function Example() {
  return (
    <div className="space-y-2">
      <Label htmlFor="description">Descrição</Label>
      <Textarea
        id="description"
        placeholder="Digite a descrição..."
        rows={4}
      />
    </div>
  );
}
```

---

### 4. Select

Dropdown de seleção com busca e agrupamento.

**Componentes:**
- `Select` - Container principal
- `SelectTrigger` - Botão de ativação
- `SelectValue` - Valor selecionado
- `SelectContent` - Container do dropdown
- `SelectItem` - Item individual
- `SelectGroup` - Agrupamento de itens
- `SelectLabel` - Label do grupo

**Exemplo:**

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';

function Example() {
  return (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Selecione uma opção" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="alta">Alta</SelectItem>
        <SelectItem value="media">Média</SelectItem>
        <SelectItem value="baixa">Baixa</SelectItem>
      </SelectContent>
    </Select>
  );
}
```

---

### 5. Label

Label para formulários com acessibilidade.

**Props:**
- `htmlFor` - ID do elemento associado
- Todas as props HTML padrão de label

**Exemplo:**

```tsx
import { Label, Input } from '@/components/ui';

function Example() {
  return (
    <div className="space-y-2">
      <Label htmlFor="name">Nome completo</Label>
      <Input id="name" />
    </div>
  );
}
```

---

### 6. Card

Container para agrupar conteúdo relacionado.

**Componentes:**
- `Card` - Container principal
- `CardHeader` - Cabeçalho do card
- `CardTitle` - Título do card
- `CardDescription` - Descrição do card
- `CardContent` - Conteúdo principal
- `CardFooter` - Rodapé do card

**Exemplo:**

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui';

function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Título do Card</CardTitle>
        <CardDescription>Descrição breve do conteúdo</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Conteúdo principal do card.</p>
      </CardContent>
      <CardFooter>
        <Button>Ação</Button>
      </CardFooter>
    </Card>
  );
}
```

---

### 7. Badge

Badge para tags, status e categorias.

**Variantes:**
- `default` - Badge padrão
- `secondary` - Badge secundário
- `destructive` - Badge de erro/alerta
- `outline` - Badge com borda

**Exemplo:**

```tsx
import { Badge } from '@/components/ui';

function Example() {
  return (
    <div className="flex gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secundário</Badge>
      <Badge variant="destructive">Erro</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  );
}
```

---

### 8. Avatar

Avatar circular para fotos de perfil.

**Componentes:**
- `Avatar` - Container do avatar
- `AvatarImage` - Imagem do avatar
- `AvatarFallback` - Fallback (iniciais ou ícone)

**Exemplo:**

```tsx
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui';

function Example() {
  return (
    <Avatar>
      <AvatarImage src="https://github.com/usuario.png" alt="@usuario" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  );
}
```

---

### 9. Dialog

Modal/Dialog para conteúdo sobreposto.

**Componentes:**
- `Dialog` - Container principal
- `DialogTrigger` - Elemento que abre o dialog
- `DialogContent` - Conteúdo do dialog
- `DialogHeader` - Cabeçalho
- `DialogTitle` - Título
- `DialogDescription` - Descrição
- `DialogFooter` - Rodapé (botões)
- `DialogClose` - Botão de fechar

**Exemplo:**

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui';
import { Button } from '@/components/ui';

function Example() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Abrir Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Título do Dialog</DialogTitle>
          <DialogDescription>
            Descrição do que este dialog faz.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          Conteúdo do dialog aqui.
        </div>
        <DialogFooter>
          <Button type="submit">Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

### 10. Separator

Linha separadora horizontal ou vertical.

**Props:**
- `orientation` - "horizontal" (padrão) ou "vertical"
- `decorative` - Se true, puramente decorativo (sem role)

**Exemplo:**

```tsx
import { Separator } from '@/components/ui';

function Example() {
  return (
    <div>
      <div className="space-y-1">
        <h4 className="text-sm font-medium">Seção 1</h4>
        <p className="text-sm text-muted-foreground">Conteúdo da seção 1</p>
      </div>

      <Separator className="my-4" />

      <div className="space-y-1">
        <h4 className="text-sm font-medium">Seção 2</h4>
        <p className="text-sm text-muted-foreground">Conteúdo da seção 2</p>
      </div>
    </div>
  );
}
```

---

### 11. DatePicker

Seletor de data com calendário e comportamento inteligente.

**Recursos:**
- Formato brasileiro: DD/MM/YYYY
- Ícone de calendário
- Popover com calendário visual
- Navegação entre meses
- Destaque da data de hoje
- Suporte a teclado (Tab, Enter, Esc)
- Opção de default automático (data atual)

**Props:**
- `value` - Data selecionada (Date | undefined)
- `onChange` - Callback ao mudar data
- `placeholder` - Texto quando vazio (padrão: "Selecione uma data")
- `disabled` - Desabilita o componente
- `defaultToToday` - Usa data atual como padrão (padrão: false)
- `className` - Classes CSS adicionais

**Exemplo:**

```tsx
import { DatePicker } from '@/components/ui';
import { useState } from 'react';

function Example() {
  const [date, setDate] = useState<Date>();

  return (
    <div className="space-y-4">
      {/* DatePicker básico */}
      <DatePicker
        value={date}
        onChange={setDate}
        placeholder="Selecione uma data"
      />

      {/* DatePicker com data atual como padrão */}
      <DatePicker
        value={date}
        onChange={setDate}
        defaultToToday
        placeholder="Data da tarefa"
      />

      {/* DatePicker desabilitado */}
      <DatePicker
        value={new Date()}
        disabled
      />
    </div>
  );
}
```

**Formatação:**

O DatePicker usa `date-fns` com locale `ptBR` para formatação em português brasileiro:

```typescript
// Formato exibido: 25/12/2024
format(date, "dd/MM/yyyy", { locale: ptBR })
```

**Comportamento Inteligente:**

```tsx
// Sem defaultToToday: mostra placeholder até selecionar
<DatePicker value={date} onChange={setDate} />

// Com defaultToToday: mostra data atual se value for undefined
<DatePicker value={date} onChange={setDate} defaultToToday />
```

---

## 🎨 Dark Mode

Todos os componentes suportam dark mode automaticamente através do sistema de temas do Tailwind CSS. As cores são definidas usando variáveis CSS que se adaptam ao tema ativo.

### Como Funciona

```css
/* Light Mode */
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  /* ... */
}

/* Dark Mode */
.dark {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  /* ... */
}
```

Os componentes usam essas variáveis:

```tsx
<Button className="bg-background text-foreground">
  Muda automaticamente com o tema
</Button>
```

---

## ♿ Acessibilidade

Todos os componentes foram construídos com acessibilidade em mente:

- **Navegação por teclado**: Tab, Enter, Escape funcionam corretamente
- **Screen readers**: ARIA labels e roles apropriados
- **Focus visible**: Indicadores visuais de foco
- **Contraste**: Cores com contraste adequado
- **Touch targets**: Tamanhos mínimos de 44x44px

### Boas Práticas

```tsx
// ✅ Bom: Label associado ao input
<Label htmlFor="email">E-mail</Label>
<Input id="email" type="email" />

// ❌ Ruim: Input sem label
<Input type="email" />

// ✅ Bom: Button com texto descritivo
<Button>Adicionar nova tarefa</Button>

// ❌ Ruim: Button apenas com ícone sem aria-label
<Button>+</Button>

// ✅ Bom: Button com ícone e aria-label
<Button aria-label="Adicionar nova tarefa">+</Button>
```

---

## 🎯 Customização

Os componentes podem ser customizados de várias formas:

### 1. Classes Tailwind

```tsx
<Button className="bg-ninho-500 hover:bg-ninho-600">
  Botão Customizado
</Button>
```

### 2. Variáveis CSS

Edite `src/index.css` para mudar as cores base:

```css
:root {
  --primary: 25 95% 53%;
  --primary-foreground: 0 0% 98%;
}
```

### 3. Wrapper Components

Crie componentes wrapper para variações específicas:

```tsx
// components/common/PrimaryButton.tsx
import { Button, ButtonProps } from '@/components/ui';

export function PrimaryButton(props: ButtonProps) {
  return (
    <Button
      className="bg-ninho-500 hover:bg-ninho-600"
      {...props}
    />
  );
}
```

---

## 📚 Recursos

- [shadcn/ui Docs](https://ui.shadcn.com/docs/components)
- [Radix UI Docs](https://www.radix-ui.com/docs/primitives)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

**Última atualização**: 2025-11-01
**Componentes**: 11 componentes (10 base + DatePicker)
