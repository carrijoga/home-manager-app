/**
 * Dicionário heurístico de termos comuns de compras para auto-sugestão de categorias.
 */
interface CategoryKeywordMap {
  keywords: string[];
  categoryNames: string[];
}

const CATEGORY_MAP: CategoryKeywordMap[] = [
  {
    keywords: [
      'banana', 'maca', 'maçã', 'pera', 'pêra', 'uva', 'tomate', 'cebola', 'alho', 'batata',
      'cenoura', 'alface', 'limao', 'limão', 'laranja', 'manga', 'melancia', 'abacate',
      'morango', 'pepino', 'pimentao', 'pimentão', 'abobrinha', 'brocolis', 'brócolis',
      'couve', 'repolho', 'salsa', 'coentro', 'mandioca', 'aipim', 'cheiro verde', 'mamao',
      'mamão', 'abacaxi', 'kiwi', 'maracuja', 'maracujá', 'goiaba', 'fruta', 'legume', 'verdura'
    ],
    categoryNames: ['hortifruti', 'frutas', 'legumes', 'verduras', 'feira'],
  },
  {
    keywords: [
      'frango', 'carne', 'alcatra', 'patinho', 'picanha', 'peixe', 'linguica', 'linguiça',
      'bacon', 'costela', 'bife', 'carne moida', 'carne moída', 'salmao', 'salmão', 'tilapia',
      'tilápia', 'camarao', 'camarão', 'file', 'filé', 'lombo', 'pernil', 'salsicha',
      'acougue', 'açougue', 'coxa', 'sobrecoxa', 'peito de frango'
    ],
    categoryNames: ['carnes', 'açougue', 'acougue', 'peixaria', 'proteínas'],
  },
  {
    keywords: [
      'leite', 'queijo', 'requeijao', 'requeijão', 'manteiga', 'iogurte', 'mussarela',
      'prato', 'creme de leite', 'leite condensado', 'nata', 'presunto', 'mortadela',
      'parmesao', 'parmesão', 'ricota', 'cottage'
    ],
    categoryNames: ['laticínios', 'laticinios', 'frios', 'queijos', 'leite'],
  },
  {
    keywords: [
      'pao', 'pão', 'torrada', 'bolo', 'biscoito', 'bolacha', 'broa', 'croissant',
      'pao frances', 'pão francês', 'pao de forma', 'pão de forma', 'baguete', 'sonho'
    ],
    categoryNames: ['padaria', 'pães', 'paes', 'confeitaria'],
  },
  {
    keywords: [
      'arroz', 'feijao', 'feijão', 'macarrao', 'macarrão', 'oleo', 'óleo', 'azeite', 'sal',
      'acucar', 'açúcar', 'cafe', 'café', 'farinha', 'trigo', 'milho', 'molho', 'extrato',
      'atum', 'sardinha', 'maionese', 'ketchup', 'mostarda', 'vinagre', 'tempero', 'fermento',
      'aveia', 'cereal', 'massa', 'pipoca', 'lentilha', 'grao de bico', 'grão de bico', 'canela'
    ],
    categoryNames: ['mercearia', 'despensa', 'mantimentos', 'alimentos', 'grãos'],
  },
  {
    keywords: [
      'cerveja', 'vinho', 'refrigerante', 'suco', 'agua', 'água', 'vodka', 'gin', 'whisky',
      'energetico', 'energético', 'coca', 'guarana', 'guaraná', 'cha', 'chá', 'espumante', 'tonica'
    ],
    categoryNames: ['bebidas', 'adega', 'sucos', 'refrigerantes'],
  },
  {
    keywords: [
      'detergente', 'sabao', 'sabão', 'amaciante', 'desinfetante', 'agua sanitaria',
      'água sanitária', 'esponja', 'papel toalha', 'saco de lixo', 'lustra moveis',
      'desengordurante', 'alcool', 'álcool', 'palha de aco', 'palha de aço', 'cloro', 'multiuso'
    ],
    categoryNames: ['limpeza', 'produtos de limpeza', 'casa', 'lavanderia'],
  },
  {
    keywords: [
      'sabonete', 'shampoo', 'xampu', 'condicionador', 'pasta de dente', 'creme dental',
      'escova de dente', 'papel higienico', 'papel higiênico', 'desodorante', 'fio dental',
      'protetor solar', 'algodao', 'algodão', 'absorvente', 'lamina', 'lâmina', 'gilete',
      'hidratante', 'enxaguante'
    ],
    categoryNames: ['higiene', 'perfumaria', 'cuidados pessoais', 'farmácia', 'banheiro'],
  },
  {
    keywords: ['racao', 'ração', 'petisco', 'areia de gato', 'sache', 'sachê', 'coleira'],
    categoryNames: ['pet', 'animais', 'petshop'],
  },
  {
    keywords: ['pizza', 'lasanha', 'batata congelada', 'sorvete', 'picole', 'picolé', 'nuggets', 'hamburguer', 'hambúrguer'],
    categoryNames: ['congelados', 'sobremesas', 'sorvetes'],
  },
];

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Tenta sugerir a melhor categoria com base no nome do item e nas categorias disponíveis do Nest.
 */
export function suggestCategoryForItem(
  itemName: string,
  categories: Array<{ shoppingCategoryId: string; name: string }>
): string | null {
  if (!itemName || !categories.length) return null;
  const normalizedItem = normalize(itemName);
  if (!normalizedItem) return null;

  // 1. Procurar grupo pelo item
  let matchedGroup: CategoryKeywordMap | undefined;
  for (const group of CATEGORY_MAP) {
    if (group.keywords.some((kw) => normalizedItem.includes(normalize(kw)))) {
      matchedGroup = group;
      break;
    }
  }

  if (!matchedGroup) return null;

  // 2. Encontrar categoria correspondente do Nest
  for (const catTarget of matchedGroup.categoryNames) {
    const targetNorm = normalize(catTarget);
    const found = categories.find((c) => normalize(c.name).includes(targetNorm) || targetNorm.includes(normalize(c.name)));
    if (found) {
      return found.shoppingCategoryId;
    }
  }

  return null;
}
