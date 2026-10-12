import type { ErrorDictionary } from '../types';

/**
 * Dicionário de mensagens de erro amigáveis em Português (pt-BR).
 * Mapeia todos os 139 códigos estáveis do backend (NinhoApp.Shared.ErrorCode).
 */
export const ptBR: ErrorDictionary = {
  // Anexos
  Attachment_NotFound: 'Anexo não encontrado.',

  // Autenticação e Segurança
  Auth_InvalidOrExpiredRefreshToken: 'Sua sessão expirou. Faça login novamente.',
  Auth_RefreshTokenIsMissing: 'Token de atualização não informado.',
  Security_InvalidOrExpiredToken: 'Token de segurança inválido ou expirado.',

  // Contas Bancárias
  BankAccount_AccountNotFound: 'Conta bancária não encontrada.',
  BankAccount_CannotChangeConfigurationWithTransactions:
    'Não é possível alterar o tipo ou saldo inicial da conta pois já existem transações vinculadas.',
  BankAccount_CannotTransferToSameAccount: 'Não é possível transferir para a mesma conta bancária.',
  BankAccount_ColorRequired: 'A cor da conta bancária é obrigatória.',
  BankAccount_ColorTooLong: 'A cor da conta bancária deve ter no máximo 50 caracteres.',
  BankAccount_DestinationAccountNotFound: 'Conta bancária de destino não encontrada.',
  BankAccount_DifferentNests: 'As contas bancárias da transferência devem pertencer ao mesmo ninho.',
  BankAccount_HasLinkedTransactions:
    'Esta conta bancária possui transações vinculadas e não pode ser excluída.',
  BankAccount_InsufficientBalanceForTransfer:
    'Saldo insuficiente na conta de origem para realizar esta transferência.',
  BankAccount_InvalidType: 'Tipo de conta bancária inválido.',
  BankAccount_NameRequired: 'O nome da conta bancária é obrigatório.',
  BankAccount_NameTooLong: 'O nome da conta bancária deve ter no máximo 100 caracteres.',
  BankAccount_SourceAccountNotFound: 'Conta bancária de origem não encontrada.',
  BankAccount_TransferAmountMustBePositive: 'O valor da transferência deve ser maior que zero.',

  // Categorias
  Category_CannotDeleteInUse:
    'Esta categoria não pode ser excluída pois possui transações financeiras vinculadas.',
  Category_CannotDeleteUsedInNestConfiguration:
    'Esta categoria não pode ser excluída pois está configurada como padrão de compras do ninho.',
  Category_CannotDeleteWithChildren:
    'Uma categoria com subcategorias não pode ser excluída. Mova ou exclua suas subcategorias primeiro.',
  Category_ColorInvalid: 'A cor da categoria deve ser uma cor hexadecimal no formato #RRGGBB.',
  Category_ColorRequired: 'Uma categoria principal deve ter uma cor.',
  Category_IconInvalid: 'O ícone da categoria deve ser um único emoji.',
  Category_IconRequired: 'O ícone da categoria é obrigatório.',
  Category_InvalidMove: 'Uma categoria não pode ser movida para ela mesma ou para uma de suas subcategorias.',
  Category_MaxDepthExceeded: 'As categorias suportam apenas dois níveis: uma categoria principal e suas subcategorias.',
  Category_NameAlreadyExists: 'Uma categoria com este nome já existe neste nível.',
  Category_NameRequired: 'O nome da categoria é obrigatório.',
  Category_NameTooLong: 'O nome da categoria deve ter no máximo 100 caracteres.',
  Category_NotFound: 'Categoria não encontrada.',
  Category_ParentScopeMismatch: 'A categoria pai deve pertencer ao mesmo ninho e escopo.',
  Category_ScopeInvalid: 'A categoria não pertence ao escopo esperado.',

  // Arquivos
  File_FileEmpty: 'O arquivo enviado está vazio.',

  // Transações Financeiras e Pagamentos
  FinancialTransaction_AddPaymentOnlyAllowedForExpense:
    'Pagamentos só podem ser adicionados a despesas.',
  FinancialTransaction_BalanceAdjustmentDescription: 'Ajuste de saldo',
  FinancialTransaction_CannotUpdateWithPayments:
    'Não é possível alterar uma transação que já possui pagamentos registrados.',
  FinancialTransaction_ExpenseCannotHaveSourceId:
    'Uma despesa não pode ter conta ou cartão definido diretamente. Registre um pagamento.',
  FinancialTransaction_InvalidFinancialSource: 'Origem financeira inválida.',
  FinancialTransaction_PaymentAmountGreaterThanZero: 'O valor do pagamento deve ser maior que zero.',
  FinancialTransaction_PaymentNotFound: 'Pagamento não encontrado.',
  FinancialTransaction_ReceiptRequiresSourceId:
    'Uma receita requer a seleção de uma conta bancária de destino.',
  FinancialTransaction_ReceiptSourceIdImmutable:
    'A conta bancária vinculada à receita não pode ser alterada.',
  FinancialTransaction_SourceBankAccountNotFoundOrInactive:
    'A conta bancária selecionada não foi encontrada ou está inativa.',
  FinancialTransaction_SourcePaymentCardNotFoundOrInactive:
    'O cartão de pagamento selecionado não foi encontrado ou está inativo.',
  FinancialTransaction_TransferDescription: 'Transferência entre contas',
  Payment_AmountMustBePositive: 'O valor do pagamento deve ser maior que zero.',
  Payment_DiscountCannotBeNegative: 'O desconto do pagamento não pode ser negativo.',
  Payment_ExceedsTransactionValue: 'O valor do pagamento excede o saldo restante da despesa.',
  Payment_InterestCannotBeNegative: 'Os juros do pagamento não podem ser negativos.',
  Payment_InvalidMethod: 'Método de pagamento inválido.',
  Payment_PaymentNotFound: 'Pagamento financeiro não encontrado.',
  Payment_TransactionIdRequired: 'O ID da transação financeira é obrigatório.',
  Transaction_AlreadyPaid: 'Esta transação já foi quitada.',
  Transaction_CannotDeleteTransfer:
    'Transações de transferência entre contas não podem ser excluídas diretamente.',
  Transaction_CannotUpdateTransfer:
    'Transações de transferência entre contas não podem ser alteradas diretamente.',
  Transaction_CategoryNotAllowedForType:
    'A categoria não corresponde ao tipo de transação (categorias de despesa para despesas, categorias de receita para receita).',
  Transaction_DescriptionRequired: 'A descrição da transação é obrigatória.',
  Transaction_DescriptionTooLong: 'A descrição da transação deve ter no máximo 200 caracteres.',
  Transaction_DueDateOnlyForExpense: 'Data de vencimento só pode ser informada para despesas.',
  Transaction_TransactionNotFound: 'Transação financeira não encontrada.',
  Transaction_ValueMustBePositive: 'O valor da transação deve ser maior que zero.',

  // Cartões de Pagamento
  PaymentCard_BankAccountRequired:
    'Uma conta bancária associada é obrigatória para este tipo de cartão.',
  PaymentCard_CardTypeInvalid: 'Tipo de cartão inválido.',
  PaymentCard_ClosingDayInvalid: 'O dia de fechamento deve ser entre 1 e 28.',
  PaymentCard_ColorTooLong: 'A cor do cartão deve ter no máximo 50 caracteres.',
  PaymentCard_DueDayInvalid: 'O dia de vencimento deve ser entre 1 e 28.',
  PaymentCard_DueOrClosingDayRequired:
    'O dia de vencimento e o dia de fechamento devem ser informados para cartão de crédito.',
  PaymentCard_HasLinkedTransactions:
    'Este cartão possui transações vinculadas e não pode ser excluído.',
  PaymentCard_LimitMustBePositive: 'O limite do cartão de crédito deve ser maior que zero.',
  PaymentCard_NameRequired: 'O nome do cartão é obrigatório.',
  PaymentCard_NameTooLong: 'O nome do cartão deve ter no máximo 100 caracteres.',
  PaymentCard_NotACreditCard: 'Esta operação só é permitida para cartões de crédito.',
  PaymentCard_NotFound: 'Cartão de pagamento não encontrado.',
  PaymentCard_PreviousBalanceCannotBeNegative: 'O saldo anterior do cartão não pode ser negativo.',

  // Geolocalização por IP
  IpGeolocation_AddressRequired: 'Endereço IP é obrigatório para geolocalização.',
  IpGeolocation_ResolutionFailed: 'Não foi possível identificar a localização para o IP fornecido.',
  IpGeolocation_ServiceUnavailable: 'Serviço de geolocalização por IP indisponível no momento.',
  IpGeolocation_UnexpectedError: 'Erro inesperado ao consultar a geolocalização por IP.',

  // Ninho e Configurações de Ninho
  NestConfiguration_CategoryMustBeExpenseType:
    'A categoria padrão do ninho deve ser do tipo Despesa.',
  NestConfiguration_DefaultCategoryRequiredWhenAutoGenerateEnabled:
    'Uma categoria padrão é obrigatória quando a geração financeira automática estiver ativada.',
  NestConfiguration_NotFound: 'Configuração do ninho não encontrada.',
  NestConfiguration_OnlyOwnerOrAdminCanUpdate:
    'Apenas o proprietário ou um administrador pode alterar a configuração do ninho.',
  NestInvite_CannotInvite: 'Você não tem permissão para enviar convites para este ninho.',
  NestInvite_NotFoundInvite: 'Convite não encontrado ou já expirado.',
  NestInvite_NotFoundNest: 'Nenhum convite encontrado para este ninho.',
  NestInvite_ReceivedNotificationMessage: '{0} convidou você para o ninho {1}.',
  NestInvite_ReceivedNotificationTitle: 'Convite para o ninho',
  Nest_AlreadyInvited: 'Este usuário já possui um convite pendente para este ninho.',
  Nest_CannotDeleteLastNest: 'Você não pode excluir seu único ninho.',
  Nest_MemberLeftNotificationMessage: '{0} saiu do ninho {1}.',
  Nest_MemberLeftNotificationTitle: 'Um membro saiu do ninho',
  Nest_MemberRemovedMessage: 'Você foi removido do ninho {0}.',
  Nest_MemberRemovedTitle: 'Remoção de ninho',
  Nest_NewMemberNotificationMessage: '{0} entrou no ninho {1}.',
  Nest_NewMemberNotificationTitle: 'Novo membro no ninho',
  Nest_NotFound: 'Ninho não encontrado.',
  Nest_OnlyOwnerCanDelete: 'Apenas o proprietário pode excluir o ninho.',
  Nest_UserAlreadyMember: 'O usuário já é membro deste ninho.',

  // Mural de Avisos
  NoticeReaction_NotFound: 'Reação do aviso não encontrada.',
  Notice_InvalidMessage:
    'A mensagem do aviso não pode ser vazia e deve ter no máximo 200 caracteres.',
  Notice_NotFound: 'Aviso não encontrado.',
  Notice_Unauthorized: 'Apenas o autor pode editar ou excluir este aviso.',

  // Notificações
  Notification_NotFound: 'Notificação não encontrada.',

  // Lista de Compras
  ShoppingItem_AlreadyPurchased: 'Este item já foi marcado como comprado.',
  ShoppingItem_DoesNotBelongToList: 'O item de compras não pertence a esta lista de compras.',
  ShoppingItem_CannotBeIgnored: 'Apenas itens pendentes podem ser desconsiderados.',
  ShoppingItem_ImportFailed: 'Falha ao importar itens de compras a partir do arquivo.',
  ShoppingItem_NotFound: 'Item da lista de compras não encontrado.',
  ShoppingItem_NotIgnored: 'Este item não está desconsiderado.',
  ShoppingItem_NotPurchased: 'Este item ainda não foi marcado como comprado.',
  ShoppingList_CannotReopenWithPaidTransaction:
    'Não é possível reabrir esta lista pois a transação financeira gerada já possui pagamentos registrados.',
  ShoppingList_GeneratedFinancialObservation: 'Gerado a partir da lista de compras',
  ShoppingList_IsFinished: 'Esta lista de compras já foi finalizada.',
  ShoppingList_NotFound: 'Lista de compras não encontrada.',

  // Tarefas
  Task_AssignedNotificationMessage: 'Você agora é responsável por "{0}".',
  Task_AssignedNotificationTitle: 'Nova tarefa para você',
  Task_AssigneeNotFound: 'O usuário não está atribuído a esta tarefa.',
  Task_AssigneeNotInNest: 'Um dos responsáveis selecionados não pertence a este ninho.',
  Task_CompletedNotificationMessage: 'Tarefa "{0}" concluída.',
  Task_CompletedNotificationTitle: 'Tarefa concluída',
  Task_InvalidTitle:
    'O título da tarefa não pode estar vazio e deve ter no máximo 200 caracteres.',
  Task_NotCompleted: 'A tarefa ainda não foi concluída.',
  Task_NotFound: 'Tarefa não encontrada.',
  Task_OnlyOwnerAdminOrCreatorCanChangeAssignees:
    'Apenas o proprietário, um administrador ou o criador da tarefa podem alterar os responsáveis.',
  Task_OnlyOwnerOrAdminCanCompleteForOthers:
    'Apenas o proprietário ou um administrador podem concluir a tarefa de outro membro.',
  Task_PageMustBePositive: 'O número da página deve ser maior ou igual a 1.',
  Task_PageSizeMustBePositive: 'A quantidade de itens por página deve ser maior ou igual a 1.',

  // Usuário e Perfil
  UserConfiguration_InvalidLocale: 'Idioma ou formato regional inválido.',
  UserConfiguration_InvalidOnboardingTour: 'Chave do tour de apresentação inválida.',
  UserConfiguration_InvalidTheme: 'Tema de interface inválido.',
  User_AccountLocked: 'Muitas tentativas de acesso. Sua conta está temporariamente bloqueada, tente novamente mais tarde.',
  User_AlreadyExists: 'Já existe uma conta cadastrada com este endereço de e-mail.',
  User_AlreadyInNest: 'Você já faz parte deste ninho.',
  User_CantGenerateUsername:
    'Não foi possível gerar uma sugestão de username no momento. Tente novamente mais tarde.',
  User_CredentialsInvalid: 'E-mail ou senha incorretos.',
  User_Google_AuthenticationFailed: 'Falha na autenticação com a conta Google.',
  User_Google_ClaimIsMissing:
    'Não foi possível obter todas as informações necessárias da sua conta Google.',
  User_InvalidAvatarSlug: 'O avatar selecionado não é uma opção válida.',
  User_InvalidCredentials: 'As credenciais informadas são inválidas.',
  User_InvalidInformations: 'As informações de cadastro fornecidas são inválidas.',
  User_InvalidProfilePictureKey: 'A foto de perfil enviada é inválida.',
  User_NotFound: 'Usuário não encontrado.',
  User_NotInNest: 'Você não tem acesso a este ninho.',
  User_RegistrationFailed: 'Não foi possível concluir o cadastro. Tente novamente mais tarde.',
  User_UserConfigurationNotFound: 'Configurações de usuário não encontradas.',
  User_UserNestNotFound: 'Nenhum ninho encontrado para este usuário.',
  User_UserNotificationNotFound: 'Notificações do usuário não encontradas.',
  User_UsernameError: 'O nome e sobrenome informados são inválidos para geração do usuário.',
  User_UsernameExists: 'Já existe um usuário cadastrado com este nome e sobrenome.',

  // Clima e Meteorologia
  Weather_CityNotFound: 'Cidade não encontrada para a consulta meteorológica.',
  Weather_CityRequired: 'A cidade é obrigatória para consultar o clima.',
  Weather_CoordinatesRequired:
    'Latitude e longitude são obrigatórias quando a localização por GPS estiver ativada.',
  Weather_DataRetrievalFailed:
    'Não foi possível obter os dados meteorológicos no momento. Tente novamente mais tarde.',
  Weather_InvalidSource: 'Origem de dados climáticos inválida. Esperado: manual, gps ou ip.',
  Weather_IpAddressUnavailable: 'Não foi possível identificar o endereço IP para consulta do clima.',
  Weather_ServiceMisconfigured: 'O serviço de meteorologia não está configurado adequadamente.',
  Weather_ServiceUnavailable: 'O serviço de meteorologia está temporariamente indisponível.',
  Weather_UnexpectedError: 'Ocorreu um erro inesperado ao consultar a previsão do tempo.',
};
