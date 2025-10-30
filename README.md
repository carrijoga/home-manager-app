# 🪺 Ninho

**Seu lar, organizado.**

Aplicativo completo de gerenciamento doméstico para toda a família. Com múltiplos módulos integrados, o Ninho facilita o dia a dia, centralizando tarefas, despesas, compras e muito mais em um único lugar.

## 📋 Sobre o Projeto

**Ninho** é uma aplicação web desenvolvida em React que ajuda você a construir e manter a organização do seu lar. Assim como os pássaros constroem seus ninhos com cuidado, o Ninho oferece as ferramentas para você cuidar da sua casa com praticidade e eficiência.

## ✨ Funcionalidades

### 📊 Dashboard
- Visão geral de todas as atividades da casa
- Quadro de avisos para comunicação familiar
- Resumo de tarefas pendentes
- Indicadores de gastos mensais
- Lista rápida de itens a comprar

### ✅ Tarefas
- Criação e gerenciamento de tarefas domésticas
- Atribuição de responsáveis
- Definição de prazos
- Marcação de tarefas concluídas
- Visualização separada de pendentes e concluídas

### 🛒 Lista de Compras
- Organização de itens por categoria (Alimentos, Limpeza, etc.)
- Definição de quantidades
- Marcação de itens já comprados
- Controle mensal de compras

### 💰 Financeiro
- Registro de despesas com categorização
- Visualização de gastos por categoria
- Cálculo automático de totais e médias
- Histórico completo de despesas

### 📦 Compras Futuras
- Planejamento de compras maiores
- Definição de prioridades (alta, média, baixa)
- Estimativa de custos
- Organização por prioridade

### 📅 Calendário
- Espaço reservado para integração futura com Google Calendar
- Sincronização de eventos familiares (em desenvolvimento)

## 🏗️ Arquitetura do Projeto

O projeto foi refatorado seguindo os princípios de **Clean Architecture** e **Separation of Concerns**:

```
ninho/
├── src/
│   ├── components/          # Componentes React
│   │   ├── common/         # Componentes reutilizáveis
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Input.jsx
│   │   │   └── Header.jsx
│   │   ├── modules/        # Módulos principais
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Tasks.jsx
│   │   │   ├── ShoppingList.jsx
│   │   │   ├── Financial.jsx
│   │   │   ├── FutureItems.jsx
│   │   │   └── Calendar.jsx
│   │   └── Navigation.jsx
│   ├── services/           # Camada de serviços
│   │   ├── api/           # Configuração de API
│   │   │   └── config.js
│   │   ├── noticeService.js
│   │   ├── taskService.js
│   │   ├── shoppingService.js
│   │   ├── financialService.js
│   │   └── futureItemsService.js
│   ├── models/            # Definições de tipos
│   │   └── types.js
│   ├── mocks/             # Dados mockados
│   │   └── data.js
│   ├── utils/             # Funções utilitárias
│   │   └── formatters.js
│   ├── App.jsx            # Componente principal
│   ├── main.jsx           # Entry point
│   └── index.css          # Estilos globais
├── public/                # Arquivos públicos
├── index.html            # HTML principal
├── package.json          # Dependências
├── vite.config.js        # Configuração Vite
├── tailwind.config.js    # Configuração Tailwind
└── README.md            # Documentação

```

## 🛠️ Tecnologias Utilizadas

- **React 18.3** - Biblioteca JavaScript para interfaces
- **Vite 5.4** - Build tool e dev server
- **Tailwind CSS 3.4** - Framework CSS utilitário
- **Lucide React** - Biblioteca de ícones
- **JavaScript ES6+** - Linguagem de programação

## 📦 Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd ninho
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

5. Acesse no navegador:
```
http://localhost:3000
```

## 🚀 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run preview` - Visualiza o build de produção
- `npm run lint` - Executa o linter
- `npm run format` - Formata o código com Prettier

## 🔧 Configuração

### Modo de Dados

Por padrão, a aplicação usa **dados mockados** localmente. Para alterar:

**Arquivo `.env`:**
```env
# Modo mock (dados locais)
VITE_DATA_MODE=mock

# Modo API (dados de servidor externo)
VITE_DATA_MODE=api
VITE_API_URL=http://localhost:3001/api
```

### Integração com API Externa

Os serviços já estão preparados para consumir uma API REST. Quando implementar o backend:

1. Configure a URL da API no arquivo `.env`
2. Altere `VITE_DATA_MODE` para `api`
3. Implemente os endpoints correspondentes no backend

**Endpoints esperados:**
- `GET /api/notices` - Lista avisos
- `POST /api/notices` - Cria aviso
- `GET /api/tasks` - Lista tarefas
- `POST /api/tasks` - Cria tarefa
- `PATCH /api/tasks/:id/toggle` - Alterna status
- E assim por diante...

### CORS

⚠️ **Importante**: Se a API estiver em outro domínio, será necessário configurar CORS no backend:

**Exemplo com Express.js:**
```javascript
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:3000', // URL do frontend
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
}));
```

## 📱 Responsividade

A aplicação é totalmente responsiva e se adapta a diferentes tamanhos de tela:
- 📱 Mobile (< 768px)
- 💻 Tablet (768px - 1024px)
- 🖥️ Desktop (> 1024px)

## 🎨 Personalização

### Cores

As cores podem ser personalizadas no arquivo `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Suas cores aqui
      }
    }
  }
}
```

### Componentes

Todos os componentes em `src/components/common/` são reutilizáveis e podem ser customizados.

## 🔮 Roadmap Futuro

- [ ] Integração com Google Calendar
- [ ] Sistema de autenticação de usuários
- [ ] Backend com Node.js e Express
- [ ] Banco de dados (MongoDB/PostgreSQL)
- [ ] Notificações push
- [ ] Modo offline com Service Workers
- [ ] Aplicativo mobile (React Native)
- [ ] Relatórios financeiros detalhados
- [ ] Gráficos e estatísticas
- [ ] Exportação de dados (PDF, Excel)

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

1. Fazer fork do projeto
2. Criar uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abrir um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👥 Autores

Desenvolvido com ❤️ para facilitar a organização doméstica.

## 📞 Suporte

Para dúvidas ou sugestões, abra uma issue no GitHub.

---

**Nota:** Este projeto está em desenvolvimento ativo. Novas funcionalidades serão adicionadas regularmente.
