import type { ErrorDictionary } from '../types';

/**
 * Diccionario de mensajes de error amigables en Español (es-ES).
 * Mapea los 139 códigos estables del backend (NinhoApp.Shared.ErrorCode).
 */
export const esES: ErrorDictionary = {
  // Archivos adjuntos
  Attachment_NotFound: 'Archivo adjunto no encontrado.',

  // Autenticación y Seguridad
  Auth_InvalidOrExpiredRefreshToken: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
  Auth_RefreshTokenIsMissing: 'Token de actualización no proporcionado.',
  Security_InvalidOrExpiredToken: 'Token de seguridad inválido o expirado.',

  // Cuentas Bancarias
  BankAccount_AccountNotFound: 'Cuenta bancaria no encontrada.',
  BankAccount_CannotChangeConfigurationWithTransactions:
    'No se puede cambiar el tipo o saldo inicial de la cuenta porque ya existen transacciones vinculadas.',
  BankAccount_CannotTransferToSameAccount: 'No es posible transferir a la misma cuenta bancaria.',
  BankAccount_ColorRequired: 'El color de la cuenta bancaria es obligatorio.',
  BankAccount_ColorTooLong: 'El color de la cuenta bancaria no debe superar los 50 caracteres.',
  BankAccount_DestinationAccountNotFound: 'Cuenta bancaria de destino no encontrada.',
  BankAccount_DifferentNests: 'Ambas cuentas bancarias deben pertenecer al mismo nido.',
  BankAccount_HasLinkedTransactions:
    'Esta cuenta bancaria tiene transacciones vinculadas y no se puede eliminar.',
  BankAccount_InsufficientBalanceForTransfer:
    'Saldo insuficiente en la cuenta de origen para realizar esta transferencia.',
  BankAccount_InvalidType: 'Tipo de cuenta bancaria inválido.',
  BankAccount_NameRequired: 'El nombre de la cuenta bancaria es obligatorio.',
  BankAccount_NameTooLong: 'El nombre de la cuenta bancaria no debe superar los 100 caracteres.',
  BankAccount_SourceAccountNotFound: 'Cuenta bancaria de origen no encontrada.',
  BankAccount_TransferAmountMustBePositive: 'El monto de la transferencia debe ser mayor que cero.',

  // Categorías
  Category_CannotDeleteInUse:
    'Esta categoría no se puede eliminar porque tiene transacciones financieras vinculadas.',
  Category_CannotDeleteUsedInNestConfiguration:
    'Esta categoría no se puede eliminar porque está configurada como predeterminada de compras del nido.',
  Category_NotFound: 'Categoría no encontrada.',

  // Archivos
  File_FileEmpty: 'El archivo enviado está vacío.',

  // Transacciones Financieras y Pagos
  FinancialTransaction_AddPaymentOnlyAllowedForExpense:
    'Los pagos solo se pueden agregar a gastos.',
  FinancialTransaction_BalanceAdjustmentDescription: 'Ajuste de saldo',
  FinancialTransaction_CannotUpdateWithPayments:
    'No se puede modificar una transacción que ya tiene pagos registrados.',
  FinancialTransaction_ExpenseCannotHaveSourceId:
    'Un gasto no puede tener cuenta o tarjeta definida directamente. Registre un pago.',
  FinancialTransaction_InvalidFinancialSource: 'Fuente financiera inválida.',
  FinancialTransaction_PaymentAmountGreaterThanZero: 'El monto del pago debe ser mayor que cero.',
  FinancialTransaction_PaymentNotFound: 'Pago no encontrado.',
  FinancialTransaction_ReceiptRequiresSourceId:
    'Un ingreso requiere seleccionar una cuenta bancaria de destino.',
  FinancialTransaction_ReceiptSourceIdImmutable:
    'La cuenta bancaria vinculada al ingreso no se puede modificar.',
  FinancialTransaction_SourceBankAccountNotFoundOrInactive:
    'La cuenta bancaria seleccionada no fue encontrada o está inactiva.',
  FinancialTransaction_SourcePaymentCardNotFoundOrInactive:
    'La tarjeta de pago seleccionada no fue encontrada o está inactiva.',
  FinancialTransaction_TransferDescription: 'Transferencia entre cuentas',
  Payment_AmountMustBePositive: 'El monto del pago debe ser mayor que cero.',
  Payment_DiscountCannotBeNegative: 'El descuento del pago no puede ser negativo.',
  Payment_ExceedsTransactionValue: 'El monto del pago supera el saldo pendiente del gasto.',
  Payment_InterestCannotBeNegative: 'El interés del pago no puede ser negativo.',
  Payment_InvalidMethod: 'Método de pago inválido.',
  Payment_PaymentNotFound: 'Pago financiero no encontrado.',
  Payment_TransactionIdRequired: 'El ID de la transacción financiera es obligatorio.',
  Transaction_AlreadyPaid: 'Esta transacción ya ha sido pagada en su totalidad.',
  Transaction_CannotDeleteTransfer:
    'Las transacciones de transferencia no se pueden eliminar directamente.',
  Transaction_CannotUpdateTransfer:
    'Las transacciones de transferencia no se pueden modificar directamente.',
  Transaction_DescriptionRequired: 'La descripción de la transacción es obligatoria.',
  Transaction_DescriptionTooLong: 'La descripción de la transacción no debe superar los 200 caracteres.',
  Transaction_DueDateOnlyForExpense: 'La fecha de vencimiento solo se puede indicar para gastos.',
  Transaction_IncomeOriginOnlyForReceipt: 'El origen solo se puede indicar para ingresos.',
  Transaction_TransactionNotFound: 'Transacción financiera no encontrada.',
  Transaction_ValueMustBePositive: 'El valor de la transacción debe ser mayor que cero.',

  // Tarjetas de Pago
  PaymentCard_BankAccountRequired:
    'Se requiere una cuenta bancaria asociada para este tipo de tarjeta.',
  PaymentCard_CardTypeInvalid: 'Tipo de tarjeta inválido.',
  PaymentCard_ClosingDayInvalid: 'El día de cierre debe estar entre 1 y 28.',
  PaymentCard_ColorTooLong: 'El color de la tarjeta no debe superar los 50 caracteres.',
  PaymentCard_DueDayInvalid: 'El día de vencimiento debe estar entre 1 y 28.',
  PaymentCard_DueOrClosingDayRequired:
    'Se deben indicar tanto el día de vencimiento como el de cierre para tarjetas de crédito.',
  PaymentCard_HasLinkedTransactions:
    'Esta tarjeta tiene transacciones vinculadas y no se puede eliminar.',
  PaymentCard_LimitMustBePositive: 'El límite de la tarjeta de crédito debe ser mayor que cero.',
  PaymentCard_NameRequired: 'El nombre de la tarjeta es obligatorio.',
  PaymentCard_NameTooLong: 'El nombre de la tarjeta no debe superar los 100 caracteres.',
  PaymentCard_NotACreditCard: 'Esta operación solo es válida para tarjetas de crédito.',
  PaymentCard_NotFound: 'Tarjeta de pago no encontrada.',
  PaymentCard_PreviousBalanceCannotBeNegative: 'El saldo anterior de la tarjeta no puede ser negativo.',

  // Geolocalización por IP
  IpGeolocation_AddressRequired: 'La dirección IP es obligatoria para la geolocalización.',
  IpGeolocation_ResolutionFailed: 'No fue posible determinar la ubicación para la IP proporcionada.',
  IpGeolocation_ServiceUnavailable: 'El servicio de geolocalización por IP no está disponible en este momento.',
  IpGeolocation_UnexpectedError: 'Error inesperado al consultar la geolocalización por IP.',

  // Nido y Configuración del Nido
  NestConfiguration_CategoryMustBeExpenseType:
    'La categoría predeterminada del nido debe ser de tipo Gasto.',
  NestConfiguration_DefaultCategoryRequiredWhenAutoGenerateEnabled:
    'Se requiere una categoría predeterminada cuando la generación financiera automática está activada.',
  NestConfiguration_NotFound: 'Configuración del nido no encontrada.',
  NestConfiguration_OnlyOwnerOrAdminCanUpdate:
    'Solo el propietario o un administrador puede modificar la configuración del nido.',
  NestInvite_CannotInvite: 'No tienes permiso para enviar invitaciones a este nido.',
  NestInvite_NotFoundInvite: 'Invitación no encontrada o expirada.',
  NestInvite_NotFoundNest: 'No se encontró ninguna invitación para este nido.',
  NestInvite_ReceivedNotificationMessage: '{0} te invitó a unirte al nido {1}.',
  NestInvite_ReceivedNotificationTitle: 'Invitación al nido',
  Nest_AlreadyInvited: 'Este usuario ya tiene una invitación pendiente para este nido.',
  Nest_CannotDeleteLastNest: 'No puedes eliminar tu único nido.',
  Nest_MemberLeftNotificationMessage: '{0} salió del nido {1}.',
  Nest_MemberLeftNotificationTitle: 'Un miembro salió del nido',
  Nest_MemberRemovedMessage: 'Has sido eliminado del nido {0}.',
  Nest_MemberRemovedTitle: 'Remoción de nido',
  Nest_NewMemberNotificationMessage: '{0} se unió al nido {1}.',
  Nest_NewMemberNotificationTitle: 'Nuevo miembro en el nido',
  Nest_NotFound: 'Nido no encontrado.',
  Nest_OnlyOwnerCanDelete: 'Solo el propietario puede eliminar el nido.',
  Nest_UserAlreadyMember: 'El usuario ya es miembro de este nido.',

  // Tablón de Avisos
  NoticeReaction_NotFound: 'Reacción del aviso no encontrada.',
  Notice_InvalidMessage:
    'El mensaje del aviso no puede estar vacío y debe tener como máximo 200 caracteres.',
  Notice_NotFound: 'Aviso no encontrado.',
  Notice_Unauthorized: 'Solo el autor puede editar o eliminar este aviso.',

  // Notificaciones
  Notification_NotFound: 'Notificación no encontrada.',

  // Lista de Compras
  ShoppingCategory_CannotDeleteDefault: 'Las categorías de compra predeterminadas no se pueden eliminar.',
  ShoppingCategory_NotFound: 'Categoría de compras no encontrada.',
  ShoppingItem_AlreadyPurchased: 'Este artículo ya ha sido marcado como comprado.',
  ShoppingItem_CannotBeIgnored: 'Solo los artículos pendientes se pueden descartar.',
  ShoppingItem_ImportFailed: 'Error al importar artículos de compras desde el archivo.',
  ShoppingItem_NotFound: 'Artículo de la lista de compras no encontrado.',
  ShoppingItem_NotIgnored: 'Este artículo no está descartado.',
  ShoppingItem_NotPurchased: 'Este artículo aún no ha sido marcado como comprado.',
  ShoppingList_CannotReopenWithPaidTransaction:
    'No se puede reabrir esta lista porque su transacción financiera generada ya tiene pagos registrados.',
  ShoppingList_GeneratedFinancialObservation: 'Generado a partir de la lista de compras',
  ShoppingList_IsFinished: 'Esta lista de compras ya ha sido finalizada.',
  ShoppingList_NotFound: 'Lista de compras no encontrada.',

  // Tareas
  Task_InvalidTitle:
    'El título de la tarea no puede estar vacío y debe tener como máximo 200 caracteres.',
  Task_NotCompleted: 'La tarea aún no se ha completado.',
  Task_NotFound: 'Tarea no encontrada.',
  Task_PageMustBePositive: 'El número de página debe ser mayor o igual a 1.',
  Task_PageSizeMustBePositive: 'La cantidad de elementos por página debe ser mayor o igual a 1.',

  // Usuario y Perfil
  UserConfiguration_InvalidLocale: 'Idioma o formato regional inválido.',
  UserConfiguration_InvalidOnboardingTour: 'Clave del tour de bienvenida inválida.',
  UserConfiguration_InvalidTheme: 'Tema de interfaz inválido.',
  User_AlreadyExists: 'Ya existe una cuenta registrada con este correo electrónico.',
  User_AlreadyInNest: 'Ya formas parte de este nido.',
  User_CantGenerateUsername:
    'No fue posible generar una sugerencia de nombre de usuario en este momento. Inténtalo más tarde.',
  User_CredentialsInvalid: 'Correo o contraseña incorrectos.',
  User_Google_AuthenticationFailed: 'Error en la autenticación con Google.',
  User_Google_ClaimIsMissing:
    'No fue posible obtener toda la información requerida de tu cuenta de Google.',
  User_InvalidAvatarSlug: 'El avatar seleccionado no es una opción válida.',
  User_InvalidCredentials: 'Las credenciales proporcionadas son inválidas.',
  User_InvalidInformations: 'La información de registro proporcionada es inválida.',
  User_InvalidProfilePictureKey: 'La foto de perfil proporcionada es inválida.',
  User_NotFound: 'Usuario no encontrado.',
  User_NotInNest: 'No tienes acceso a este nido.',
  User_RegistrationFailed: 'No fue posible completar el registro. Inténtalo más tarde.',
  User_UserConfigurationNotFound: 'Configuración de usuario no encontrada.',
  User_UserNestNotFound: 'No se encontraron nidos para este usuario.',
  User_UserNotificationNotFound: 'Notificaciones de usuario no encontradas.',
  User_UsernameError: 'El nombre y apellido no son válidos para generar un nombre de usuario.',
  User_UsernameExists: 'Ya existe un usuario con este nombre y apellido.',

  // Clima y Meteorología
  Weather_CityNotFound: 'Ciudad no encontrada para el pronóstico del tiempo.',
  Weather_CityRequired: 'La ciudad es obligatoria para consultar el clima.',
  Weather_CoordinatesRequired:
    'Latitud y longitud son requeridas cuando la ubicación por GPS está activada.',
  Weather_DataRetrievalFailed:
    'No fue posible obtener los datos meteorológicos en este momento. Inténtalo más tarde.',
  Weather_InvalidSource: "Fuente meteorológica inválida. Se esperaba 'manual', 'gps' o 'ip'.",
  Weather_IpAddressUnavailable: 'No se pudo determinar la dirección IP para la consulta del clima.',
  Weather_ServiceMisconfigured: 'El servicio meteorológico no está configurado adecuadamente.',
  Weather_ServiceUnavailable: 'El servicio meteorológico no está disponible temporalmente.',
  Weather_UnexpectedError: 'Ocurrió un error inesperado al consultar el pronóstico del tiempo.',
};
