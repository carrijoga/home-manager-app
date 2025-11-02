
/**
 * Componente de Logo do Ninho
 * Renderiza o ícone do ninho com o texto
 */
const Logo = ({ size = 'default', showText = true }) => {
  const sizes = {
    small: { icon: 32, text: 'text-xl', tagline: 'text-xs' },
    default: { icon: 48, text: 'text-3xl', tagline: 'text-sm' },
    large: { icon: 64, text: 'text-4xl', tagline: 'text-base' }
  };

  const { icon, text, tagline } = sizes[size] || sizes.default;

  return (
    <div className="flex items-center gap-3">
      {/* Ícone do Ninho */}
      <div className="relative" style={{ width: icon, height: icon }}>
        <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
          {/* Círculo de fundo sutil */}
          <circle cx="30" cy="30" r="28" fill="#8B5A3C" opacity="0.1" />

          {/* Base do ninho */}
          <ellipse cx="30" cy="36" rx="16" ry="7" fill="#654321" />
          <ellipse cx="30" cy="34" rx="16" ry="7" fill="#8B5A3C" />

          {/* Galhos entrelaçados */}
          <path d="M 14 34 Q 16 32 18 34" stroke="#654321" strokeWidth="1.2" fill="none" />
          <path d="M 20 33 Q 22 31 24 33" stroke="#654321" strokeWidth="1.2" fill="none" />
          <path d="M 36 33 Q 38 31 40 33" stroke="#654321" strokeWidth="1.2" fill="none" />
          <path d="M 42 34 Q 44 32 46 34" stroke="#654321" strokeWidth="1.2" fill="none" />

          {/* Ovos no ninho */}
          <ellipse cx="26" cy="34" rx="3.5" ry="4.5" fill="#F4D03F" />
          <ellipse cx="34" cy="34" rx="3.5" ry="4.5" fill="#F4D03F" />
          <ellipse cx="30" cy="32" rx="3.5" ry="4.5" fill="#F4D03F" />

          {/* Brilho sutil nos ovos */}
          <ellipse cx="27" cy="32" rx="1.2" ry="1.8" fill="#FFF9E6" opacity="0.7" />
          <ellipse cx="35" cy="32" rx="1.2" ry="1.8" fill="#FFF9E6" opacity="0.7" />
          <ellipse cx="31" cy="30" rx="1.2" ry="1.8" fill="#FFF9E6" opacity="0.7" />

          {/* Detalhe de folha/ramo */}
          <path d="M 15 28 Q 12 26 14 24" stroke="#52B788" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <ellipse cx="13" cy="25" rx="2" ry="3" fill="#52B788" opacity="0.6" transform="rotate(-20 13 25)" />
        </svg>
      </div>

      {/* Texto do Logo */}
      {showText && (
        <div className="flex flex-col">
          <span className={`${text} font-bold text-indigo-500 dark:text-dark-accent-indigo transition-colors duration-300`}>
            Ninho
          </span>
          <span className={`${tagline} text-gray-500 dark:text-dark-text-tertiary italic -mt-1 transition-colors duration-300`}>
            Seu lar, organizado
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
