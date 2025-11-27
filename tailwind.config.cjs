/**
 * Tailwind CSS configuration for the project.
 *
 * Notes:
 * - This file is CommonJS (`.cjs`) because some toolchains/configs expect that format.
 * - Adjust the `content` globs if your source files live in different locations.
 * - The `safelist` contains patterns for dynamic classes (e.g. house/theme color classes, modal classes).
 *   Tweak or remove entries depending on which dynamic classes you actually generate at runtime.
 */

module.exports = {
  content: [
    "./src/**/*.{astro,html,js,jsx,ts,tsx}",
    "./public/**/*.html",
    "./index.html",
  ],
  safelist: [
    // Generic utility color patterns (bg-, text-, border-, etc.) with numeric scales
    {
      pattern:
        /^(bg|text|border|from|to|ring|fill|stroke)-(?:[a-z]+)-(?:50|100|200|300|400|500|600|700|800|900)$/,
    },
  ],
  theme: {
    extend: {
      fontFamily: {
        // `Inter` is used in the project; fallback to system sans stack.
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          " -apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          '"Noto Sans"',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
      },
      // Add any custom design tokens you need for the project
      colors: {
        // Example "house" color tokens; change or remove as required.
        house: {
          red: "#ef4444",
          blue: "#3b82f6",
          green: "#10b981",
        },
      },
    },
  },
  plugins: [],
};
