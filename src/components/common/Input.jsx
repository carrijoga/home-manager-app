/**
 * Componente de input reutilizável
 */
const Input = ({
  type = 'text',
  placeholder = '',
  value,
  onChange,
  onKeyPress = null,
  onKeyDown = null,
  className = '',
  label = null,
  error = null,
  required = false,
  disabled = false,
  name = '',
  id = '',
}) => {
  const inputClasses = `w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-colors duration-300 bg-background text-foreground placeholder-muted-foreground ${
    error ? 'border-red-500' : 'border-input'
  } ${disabled ? 'bg-muted cursor-not-allowed opacity-60' : ''}`;

  return (
    <div className={`${className}`}>
      {label && (
        <label htmlFor={id} className="mb-1 block text-sm font-medium text-foreground">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
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
        onKeyDown={onKeyDown}
        required={required}
        disabled={disabled}
        className={inputClasses}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default Input;
