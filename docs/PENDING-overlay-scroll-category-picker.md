# Pendências: scroll em overlays aninhados e CategoryPicker

**Status:** parcialmente validado | **Atualizado em:** 2026-10-07 | **Origem:** sessão "MEMORY.md e pendências frontend" (repo `ninhoapp-api`)

## Contexto

A sessão começou verificando o `Docs/memory/MEMORY.md` da API em busca de pendências do frontend. A única pendência registrada (migração para `assignees[]`) **já estava implementada** no front e foi dada como concluída (commit `a85a0de` na API, `docs: mark frontend assignees[] migration as done`). O `MEMORY.md` da API ficou sem pendências abertas.

Em seguida surgiram dois problemas novos, ambos tratados nesta sessão:

1. O `CategoryPicker` deixava a hierarquia categoria › subcategoria confusa.
2. O scroll do mouse não funcionava dentro de popovers abertos a partir de modais (só a barra de rolagem arrastada funcionava).

## O que foi entregue (já em `origin/dev`)

| Commit | O que fez |
|---|---|
| `3fa8780` | `fix(ui)`: scroll do mouse em `Popover`, `Select` e `DropdownMenu` dentro de modais |
| `3d04679` | `fix(categorias)`: pai com fundo destacado e negrito, guia vertical nas subcategorias, `CommandSeparator` entre grupos |
| `b1c99f1` | `fix(ui)`: mesma correção de scroll aplicada ao `SheetContent` |

Arquivos: `src/hooks/useEscapeScrollLock.ts`, `src/lib/composeRefs.ts`, `src/components/ui/{popover,select,dropdown-menu,sheet}.tsx`, `src/components/common/CategoryPicker.tsx`. Typecheck e lint passaram limpos.

## Causa raiz (para não redescobrir)

`Dialog` e `Sheet` do Radix travam o scroll do body com `react-remove-scroll`, que intercepta `wheel` e `touchmove` no `document` e cancela o que não estiver dentro do próprio modal. `Popover`, `Select` e `DropdownMenu` são portados para o `<body>`, então o wheel morria sobre eles. Issues conhecidas: radix-ui/primitives#2028 e #2125, shadcn-ui/ui#6988.

A correção registra `wheel`/`touchmove` com `capture: true` via **callback ref** e chama `stopPropagation()`. Tem que ser callback ref: `useEffect` + `useRef` roda depois do listener do `react-remove-scroll` e perde a corrida.

**Regra para componentes novos:** todo primitivo Radix portado que tenha lista rolável e possa abrir dentro de um `Dialog`/`Sheet` precisa de `useEscapeScrollLock`. Sem isso o bug volta.

## Pendências

### 1. Validar o scroll por toque no Sheet do CategoryPicker (não verificado)

No mobile (< 768px) o `CategoryPicker` abre um `Sheet`, que é um `Dialog` dentro do `Dialog` "Editar Tarefa". A correção foi aplicada por prevenção, mas **não foi possível provar que funciona**: as ferramentas do navegador embutido não geram `touchmove` real (`left_click_drag` dispara só `mousemove`/`pointermove`) e o wheel sintético não rola em viewport com emulação de toque.

- **Como validar:** celular real, ou DevTools do Chrome local com touch simulation. Abrir Tarefas › editar › Categoria e arrastar o dedo sobre a lista.
- **Aceite:** a lista rola e o Sheet não fecha.
- **Se falhar:** investigar `touchmove` no `useEscapeScrollLock` (o hook intercepta os dois eventos) e a interação com o gesto de fechar.

### 2. Validar o CategoryPicker no escopo Shopping, com vários filhos por pai

O novo visual só foi conferido em Tarefas, onde o único pai com filho era "Casa › Contas". O caso da imagem original (Limpeza › Lavanderia, pais com vários filhos) ficou sem teste. A tentativa de abrir `ItemFormDialog.tsx` foi abandonada.

- **Aceite:** guia vertical contínua entre filhos consecutivos, separador entre grupos, busca ativa sem filho órfão confuso.
- **Verificar também:** busca com texto, em que o filtro pode mostrar um filho sem o pai por perto.

### 3. Decidir sobre os outros primitivos portados

Aplicado em `Popover`, `Select`, `DropdownMenu` (só `DropdownMenuContent`) e `Sheet`. **Não aplicado em:**

- `DropdownMenuSubContent` (decisão consciente: submenus raramente têm lista longa);
- `Tooltip`, `HoverCard`, `ContextMenu` e similares, se existirem. Não foi verificado.

Fazer um `grep` por `Portal` em `src/components/ui/` e aplicar onde houver conteúdo rolável.

### 4. Ruído de console pré-existente (não investigado)

Aparece no console do app e **não tem relação** com as mudanças acima: erro de Service Worker, aviso de `<button>` dentro de `<button>` (nesting inválido de DOM), aviso de `key` ausente em lista. Vale abrir uma tarefa própria para o nesting de botão, que é erro de acessibilidade.

### 5. Working tree do frontend com mudanças não commitadas (conferir antes de qualquer commit)

Estado em 2026-10-07, branch `dev` igual a `origin/dev`:

- `public/favicon.svg`, `public/logo.svg`, `public/manifest.json` e `public/mockServiceWorker.js` aparecem **deletados** e não commitados. Não são deste trabalho. A deleção de `manifest.json` quebra o PWA, que o ROADMAP lista como entregue. Confirmar se foi intencional ou acidental antes de commitar; para desfazer: `git checkout -- public/`.
- `docs/design-system.html`, `docs/rain.png`, `docs/snow.png` e `docs/thunderstorm.png` estão sem rastreio. Outra sessão (documentação do Domestic Sanctuary Design System) pode estar produzindo esses arquivos.

### 6. Feedback de design ainda não dado

O visual final do `CategoryPicker` (pai em negrito com `bg-muted/40`, filhos recuados com guia vertical) foi uma decisão minha após duas iterações descartadas: heading de grupo e item "Categoria geral" (ficavam redundantes). Você ainda não confirmou se atende. Se não atender, as alternativas descartadas estão acima.

## Como retomar

1. Ler este arquivo.
2. Rodar o app (`npm run dev`) e fazer as validações 1 e 2.
3. Resolver o item 5 antes de qualquer commit amplo.
4. Quando tudo estiver validado, apagar este arquivo e deixar a regra da seção "Causa raiz" no `docs/CLAUDE.md` do frontend.
