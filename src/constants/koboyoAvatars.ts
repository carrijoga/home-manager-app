export interface KoboyoAvatarOption {
  slug: string;
  name: string;
  url: string;
}

/**
 * Lista oficial de ícones de rostos Hand-drawn do Koboyo.
 * Baseado nos slugs fornecidos e suportados pela plataforma Koboyo.
 */
// Lista de slugs adicionais suportados pelo backend (AvatarSlugs.cs)
const BACKEND_EXTRA_SLUGS = [
  'face',
  'face-bandage',
  'face-eyepatch',
  'face-headphones',
  'face-halo',
  'face-goggles',
  'face-headset',
  'face-monocle',
  'face-snorkel',
  'face-pulling-tongue',
  'face-tongue-out',
  'silly-tongue-face-2',
];

const KOBOYO_DEFAULT_FACE_SLUGS = [
  'angry-face',
  'anxious-face',
  'blushing-face',
  'bored-face',
  'confused-face',
  'content-face',
  'crying-face',
  'curious-face',
  'determined-face',
  'dizzy-face',
  'exhausted-face',
  'face-beaming',
  'face-chewing',
  'face-disbelief',
  'face-gasping',
  'face-grimacing',
  'face-humming',
  'face-nodding',
  'face-pouting',
  'face-shaking',
  'face-shouting',
  'face-singing',
  'face-smirking',
  'face-sneezing',
  'face-sniffling',
  'face-sobbing',
  'face-tasting',
  'face-whispering',
  'face-whistling',
  'face-wincing',
  'face-yawning',
  'furious-face',
  'ghost-face',
  'grateful-face',
  'grinning-face',
  'hopeful-face',
  'laughing-face',
  'mischievous-face',
  'money-face',
  'nervous-face',
  'neutral-face',
  'party-face',
  'pensive-face',
  'pleading-face',
  'proud-face',
  'relieved-face',
  'robot-face',
  'sad-face',
  'scared-face',
  'sceptical-face',
  'shocked-face',
  'shushing-face',
  'shy-face',
  'sick-face',
  'sleeping-face',
  'smiling-face',
  'smirking-face',
  'sobbing-face',
  'starstruck-face',
  'surprised-face',
];

export const KOBOYO_FACE_SLUGS: string[] = Array.from(
  new Set([...BACKEND_EXTRA_SLUGS, ...KOBOYO_DEFAULT_FACE_SLUGS])
);

