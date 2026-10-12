# Ícones de clima 3D animados (WeatherIcon)

Seis ícones de argila (`clear`, `cloudy`, `partly-cloudy`, `rain`, `thunderstorm`, `snow`), cada um separado em **camadas** (WebP com transparência) e animado só com CSS (`transform` e `opacity`).

## O que vem no pacote

| Caminho | O quê |
|---|---|
| `public/assets/icons/3d/weather/<id>/*.webp` | camadas de cada ícone + `full.webp` (ícone completo, 512 px) |
| `src/components/common/WeatherIcon/` | `WeatherIcon.tsx`, `weather-icon.css`, `manifest.json`, `index.ts` |
| `src/utils/weatherIcon.ts` | `owmToWeatherIcon(id, isNight)`: id do OpenWeatherMap → nome do ícone |
| `scripts/extract_weather_layers.py` | gera camadas e manifest a partir de `docs/icons/sources/weather/*.png` |
| `docs/icons/sources/weather/*.png` | artes originais (1024 px, transparentes) |
| `.agents/skills/ninho-clay-icons/` | skill atualizada + `remove_bg.py` |

Total em produção: ~350 KB (38 arquivos), 512 px.

## Uso

```tsx
import { WeatherIcon } from "@/components/common/WeatherIcon";
import { owmToWeatherIcon } from "@/utils/weatherIcon";

<WeatherIcon name={owmToWeatherIcon(weather.id)} size={96} label={t("weather.condition", { ... })} />
<WeatherIcon name="rain" size="3rem" animated={false} />   {/* lista longa / previsão de vários dias */}
```

- `label` vem do i18n (react-i18next). Sem `label`, o ícone é decorativo (`aria-hidden`).
- `animated={false}` renderiza **uma imagem só** (`full.webp`). Use em listas e previsões com vários ícones.
- Com `prefers-reduced-motion: reduce`, o componente já cai na imagem estática.
- O componente pausa as animações quando sai da tela (IntersectionObserver) e só troca para as camadas depois que **todas** foram decodificadas.
- `size` aceita número (px) ou string CSS; o movimento escala junto (unidades `cqw`).

## Regras de integração

1. **Não** importe os WebP direto nos módulos; passe sempre pelo `WeatherIcon`.
2. Máximo de **~3 ícones animados por tela**. Acima disso, `animated={false}`.
3. Testar nos temas claro e escuro. O tema escuro do Ninho (`#0A0908` a `#1E1C19`) é o mais crítico (ver "Limites").
4. PWA: confirmar que `/assets/icons/3d/weather/**` entra no precache (ou no cache em runtime) do `sw.js`, para funcionar offline.
5. Se algum ícone passar de ~170 px na tela em telas 3x, regerar com `--size 1024`.

## Mapeamento OpenWeatherMap

| `weather[0].id` | Ícone |
|---|---|
| 2xx | `thunderstorm` |
| 3xx (garoa), 5xx | `rain` |
| 6xx | `snow` |
| 800 | `clear` |
| 801, 802 | `partly-cloudy` |
| 803, 804 | `cloudy` |
| 7xx (névoa, fumaça, poeira...) | `cloudy` (aproximação) |

## Limites conhecidos (decidir antes de lançar)

- **Não há ícones noturnos.** À noite o app mostraria sol em 800/801/802. `isNight` já existe na função para não quebrar chamadas depois. Pendente: gerar `clear-night` e `partly-cloudy-night`.
- **Sem ícone de névoa.**
- **Gotas da chuva no tema escuro:** contraste médio de 2,7:1 contra `#1E1C19` (1,6:1 nas partes sombreadas), abaixo dos 3:1 recomendados para elementos gráficos. Os flocos da neve passam (4,4:1). Clarear as gotas na arte.
- **Covinha circular nas nuvens** (todas as cinco). Retocar a arte antes de usar; a skill já proíbe em ícones novos.
- **Tempestade:** o raio está atrás da nuvem. A separação é automática (por cor) e ficou limpa nos quadros conferidos, mas há dois pontinhos claros na emenda. Se incomodar, retocar `thunderstorm.png` e rodar o script de novo.
- Movimento é de recortes 2D, sem deformação da argila.

## Regerar / adicionar ícone

```bash
pip install pillow numpy scipy
python scripts/extract_weather_layers.py            # --size 1024 para telas grandes
```

Ícone novo animável precisa de uma **receita** em `extract_weather_layers.py` (a separação depende do desenho) e de regras CSS para o(s) novo(s) `data-role`. Gere a arte com as peças **destacadas e sem sobreposição** (gotas, flocos, raios); sobreposição (como o raio atrás da nuvem) exige recorte manual ou por cor.

## Critérios de aceite

- [ ] `tsc --noEmit` sem erros
- [ ] Os seis ícones animam nos temas claro e escuro, sem "peças piscando" no carregamento
- [ ] Com `prefers-reduced-motion`, aparece a imagem estática e nada se move
- [ ] Sem requisições 404 para `/assets/icons/3d/weather/**`
- [ ] Funciona offline (PWA)
- [ ] Nenhum ícone de clima anterior (Lucide etc.) sobrando nas telas que usam clima
