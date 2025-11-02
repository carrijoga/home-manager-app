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
                // Modern Indigo - Primary accent color
                'indigo': {
                    '50': '#EEF2FF',
                    '100': '#E0E7FF',
                    '200': '#C7D2FE',
                    '300': '#A5B4FC',
                    '400': '#818CF8',
                    '500': '#6366F1',
                    '600': '#4F46E5',
                    '700': '#4338CA',
                    '800': '#3730A3',
                    '900': '#312E81',
                },
                // Vibrant Purple - Secondary accent
                'purple': {
                    '50': '#FAF5FF',
                    '100': '#F3E8FF',
                    '200': '#E9D5FF',
                    '300': '#D8B4FE',
                    '400': '#C084FC',
                    '500': '#A855F7',
                    '600': '#9333EA',
                    '700': '#7E22CE',
                    '800': '#6B21A8',
                    '900': '#581C87',
                },
                // Cyan - Fresh, modern feel
                'cyan': {
                    '50': '#ECFEFF',
                    '100': '#CFFAFE',
                    '200': '#A5F3FC',
                    '300': '#67E8F9',
                    '400': '#22D3EE',
                    '500': '#06B6D4',
                    '600': '#0891B2',
                    '700': '#0E7490',
                    '800': '#155E75',
                    '900': '#164E63',
                },
                // Emerald - Success states
                'emerald': {
                    '50': '#ECFDF5',
                    '100': '#D1FAE5',
                    '200': '#A7F3D0',
                    '300': '#6EE7B7',
                    '400': '#34D399',
                    '500': '#10B981',
                    '600': '#059669',
                    '700': '#047857',
                    '800': '#065F46',
                    '900': '#064E3B',
                },
                // Amber - Warnings
                'amber': {
                    '50': '#FFFBEB',
                    '100': '#FEF3C7',
                    '200': '#FDE68A',
                    '300': '#FCD34D',
                    '400': '#FBBF24',
                    '500': '#F59E0B',
                    '600': '#D97706',
                    '700': '#B45309',
                    '800': '#92400E',
                    '900': '#78350F',
                },
                // Rose - Errors/destructive
                'rose': {
                    '50': '#FFF1F2',
                    '100': '#FFE4E6',
                    '200': '#FECDD3',
                    '300': '#FDA4AF',
                    '400': '#FB7185',
                    '500': '#F43F5E',
                    '600': '#E11D48',
                    '700': '#BE123C',
                    '800': '#9F1239',
                    '900': '#881337',
                },
                // Slate - Neutral colors
                'slate': {
                    '50': '#F8FAFC',
                    '100': '#F1F5F9',
                    '200': '#E2E8F0',
                    '300': '#CBD5E1',
                    '400': '#94A3B8',
                    '500': '#64748B',
                    '600': '#475569',
                    '700': '#334155',
                    '800': '#1E293B',
                    '900': '#0F172A',
                },
                'success': {
                    DEFAULT: '#10B981',
                    dark: '#34D399',
                },
                'warning': {
                    DEFAULT: '#F59E0B',
                    dark: '#FBBF24',
                },
                'error': {
                    DEFAULT: '#F43F5E',
                    dark: '#FB7185',
                },
                'info': {
                    DEFAULT: '#06B6D4',
                    dark: '#22D3EE',
                },
                // Updated dark mode colors
                dark: {
                    bg: {
                        primary: '#0F172A',
                        secondary: '#1E293B',
                        tertiary: '#334155',
                        elevated: '#475569',
                        hover: '#64748B'
                    },
                    text: {
                        primary: '#F8FAFC',
                        secondary: '#E2E8F0',
                        tertiary: '#CBD5E1',
                        muted: '#94A3B8'
                    },
                    border: {
                        subtle: '#1E293B',
                        default: '#334155',
                        emphasis: '#475569'
                    },
                    accent: {
                        indigo: '#818CF8',
                        purple: '#C084FC',
                        cyan: '#22D3EE',
                        emerald: '#34D399',
                        amber: '#FBBF24'
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
                    '50': '#EEF2FF',
                    '100': '#E0E7FF',
                    '200': '#C7D2FE',
                    '300': '#A5B4FC',
                    '400': '#818CF8',
                    '500': '#6366F1',
                    '600': '#4F46E5',
                    '700': '#4338CA',
                    '800': '#3730A3',
                    '900': '#312E81',
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))'
                },
                secondary: {
                    '50': '#FAF5FF',
                    '100': '#F3E8FF',
                    '200': '#E9D5FF',
                    '300': '#D8B4FE',
                    '400': '#C084FC',
                    '500': '#A855F7',
                    '600': '#9333EA',
                    '700': '#7E22CE',
                    '800': '#6B21A8',
                    '900': '#581C87',
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
