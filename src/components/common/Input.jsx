
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
  const inputClasses = `w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-colors duration-300 bg-background text-foreground placeholder-muted-foreground ${
    error ? 'border-red-500' : 'border-input'
  } ${disabled ? 'bg-muted cursor-not-allowed opacity-60' : ''}`;

  return (
    <div className={`${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-foreground mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
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
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default Input;
