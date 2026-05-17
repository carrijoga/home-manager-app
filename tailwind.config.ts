import type { Config } from 'tailwindcss';

const config: Config = {
	content: [
		"./index.html",
		"./src/**/*.{js,jsx,ts,tsx}",
	],
	darkMode: 'class',
	theme: {
    	extend: {
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
    			/* shadcn/ui bridge — direct oklch values */
    			background:  'var(--background)',
    			foreground:  'var(--foreground)',
    			card: {
    				DEFAULT:    'var(--card)',
    				foreground: 'var(--card-foreground)',
    			},
    			popover: {
    				DEFAULT:    'var(--popover)',
    				foreground: 'var(--popover-foreground)',
    			},
    			primary: {
    				DEFAULT:    'var(--primary)',
    				foreground: 'var(--primary-foreground)',
    			},
    			secondary: {
    				DEFAULT:    'var(--secondary)',
    				foreground: 'var(--secondary-foreground)',
    			},
    			muted: {
    				DEFAULT:    'var(--muted)',
    				foreground: 'var(--muted-foreground)',
    			},
    			accent: {
    				DEFAULT:    'var(--accent)',
    				foreground: 'var(--accent-foreground)',
    			},
    			destructive: {
    				DEFAULT:    'var(--destructive)',
    				foreground: 'var(--destructive-foreground)',
    			},
    			border:  'var(--border)',
    			input:   'var(--input)',
    			ring:    'var(--ring)',
    			chart: {
    				'1': 'var(--chart-1)',
    				'2': 'var(--chart-2)',
    				'3': 'var(--chart-3)',
    				'4': 'var(--chart-4)',
    				'5': 'var(--chart-5)',
    			},
    			sidebar: {
    				DEFAULT:             'var(--sidebar-background)',
    				foreground:          'var(--sidebar-foreground)',
    				primary:             'var(--sidebar-primary)',
    				'primary-foreground':'var(--sidebar-primary-foreground)',
    				accent:              'var(--sidebar-accent)',
    				'accent-foreground': 'var(--sidebar-accent-foreground)',
    				border:              'var(--sidebar-border)',
    				ring:                'var(--sidebar-ring)',
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
