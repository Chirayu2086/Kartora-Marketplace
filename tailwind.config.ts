import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#2563eb", dark: "#1d4ed8", light: "#e8f0fe" },
        cta: { DEFAULT: "#f4690c", dark: "#d9560a" },
        success: "#388e3c",
        page: "#f1f3f6",
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.08)",
        lift: "0 3px 16px rgba(0,0,0,0.14)",
      },
    },
  },
  plugins: [],
};

export default config;
