/**
 * Tipos e contratos de suporte para internacionalização (i18n) e códigos de erro da API do NinhoApp.
 */

export type SupportedLanguage = 'pt-BR' | 'en-US' | 'es-ES';

export interface LanguageOption {
  value: SupportedLanguage;
  label: string;
  nativeLabel: string;
  available: boolean;
}

/**
 * Enum numérico que espelha NinhoApp.Domain.Enum.Locale no backend.
 * PortugueseBrazil = 1, EnglishUS = 2, SpanishSpain = 3.
 */
export enum ApiLocaleEnum {
  PortugueseBrazil = 1,
  EnglishUS = 2,
  SpanishSpain = 3,
}

export function languageToApiLocale(lang: SupportedLanguage): ApiLocaleEnum {
  switch (lang) {
    case 'pt-BR':
      return ApiLocaleEnum.PortugueseBrazil;
    case 'en-US':
      return ApiLocaleEnum.EnglishUS;
    case 'es-ES':
      return ApiLocaleEnum.SpanishSpain;
    default:
      return ApiLocaleEnum.PortugueseBrazil;
  }
}

export function apiLocaleToLanguage(locale: number | string): SupportedLanguage {
  if (typeof locale === 'number') {
    switch (locale) {
      case ApiLocaleEnum.PortugueseBrazil:
        return 'pt-BR';
      case ApiLocaleEnum.EnglishUS:
        return 'en-US';
      case ApiLocaleEnum.SpanishSpain:
        return 'es-ES';
      default:
        return 'pt-BR';
    }
  }

  if (typeof locale === 'string') {
    const clean = locale.trim().toLowerCase();
    if (clean.startsWith('en') || clean.includes('english')) return 'en-US';
    if (clean.startsWith('es') || clean.includes('spanish')) return 'es-ES';
    return 'pt-BR';
  }

  return 'pt-BR';
}

/**
 * Códigos estáveis de erro retornados pelo backend (NinhoApp.Shared.ErrorCode).
 */
