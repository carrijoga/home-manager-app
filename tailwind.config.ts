import type { Config } from 'tailwindcss';

/**
 * Torna um token CSS compatível com o modificador de opacidade do Tailwind (`bg-primary/10`).
 *
 * O Tailwind só gera a variante `/N` quando o valor da cor contém o placeholder
 * `<alpha-value>`. Um valor cru como `var(--primary)` não o contém, então utilitários
 * como `bg-primary/10` eram descartados silenciosamente na compilação — não geravam
 * CSS nenhum, e o elemento ficava sem fundo.
 *
 * `color-mix` funciona com qualquer formato de cor (hex, oklch, rgba), o que permite
 * manter os tokens em `index.css` exatamente como estão.
 */
const alphaToken = (token: string) =>
	`color-mix(in srgb, var(${token}) calc(100% * <alpha-value>), transparent)`;

const config: Config = {
	content: [
		"./index.html",
		"./src/**/*.{js,jsx,ts,tsx}",
	],
	darkMode: 'class',
	theme: {
    	extend: {
    		/**
    		 * Valores de opacidade fora da escala padrão do Tailwind
    		 * (que vai de 5 em 5, e pula de 10 para 20).
    		 *
    		 * Sem declará-los aqui, utilitárias como `bg-primary/8` não
    		 * geram CSS nenhum e o elemento fica sem fundo — o mesmo
    		 * sintoma que `alphaToken` corrigiu para os valores da escala.
    		 * Usados pelo item ativo da sidebar e pelo hover da lista de
    		 * compras.
    		 */
    		opacity: {
    			'8':  '0.08',
    			'12': '0.12',
    			'15': '0.15',
    		},
    		animation: {
    			'fade-in': 'fadeIn 0.3s var(--ease-out-quart)',
    			'slide-in': 'slideInRight 0.4s var(--ease-out-quart)',
    			'scale-in': 'scaleIn 0.3s var(--ease-out-quart)',
    			'pulse-soft': 'pulse 2s var(--ease-out-quart) infinite',
    		},
    		keyframes: {
    			fadeIn: {
    				'0%': { opacity: '0', transform: 'translateY(10px)' },
    				'100%': { opacity: '1', transform: 'translateY(0)' },
    			},
    			slideInRight: {
    				'0%': { opacity: '0', transform: 'translateX(-20px)' },
    				'100%': { opacity: '1', transform: 'translateX(0)' },
    			},
    			scaleIn: {
    				'0%': { opacity: '0', transform: 'scale(0.95)' },
    				'100%': { opacity: '1', transform: 'scale(1)' },
    			},
    		},
    		colors: {
    			/* ── Semantic palette scales ── */
    			terracotta: {
    				'50':  '#fdf4f0',
    				'100': '#fae5db',
    				'200': '#f4c9b3',
    				'300': '#eca487',
    				'400': '#e07e59',
    				'500': '#c1714d',
    				'600': '#a55c3a',
    				'700': '#8a4828',
    				'800': '#6f3519',
    				'900': '#54240e',
    			},
    			honey: {
    				'50':  '#fffbf0',
    				'100': '#fef3d0',
    				'200': '#fde49e',
    				'300': '#fbd16b',
    				'400': '#f8bc3a',
    				'500': '#e5a520',
    				'600': '#c28a10',
    				'700': '#9e6e08',
    				'800': '#7b5304',
    				'900': '#583b02',
    			},
    			sage: {
    				'50':  '#f2f7f4',
    				'100': '#e0ede5',
    				'200': '#bcd9c6',
    				'300': '#91c0a1',
    				'400': '#62a378',
    				'500': '#4a8a61',
    				'600': '#38714d',
    				'700': '#285839',
    				'800': '#1a4028',
    				'900': '#0e2a19',
    			},
    			linen: {
    				'50':  '#fffefb',
    				'100': '#fefcf5',
    				'200': '#fdf8ec',
    				'300': '#fbf3df',
    				'400': '#f5e9c8',
    				'500': '#ecd9a8',
    				'600': '#d4bc7a',
    				'700': '#b89a4e',
    				'800': '#957930',
    				'900': '#6e591c',
    			},
    			/* PostIt pastels */
    			'postit-sun':   '#f5e6b2',
    			'postit-blush': '#f0d0ce',
    			'postit-mint':  '#d2edd8',
    			'postit-sky':   '#c8ddf0',
    			'postit-peach': '#f0d9c0',
    			/* shadcn/ui bridge — tokens CSS envolvidos para suportar `/N` (ver alphaToken) */
    			background:  alphaToken('--background'),
    			foreground:  alphaToken('--foreground'),
    			card: {
    				DEFAULT:    alphaToken('--card'),
    				foreground: alphaToken('--card-foreground'),
    			},
    			popover: {
    				DEFAULT:    alphaToken('--popover'),
    				foreground: alphaToken('--popover-foreground'),
    			},
    			primary: {
    				DEFAULT:    alphaToken('--primary'),
    				foreground: alphaToken('--primary-foreground'),
    			},
    			secondary: {
    				DEFAULT:    alphaToken('--secondary'),
    				foreground: alphaToken('--secondary-foreground'),
    			},
    			muted: {
    				DEFAULT:    alphaToken('--muted'),
    				foreground: alphaToken('--muted-foreground'),
    			},
    			accent: {
    				DEFAULT:    alphaToken('--accent'),
    				foreground: alphaToken('--accent-foreground'),
    			},
    			destructive: {
    				DEFAULT:    alphaToken('--destructive'),
    				foreground: alphaToken('--destructive-foreground'),
    			},
    			border:  alphaToken('--border'),
    			input:   alphaToken('--input'),
    			ring:    alphaToken('--ring'),
    			chart: {
    				'1': alphaToken('--chart-1'),
    				'2': alphaToken('--chart-2'),
    				'3': alphaToken('--chart-3'),
    				'4': alphaToken('--chart-4'),
    				'5': alphaToken('--chart-5'),
    			},
    			sidebar: {
    				DEFAULT:             alphaToken('--sidebar-background'),
    				foreground:          alphaToken('--sidebar-foreground'),
    				primary:             alphaToken('--sidebar-primary'),
    				'primary-foreground':alphaToken('--sidebar-primary-foreground'),
    				accent:              alphaToken('--sidebar-accent'),
    				'accent-foreground': alphaToken('--sidebar-accent-foreground'),
    				border:              alphaToken('--sidebar-border'),
    				ring:                alphaToken('--sidebar-ring'),
    			},
    		},
    		fontSize: {
    			xs:   'var(--text-xs)',
    			sm:   'var(--text-sm)',
    			base: 'var(--text-base)',
    			lg:   'var(--text-lg)',
    			xl:   'var(--text-xl)',
    			'2xl':'var(--text-2xl)',
    			'3xl':'var(--text-3xl)',
    			'4xl':'var(--text-4xl)',
    		},
    		borderRadius: {
    			sm:   'var(--radius-sm)',
    			md:   'var(--radius-md)',
    			lg:   'var(--radius-lg)',
    			xl:   'var(--radius-xl)',
    			full: 'var(--radius-full)',
    			DEFAULT: 'var(--radius)',
    		},
    		transitionTimingFunction: {
    			'out-quart': 'var(--ease-out-quart)',
    			'out-expo':  'var(--ease-out-expo)',
    			'spring':    'var(--ease-out-expo)',
    		},
    	}
    },
	plugins: [
		require("tailwindcss-animate"),
		require("@tailwindcss/container-queries"),
		function({ addUtilities }: { addUtilities: (utilities: Record<string, Record<string, string>>) => void }) {
			addUtilities({
				'.pb-safe': {
					'padding-bottom': 'env(safe-area-inset-bottom, 0px)',
				},
			});
		},
	],
}

export default config;
