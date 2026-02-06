import type { Config } from 'tailwindcss';
import { withUt } from 'uploadthing/tw';

const config: Config = withUt({
	darkMode: ['class'],
	content: [
		'./pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./components/**/*.{js,ts,jsx,tsx,mdx}',
		'./app/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		extend: {
			screens: {
				'nav': '1200px',
			},
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
				},
				primary: {
					DEFAULT: 'var(--primary)',
					foreground: 'hsl(var(--primary-foreground))',
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))',
				},
				// Custom color palette
				orange: {
					DEFAULT: '#EA8543',
					dark: '#C46C32',
					light: '#F3A56C',
					50: '#FEF4ED',
					100: '#FCE8D9',
					200: '#F9D0B3',
					300: '#F5B88C',
					400: '#F2A066',
					500: '#EA8543',
					600: '#C46C32',
					700: '#935121',
					800: '#623616',
					900: '#311B0B',
				},
				navy: {
					DEFAULT: '#1D2436',
					dark: '#141924',
					light: '#2A3145',
					50: '#E8E9EC',
					100: '#D1D3D9',
					200: '#A3A7B3',
					300: '#757B8D',
					400: '#474F67',
					500: '#1D2436',
					600: '#141924',
					700: '#0F131B',
					800: '#0A0D12',
					900: '#050609',
				},
				neutral: {
					white: '#FFFFFF',
					black: '#1A1A1A',
					'gray-light': '#F7F7F7',
					'gray-medium': '#D9D9D9',
					'gray-dark': '#7A7A7A',
					'warm': '#DABFAE',
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
		},
	},
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	plugins: [require('tailwindcss-animate')],
}) satisfies Config;

export default config;
