import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // Habilita dark mode com classe
  theme: {
  	extend: {
  		animation: {
  			'fade-in': 'fadeIn 0.3s ease-out',
  			'slide-in': 'slideInRight 0.4s ease-out',
  			'scale-in': 'scaleIn 0.3s ease-out',
  			'pulse-soft': 'pulse 2s ease-in-out infinite'
  		},
  		keyframes: {
  			fadeIn: {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(10px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			slideInRight: {
  				'0%': {
  					opacity: '0',
  					transform: 'translateX(-20px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateX(0)'
  				}
  			},
  			scaleIn: {
  				'0%': {
  					opacity: '0',
  					transform: 'scale(0.95)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'scale(1)'
  				}
  			}
  		},
  		colors: {
  			ninho: {
  				'50': '#FAF6F3',
  				'100': '#F5EDE7',
  				'200': '#E8D4C3',
  				'300': '#DBBB9F',
  				'400': '#C18E67',
  				'500': '#8B5A3C',
  				'600': '#7D5136',
  				'700': '#694429',
  				'800': '#54361F',
  				'900': '#3F2917'
  			},
  			aconchego: {
  				'50': '#FFFCF5',
  				'100': '#FEF9EB',
  				'200': '#FDF0CD',
  				'300': '#FCE7AF',
  				'400': '#F8D973',
  				'500': '#F4D03F',
  				'600': '#DCBB39',
  				'700': '#B89C2F',
  				'800': '#937D26',
  				'900': '#78671F'
  			},
  			natureza: {
  				'50': '#F0F9F5',
  				'100': '#E1F3EB',
  				'200': '#B4E0CD',
  				'300': '#87CDAF',
  				'400': '#6DC09E',
  				'500': '#52B788',
  				'600': '#4AA57A',
  				'700': '#3E8966',
  				'800': '#326E52',
  				'900': '#295A43'
  			},
  			serenidade: {
  				'50': '#F4F8FA',
  				'100': '#E9F1F5',
  				'200': '#C8DCE6',
  				'300': '#A7C7D7',
  				'400': '#95B8CD',
  				'500': '#84A9C0',
  				'600': '#7798AD',
  				'700': '#637F90',
  				'800': '#4F6673',
  				'900': '#41535E'
  			},
  			aviso: {
  				'50': '#FFFBEB',
  				'100': '#FEF3C7',
  				'200': '#FDE68A',
  				'300': '#FCD34D',
  				'400': '#FBBF24',
  				'500': '#F59E0B',
  				'600': '#D97706',
  				'700': '#B45309',
  				'800': '#92400E',
  				'900': '#78350F'
  			},
  			dark: {
  				bg: {
  					primary: '#1A1512',
  					secondary: '#241C17',
  					tertiary: '#2D241E',
  					elevated: '#362B23',
  					hover: '#403328'
  				},
  				text: {
  					primary: '#F5EDE7',
  					secondary: '#D4C4B8',
  					tertiary: '#A89582',
  					muted: '#7A6B5D'
  				},
  				border: {
  					subtle: '#362B23',
  					default: '#4A3D33',
  					emphasis: '#5C4D40'
  				},
  				accent: {
  					ninho: '#A67355',
  					aconchego: '#E8C35A',
  					natureza: '#6BC89A',
  					serenidade: '#96B8CC',
  					aviso: '#F5B547'
  				}
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}

export default config;
