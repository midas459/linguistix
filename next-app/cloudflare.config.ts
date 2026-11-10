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
    },
  }),
}));
