"""
Extrai as CAMADAS animáveis dos ícones de clima do Ninho e gera:
  - public/assets/icons/3d/weather/<id>/<camada>.webp   (uma peça por arquivo, com transparência)
  - public/assets/icons/3d/weather/<id>/full.webp       (ícone completo, para uso estático)
  - src/components/common/WeatherIcon/manifest.json     (posição, papel e variáveis CSS de cada camada)

Entrada: docs/icons/sources/weather/<id>.png  (PNG 1024x1024 com fundo transparente, já passado pelo remove_bg.py)
Uso:
  python scripts/extract_weather_layers.py [--src DIR] [--out DIR] [--manifest FILE] [--size 512]

Dependências: pip install pillow numpy scipy

IMPORTANTE: cada ícone animável tem uma "receita" (função abaixo) porque a separação depende do desenho:
raios/gotas/flocos são peças soltas (componentes conectados); o raio da tempestade fica atrás da nuvem e é separado por cor.
Ícone novo com peças diferentes => nova receita. Ícones novos devem ser GERADOS com as peças destacadas e sem sobreposição.
"""
import argparse, io, json, math
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

# ---------------------------------------------------------------- utilidades
def disk(r):
    y, x = np.ogrid[-r:r + 1, -r:r + 1]
    return (x * x + y * y) <= r * r

def load(p):
    return np.array(Image.open(p).convert("RGBA"))

def make_layer(arr, mask):
    """Camada = alpha do original * máscara (0..1). Recolore a faixa de borda (3 px) com a cor interior
    mais próxima: remove franjas escuras/claras deixadas pelo recorte de fundo."""
    alpha = arr[:, :, 3].astype(float) * mask
    core = alpha >= 250
    inner = ndi.binary_erosion(core, structure=disk(3))
    if inner.sum() < 20:
        inner = core
    _, (jy, jx) = ndi.distance_transform_edt(~inner, return_indices=True)
    band = ((alpha > 0) & ~inner)[..., None]
    out = np.zeros_like(arr)
    out[:, :, :3] = np.where(band, arr[:, :, :3][jy, jx], arr[:, :, :3])
    out[:, :, 3] = alpha.astype(np.uint8)
    return out

def split_components(arr, erode=0, min_area=300):
    """Separa peças por componentes conectados do alpha. `erode` separa peças que encostam (ex.: raios no disco)."""
    alpha = arr[:, :, 3]
    core = alpha > 128
    seeds = ndi.binary_erosion(core, structure=disk(erode)) if erode else core
    lab, k = ndi.label(seeds)
    areas = ndi.sum(seeds, lab, range(1, k + 1))
    keep = [i + 1 for i, a in enumerate(areas) if a > (150 if erode else min_area)]
    corek = np.isin(lab, keep)
    dist, (iy, ix) = ndi.distance_transform_edt(~corek, return_indices=True)
    assigned = lab[iy, ix]
    assigned[(alpha == 0) | (dist > 8 + erode)] = 0
    parts = []
    for i in keep:
        m = (assigned == i).astype(float)
        ys, xs = np.where((assigned == i) & core)
        parts.append(dict(img=make_layer(arr, m), area=len(xs), cx=float(xs.mean()), cy=float(ys.mean())))
    return parts

def angle_order(items, cx, cy):
    for it in items:
        it["ang"] = (math.atan2(it["cx"] - cx, -(it["cy"] - cy)) + 2 * math.pi) % (2 * math.pi)
    items.sort(key=lambda it: it["ang"])

def unit(it, cx, cy):
    v = np.array([it["cx"] - cx, it["cy"] - cy], float)
    v /= np.linalg.norm(v)
    return round(float(v[0]), 3), round(float(v[1]), 3)

# ---------------------------------------------------------------- receitas (uma por ícone)
# Cada receita devolve (group, [(RGBA 1024x1024, meta), ...]) na ORDEM DE EMPILHAMENTO (de trás para frente).
def recipe_clear(arr):
    parts = split_components(arr, erode=18)
    disc = max(parts, key=lambda p: p["area"]); rays = [p for p in parts if p is not disc]
    angle_order(rays, disc["cx"], disc["cy"])
    layers = [(disc["img"], dict(role="disc"))]
    for k, r in enumerate(rays):
        ux, uy = unit(r, disc["cx"], disc["cy"])
        layers.append((r["img"], dict(role="ray", k=k, n=len(rays), ux=ux, uy=uy)))
    return "float", layers

