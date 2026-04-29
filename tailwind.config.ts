import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF8C00',
          hover: '#E67E00',
          active: '#D96F00',
          light: 'rgba(255, 140, 0, 0.1)',
        },
        dark: {
          DEFAULT: '#000000',
          light: '#1a1a1a',
        },
        bg: '#FFFFFF',
        surface: {
          DEFAULT: '#FFFFFF',
          2: '#F5F5F5',
        },
        border: '#E0E0E0',
        divider: '#E0E0E0',
        text: {
          DEFAULT: '#212121',
          muted: '#666666',
          faint: '#999999',
        },
        success: '#4CAF50',
        error: '#F44336',
        warning: '#FF8C00',
        info: '#2196F3',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        full: '9999px',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 8px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 4px 16px rgba(0, 0, 0, 0.15)',
        dropdown: '0 4px 16px rgba(0, 0, 0, 0.15)',
        modal: '0 8px 32px rgba(0, 0, 0, 0.2)',
        navbar: '0 2px 8px rgba(0, 0, 0, 0.3)',
        'btn-primary': '0 2px 8px rgba(255, 140, 0, 0.3)',
        'btn-primary-hover': '0 4px 12px rgba(255, 140, 0, 0.4)',
      },
      spacing: {
        'xs': '4px',
        'sm-space': '8px',
        'md-space': '16px',
        'lg-space': '24px',
        'xl-space': '32px',
        '2xl-space': '40px',
        '3xl-space': '48px',
      },
      maxWidth: {
        container: '1200px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-in-out',
        'slide-down': 'slideDown 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
