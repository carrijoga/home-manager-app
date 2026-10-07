import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils";
import manifest from "./manifest.json";
import "./weather-icon.css";

export type WeatherIconName = keyof typeof manifest.icons;

interface LayerDef {
  file: string;
  role: string;
  x: number;
  y: number;
  w: number;
  h: number;
  k?: number;
  n?: number;
  ux?: number;
  uy?: number;
  sw?: number;
  ox?: number;
  oy?: number;
}

export interface WeatherIconProps {
  name: WeatherIconName;
  /** Lado do ícone: número (px) ou string CSS ("4rem"). */
  size?: number | string;
  /** false = imagem única e estática (listas longas, previsão de vários dias). */
  animated?: boolean;
  /** Texto acessível (passe via i18n). Sem `label`, o ícone é decorativo (aria-hidden). */
  label?: string;
  className?: string;
}

function usePrefersReducedMotion(): boolean {
  const query = "(prefers-reduced-motion: reduce)";
  const [reduce, setReduce] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setReduce(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduce;
}

/** Pausa as animações quando o ícone sai da tela (economiza bateria). */
function useInView<T extends Element>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, inView] as const;
}

/** Só troca para as camadas quando TODAS já foram decodificadas (evita peças aparecendo uma a uma). */
function useLayersReady(urls: string[], enabled: boolean): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    Promise.all(
      urls.map((url) => {
        const img = new Image();
        img.src = url;
        return img.decode().catch(() => undefined);
      }),
    ).then(() => !cancelled && setReady(true));
    return () => {
      cancelled = true;
    };
  }, [urls, enabled]);
  return enabled && ready;
}

export function WeatherIcon({ name, size = 96, animated = true, label, className }: WeatherIconProps) {
  const def = manifest.icons[name];
  const layers = def.layers as LayerDef[];
  const group = "group" in def ? (def.group as string) : undefined;
  const base = `${import.meta.env.BASE_URL}${manifest.basePath}/${name}`;

  const reduceMotion = usePrefersReducedMotion();
  const [ref, inView] = useInView<HTMLDivElement>();
  const wantLayers = animated && !reduceMotion;
  const urls = useMemo(() => layers.map((l) => `${base}/${l.file}`), [layers, base]);
  const showLayers = useLayersReady(urls, wantLayers);

  return (
    <div
      ref={ref}
      className={cn("wi", className)}
      style={{ width: size, height: size }}
      data-mode={showLayers ? "layers" : "static"}
      data-paused={!inView}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {showLayers ? (
        <div className="wi-g" data-anim={group}>
          {layers.map((l, i) => (
            <img
              key={l.file}
              src={urls[i]}
              alt=""
              draggable={false}
              decoding="async"
              data-role={l.role}
              style={
                {
                  left: `${l.x}%`,
                  top: `${l.y}%`,
                  width: `${l.w}%`,
                  height: `${l.h}%`,
                  ...(l.k !== undefined && { "--k": l.k }),
                  ...(l.n !== undefined && { "--n": l.n }),
                  ...(l.ux !== undefined && { "--ux": l.ux, "--uy": l.uy }),
                  ...(l.sw !== undefined && { "--sw": l.sw }),
                  ...(l.ox !== undefined && { "--ox": `${l.ox}%`, "--oy": `${l.oy}%` }),
                } as CSSProperties
              }
            />
          ))}
        </div>
      ) : (
        <img className="wi-full" src={`${base}/full.webp`} alt="" draggable={false} decoding="async" />
      )}
    </div>
  );
}