export type KnownErrorCode =
  | 'Attachment_NotFound'
  | 'Auth_InvalidOrExpiredRefreshToken'
  | 'Auth_RefreshTokenIsMissing'
  | 'BankAccount_AccountNotFound'
  | 'BankAccount_CannotChangeConfigurationWithTransactions'
  | 'BankAccount_CannotTransferToSameAccount'
  | 'BankAccount_ColorRequired'
  | 'BankAccount_ColorTooLong'
  | 'BankAccount_DestinationAccountNotFound'
  | 'BankAccount_DifferentNests'
  | 'BankAccount_HasLinkedTransactions'
  | 'BankAccount_InsufficientBalanceForTransfer'
  | 'BankAccount_InvalidType'
  | 'BankAccount_NameRequired'
  | 'BankAccount_NameTooLong'
  | 'BankAccount_SourceAccountNotFound'
  | 'BankAccount_TransferAmountMustBePositive'
  | 'Category_CannotDeleteInUse'
  | 'Category_CannotDeleteUsedInNestConfiguration'
  | 'Category_CannotDeleteWithChildren'
  | 'Category_ColorInvalid'
  | 'Category_ColorRequired'
  | 'Category_IconInvalid'
  | 'Category_IconRequired'
  | 'Category_InvalidMove'
  | 'Category_MaxDepthExceeded'
  | 'Category_NameAlreadyExists'
  | 'Category_NameRequired'
  | 'Category_NameTooLong'
  | 'Category_NotFound'
  | 'Category_ParentScopeMismatch'
  | 'Category_ScopeInvalid'
  | 'File_FileEmpty'
  | 'FinancialTransaction_AddPaymentOnlyAllowedForExpense'
  | 'FinancialTransaction_BalanceAdjustmentDescription'
  | 'FinancialTransaction_CannotUpdateWithPayments'
  | 'FinancialTransaction_ExpenseCannotHaveSourceId'
  | 'FinancialTransaction_InvalidFinancialSource'
  | 'FinancialTransaction_PaymentAmountGreaterThanZero'
  | 'FinancialTransaction_PaymentNotFound'
  | 'FinancialTransaction_ReceiptRequiresSourceId'
  | 'FinancialTransaction_ReceiptSourceIdImmutable'
  | 'FinancialTransaction_SourceBankAccountNotFoundOrInactive'
  | 'FinancialTransaction_SourcePaymentCardNotFoundOrInactive'
  | 'FinancialTransaction_TransferDescription'
  | 'IpGeolocation_AddressRequired'
  | 'IpGeolocation_ResolutionFailed'
  | 'IpGeolocation_ServiceUnavailable'
  | 'IpGeolocation_UnexpectedError'
  | 'NestConfiguration_CategoryMustBeExpenseType'
  | 'NestConfiguration_DefaultCategoryRequiredWhenAutoGenerateEnabled'
  | 'NestConfiguration_NotFound'
  | 'NestConfiguration_OnlyOwnerOrAdminCanUpdate'
  | 'NestInvite_CannotInvite'
  | 'NestInvite_NotFoundInvite'
  | 'NestInvite_NotFoundNest'
  | 'NestInvite_ReceivedNotificationMessage'
  | 'NestInvite_ReceivedNotificationTitle'
  | 'Nest_AlreadyInvited'
  | 'Nest_CannotDeleteLastNest'
  | 'Nest_MemberLeftNotificationMessage'
  | 'Nest_MemberLeftNotificationTitle'
  | 'Nest_MemberRemovedMessage'
  | 'Nest_MemberRemovedTitle'
  | 'Nest_NewMemberNotificationMessage'
  | 'Nest_NewMemberNotificationTitle'
  | 'Nest_NotFound'
  | 'Nest_OnlyOwnerCanDelete'
  | 'Nest_UserAlreadyMember'
  | 'NoticeReaction_NotFound'
  | 'Notice_InvalidMessage'
  | 'Notice_NotFound'
  | 'Notice_Unauthorized'
  | 'Notification_NotFound'
  | 'PaymentCard_BankAccountRequired'
  | 'PaymentCard_CardTypeInvalid'
  | 'PaymentCard_ClosingDayInvalid'
  | 'PaymentCard_ColorTooLong'
  | 'PaymentCard_DueDayInvalid'
  | 'PaymentCard_DueOrClosingDayRequired'
  | 'PaymentCard_HasLinkedTransactions'
  | 'PaymentCard_LimitMustBePositive'
  | 'PaymentCard_NameRequired'
  | 'PaymentCard_NameTooLong'
  | 'PaymentCard_NotACreditCard'
  | 'PaymentCard_NotFound'
  | 'PaymentCard_PreviousBalanceCannotBeNegative'
  | 'Payment_AmountMustBePositive'
  | 'Payment_DiscountCannotBeNegative'
  | 'Payment_ExceedsTransactionValue'
  | 'Payment_InterestCannotBeNegative'
  | 'Payment_InvalidMethod'
  | 'Payment_PaymentNotFound'
  | 'Payment_TransactionIdRequired'
  | 'Security_InvalidOrExpiredToken'
  | 'ShoppingItem_AlreadyPurchased'
  | 'ShoppingItem_CannotBeIgnored'
  | 'ShoppingItem_DoesNotBelongToList'
  | 'ShoppingItem_ImportFailed'
  | 'ShoppingItem_NotFound'
  | 'ShoppingItem_NotIgnored'
  | 'ShoppingItem_NotPurchased'
  | 'ShoppingList_CannotReopenWithPaidTransaction'
  | 'ShoppingList_GeneratedFinancialObservation'
  | 'ShoppingList_IsFinished'
  | 'ShoppingList_NotFound'
  | 'Task_AssignedNotificationMessage'
  | 'Task_AssignedNotificationTitle'
  | 'Task_AssigneeNotFound'
  | 'Task_AssigneeNotInNest'
  | 'Task_CompletedNotificationMessage'
  | 'Task_CompletedNotificationTitle'
  | 'Task_InvalidTitle'
  | 'Task_NotCompleted'
  | 'Task_NotFound'
  | 'Task_OnlyOwnerAdminOrCreatorCanChangeAssignees'
  | 'Task_OnlyOwnerOrAdminCanCompleteForOthers'
  | 'Task_PageMustBePositive'
  | 'Task_PageSizeMustBePositive'
  | 'Transaction_AlreadyPaid'
  | 'Transaction_CannotDeleteTransfer'
  | 'Transaction_CannotUpdateTransfer'
  | 'Transaction_CategoryNotAllowedForType'
  | 'Transaction_DescriptionRequired'
  | 'Transaction_DescriptionTooLong'
  | 'Transaction_DueDateOnlyForExpense'
  | 'Transaction_TransactionNotFound'
  | 'Transaction_ValueMustBePositive'
  | 'UserConfiguration_InvalidLocale'
  | 'UserConfiguration_InvalidOnboardingTour'
  | 'UserConfiguration_InvalidTheme'
  | 'User_AccountLocked'
  | 'User_AlreadyExists'
  | 'User_AlreadyInNest'
  | 'User_CantGenerateUsername'
  | 'User_CredentialsInvalid'
  | 'User_Google_AuthenticationFailed'
  | 'User_Google_ClaimIsMissing'
  | 'User_InvalidAvatarSlug'
  | 'User_InvalidCredentials'
  | 'User_InvalidInformations'
  | 'User_InvalidProfilePictureKey'
  | 'User_NotFound'
  | 'User_NotInNest'
  | 'User_RegistrationFailed'
  | 'User_UserConfigurationNotFound'
  | 'User_UserNestNotFound'
  | 'User_UserNotificationNotFound'
  | 'User_UsernameError'
  | 'User_UsernameExists'
  | 'Weather_CityNotFound'
  | 'Weather_CityRequired'
  | 'Weather_CoordinatesRequired'
  | 'Weather_DataRetrievalFailed'
  | 'Weather_InvalidSource'
  | 'Weather_IpAddressUnavailable'
  | 'Weather_ServiceMisconfigured'
  | 'Weather_ServiceUnavailable'
  | 'Weather_UnexpectedError';

/** Permite códigos conhecidos com autocompletion, além de qualquer string para extensibilidade */
export type ErrorCode = KnownErrorCode | (string & {});

export type ErrorDictionary = Record<KnownErrorCode, string> & Record<string, string>;
