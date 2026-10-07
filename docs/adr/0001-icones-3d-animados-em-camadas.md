# XXXX. Ícones 3D animados em camadas (WebP + CSS)

Status: proposta · Data: 2026-09-24 (renumerar `XXXX` conforme a sequência do repositório)

## Contexto

Os ícones de clima seguem a estética clay do Ninho e as animações atuais são micro-animações (rotate e scale) no ícone inteiro. Queremos movimento por peça (raios do sol, gotas, flocos, clarão do raio) sem GIF/MP4 e sem perder o acabamento de argila.

## Decisão

Separar cada ícone em camadas WebP com transparência, descritas por um `manifest.json`, e animar com CSS (`transform` e `opacity`) num componente React (`WeatherIcon`). A extração é feita por script versionado (`scripts/extract_weather_layers.py`), a partir das artes originais em `docs/icons/sources/`.

## Alternativas descartadas

- **SVG (vetorização automática):** testada no sol; perde volume e textura e não reduz o peso (400 KB, contra ~30 KB das camadas em WebP). SVG desenhado à mão seria outra estética.
- **GIF/MP4/vídeo com alfa:** pesado, sem adaptação a tema, difícil pausar e respeitar `prefers-reduced-motion`.
- **Lottie/Rive com raster:** mais ferramenta e runtime do que o problema pede.

## Consequências

- Ícones animáveis precisam ser gerados com **peças destacadas**; cada ícone novo pede uma receita de extração.
- ~350 KB de assets a mais (512 px); `animated={false}` em listas.
- Depende de container query units (`cqw`), suportadas em navegadores atuais.
- Sem deformação de massa: é animação de recortes 2D.
