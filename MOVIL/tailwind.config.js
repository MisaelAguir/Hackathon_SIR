
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        riaar: {
          navy: "#0D2B45",
          blue: "#1B4B91",
          orange: "#F26419",
          yellow: "#F6C445",
          ink: "#0B1320",
          cream: "#F8F9FB"
        }
      },
      boxShadow: {
        card: "0 8px 30px rgba(0,0,0,.25)"
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(-4px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        }
      },
      animation: {
        fadeIn: 'fadeIn .35s ease-out'
      }
    },
  },
  plugins: [],
}