def recipe_partly_cloudy(arr):
    parts = split_components(arr)
    body = max(parts, key=lambda p: p["area"]); rays = [p for p in parts if p is not body]
    P = np.array([[r["cx"], r["cy"]] for r in rays])       # centro do sol = círculo ajustado aos raios visíveis
    sol, *_ = np.linalg.lstsq(np.c_[2 * P, np.ones(len(P))], (P ** 2).sum(1), rcond=None)
    cx, cy = float(sol[0]), float(sol[1]); angle_order(rays, cx, cy)
    layers = [(body["img"], dict(role="body"))]           # nuvem + disco do sol (juntos)
    for k, r in enumerate(rays):
        ux, uy = unit(r, cx, cy)
        layers.append((r["img"], dict(role="ray", k=k, n=len(rays), ux=ux, uy=uy)))
    return "float", layers

def recipe_rain(arr):
    parts = split_components(arr)
    cloud = max(parts, key=lambda p: p["area"]); drops = sorted([p for p in parts if p is not cloud], key=lambda p: p["cx"])
    order = [1, 0, 2]                                       # ordem de queda (irregular)
    layers = [(d["img"], dict(role="drop", k=order[i])) for i, d in enumerate(drops)]   # gotas ATRÁS da nuvem
    layers.append((cloud["img"], dict(role="cloud")))
    return None, layers

def recipe_snow(arr):
    parts = split_components(arr)
    cloud = max(parts, key=lambda p: p["area"]); flakes = sorted([p for p in parts if p is not cloud], key=lambda p: p["cx"])
    order, sway = [1, 0, 2], [-1, 1, 1]
    layers = [(f["img"], dict(role="flake", k=order[i], sw=sway[i])) for i, f in enumerate(flakes)]
    layers.append((cloud["img"], dict(role="cloud")))
    return None, layers

def recipe_cloudy(arr):
    parts = split_components(arr)
    return None, [(parts[0]["img"], dict(role="single"))]

def recipe_thunderstorm(arr):
    """O raio está ATRÁS da nuvem: separa por cor (mostarda x cinza) e prolonga o raio 30 px por trás da nuvem."""
    a8 = arr[:, :, 3]; rgb = arr[:, :, :3].astype(float) / 255
    mx, mn = rgb.max(2), rgb.min(2); sat = (mx - mn) / (mx + 1e-6)
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    cand = (sat > 0.42) & (r > g) & (g > b) & (a8 > 128)
    lab, k = ndi.label(cand); areas = ndi.sum(cand, lab, range(1, k + 1))
    bolt = lab == (1 + int(np.argmax(areas)))
    bolt = ndi.gaussian_filter(bolt.astype(float), 1.6) > 0.5              # suaviza a fronteira (classificação por cor é ruidosa)
    # nuvem
    cl = (a8 > 128) & ~ndi.binary_dilation(bolt, structure=disk(4))
    lab2, k2 = ndi.label(cl); ar2 = ndi.sum(cl, lab2, range(1, k2 + 1)); cloud_reg = lab2 == (1 + int(np.argmax(ar2)))
    cloud_reg_d = ndi.binary_dilation(cloud_reg, structure=disk(6))
    cloud_m = cloud_reg_d.astype(float) * (1 - ndi.gaussian_filter(ndi.binary_erosion(bolt, structure=disk(5)).astype(float), 0.8))
    # raio prolongado PARA CIMA (só dentro da silhueta da nuvem), repetindo a cor do topo de cada coluna
    H, W = bolt.shape; ext = np.zeros_like(bolt); rgb_b = arr[:, :, :3].copy()
    for x in range(W):
        col = np.where(bolt[:, x])[0]
        if len(col) == 0:
            continue
        yt = col.min(); ysrc = min(yt + 8, col.max()); y0 = max(yt - 30, 0)
        ext[y0:yt, x] = True; rgb_b[y0:yt, x] = arr[ysrc, x, :3]
    ext &= (a8 > 128)
    _, (iy, ix) = ndi.distance_transform_edt(~bolt, return_indices=True)
    ring = ndi.binary_dilation(bolt, structure=disk(2)) & ~bolt
    rgb_b[ring] = arr[:, :, :3][iy, ix][ring]
    arr_b = arr.copy(); arr_b[:, :, :3] = rgb_b; arr_b[:, :, 3] = np.where(ext, 255, arr[:, :, 3])
    bolt_l = make_layer(arr_b, (ndi.binary_dilation(bolt, structure=disk(2)) | ext).astype(float))
    cloud_l = make_layer(arr, cloud_m)
    ys, xs = np.where(bolt); top_y = int(ys.min()); top_x = float(xs[ys < top_y + 12].mean())
    # "hot": raio mais claro (só a parte visível, com rampa de opacidade no topo p/ não clarear a sombra da nuvem)
    hot = bolt_l.copy(); hot[:, :, :3] = (hot[:, :, :3] * 0.45 + np.array([255, 244, 200]) * 0.55).astype(np.uint8)
    hot[:, :, 3] = np.where(ndi.binary_dilation(bolt, structure=disk(2)), hot[:, :, 3], 0).astype(np.uint8)
    ramp = np.clip((np.arange(H)[:, None] - top_y - 10) / 80.0, 0, 1)
    hot[:, :, 3] = (hot[:, :, 3] * ramp).astype(np.uint8)
    # "glow": halo borrado do raio
    ga = ndi.gaussian_filter(bolt_l[:, :, 3].astype(float) / 255, 34); ga = np.clip(ga / ga.max(), 0, 1) * 0.95
    glow = np.zeros_like(arr); glow[:, :, :3] = (255, 205, 90); glow[:, :, 3] = (ga * 255).astype(np.uint8)
    return None, [(glow, dict(role="glow")), (bolt_l, dict(role="bolt", _origin=(top_x, top_y))),
                  (hot, dict(role="hot", _origin=(top_x, top_y))), (cloud_l, dict(role="stormcloud"))]

