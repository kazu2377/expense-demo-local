import { nitro } from "nitro/vite";
import vinext from "vinext";
import { defineConfig } from "vite";
import { sites } from "./build/sites-vite-plugin.ts";

export default defineConfig({
  plugins: [vinext(), sites(), nitro()],
});
