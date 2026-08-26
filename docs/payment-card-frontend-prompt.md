Preciso adaptar o frontend (React) para a nova API de "Payment Card" (antes era "Credit Card"). A API foi reestruturada para suportar 4 tipos de cartão com regras diferentes por tipo. Segue tudo que você precisa: rotas, shapes exatos de request/response, e as regras de validação por tipo.

## O que mudou

O antigo `CreditCard` virou `PaymentCard`, com um campo `CardType` que pode ser `Credit`, `Debit`, `Prepaid` ou `Other`. Cada tipo tem campos obrigatórios diferentes. Se o frontend hoje só lida com "cartão de crédito", provavelmente precisa:
1. Trocar toda referência de rota/tipo de `credit-card(s)` para `payment-card(s)`.
2. Adicionar um seletor de tipo de cartão (`CardType`) no formulário de criação, que mostra/oculta campos dinamicamente conforme o tipo escolhido.
3. Atualizar os tipos TypeScript para refletir os novos shapes abaixo.

## Enum CardType

**Importante: o backend serializa o enum como número inteiro, não como string.** Envie/receba os seguintes valores:

```ts
enum CardType {
  Credit = 0,
  Debit = 1,
  Prepaid = 2,
  Other = 3,
}
```

## Regras por tipo (para validação no formulário, espelhando o backend)

| Campo | Credit | Debit | Prepaid | Other |
|---|---|---|---|---|
| `bankAccountId` | **obrigatório** | **obrigatório** | opcional | não se aplica (sempre null) |
| `creditLimit` | **obrigatório**, > 0 | não se aplica | não se aplica | não se aplica |
| `dueDay` / `closingDay` | pelo menos **um dos dois** obrigatório (1–28); se só um vier, o outro é calculado automaticamente pelo backend | não se aplica | não se aplica | não se aplica |
| `previousBalance` | opcional, ≥ 0 (default 0 se omitido) | não se aplica | não se aplica | não se aplica |
| `name` | obrigatório (máx 100 caracteres), todos os tipos |
| `color` | opcional (máx 50 caracteres), todos os tipos |

O backend valida tudo isso e retorna 400 com mensagem de erro se algo obrigatório faltar — mas o ideal é o formulário já esconder/desabilitar campos que não se aplicam ao tipo selecionado, para não confundir o usuário.

## Endpoints

Base: `/api/payment-cards` (era `/api/credit-cards`)

### Criar cartão
`POST /api/payment-cards/create`

Request body (um único shape para todos os tipos — campos não aplicáveis ao tipo escolhido podem ser omitidos/null):
```ts
interface CreatePaymentCardRequest {
  cardType: CardType;        // obrigatório, 0-3
  name: string;               // obrigatório
  bankAccountId?: string;     // Guid, obrigatório p/ Credit e Debit
  creditLimit?: number;       // obrigatório p/ Credit
  dueDay?: number;            // 1-28, ao menos um (dueDay|closingDay) obrigatório p/ Credit
  closingDay?: number;        // 1-28
  previousBalance?: number;   // p/ Credit, default 0
  color?: string;             // opcional, todos os tipos
}
```
Resposta: `201 Created` com o `Guid` do novo cartão no corpo.

### Buscar por id
`GET /api/payment-cards/get-by-id?id={guid}`
Resposta: `200 OK` com `PaymentCardResponse` (shape abaixo).

### Listar (do nest atual)
`GET /api/payment-cards/list`
Resposta: `200 OK` com array de `PaymentCardResponse`.

### Atualizar nome/cor (qualquer tipo de cartão)
`PUT /api/payment-cards/update-details/{id}`
```ts
interface UpdatePaymentCardDetailsRequest {
  name: string;
  color?: string;
}
```

### Atualizar limite/dias (só cartões Credit)
`PUT /api/payment-cards/update-credit-settings/{id}`
```ts
interface UpdateCreditPaymentCardSettingsRequest {
  creditLimit: number;
  dueDay?: number;
  closingDay?: number;
}
```
Retorna erro se o cartão não for do tipo `Credit`.

### Inativar / Ativar
`DELETE /api/payment-cards/inactivate/{id}`
`PATCH /api/payment-cards/activate/{id}`

## Shape de resposta (PaymentCardResponse)

```ts
interface PaymentCardResponse {
  paymentCardId: string;      // Guid
  bankAccountId?: string;     // Guid, null se não aplicável
  type: CardType;             // 0-3
  name: string;
  creditLimit?: number;       // null se não for Credit
  dueDay?: number;            // null se não for Credit
  closingDay?: number;        // null se não for Credit
  previousBalance?: number;   // null se não for Credit
  color?: string;
  isActive: boolean;
}
```

## O que fazer

1. Renomear todos os tipos/serviços/rotas de "CreditCard" para "PaymentCard" no código do frontend (componentes, hooks, serviços de API, tipos TS).
2. Adicionar o enum `CardType` e um seletor de tipo no formulário de criação.
3. Fazer o formulário de criação mostrar/ocultar campos condicionalmente conforme o `cardType` selecionado, seguindo a tabela de regras acima (não mostrar `creditLimit`/`dueDay`/`closingDay`/`previousBalance` para tipos que não sejam Credit; não mostrar `bankAccountId` para Other).
4. Ajustar telas de edição: separar (se ainda não estiver) a edição de "detalhes gerais" (nome/cor) da edição de "configurações de crédito" (limite/dias), já que agora são dois endpoints distintos — o segundo só deve aparecer/ser habilitado quando o cartão listado for do tipo Credit.
5. Atualizar qualquer lugar que exiba o tipo do cartão (ex: lista de cartões) para mostrar um label amigável a partir do enum numérico (`Credit`/`Debit`/`Prepaid`/`Other`).
