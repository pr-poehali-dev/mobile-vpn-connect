import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
			"./1774634827895693936.html"
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
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
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
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			fontFamily: {
				'mono': ['"IBM Plex Mono"', 'monospace'],
				'sans': ['"IBM Plex Sans"', 'sans-serif'],
			},
			keyframes: {
				'pulse-ring': {
					'0%': { transform: 'scale(1)', opacity: '0.8' },
					'50%': { transform: 'scale(1.15)', opacity: '0.3' },
					'100%': { transform: 'scale(1)', opacity: '0.8' },
				},
				'pulse-ring-outer': {
					'0%': { transform: 'scale(1)', opacity: '0.4' },
					'50%': { transform: 'scale(1.3)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '0.4' },
				},
				'encrypt-scroll': {
					'0%': { transform: 'translateY(0)' },
					'100%': { transform: 'translateY(-50%)' },
				},
				'fade-in-up': {
					'from': { opacity: '0', transform: 'translateY(16px)' },
					'to': { opacity: '1', transform: 'translateY(0)' },
				},
				'slide-in': {
					'from': { opacity: '0', transform: 'translateX(-12px)' },
					'to': { opacity: '1', transform: 'translateX(0)' },
				},
				'spin-slow': {
					'from': { transform: 'rotate(0deg)' },
					'to': { transform: 'rotate(360deg)' },
				},
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse-ring': 'pulse-ring 2.5s ease-in-out infinite',
				'pulse-ring-outer': 'pulse-ring-outer 2.5s ease-in-out infinite',
				'encrypt-scroll': 'encrypt-scroll 12s linear infinite',
				'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
				'slide-in': 'slide-in 0.4s ease-out forwards',
				'spin-slow': 'spin-slow 8s linear infinite',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;