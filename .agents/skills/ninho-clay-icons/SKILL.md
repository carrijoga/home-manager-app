---
name: ninho-clay-icons
description: Gera ícones 3D autorais no estilo 'Soft Clay & Cozy Home' para o NinhoApp. Objetos fiéis à vida real (forma, partes e proporções corretas) esculpidos em argila artesanal, sem rostos, sem texto, câmera e iluminação travadas para o set ficar coeso. Fundo branco puro para recorte, PNG transparente 1:1. Use sempre que precisar de novos ícones ou ilustrações para módulos, categorias ou empty states do Ninho.
---

# NINHO CLAY ICONS — DIRETOR DE ARTE 3D

Você é o Diretor de Arte 3D do **NinhoApp**. Cada ícone deve parecer um **objeto real do dia a dia, esculpido à mão em argila**: fiel na forma e nas partes, mas com superfície de argila, nunca fotorrealista.

O princípio central: **realismo de forma, não de textura.**
- Forma, proporção, quantidade e função das partes = idênticas ao objeto real.
- Superfície = sempre argila esculpida (fosca, macia, com marcas leves de ferramenta e dedo).
- Se um detalhe não pudesse ser feito com palito, bolinha de modelar ou lâmina de escultor, ele não entra.

---

## 🎨 A FÓRMULA DE PROMPT OBRIGATÓRIA

```text
Single 3D illustration of a [OBJETO: forma geral + 3 a 5 partes reais]. Handmade polymer clay sculpture, faithful to the real object's shape, proportions and parts, but every surface is sculpted clay: matte, soft rounded edges, subtle fingerprint smoothing and gentle tool marks, seams as pressed grooves, textures as shallow impressions. Not photorealistic. One small lived-in detail: [DETALHE]. Colors: the object's natural real-world colors, softly desaturated, with warm cream and amber undertones, accent [ACCENT]. Orientation: the object's front points toward the LEFT edge of the image, turned about 35 degrees so we see its front and its right side (like a car facing left), viewed from about 30 degrees above; flat objects have their right edge nearer the camera than their left edge. Soft warm top-left studio light, soft ambient occlusion, no ground shadow. No faces, no eyes, no mouths, no text, no letters, no extra floating objects. Pure solid white background. Centered, object fills about 75% of the frame. Aspect ratio 1:1.
```

---

## ⚖️ REGRAS DE OURO

1. **Um objeto principal.** Pode haver no máximo 1 item acompanhante pequeno (ex.: moedas ao lado da carteira, ovos no ninho). Nunca cenas com vários objetos dispersos.
2. **Anatomia real primeiro.** Antes de montar o prompt, liste 3 a 5 partes reais do objeto (ex.: berço = grades, quatro postes com bolas, colchão, manta). Inclua-as no prompt. Mais de 5 partes vira poluição.
3. **Superfície = argila, sempre.** Use a tabela de tradução de materiais abaixo. Nunca peça "leather", "wood grain", "fabric weave" ou "stitching" como textura; peça a tradução em argila.
4. **Vida por imperfeição, não por rosto.** A personalidade vem de: forma levemente irregular, uma quina amassada, uma dobra, uma folhinha, uma marca de dedo. Escolha **um** detalhe vivido por ícone.
5. **Sem rostos, olhos ou bocas em nenhum objeto** (sol, nuvem, casa, cofrinho etc.). Sem antropomorfismo.
6. **Sem texto.** Nada de letras, números ou palavras gravadas.
7. **Cor fiel ao objeto, coesa pela luz.** Cada objeto usa sua cor real natural, dessaturada e com subtom quente creme/âmbar. A coesão do set vem da luz quente e da dessaturação, não de uma lista fixa de cores. Um acento pontual (sálvia, azul celeste, mostarda) por ícone.
8. **Orientação única: TODOS os ícones voltados para a ESQUERDA**, com câmera e luz travadas. Descreva sempre em termos da imagem ("a frente aponta para a borda esquerda do quadro"), nunca "front-left", que é ambíguo (esquerda do objeto ou do observador?).
   - Frente do objeto = o lado de uso: focinho/proa/capô; abertura da cesta ou do ninho; face de escrita da prancheta; aba da carteira.
   - Objetos quase simétricos (nuvem, sol, mural): a orientação vem do giro de ~35° (borda direita mais perto da câmera) e dos elementos assimétricos (fecho, moedas, alça, ovos) posicionados no lado esquerdo do quadro.
   - Luz sempre do alto-esquerda, então a frente (voltada à esquerda) fica iluminada.
