import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputDir = path.resolve(__dirname, '../public/icons/koboyo');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Slugs do backend AvatarSlugs.cs
const backendSlugs = [
  'face',
  'face-bandage',
  'face-eyepatch',
  'angry-face',
  'face-headphones',
  'face-halo',
  'face-goggles',
  'face-headset',
  'face-monocle',
  'face-snorkel',
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
  'ghost-face',
  'grinning-face',
  'robot-face',
  'sad-face',
  'sceptical-face',
  'sleeping-face',
  'smirking-face',
  'face-pulling-tongue',
  'face-tongue-out',
  'silly-tongue-face-2',
];

// Ícones de Ninhos do Koboyo (Pássaros e mascotes)
const birdSlugs = [
  'canary',
  'goldfinch',
  'bullfinch',
  'chaffinch',
  'greenfinch',
  'blackbird',
  'hummingbird',
  'chick-postbag',
  'chick-spanner',
  'chick-mascot-clapping',
  'chick-mascot-shrugging',
  'chick-mascot-surfboard',
  'feather',
  'feather-token',
];

// Slugs extras que existiam anteriormente na lista do frontend
const extraSlugs = [
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
  'furious-face',
  'grateful-face',
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
  'scared-face',
  'shocked-face',
  'shushing-face',
  'shy-face',
  'sick-face',
  'smiling-face',
  'starstruck-face',
  'surprised-face',
];

const allSlugs = Array.from(new Set([...backendSlugs, ...birdSlugs, ...extraSlugs]));

console.log(`Iniciando download de ${allSlugs.length} ícones Koboyo...`);

async function downloadIcons() {
  let successCount = 0;
  let failCount = 0;

  for (const slug of allSlugs) {
    const targetFile = path.join(outputDir, `${slug}.svg`);
    const cdnUrl = `https://koboyo.com/icons/svg/${slug}.svg`;

    try {
      const res = await fetch(cdnUrl);
      if (res.ok) {
        const svgText = await res.text();
        fs.writeFileSync(targetFile, svgText, 'utf8');
        successCount++;
        console.log(`✓ [${successCount}/${allSlugs.length}] ${slug}.svg salvo.`);
      } else {
        console.warn(`✗ Falha ao baixar ${slug} (${res.status}): ${cdnUrl}`);
        failCount++;
      }
    } catch (err) {
      console.error(`✗ Erro na requisição para ${slug}:`, err.message);
      failCount++;
    }
  }

  console.log(`\nDownload finalizado! Sucessos: ${successCount}, Falhas: ${failCount}`);
}

downloadIcons();
