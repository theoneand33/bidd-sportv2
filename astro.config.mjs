// @ts-check
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

// Enable Tailwind integration for Astro
// https://docs.astro.build/en/guides/integrations-guide/tailwind/
export default defineConfig({
  integrations: [tailwind()],
});
