import sharp from 'sharp';
import fs from 'fs/promises';
import { existsSync, statSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Formata bytes para formato legível (KB, MB)
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// Parse argumentos simples da linha de comando
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    targetPath: null,
    outDir: null,
    quality: 85,
    lossless: false,
    deleteOriginal: false,
    effort: 6,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--lossless') {
      options.lossless = true;
    } else if (arg === '--delete-original' || arg === '--delete') {
      options.deleteOriginal = true;
    } else if (arg.startsWith('--quality=')) {
      options.quality = parseInt(arg.split('=')[1], 10);
    } else if (arg === '-q' || arg === '--quality') {
      options.quality = parseInt(args[++i], 10);
    } else if (arg.startsWith('--effort=')) {
      options.effort = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--output=') || arg.startsWith('--out=')) {
      options.outDir = arg.split('=')[1];
    } else if (arg === '-o' || arg === '--output' || arg === '--outDir') {
      options.outDir = args[++i];
    } else if (!arg.startsWith('-') && !options.targetPath) {
      options.targetPath = arg;
    }
  }

  // Se nenhum caminho for passado, sugere o diretório padrão public/icons ou public
  if (!options.targetPath) {
    const defaultPublicIcons = path.resolve(__dirname, '../public/icons');
    const defaultPublic = path.resolve(__dirname, '../public');

    if (existsSync(defaultPublicIcons)) {
      options.targetPath = defaultPublicIcons;
    } else if (existsSync(defaultPublic)) {
      options.targetPath = defaultPublic;
    } else {
      options.targetPath = process.cwd();
    }
  } else {
    options.targetPath = path.resolve(process.cwd(), options.targetPath);
  }

  if (options.outDir) {
    options.outDir = path.resolve(process.cwd(), options.outDir);
  }

  return options;
}

// Coleta todos os arquivos .png recursivamente
async function getPngFiles(dirOrFile) {
  if (!existsSync(dirOrFile)) {
    throw new Error(`Caminho não encontrado: ${dirOrFile}`);
  }

  const stat = statSync(dirOrFile);
  if (stat.isFile()) {
    return dirOrFile.toLowerCase().endsWith('.png') ? [dirOrFile] : [];
  }

  const files = [];
  async function scan(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await scan(fullPath);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.png')) {
        files.push(fullPath);
      }
    }
  }

  await scan(dirOrFile);
  return files;
}

async function convertFile(pngPath, options) {
  const parsed = path.parse(pngPath);
  let webpPath;

  if (options.outDir) {
    const isTargetFile = statSync(options.targetPath).isFile();
    let destFolder = options.outDir;
    if (!isTargetFile) {
      const relDir = path.relative(options.targetPath, parsed.dir);
      destFolder = relDir ? path.join(options.outDir, relDir) : options.outDir;
    }
    if (!existsSync(destFolder)) {
      await fs.mkdir(destFolder, { recursive: true });
    }
    webpPath = path.join(destFolder, `${parsed.name}.webp`);
  } else {
    webpPath = path.join(parsed.dir, `${parsed.name}.webp`);
  }

  const initialStat = await fs.stat(pngPath);
  const originalSize = initialStat.size;

  const sharpInstance = sharp(pngPath);

  await sharpInstance
    .webp({
      quality: options.quality,
      lossless: options.lossless,
      effort: options.effort,
    })
    .toFile(webpPath);

  const newStat = await fs.stat(webpPath);
  const newSize = newStat.size;
  const savedBytes = originalSize - newSize;
  const reductionPct = ((savedBytes / originalSize) * 100).toFixed(1);

  if (options.deleteOriginal) {
    await fs.unlink(pngPath);
  }

  return {
    file: parsed.base,
    outputPath: webpPath,
    originalSize,
    newSize,
    savedBytes,
    reductionPct,
  };
}

async function main() {
  const options = parseArgs();

  console.log(`\n🖼️  Conversor PNG -> WebP`);
  console.log(`📂 Origem:  ${options.targetPath}`);
  if (options.outDir) {
    console.log(`📁 Destino: ${options.outDir}`);
  }
  console.log(`⚙️  Configurações: Qualidade: ${options.lossless ? 'Lossless' : options.quality} | Deletar originais: ${options.deleteOriginal ? 'Sim' : 'Não'}\n`);

  const files = await getPngFiles(options.targetPath);

  if (files.length === 0) {
    console.log('⚠️  Nenhum arquivo .png encontrado no caminho informado.');
    return;
  }

  console.log(`Encontrados ${files.length} arquivo(s) PNG para converter...\n`);

  let totalOriginal = 0;
  let totalConverted = 0;
  let successCount = 0;
  let errorCount = 0;

  for (const file of files) {
    try {
      const relativePath = path.relative(process.cwd(), file);
      const res = await convertFile(file, options);
      totalOriginal += res.originalSize;
      totalConverted += res.newSize;
      successCount++;

      const sign = res.savedBytes >= 0 ? '-' : '+';
      const absPct = Math.abs(res.reductionPct);
      const outputRel = path.relative(process.cwd(), res.outputPath);
      console.log(`  ✓ ${relativePath} -> ${outputRel}`);
      console.log(`    ${formatBytes(res.originalSize)} -> ${formatBytes(res.newSize)} (${sign}${absPct}%)\n`);
    } catch (err) {
      errorCount++;
      console.error(`  ❌ Erro ao converter ${file}:`, err.message);
    }
  }

  const totalSaved = totalOriginal - totalConverted;
  const totalReductionPct = totalOriginal > 0 ? ((totalSaved / totalOriginal) * 100).toFixed(1) : '0';

  console.log('----------------------------------------------------');
  console.log(`✅ Concluído: ${successCount} convertidos com sucesso${errorCount > 0 ? `, ${errorCount} falhas` : ''}.`);
  console.log(`📊 Tamanho total original: ${formatBytes(totalOriginal)}`);
  console.log(`📊 Tamanho total em WebP:  ${formatBytes(totalConverted)}`);
  console.log(`🎉 Economia total:        ${formatBytes(totalSaved)} (${totalReductionPct}% de redução)`);
  console.log('----------------------------------------------------\n');
}

main().catch(err => {
  console.error('Erro na execução:', err);
  process.exit(1);
});
