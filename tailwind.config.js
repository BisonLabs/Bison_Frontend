/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-image': "linear-gradient(107.86deg, #1C1C1C 7.16%, #171717 108.66%);",
        'gradient-background': 'linear-gradient(90deg, rgb(33,33,33) 0%,transparent 59%),repeating-linear-gradient(45deg, rgba(168, 168, 168,0.1) 0px, rgba(168, 168, 168,0.1) 1px,transparent 1px, transparent 13px),repeating-linear-gradient(135deg, rgba(168, 168, 168,0.1) 0px, rgba(168, 168, 168,0.1) 1px,transparent 1px, transparent 13px),linear-gradient(90deg, rgb(33,33,33),rgb(33,33,33));',
        'gradient-card': 'linear-gradient(131.78deg, #383838 2.07%, #000000 95.81%);',
        'gradient-btn': 'linear-gradient(94.32deg, #262626 8.94%, #2D2D2D 89.83%);',
        'box-image': "linear-gradient(143.69deg, #323232 12.27%, #272727 47.57%, #141414 92.01%);",
        'gradient-card1': 'linear-gradient(143.69deg, #292928 12.27%, #0d0d0d 92.01%);',
      },
      backgroundColor: {
        'button-hover': '#323232',
      },
    },
  },
  plugins: [],
}
