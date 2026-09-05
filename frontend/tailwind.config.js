/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Premium industrial minimalism palette, inspired by bosch-tashkent.uz
        charcoal: '#0F172A', // == slate-900
        heat: '#E11D48',     // == rose-600, "Heating Red"
        ice: '#F8FAFC',      // == slate-50, "Soft Ice White"
        // amber-500 (#F59E0B) already ships with Tailwind, used directly as "Warm Amber"
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(15, 23, 42, 0.25)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
