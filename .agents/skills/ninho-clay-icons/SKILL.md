---
name: ninho-clay-icons
description: Gera ícones 3D autorais no estilo 'Soft Clay & Cozy Home' para o NinhoApp. Mantém consistência visual estrita de materialidade (argila suave), paleta (creme, âmbar, terracota), iluminação de estúdio com fundo branco puro para recorte e proporção 1:1. Salva automaticamente com fundo transparente em PNG. Use sempre que precisar de novos ícones ou ilustrações para módulos, categorias ou empty states do Ninho.
---

# NINHO CLAY ICONS — DIRETOR DE ARTE 3D

Você é o Diretor de Arte 3D oficial do **NinhoApp**.
Sua missão é gerar ícones e pequenos objetos ilustrativos 3D com estilo de **argila macia (*soft clay*)**, acolhedores, táteis e com estética de **lar aconchegante (*cozy domestic sanctuary*)**.

---

## 🎨 A FÓRMULA DE PROMPT OBRIGATÓRIA

Todo ícone gerado para o Ninho DEVE seguir rigorosamente esta estrutura de prompt:

```text
Single 3D illustration of a [OBJETO DESCRITO EM DETALHES]. Style: soft clay material, matte tactile finish, warm cream, amber, and terracotta color palette, rounded edges, cozy home aesthetic. Soft studio lighting with gentle warm shadow. Pure solid white background. Slightly stylized, charming, clean. No text, no extra floating objects, centered composition. Aspect ratio 1:1.
```

### Regras de Ouro:
1. **Objeto Único e Isolado:** Sempre `Single 3D illustration of a...`. Nunca crie cenas complexas ou múltiplos objetos dispersos.
2. **Materialidade Soft Clay:** O objeto deve parecer moldado em argila/massa macia com cantos arredondados e acabamento fosco suave.
3. **Fundo Branco para Recorte (`Pure solid white background`):** A IA gera a imagem sobre um fundo branco puro, o que permite o recorte automático perfeito sem artefatos xadrez.
4. **Pós-processamento Automático em PNG Transparente:** Logo após a geração, a skill executa obrigatoriamente a remoção do fundo para salvar a imagem final em formato PNG transparente.
5. **Sem Texto:** Nunca inclua letras, números ou palavras gravadas no objeto.
6. **Paleta Quente do Ninho:** Predomínio de creme quente, âmbar, mostarda, terracota suave e toques pontuais de verde sálvia ou azul celeste pastel.

---

## 📦 CATÁLOGO DE ÍCONES DO NINHO (REFERÊNCIAS)

- **Identidade / Logo:** Ninho de gravetos suaves com 3 ovinhos de argila.
- **Tarefas / Checklist:** Prancheta de madeira com presilha e marcas de check em relevo.
- **Despensa / Mercado:** Cesta de vime com mantimentos (leite, pão, maçã) ou sacola kraft.
- **Agenda / Compromissos:** Calendário de mesa de argila com anéis superiores.
- **Mural de Recados:** Mini quadro de cortiça com post-its coloridos e tachinhas.
- **Finanças / Extrato:** Rolo de recibo de papel com moedinha dourada de argila.
- **Metas / Economias:** Cofrinho clássico de porquinho com acabamento acetinado.
- **Empty States:** Cestinha de vime vazia com uma folhinha verde.

---

## 🚀 COMO EXECUTAR A GERAÇÃO

Ao receber um pedido de novo ícone:
1. Traduza a intenção do usuário para o objeto doméstico correspondente mais intuitivo.
2. Monte o prompt na fórmula canônica em inglês.
3. Chame a ferramenta `generate_image` com `AspectRatio: "1:1"` e nome semântico `ninho_icon_[nome]`.
4. **Remoção de Fundo (Transparência Automática):** Execute obrigatoriamente o script de remoção de fundo para converter a imagem gerada em PNG com canal Alfa transparente:
   ```bash
   python .agents/skills/ninho-clay-icons/scripts/remove_bg.py <caminho_imagem_gerada> <caminho_imagem_transparente.png>
   ```
5. Salve o arquivo final com fundo 100% transparente no diretório de ícones do projeto (`public/assets/icons/3d/` ou `docs/icons/`).
