import { bindings, defineConfig, defineWorker } from "cf/config";

export default defineConfig(({ isPreview }) => ({
  worker: defineWorker({
    name: "linguistix",
    // Worker Previews need an enabled workers.dev host to receive a URL.
    // Keep the production worker's host configuration unchanged.
    workersDev: isPreview ? true : undefined,
    previewUrls: true,
    entrypoint: "vinext/server/fetch-handler",
    compatibilityDate: "2026-11-09",
    compatibilityFlags: ["nodejs_compat"],
    assets: {
      htmlHandling: "none",
      notFoundHandling: "none",
      runWorkerFirst: ["/*", "!/_next/static/*", "!/*/_next/static/*"],
    },
    env: {
      ASSETS: bindings.assets(),
      // Remote binding lets the Cloudflare/Vite dev runtime use the real
      // account AI service; deployed Worker requests use the same binding.
      AI: bindings.ai({ dev: { remote: true } }),
    },
  }),
}));
