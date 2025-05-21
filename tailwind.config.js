/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
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
  		keyframes: {
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
  			},
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' }
        },
        'small-float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' }
        },
        'fadeIn': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'fadeInRight': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        'fadeInLeft': {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        'gradientShift': {
          '0%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
          '100%': { 'background-position': '0% 50%' }
        },
        'slide-words': {
          '0%': { transform: 'translateY(0%)' },
          '20%': { transform: 'translateY(0%)' },
          '25%': { transform: 'translateY(-20%)' },
          '45%': { transform: 'translateY(-20%)' },
          '50%': { transform: 'translateY(-40%)' },
          '70%': { transform: 'translateY(-40%)' },
          '75%': { transform: 'translateY(-60%)' },
          '95%': { transform: 'translateY(-60%)' },
          '100%': { transform: 'translateY(-80%)' }
        },
        'count-up': {
          '0%': { 'counter-increment': 'count 0' },
          '100%': { 'counter-increment': 'count var(--value)' }
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7', transform: 'scale(0.99)' }
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' }
        },
        'shimmer': {
          '0%': { 'background-position': '-200% 0' },
          '100%': { 'background-position': '200% 0' }
        },
        'vibrate': {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-2px)' },
          '40%': { transform: 'translateX(2px)' },
          '60%': { transform: 'translateX(-2px)' },
          '80%': { transform: 'translateX(2px)' }
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' }
        },
        'morph': {
          '0%, 100%': { 'border-radius': '60% 40% 30% 70%/60% 30% 70% 40%' },
          '25%': { 'border-radius': '30% 60% 70% 40%/50% 60% 30% 60%' },
          '50%': { 'border-radius': '40% 60% 30% 70%/60% 40% 70% 30%' },
          '75%': { 'border-radius': '60% 40% 70% 30%/40% 70% 30% 60%' }
        },
        'bounce-button': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        'scale-up': {
          '0%': { transform: 'scale(0)' },
          '80%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' }
        },
        'blink-cursor': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' }
        },
        'ripple': {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '50%': { transform: 'scale(1.5)', opacity: '0.5' },
          '100%': { transform: 'scale(2)', opacity: '0' }
        },
        'ping-slow': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.5)', opacity: '0.5' },
          '100%': { transform: 'scale(2)', opacity: '0' }
        },
        'pulse-slow': {
          '0%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '0.3', transform: 'scale(1.05)' },
          '100%': { opacity: '0.6', transform: 'scale(1)' }
        },
        'spotlight': {
          '0%': {
            opacity: '0.2',
            transform: 'translate(-50%, -50%) scale(0.7)'
          },
          '100%': {
            opacity: '0',
            transform: 'translate(-50%, -50%) scale(1)'
          }
        }
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'small-float': 'small-float 2s ease-in-out infinite',
        'fadeIn': 'fadeIn 0.8s ease-out forwards',
        'fadeInRight': 'fadeInRight 0.8s ease-out forwards',
        'fadeInLeft': 'fadeInLeft 0.8s ease-out forwards',
        'gradientShift': 'gradientShift 8s ease infinite',
        'spin-slow': 'spin 20s linear infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'pulse-slow': 'pulse-slow 8s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'vibrate': 'vibrate 0.3s linear',
        'bounce-subtle': 'bounce-subtle 2s infinite ease-in-out',
        'morph': 'morph 15s linear infinite',
        'blink-cursor': 'blink-cursor 0.8s ease-in-out infinite',
        'ripple': 'ripple 0.6s ease-out forwards',
        'ping-slow': 'ping-slow 2.5s cubic-bezier(0, 0, 0.2, 1) infinite',
        'spotlight': 'spotlight 2s ease-in-out infinite',
        'slide-words': 'slide-words 15s infinite',
        'count-up': 'count-up 2s forwards',
        'pulse-subtle': 'pulse-subtle 3s infinite ease-in-out',
        'fade-in-up': 'fade-in-up 0.8s forwards ease-out',
        'fade-in-down': 'fade-in-down 0.8s forwards ease-out',
        'bounce-button': 'bounce-button 2s infinite ease-in-out',
        'scale-up': 'scale-up 0.5s forwards ease-out'
  		},
      backgroundImage: {
        'grid-pattern': 'linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
        'gradient-radial': 'radial-gradient(circle, var(--tw-gradient-stops))'
      },
      backgroundSize: {
        'grid': '24px 24px'
      }
  	}
  },
  plugins: [require("tailwindcss-animate")],
}

