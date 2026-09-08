// @lovable.dev/vite-tanstack-config já inclui automaticamente:
//   - TanStack devtools (dev-only, primeiro), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     injeção de env VITE_*, alias @ path, dedupe de React/TanStack, error logger plugins,
//     e detecção de sandbox (port/host/strictPort).
// Não adicione esses manualmente ou o app quebra com plugins duplicados.
//
// nitro: false desativa o build padrão do Lovable (que teria como alvo o preset
// "cloudflare-module"), deixando o build/deploy inteiramente por conta do plugin
// oficial da Netlify abaixo.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import netlify from "@netlify/vite-plugin-tanstack-start";

export default defineConfig({
  tanstackStart: {
    // Redireciona a entrada do servidor bundled do TanStack Start para src/server.ts
    // (nosso wrapper de erro de SSR). nitro/vite builda a partir daqui.
    server: { entry: "server" },
  },
  nitro: false,
  plugins: [netlify()],
});