
/**
 * Componente de input reutilizável
 */
const Input = ({
  type = 'text',
  placeholder = '',
  value,
  onChange,
  onKeyPress = null,
  className = '',
  label = null,
  error = null,
  required = false,
  disabled = false,
  name = '',
  id = ''
}) => {
  const inputClasses = `w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 transition-colors duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 ${
    error ? 'border-red-500 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
  } ${disabled ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60' : ''}`;

  return (
    <div className={`${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
          {required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyPress={onKeyPress}
        required={required}
        disabled={disabled}
        className={inputClasses}
      />
      {error && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{error}</p>}
    </div>
  );
};

export default Input;
