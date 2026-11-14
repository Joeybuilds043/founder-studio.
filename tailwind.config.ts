import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: { fontFamily: { sans: ["Inter", "Arial", "sans-serif"] }, colors: { ink: "#17243a", navy: "#163a70", line: "#e7ebf1", canvas: "#f5f7fa" }, boxShadow: { soft: "0 8px 24px rgba(22, 42, 74, .06)" } } },
  plugins: []
};
export default config;