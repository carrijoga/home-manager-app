import os
import sys
import argparse
from pathlib import Path
from PIL import Image

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

def format_bytes(size):
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size < 1024.0:
            return f"{size:.2f} {unit}"
        size /= 1024.0
    return f"{size:.2f} TB"

def convert_png_to_webp(target_path, quality=85, lossless=False, delete_original=False):
    target = Path(target_path)
    if not target.exists():
        print(f"❌ Caminho não encontrado: {target}")
        return

    if target.is_file():
        files = [target] if target.suffix.lower() == '.png' else []
    else:
        files = list(target.rglob('*.png'))

    if not files:
        print("⚠️  Nenhum arquivo .png encontrado.")
        return

    print(f"\n🖼️  Conversor PNG -> WebP (Python / Pillow)")
    print(f"📂 Alvo: {target.resolve()}")
    print(f"⚙️  Qualidade: {'Lossless' if lossless else quality} | Deletar originais: {'Sim' if delete_original else 'Não'}\n")
    print(f"Encontrados {len(files)} arquivo(s) PNG para converter...\n")

    total_original = 0
    total_converted = 0
    success = 0
    errors = 0

    for file_path in files:
        try:
            original_size = file_path.stat().st_size
            webp_path = file_path.with_suffix('.webp')

            with Image.open(file_path) as img:
                img.save(
                    webp_path,
                    format="WEBP",
                    quality=quality,
                    lossless=lossless,
                    method=6
                )

            new_size = webp_path.stat().st_size
            saved = original_size - new_size
            pct = (saved / original_size) * 100 if original_size > 0 else 0

            total_original += original_size
            total_converted += new_size
            success += 1

            sign = '-' if saved >= 0 else '+'
            print(f"  ✓ {file_path.name}")
            print(f"    {format_bytes(original_size)} -> {format_bytes(new_size)} ({sign}{abs(pct):.1f}%)\n")

            if delete_original:
                file_path.unlink()

        except Exception as e:
            errors += 1
            print(f"  ❌ Erro ao converter {file_path.name}: {e}\n")

    total_saved = total_original - total_converted
    total_pct = (total_saved / total_original * 100) if total_original > 0 else 0

    print("----------------------------------------------------")
    print(f"✅ Concluído: {success} convertidos{f', {errors} falhas' if errors > 0 else ''}.")
    print(f"📊 Tamanho total original: {format_bytes(total_original)}")
    print(f"📊 Tamanho total em WebP:  {format_bytes(total_converted)}")
    print(f"🎉 Economia total:        {format_bytes(total_saved)} ({total_pct:.1f}% de redução)")
    print("----------------------------------------------------\n")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Converte arquivos PNG para WebP.")
    parser.add_argument("path", nargs="?", default=".", help="Caminho do arquivo ou diretório (padrão: pasta atual)")
    parser.add_argument("-q", "--quality", type=int, default=85, help="Qualidade WebP de 1 a 100 (padrão: 85)")
    parser.add_argument("--lossless", action="store_true", help="Conversão sem perdas (lossless)")
    parser.add_argument("--delete-original", "--delete", action="store_true", help="Exclui os arquivos .png originais após conversão")

    args = parser.parse_args()
    convert_png_to_webp(
        target_path=args.path,
        quality=args.quality,
        lossless=args.lossless,
        delete_original=args.delete_original
    )
