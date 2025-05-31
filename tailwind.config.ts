
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(214, 84%, 56%)',
					foreground: 'hsl(0, 0%, 98%)',
					50: 'hsl(214, 100%, 97%)',
					100: 'hsl(214, 95%, 93%)',
					200: 'hsl(213, 97%, 87%)',
					300: 'hsl(212, 96%, 78%)',
					400: 'hsl(213, 94%, 68%)',
					500: 'hsl(214, 84%, 56%)',
					600: 'hsl(215, 79%, 51%)',
					700: 'hsl(215, 68%, 47%)',
					800: 'hsl(215, 61%, 39%)',
					900: 'hsl(215, 54%, 33%)',
				},
				secondary: {
					DEFAULT: 'hsl(210, 40%, 96.1%)',
					foreground: 'hsl(222.2, 47.4%, 11.2%)'
				},
				destructive: {
					DEFAULT: 'hsl(0, 84.2%, 60.2%)',
					foreground: 'hsl(210, 40%, 98%)'
				},
				muted: {
					DEFAULT: 'hsl(210, 40%, 96.1%)',
					foreground: 'hsl(215.4, 16.3%, 46.9%)'
				},
				accent: {
					DEFAULT: 'hsl(210, 40%, 96.1%)',
					foreground: 'hsl(222.2, 47.4%, 11.2%)'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				exam: {
					active: 'hsl(142, 76%, 36%)',
					warning: 'hsl(38, 92%, 50%)',
					danger: 'hsl(0, 84%, 60%)',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'scale-in': {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'pulse-warning': {
					'0%, 100%': { backgroundColor: 'hsl(38, 92%, 50%)' },
					'50%': { backgroundColor: 'hsl(38, 92%, 60%)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'pulse-warning': 'pulse-warning 2s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