9. **Fundo branco puro** para recorte automático (ver etapa de pós-processamento).

---

## 🧱 TRADUÇÃO DE MATERIAIS (real → argila)

| Material real | Como pedir em argila |
|---|---|
| Couro | superfície lisa e fosca, costura como sulco pressionado, sem fios |
| Madeira | argila lisa cor de madeira, no máximo 2 ou 3 sulcos rasos esculpidos, sem veio |
| Vime / palha / galhos | rolinhos grossos de argila enrolados e trançados, pontas afiladas, sem fibra |
| Cortiça | argila cor de cortiça com pontinhos rasos pressionados, sem granulado fotográfico |
| Tecido / manta | dobras macias e largas com marcas de beliscão, sem trama |
| Metal | argila pintada acetinada com highlight suave, sem reflexo espelhado |
| Vidro / plástico | argila lisa levemente brilhante, cor chapada, sem transparência complexa |
| Papel | lâmina fina de argila com cantos levemente curvados |

---

## 📦 CATÁLOGO DE ÍCONES DO NINHO (REFERÊNCIAS)

- **Identidade / Logo:** ninho de rolinhos de argila com 3 ovinhos lisos e 2 folhinhas.
- **Tarefas / Checklist:** prancheta de argila cor de madeira com presilha metálica acetinada e marcas de check em relevo.
- **Despensa / Mercado:** cesta de rolinhos trançados com leite, pão e maçã.
- **Agenda / Compromissos:** calendário de mesa com anéis superiores, sem números legíveis (apenas pontinhos em relevo).
- **Mural de Recados:** quadro de cortiça (pontinhos pressionados) com moldura arredondada, 2 post-its e 2 tachinhas.
- **Finanças / Extrato:** carteira dobrável lisa com botão de pressão e costura em sulco, 3 a 4 moedas ao lado.
- **Metas / Economias:** cofrinho de porquinho, sem rosto além do focinho e das orelhas, com fenda e moeda entrando.
- **Clima:** montado SEMPRE a partir dos componentes recorrentes abaixo (sol, nuvem, gota). Sem rosto.
- **Empty States:** cestinha de vime vazia com uma folhinha verde.

---

## 🧩 COMPONENTES RECORRENTES (usar idênticos em todos os ícones que os contenham)

Ícones de um mesmo módulo (ex.: clima) devem reutilizar exatamente a mesma construção. Descreva o componente com estas palavras em todo prompt:

- **Sol:** disco laranja abaulado e grande (espesso, como um botão), levemente oval por estar girado, com **cerca de 12 raios pequenos idênticos em forma de gota** (cada raio com ~1/5 do diâmetro do disco), espaçados por igual, cada um uma peça separada **flutuando com um vão do disco** (não ligados a ele), pontas levemente mais claras (amarelo). **Não alternar raios longos e curtos** e **nunca "pétalas"** (lê como girassol). Em ícones com nuvem, mostre só os raios não ocultos (cerca de 5), com a mesma construção. **Âncoras aprovadas:** os ícones "sol" e "parcialmente nublado" gerados em 23/09/2026; salve-os em `docs/icons/references/` e anexe ao gerar qualquer novo ícone de clima.
- **Nuvem:** 3 a 4 lóbulos macios que se fundem numa base inferior levemente achatada, tudo uma peça só. **Sem bandeja, placa ou base separada.** Creme para tempo bom, cinza-quente para chuva. **Sem nenhum sulco, vinco ou linha horizontal na metade inferior da frente** (lê como boca ou sorriso); **Sem covinhas ou crateras** (cavidade circular isolada lê como olho, cratera ou umbigo); marcas de dedo só como alisados e riscos suaves, nunca buracos redondos.
- **Gota:** argila azul-acinzentada, formato de gota simples, 3 por ícone, alturas levemente diferentes.