RECIPES = {"clear": recipe_clear, "cloudy": recipe_cloudy, "partly-cloudy": recipe_partly_cloudy,
           "rain": recipe_rain, "thunderstorm": recipe_thunderstorm, "snow": recipe_snow}

# ---------------------------------------------------------------- saída
def crop_encode(arr, size):
    im = Image.fromarray(arr, "RGBA").resize((size, size), Image.LANCZOS)
    a = np.array(im)[:, :, 3]; ys, xs = np.where(a > 0)
    x0, x1 = max(xs.min() - 2, 0), min(xs.max() + 3, size); y0, y1 = max(ys.min() - 2, 0), min(ys.max() + 3, size)
    crop = im.crop((x0, y0, x1, y1)); buf = io.BytesIO()
    crop.save(buf, "WEBP", quality=90, alpha_quality=100, method=6)
    box = dict(x=round(x0 / size * 100, 3), y=round(y0 / size * 100, 3), w=round((x1 - x0) / size * 100, 3), h=round((y1 - y0) / size * 100, 3))
    return im, buf.getvalue(), box

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", default="docs/icons/sources/weather")
    ap.add_argument("--out", default="public/assets/icons/3d/weather")
    ap.add_argument("--manifest", default="src/components/common/WeatherIcon/manifest.json")
    ap.add_argument("--size", type=int, default=512)
    a = ap.parse_args()
    src, out = Path(a.src), Path(a.out)
    manifest = dict(size=a.size, basePath="assets/icons/3d/weather", icons={})
    for name, recipe in RECIPES.items():
        arr = load(src / f"{name}.png"); group, layers = recipe(arr)
        d = out / name; d.mkdir(parents=True, exist_ok=True)
        for f in d.glob("*.webp"): f.unlink()
        entries, total = [], 0
        full = Image.new("RGBA", (a.size, a.size), (0, 0, 0, 0)); counters = {}
        for arr_l, meta in layers:
            role = meta["role"]; idx = counters.get(role, 0); counters[role] = idx + 1
            fname = f"{role}.webp" if role in ("disc", "body", "cloud", "single", "stormcloud", "bolt", "hot", "glow") else f"{role}-{idx:02d}.webp"
            im, data, box = crop_encode(arr_l, a.size)
            (d / fname).write_bytes(data); total += len(data)
            e = dict(file=fname, role=role, **box)
            for key in ("k", "n", "ux", "uy", "sw"):
                if key in meta: e[key] = meta[key]
            if "_origin" in meta:   # origem do transform = topo visível do raio, em % da caixa da camada
                ox, oy = meta["_origin"]
                e["ox"] = round((ox / 1024 * 100 - box["x"]) / box["w"] * 100, 1); e["oy"] = round((oy / 1024 * 100 - box["y"]) / box["h"] * 100, 1)
            entries.append(e)
            if role not in ("glow", "hot"): full.alpha_composite(im)
        buf = io.BytesIO(); full.save(buf, "WEBP", quality=90, alpha_quality=100, method=6)
        (d / "full.webp").write_bytes(buf.getvalue())
        manifest["icons"][name] = dict(layers=entries, **({"group": group} if group else {}))
        print(f"{name:14s} {len(entries):2d} camadas  {total/1024:5.1f} KB  (+ full {len(buf.getvalue())/1024:.1f} KB)")
    Path(a.manifest).parent.mkdir(parents=True, exist_ok=True)
    Path(a.manifest).write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print("manifest:", a.manifest)

if __name__ == "__main__":
    main()
