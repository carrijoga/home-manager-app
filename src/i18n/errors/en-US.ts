import type { ErrorDictionary } from '../types';

/**
 * Friendly error messages dictionary in English (en-US).
 * Maps all 139 stable error codes from backend (NinhoApp.Shared.ErrorCode).
 */
export const enUS: ErrorDictionary = {
  // Attachments
  Attachment_NotFound: 'Attachment not found.',

  // Authentication and Security
  Auth_InvalidOrExpiredRefreshToken: 'Your session has expired. Please sign in again.',
  Auth_RefreshTokenIsMissing: 'Refresh token is missing.',
  Security_InvalidOrExpiredToken: 'Security token is invalid or expired.',

  // Bank Accounts
  BankAccount_AccountNotFound: 'Bank account not found.',
  BankAccount_CannotChangeConfigurationWithTransactions:
    'Cannot change account type or initial balance because there are linked transactions.',
  BankAccount_CannotTransferToSameAccount: 'Cannot transfer to the same bank account.',
  BankAccount_ColorRequired: 'Bank account color is required.',
  BankAccount_ColorTooLong: 'Bank account color must not exceed 50 characters.',
  BankAccount_DestinationAccountNotFound: 'Destination bank account not found.',
  BankAccount_DifferentNests: 'Both bank accounts must belong to the same nest.',
  BankAccount_HasLinkedTransactions:
    'This bank account has linked transactions and cannot be deleted.',
  BankAccount_InsufficientBalanceForTransfer:
    'Source bank account does not have sufficient balance for this transfer.',
  BankAccount_InvalidType: 'Invalid bank account type.',
  BankAccount_NameRequired: 'Bank account name is required.',
  BankAccount_NameTooLong: 'Bank account name must not exceed 100 characters.',
  BankAccount_SourceAccountNotFound: 'Source bank account not found.',
  BankAccount_TransferAmountMustBePositive: 'Transfer amount must be greater than zero.',

  // Categories
  Category_CannotDeleteInUse:
    'This category cannot be deleted because it has linked financial transactions.',
  Category_CannotDeleteUsedInNestConfiguration:
    'This category cannot be deleted because it is set as the default shopping category for the nest.',
  Category_NotFound: 'Category not found.',

  // Files
  File_FileEmpty: 'The uploaded file is empty.',

  // Financial Transactions and Payments
  FinancialTransaction_AddPaymentOnlyAllowedForExpense:
    'Payments can only be added to expense transactions.',
  FinancialTransaction_BalanceAdjustmentDescription: 'Balance adjustment',
  FinancialTransaction_CannotUpdateWithPayments:
    'A transaction with linked payments cannot be edited.',
  FinancialTransaction_ExpenseCannotHaveSourceId:
    'An expense transaction cannot have a bank account or card set directly. Please record a payment.',
  FinancialTransaction_InvalidFinancialSource: 'Financial source is invalid.',
  FinancialTransaction_PaymentAmountGreaterThanZero: 'Payment amount must be greater than zero.',
  FinancialTransaction_PaymentNotFound: 'Payment not found.',
  FinancialTransaction_ReceiptRequiresSourceId:
    'A receipt transaction requires selecting a destination bank account.',
  FinancialTransaction_ReceiptSourceIdImmutable:
    'The bank account linked to a receipt cannot be changed.',
  FinancialTransaction_SourceBankAccountNotFoundOrInactive:
    'The selected bank account was not found or is inactive.',
  FinancialTransaction_SourcePaymentCardNotFoundOrInactive:
    'The selected payment card was not found or is inactive.',
  FinancialTransaction_TransferDescription: 'Transfer between accounts',
  Payment_AmountMustBePositive: 'Payment amount must be greater than zero.',
  Payment_DiscountCannotBeNegative: 'Payment discount cannot be negative.',
  Payment_ExceedsTransactionValue: 'Payment amount exceeds the remaining expense balance.',
  Payment_InterestCannotBeNegative: 'Payment interest cannot be negative.',
  Payment_InvalidMethod: 'Invalid payment method.',
  Payment_PaymentNotFound: 'Financial payment not found.',
  Payment_TransactionIdRequired: 'Financial transaction ID is required.',
  Transaction_AlreadyPaid: 'This transaction has already been paid in full.',
  Transaction_CannotDeleteTransfer: 'Transfer transactions cannot be deleted directly.',
  Transaction_CannotUpdateTransfer: 'Transfer transactions cannot be modified directly.',
  Transaction_DescriptionRequired: 'Transaction description is required.',
  Transaction_DescriptionTooLong: 'Transaction description must not exceed 200 characters.',
  Transaction_DueDateOnlyForExpense: 'Due date can only be set for expense transactions.',
  Transaction_IncomeOriginOnlyForReceipt: 'Income source can only be set for receipt transactions.',
  Transaction_TransactionNotFound: 'Financial transaction not found.',
  Transaction_ValueMustBePositive: 'Transaction amount must be greater than zero.',

  // Payment Cards
  PaymentCard_BankAccountRequired: 'A linked bank account is required for this card type.',
  PaymentCard_CardTypeInvalid: 'Invalid card type.',
  PaymentCard_ClosingDayInvalid: 'Closing day must be between 1 and 28.',
  PaymentCard_ColorTooLong: 'Payment card color must not exceed 50 characters.',
  PaymentCard_DueDayInvalid: 'Due day must be between 1 and 28.',
  PaymentCard_DueOrClosingDayRequired:
    'Both due day and closing day must be provided for credit cards.',
  PaymentCard_HasLinkedTransactions:
    'This card has linked transactions and cannot be deleted.',
  PaymentCard_LimitMustBePositive: 'Credit limit must be greater than zero.',
  PaymentCard_NameRequired: 'Payment card name is required.',
  PaymentCard_NameTooLong: 'Payment card name must not exceed 100 characters.',
  PaymentCard_NotACreditCard: 'This operation is only valid for credit cards.',
  PaymentCard_NotFound: 'Payment card not found.',
  PaymentCard_PreviousBalanceCannotBeNegative: 'Previous card balance cannot be negative.',

  // IP Geolocation
  IpGeolocation_AddressRequired: 'IP address is required for geolocation.',
  IpGeolocation_ResolutionFailed: 'Could not determine location for the given IP address.',
  IpGeolocation_ServiceUnavailable: 'IP geolocation service is currently unavailable.',
  IpGeolocation_UnexpectedError: 'An unexpected error occurred while resolving IP geolocation.',

  // Nest and Nest Configuration
  NestConfiguration_CategoryMustBeExpenseType:
    'The default nest category must be of type Expense.',
  NestConfiguration_DefaultCategoryRequiredWhenAutoGenerateEnabled:
    'A default category is required when automatic financial generation is enabled.',
  NestConfiguration_NotFound: 'Nest configuration not found.',
  NestConfiguration_OnlyOwnerOrAdminCanUpdate:
    'Only the owner or an administrator can update nest settings.',
  NestInvite_CannotInvite: 'You do not have permission to invite members to this nest.',
  NestInvite_NotFoundInvite: 'Invitation not found or has expired.',
  NestInvite_NotFoundNest: 'No invitation found for this nest.',
  NestInvite_ReceivedNotificationMessage: '{0} invited you to join nest {1}.',
  NestInvite_ReceivedNotificationTitle: 'Nest invitation',
  Nest_AlreadyInvited: 'This user already has a pending invitation for this nest.',
  Nest_CannotDeleteLastNest: 'You cannot delete your only nest.',
  Nest_MemberLeftNotificationMessage: '{0} left the nest {1}.',
  Nest_MemberLeftNotificationTitle: 'A member left the nest',
  Nest_MemberRemovedMessage: 'You have been removed from nest {0}.',
  Nest_MemberRemovedTitle: 'Removed from nest',
  Nest_NewMemberNotificationMessage: '{0} joined nest {1}.',
  Nest_NewMemberNotificationTitle: 'New member joined',
  Nest_NotFound: 'Nest not found.',
  Nest_OnlyOwnerCanDelete: 'Only the owner can delete this nest.',
  Nest_UserAlreadyMember: 'This user is already a member of this nest.',

  // Notice Board
  NoticeReaction_NotFound: 'Notice reaction not found.',
  Notice_InvalidMessage:
    'Notice message must not be empty and cannot exceed 200 characters.',
  Notice_NotFound: 'Notice not found.',
  Notice_Unauthorized: 'Only the author can edit or delete this notice.',

  // Notifications
  Notification_NotFound: 'Notification not found.',

  // Shopping List
  ShoppingCategory_CannotDeleteDefault: 'Default shopping categories cannot be deleted.',
  ShoppingCategory_NotFound: 'Shopping category not found.',
  ShoppingItem_AlreadyPurchased: 'This item has already been marked as purchased.',
  ShoppingItem_CannotBeIgnored: 'Only pending items can be marked as ignored.',
  ShoppingItem_ImportFailed: 'Failed to import shopping items from the file.',
  ShoppingItem_NotFound: 'Shopping list item not found.',
  ShoppingItem_NotIgnored: 'This item is not marked as ignored.',
  ShoppingItem_NotPurchased: 'This item has not been marked as purchased yet.',
  ShoppingList_CannotReopenWithPaidTransaction:
    'Cannot reopen this list because its generated financial transaction already has recorded payments.',
  ShoppingList_GeneratedFinancialObservation: 'Generated from shopping list',
  ShoppingList_IsFinished: 'This shopping list has already been completed.',
  ShoppingList_NotFound: 'Shopping list not found.',

  // Tasks
  Task_InvalidTitle:
    'Task title must not be empty and cannot exceed 200 characters.',
  Task_NotCompleted: 'The task has not been completed yet.',
  Task_NotFound: 'Task not found.',
  Task_PageMustBePositive: 'Page number must be greater than or equal to 1.',
  Task_PageSizeMustBePositive: 'Page size must be greater than or equal to 1.',

  // User and Profile
  UserConfiguration_InvalidLocale: 'Invalid locale or regional format.',
  UserConfiguration_InvalidOnboardingTour: 'Invalid onboarding tour key.',
  UserConfiguration_InvalidTheme: 'Invalid interface theme.',
  User_AlreadyExists: 'An account with this email address already exists.',
  User_AlreadyInNest: 'You are already a member of this nest.',
  User_CantGenerateUsername:
    'Could not generate a username suggestion right now. Please try again later.',
  User_CredentialsInvalid: 'Incorrect email or password.',
  User_Google_AuthenticationFailed: 'Google authentication failed.',
  User_Google_ClaimIsMissing:
    'Could not retrieve all required information from your Google account.',
  User_InvalidAvatarSlug: 'The selected avatar is not a valid option.',
  User_InvalidCredentials: 'The provided credentials are invalid.',
  User_InvalidInformations: 'The provided registration information is invalid.',
  User_InvalidProfilePictureKey: 'The uploaded profile picture is invalid.',
  User_NotFound: 'User not found.',
  User_NotInNest: 'You do not have access to this nest.',
  User_RegistrationFailed: 'Could not complete registration. Please try again later.',
  User_UserConfigurationNotFound: 'User configuration not found.',
  User_UserNestNotFound: 'No nests found for this user.',
  User_UserNotificationNotFound: 'User notifications not found.',
  User_UsernameError: 'The provided name and last name cannot be used to generate a username.',
  User_UsernameExists: 'A user with this first and last name already exists.',

  // Weather
  Weather_CityNotFound: 'City not found for weather forecast.',
  Weather_CityRequired: 'City is required for weather forecast.',
  Weather_CoordinatesRequired:
    'Latitude and longitude are required when GPS location is enabled.',
  Weather_DataRetrievalFailed:
    'Could not retrieve weather data at this moment. Please try again later.',
  Weather_InvalidSource: "Invalid weather data source. Expected 'manual', 'gps' or 'ip'.",
  Weather_IpAddressUnavailable: 'Could not determine IP address for weather information.',
  Weather_ServiceMisconfigured: 'Weather service is not properly configured.',
  Weather_ServiceUnavailable: 'Weather service is temporarily unavailable.',
  Weather_UnexpectedError: 'An unexpected error occurred while checking the weather forecast.',
};