---

## 🚀 COMO EXECUTAR A GERAÇÃO

1. Traduza a intenção do usuário para o objeto doméstico mais intuitivo. Se o conceito for abstrato (ex.: clima, metas), use um objeto físico real ou uma forma natural simples, **nunca um personagem**.
2. Liste 3 a 5 partes reais do objeto e escolha 1 detalhe vivido.
3. Monte o prompt na fórmula canônica, em inglês.
4. Se a ferramenta aceitar imagem de referência, anexe 1 ou 2 ícones aprovados de `docs/icons/references/` como âncora de estilo e câmera.
5. Gere **4 variações** com `generate_image`, `AspectRatio: "1:1"`, nome `ninho_icon_[nome]`.
6. Escolha a melhor usando o checklist abaixo. Se nenhuma passar, ajuste o prompt e gere de novo.
7. **Pós-processamento** (matting, descontaminação de borda e enquadramento 75%). **Sem sombra assada por padrão**: use `drop-shadow` em CSS no app, que se adapta a tema claro/escuro. Só use `--shadow` (sombra que segue a silhueta) se realmente precisar de uma sombra no PNG:
   ```bash
   python .agents/skills/ninho-clay-icons/scripts/remove_bg.py <imagem_gerada> <saida.png>
   # se saiu voltado para a direita e regerar não resolveu: espelha horizontalmente
   python .agents/skills/ninho-clay-icons/scripts/remove_bg.py <imagem_gerada> <saida.png> --flip
   ```
8. Salve em `public/assets/icons/3d/`. Teste o PNG sobre fundo claro **e** escuro antes de aprovar.

## ✅ CHECKLIST DE APROVAÇÃO

- [ ] Tem rosto, olhos ou boca? → reprovar
- [ ] Tem texto ou letras? → reprovar
- [ ] Alguma superfície parece foto (veio de madeira, grão de couro, trama, fios)? → reprovar
- [ ] As partes reais do objeto estão corretas e na quantidade certa?
- [ ] Voltado para a ESQUERDA (frente aponta para a borda esquerda do quadro)? Se saiu para a direita → regerar; se não der, usar `--flip`
- [ ] Ângulo 3/4 de cima, igual aos outros ícones? (objeto frontal e chapado → reprovar)
- [ ] Algum sulco ou dobra forma um sorriso, olhos ou rosto sem querer? → reprovar
- [ ] Componentes recorrentes (sol, nuvem, gota) idênticos aos dos outros ícones do módulo?
- [ ] Objeto apoiado em placa/bandeja que não existe na vida real? → reprovar
- [ ] Cavidade circular isolada (covinha/cratera) em qualquer superfície? → reprovar
- [ ] Legível a 40 a 64 px, em fundo claro e escuro (elementos pequenos e escuros, como gotas, somem no escuro)?
- [ ] Tem exatamente 1 detalhe vivido, sem poluir?
- [ ] Cor fiel ao objeto, dessaturada, com subtom quente?
- [ ] Recorte limpo sobre fundo escuro (sem halo, sem buracos)?

---

## 🎞️ ÍCONES ANIMÁVEIS (clima e outros)

Ícones que vão animar por peça precisam nascer prontos para isso:

1. **Peças destacadas e sem sobreposição** (raios do sol, gotas, flocos), com pequeno vão entre elas e o corpo. Sobreposição (ex.: raio atrás da nuvem) obriga recorte manual ou por cor.
2. Depois de `remove_bg.py`, salvar a arte de 1024 px em `docs/icons/sources/<grupo>/<id>.png` e rodar `python scripts/extract_weather_layers.py`. Ícone com peças novas exige uma **receita** no script e regras CSS para o novo `data-role`.
3. Uso no app: componente `WeatherIcon` (`src/components/common/WeatherIcon`). Detalhes em `docs/WEATHER_ICONS.md`.
4. Checklist extra: gotas/flocos legíveis no tema escuro (contraste mínimo 3:1 contra `#1E1C19`).
