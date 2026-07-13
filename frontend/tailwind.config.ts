import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
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
          DEFAULT: 'hsl(var(--primary))',
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
        ink: 'var(--ink)',
        cream: 'var(--cream)',
        blush: 'var(--blush)',
        sage: 'var(--sage)',
        'sky-light': 'var(--sky-light)',
        'sky-primary': 'var(--sky-primary)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        cardJitter: {
          '0%, 100%': { transform: 'translateX(0) rotateZ(0deg) rotateY(0deg)' },
          '10%': { transform: 'translateX(-3px) rotateZ(-1deg) rotateY(-3deg)' },
          '20%': { transform: 'translateX(3px) rotateZ(1.5deg) rotateY(2deg)' },
          '30%': { transform: 'translateX(-2px) rotateZ(-0.5deg) rotateY(-4deg)' },
          '40%': { transform: 'translateX(4px) rotateZ(2deg) rotateY(3deg)' },
          '50%': { transform: 'translateX(-3px) rotateZ(-1.5deg) rotateY(-2deg)' },
          '60%': { transform: 'translateX(2px) rotateZ(0.8deg) rotateY(4deg)' },
          '70%': { transform: 'translateX(-4px) rotateZ(-2deg) rotateY(-1deg)' },
          '80%': { transform: 'translateX(3px) rotateZ(1deg) rotateY(2deg)' },
          '90%': { transform: 'translateX(-2px) rotateZ(-0.8deg) rotateY(-3deg)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'card-jitter': 'cardJitter 0.4s ease-in-out infinite',
      },
    },
  },
  plugins: [animate],
};

export default config;
