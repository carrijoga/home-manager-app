export interface KoboyoAvatarOption {
  slug: string;
  name: string;
  url: string;
}

/**
 * Lista oficial de ícones de rostos Hand-drawn do Koboyo.
 * Baseado nos slugs fornecidos e suportados pela plataforma Koboyo.
 */
export const KOBOYO_FACE_SLUGS: string[] = [
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

/** Rótulos amigáveis em português para cada slug de ícone */
export const KOBOYO_AVATAR_NAMES: Record<string, string> = {
  'angry-face': 'Bravo',
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
  'ghost-face': 'Assustado',
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
};

/**
 * Retorna a URL direta do SVG hospedado no CDN oficial do Koboyo.
 */
export function getKoboyoAvatarUrl(slug: string): string {
  return `https://koboyo.com/icons/svg/${slug}.svg`;
}

/**
 * Resolve o avatar do usuário.
 * 1. Foto personalizada (`profilePictureUrl` / `photoUrl`) se houver.
 *    - Se for URL (http, https, data URI, blob, /), retorna o próprio link.
 *    - Se for um slug do Koboyo (ex: "sceptical-face", "scared-face"), converte para a URL do CDN do Koboyo.
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
    // Se for URL completa, caminho relativo, data URI ou blob
    if (
      photo.startsWith('http://') ||
      photo.startsWith('https://') ||
      photo.startsWith('/') ||
      photo.startsWith('data:') ||
      photo.startsWith('blob:')
    ) {
      return photo;
    }

    // Se o backend enviar um slug Koboyo no campo photoUrl (ex: "sceptical-face", "scared-face")
    if (KOBOYO_FACE_SLUGS.includes(photo) || (!photo.includes('/') && !photo.includes('.'))) {
      return getKoboyoAvatarUrl(photo);
    }

    return photo;
  }

  if (slug && slug.length > 0) {
    return getKoboyoAvatarUrl(slug);
  }

  return undefined;
}
