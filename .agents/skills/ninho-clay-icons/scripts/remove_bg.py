"""
Remove o fundo branco de ícones gerados por IA, normaliza o enquadramento
e (opcionalmente, com --shadow) adiciona sombra que segue a silhueta.

Uso:
  python remove_bg.py <entrada> <saida.png> [--size 1024] [--fill 0.78]
                      [--shadow] [--flip] [--no-normalize] [--model isnet-general-use]

Dependências:
  pip install rembg onnxruntime pillow numpy scipy

Por que não é mais um threshold de branco:
  - threshold apaga highlights claros DENTRO do objeto (buracos);
  - a rampa de alpha estreita vira uma máscara binária (borda serrilhada);
  - sombras viram manchas brancas/opacas;
  - as bordas mantêm a cor misturada com branco (halo em dark mode).
"""
import argparse
import numpy as np
from PIL import Image, ImageFilter, ImageOps
from rembg import new_session, remove


def matte(img_rgb, model):
    """Máscara de alpha por modelo de matting (rembg)."""
    session = new_session(model)
    mask = remove(img_rgb, session=session, only_mask=True, post_process_mask=True)
    return np.asarray(mask, dtype=np.float32) / 255.0


def decontaminate_white(rgb, alpha):
    """
    Remove a contribuição do fundo branco nos pixels de borda.
    C = a*F + (1-a)*255  ->  F = (C - (1-a)*255) / a
    Sem isso, a borda fica esbranquiçada (halo) em fundo escuro.
    """
    a = alpha[..., None]
    fg = (rgb - (1.0 - a)) / np.maximum(a, 1e-3)
    fg = np.clip(fg, 0.0, 1.0)
    edge = (a > 0.0) & (a < 1.0)
    return np.where(edge, fg, rgb)


def normalize(rgba_img, size, fill):
    """Recorta no bbox e centraliza numa tela quadrada, objeto ocupando `fill` da tela."""
    alpha = np.asarray(rgba_img)[..., 3]
    ys, xs = np.where(alpha > 5)
    if len(xs) == 0:
        return rgba_img
    crop = rgba_img.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    scale = (size * fill) / max(crop.size)
    new_w, new_h = max(1, round(crop.width * scale)), max(1, round(crop.height * scale))
    crop = crop.resize((new_w, new_h), Image.LANCZOS)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    # sobe um pouco o objeto para sobrar espaço para a sombra
    ox = (size - new_w) // 2
    oy = (size - new_h) // 2 - round(size * 0.02)
    canvas.alpha_composite(crop, (ox, oy))
    return canvas


def add_silhouette_shadow(canvas, size, opacity=0.16, offset=0.022, blur=0.018,
                          color=(40, 30, 25)):
    """
    Sombra opcional que SEGUE A SILHUETA do objeto (deslocada para baixo e borrada),
    em cinza-quente neutro. Não usa elipse fixa: uma elipse igual para todo ícone vira
    um 'retângulo' borrado quando o objeto é assimétrico (sol, gotas soltas etc.).
    Padrão é NÃO usar: prefira drop-shadow via CSS, que se adapta a claro/escuro.
    """
    arr = np.asarray(canvas)
    alpha = Image.fromarray(arr[..., 3], "L").filter(ImageFilter.GaussianBlur(size * blur))
    a = np.asarray(alpha, dtype=np.float32)
    dy = max(1, round(size * offset))
    shifted = np.zeros_like(a)
    shifted[dy:, :] = a[:-dy, :]
    shadow = np.zeros((size, size, 4), dtype=np.uint8)
    shadow[..., :3] = color
    shadow[..., 3] = (shifted * opacity).astype(np.uint8)
    out = Image.fromarray(shadow, "RGBA")
    out.alpha_composite(canvas)  # objeto por cima da sombra
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("input")
    ap.add_argument("output")
    ap.add_argument("--size", type=int, default=1024)
    ap.add_argument("--fill", type=float, default=0.78)
    ap.add_argument("--shadow", action="store_true",
                    help="adiciona sombra que segue a silhueta (padrão: sem sombra)")
    ap.add_argument("--no-normalize", action="store_true")
    ap.add_argument("--flip", action="store_true",
                    help="espelha horizontalmente (ícone saiu voltado para o lado errado)")
    ap.add_argument("--model", default="isnet-general-use")
    args = ap.parse_args()

    img = Image.open(args.input).convert("RGB")
    if args.flip:
        img = ImageOps.mirror(img)
    rgb = np.asarray(img, dtype=np.float32) / 255.0
    alpha = matte(img, args.model)
    fg = decontaminate_white(rgb, alpha)

    rgba = np.dstack([fg, alpha])
    result = Image.fromarray((rgba * 255).round().astype(np.uint8), "RGBA")

    if not args.no_normalize:
        result = normalize(result, args.size, args.fill)
    if args.shadow:
        result = add_silhouette_shadow(result, result.size[0])

    result.save(args.output, "PNG")
    print(f"OK: {args.output} ({result.size[0]}x{result.size[1]})")


if __name__ == "__main__":
    main()