/** Rótulos amigáveis em português para cada slug de ícone */
export const KOBOYO_AVATAR_NAMES: Record<string, string> = {
  face: 'Rosto neutro',
  'face-bandage': 'Machucado',
  'face-eyepatch': 'Tapa-olho pirata',
  'angry-face': 'Bravo',
  'face-headphones': 'Com fones',
  'face-halo': 'Anjinho',
  'face-goggles': 'Óculos de proteção',
  'face-headset': 'Headset gamer',
  'face-monocle': 'Monóculo refinado',
  'face-snorkel': 'Mergulhador',
  'anxious-face': 'Ansioso',
  'blushing-face': 'Coreado',
  'bored-face': 'Tedioso',
  'confused-face': 'Confuso',
  'content-face': 'Satisfeito',
  'crying-face': 'Chorando',
  'curious-face': 'Curioso',
  'determined-face': 'Determinado',
  'dizzy-face': 'Tonto',
  'exhausted-face': 'Exausto',
  'face-beaming': 'Radiante',
  'face-chewing': 'Mastigando',
  'face-disbelief': 'Incrédulo',
  'face-gasping': 'Pasmado',
  'face-grimacing': 'Careta',
  'face-humming': 'Cantarolando',
  'face-nodding': 'Concordando',
  'face-pouting': 'Fazendo bico',
  'face-shaking': 'Balançando a cabeça',
  'face-shouting': 'Gritando',
  'face-singing': 'Cantando',
  'face-smirking': 'Sorriso maroto',
  'face-sneezing': 'Espirrando',
  'face-sniffling': 'Fungando',
  'face-sobbing': 'Soluçando',
  'face-tasting': 'Saboreando',
  'face-whispering': 'Sussurrando',
  'face-whistling': 'Assobiando',
  'face-wincing': 'Contorcendo',
  'face-yawning': 'Bocejando',
  'furious-face': 'Furioso',
  'ghost-face': 'Fantasma',
  'grateful-face': 'Grato',
  'grinning-face': 'Sorridente',
  'hopeful-face': 'Esperançoso',
  'laughing-face': 'Rindo',
  'mischievous-face': 'Traverso',
  'money-face': 'Dinheiro nos olhos',
  'nervous-face': 'Nervoso',
  'neutral-face': 'Neutro',
  'party-face': 'Festivo',
  'pensive-face': 'Pensativo',
  'pleading-face': 'Pedindo por favor',
  'proud-face': 'Orgulhoso',
  'relieved-face': 'Aliviado',
  'robot-face': 'Robô',
  'sad-face': 'Triste',
  'scared-face': 'Com medo',
  'sceptical-face': 'Céptico',
  'shocked-face': 'Chocado',
  'shushing-face': 'Fazendo silêncio',
  'shy-face': 'Tímido',
  'sick-face': 'Doente',
  'sleeping-face': 'Dormindo',
  'smiling-face': 'Sorriso alegre',
  'smirking-face': 'Sorrisinho',
  'sobbing-face': 'Choro intenso',
  'starstruck-face': 'Estrelas nos olhos',
  'surprised-face': 'Surpreso',
  'face-pulling-tongue': 'Mostrando a língua',
  'face-tongue-out': 'Língua para fora',
  'silly-tongue-face-2': 'Boba alegre',
};

/**
 * Retorna a URL direta do SVG local (com fallback para Koboyo se necessário).
 */
export function getKoboyoAvatarUrl(slug: string): string {
  const cleanSlug = slug.replace(/^koboyo:/, '').replace('.svg', '');
  return `/icons/koboyo/${cleanSlug}.svg`;
}

/**
 * Resolve o avatar do usuário.
 * 1. Foto personalizada (`profilePictureUrl` / `photoUrl`) se houver.
 *    - Se for URL externa (http, https, data URI, blob) ou caminho absoluto iniciado em '/', retorna o próprio link.
 *    - Se for um slug do Koboyo (ex: "sceptical-face", "face-eyepatch"), converte para a URL local.
 * 2. Ícone Hand-drawn do Koboyo (`avatarSlug`) se houver.
 * 3. `undefined` (faz fallback para iniciais do usuário).
 */
export function resolveUserAvatar(
  profilePictureUrl?: string | null,
  avatarSlug?: string | null
): string | undefined {
  const photo = profilePictureUrl?.trim();
  const slug = avatarSlug?.trim();

  if (photo && photo.length > 0) {
    // Se for URL externa, data URI ou blob
    if (
      photo.startsWith('http://') ||
      photo.startsWith('https://') ||
      photo.startsWith('data:') ||
      photo.startsWith('blob:')
    ) {
      return photo;
    }

    // Se já for um path relativo servido do public
    if (photo.startsWith('/')) {
      return photo;
    }

    // Se o backend enviar um slug Koboyo no campo photoUrl (ex: "sceptical-face", "face-eyepatch")
    return getKoboyoAvatarUrl(photo);
  }

  if (slug && slug.length > 0) {
    return getKoboyoAvatarUrl(slug);
  }

  return undefined;
}

/**
 * Verifica se a URL resolvida ou slug corresponde a um avatar do Koboyo.
 */
export function isKoboyoAvatar(
  avatarUrlOrSlug?: string | null,
  avatarSlug?: string | null
): boolean {
  if (!avatarUrlOrSlug && !avatarSlug) return false;
  const target = (avatarUrlOrSlug || avatarSlug || '').trim();
  if (target.includes('/icons/koboyo/') || target.startsWith('koboyo:')) return true;
  return target in KOBOYO_AVATAR_NAMES;
}
