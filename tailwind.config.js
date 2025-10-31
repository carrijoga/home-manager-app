/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta principal do Ninho
        ninho: {
          // Marrom Terra - Cor principal do ninho
          50: '#FAF6F3',
          100: '#F5EDE7',
          200: '#E8D4C3',
          300: '#DBBB9F',
          400: '#C18E67',
          500: '#8B5A3C', // Principal
          600: '#7D5136',
          700: '#694429',
          800: '#54361F',
          900: '#3F2917',
        },
        aconchego: {
          // Amarelo Suave - Aconchego e calor
          50: '#FFFCF5',
          100: '#FEF9EB',
          200: '#FDF0CD',
          300: '#FCE7AF',
          400: '#F8D973',
          500: '#F4D03F', // Principal
          600: '#DCBB39',
          700: '#B89C2F',
          800: '#937D26',
          900: '#78671F',
        },
        natureza: {
          // Verde Natureza - Crescimento e vida
          50: '#F0F9F5',
          100: '#E1F3EB',
          200: '#B4E0CD',
          300: '#87CDAF',
          400: '#6DC09E',
          500: '#52B788', // Principal
          600: '#4AA57A',
          700: '#3E8966',
          800: '#326E52',
          900: '#295A43',
        },
        serenidade: {
          // Azul Céu - Tranquilidade e organização
          50: '#F4F8FA',
          100: '#E9F1F5',
          200: '#C8DCE6',
          300: '#A7C7D7',
          400: '#95B8CD',
          500: '#84A9C0', // Principal
          600: '#7798AD',
          700: '#637F90',
          800: '#4F6673',
          900: '#41535E',
        },
        // Cores complementares
        aviso: {
          // Amarelo para avisos
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
      },
    },
  },
  plugins: [],
}
