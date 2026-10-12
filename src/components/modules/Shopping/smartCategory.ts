/**
 * Sugestão heurística de categoria de compras pelo nome do item.
 * Pura — testada por scripts/test-shopping-grouping.ts.
 */
import { type CategoryNode, flattenTree } from '@/lib/categories';

interface CategoryKeywordMap {
  keywords: string[];
  /** Nomes-alvo em ordem de preferência; casam por `includes` nos dois sentidos. */
  categoryNames: string[];
}

// A ordem importa: o primeiro grupo cujo termo aparece no nome vence.
const CATEGORY_MAP: CategoryKeywordMap[] = [
  {
    keywords: [
      'banana', 'maca', 'maçã', 'pera', 'pêra', 'uva', 'tomate', 'cebola', 'alho', 'batata',
      'cenoura', 'alface', 'limao', 'limão', 'laranja', 'manga', 'melancia', 'abacate',
      'morango', 'pepino', 'pimentao', 'pimentão', 'abobrinha', 'brocolis', 'brócolis',
      'couve', 'repolho', 'salsa', 'coentro', 'mandioca', 'aipim', 'cheiro verde', 'mamao',
      'mamão', 'abacaxi', 'kiwi', 'maracuja', 'maracujá', 'goiaba', 'fruta', 'legume', 'verdura',
    ],
    categoryNames: ['hortifruti', 'frutas', 'legumes', 'verduras', 'feira'],
  },
  {
    keywords: [
      'frango', 'carne', 'alcatra', 'patinho', 'picanha', 'peixe', 'linguica', 'linguiça',
      'bacon', 'costela', 'bife', 'carne moida', 'carne moída', 'salmao', 'salmão', 'tilapia',
      'tilápia', 'camarao', 'camarão', 'file', 'filé', 'lombo', 'pernil', 'salsicha',
      'acougue', 'açougue', 'coxa', 'sobrecoxa', 'peito de frango',
    ],
    categoryNames: ['açougue e peixaria', 'açougue', 'carnes', 'peixaria', 'proteínas'],
  },
  {
    keywords: [
      'leite', 'queijo', 'requeijao', 'requeijão', 'manteiga', 'iogurte', 'mussarela',
      'prato', 'creme de leite', 'leite condensado', 'nata', 'presunto', 'mortadela',
      'parmesao', 'parmesão', 'ricota', 'cottage',
    ],
    categoryNames: ['frios e laticínios', 'laticínios', 'frios', 'queijos', 'leite'],
  },
  {
    keywords: [
      'pao', 'pão', 'torrada', 'bolo', 'biscoito', 'bolacha', 'broa', 'croissant',
      'pao frances', 'pão francês', 'pao de forma', 'pão de forma', 'baguete', 'sonho',
    ],
    categoryNames: ['padaria', 'pães', 'confeitaria'],
  },
  {
    keywords: [
      'arroz', 'feijao', 'feijão', 'macarrao', 'macarrão', 'oleo', 'óleo', 'azeite', 'sal',
      'acucar', 'açúcar', 'cafe', 'café', 'farinha', 'trigo', 'milho', 'molho', 'extrato',
      'atum', 'sardinha', 'maionese', 'ketchup', 'mostarda', 'vinagre', 'tempero', 'fermento',
      'aveia', 'cereal', 'massa', 'pipoca', 'lentilha', 'grao de bico', 'grão de bico', 'canela',
    ],
    categoryNames: ['mercearia', 'despensa', 'mantimentos', 'alimentos', 'grãos'],
  },
  {
    keywords: [
      'cerveja', 'vinho', 'refrigerante', 'suco', 'agua', 'água', 'vodka', 'gin', 'whisky',
      'energetico', 'energético', 'coca', 'guarana', 'guaraná', 'cha', 'chá', 'espumante', 'tonica',
    ],
    categoryNames: ['bebidas', 'adega', 'sucos', 'refrigerantes'],
  },
  {
    // Antes de "limpeza": itens de roupa vão para a sub Lavanderia quando existir.
    keywords: [
      'sabao em po', 'sabão em pó', 'sabao liquido', 'sabão líquido', 'amaciante',
      'alvejante', 'tira manchas', 'tira-manchas',
    ],
    categoryNames: ['lavanderia', 'limpeza'],
  },
  {
    keywords: [
      'detergente', 'sabao', 'sabão', 'desinfetante', 'agua sanitaria', 'água sanitária',
      'esponja', 'papel toalha', 'saco de lixo', 'lustra moveis', 'desengordurante', 'alcool',
      'álcool', 'palha de aco', 'palha de aço', 'cloro', 'multiuso',
    ],
    categoryNames: ['limpeza', 'produtos de limpeza', 'lavanderia'],
  },
  {
    keywords: [
      'sabonete', 'shampoo', 'xampu', 'condicionador', 'pasta de dente', 'creme dental',
      'escova de dente', 'papel higienico', 'papel higiênico', 'desodorante', 'fio dental',
      'protetor solar', 'algodao', 'algodão', 'absorvente', 'lamina', 'lâmina', 'gilete',
      'hidratante', 'enxaguante',
    ],
    categoryNames: ['higiene e beleza', 'higiene', 'perfumaria', 'cuidados pessoais', 'banheiro'],
  },
  {
    keywords: [
      'remedio', 'remédio', 'dipirona', 'paracetamol', 'ibuprofeno', 'curativo', 'band-aid',
      'vitamina', 'termometro', 'termômetro', 'soro fisiologico', 'soro fisiológico',
    ],
    categoryNames: ['farmácia', 'drogaria', 'remédios'],
  },
  {
    keywords: ['racao', 'ração', 'petisco', 'areia de gato', 'sache', 'sachê', 'coleira'],
    categoryNames: ['pet', 'animais', 'petshop'],
  },
  {
    keywords: [
      'pizza', 'lasanha', 'batata congelada', 'sorvete', 'picole', 'picolé', 'nuggets',
      'hamburguer', 'hambúrguer', 'congelado', 'congelada', 'polpa',
    ],
    categoryNames: ['congelados', 'sobremesas', 'sorvetes'],
  },
  {
    keywords: [
      'lampada', 'lâmpada', 'pilha', 'vela', 'fosforo', 'fósforo', 'papel aluminio',
      'papel alumínio', 'filme plastico', 'filme plástico', 'guardanapo', 'descartavel', 'descartável',
    ],
    categoryNames: ['casa e utilidades', 'utilidades', 'casa'],
  },
];

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}

/**
 * Sugere o id de uma categoria da árvore (escopo Compras) para o nome do item.
 * Para cada nome-alvo do grupo, testa subcategorias antes das principais.
 */
export function suggestCategoryForItem<T extends CategoryNode>(
  itemName: string,
  tree: T[]
): string | null {
  if (!itemName || tree.length === 0) return null;
  const normalizedItem = normalize(itemName);
  if (!normalizedItem) return null;

  const group = CATEGORY_MAP.find((g) =>
    g.keywords.some((kw) => normalizedItem.includes(normalize(kw)))
  );
  if (!group) return null;

  const flat = flattenTree(tree);
  const candidates = [
    ...flat.filter((f) => f.depth === 1),
    ...flat.filter((f) => f.depth === 0),
  ].map((f) => f.category);

  for (const target of group.categoryNames) {
    const t = normalize(target);
    const found = candidates.find((c) => {
      const n = normalize(c.name);
      return n.includes(t) || t.includes(n);
    });
    if (found) return found.categoryId;
  }
  return null;
}
