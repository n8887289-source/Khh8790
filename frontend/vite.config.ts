import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// BASE44_PREVIEW_MODE is supplied by the Base44 sandbox only. When it is not exactly "1"
// (any normal local run, CI or deployment) the dev server keeps Vite's default host
// allowlist and this file behaves as a plain Vite config.
const previewMode = process.env.BASE44_PREVIEW_MODE === '1';
const sandboxHostDomain = process.env.BASE44_SANDBOX_HOST_DOMAIN;

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    // The preview proxy reaches the dev server as <port>-<sandbox id>.<domain>, and the
    // sandbox id changes whenever the environment is recreated - hence the wildcard.
    // Vite >= 6.1 also appends __VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS (the public host).
    allowedHosts: previewMode && sandboxHostDomain ? [`.${sandboxHostDomain}`] : undefined,
    proxy: {
      // Single-origin wiring: the browser only ever talks to the dev server.
      '/api': {
        target: process.env.API_PROXY_TARGET ?? 'http://localhost:4000',
        changeOrigin: true,
      },
    },
    // Bind mounts do not always deliver filesystem events; polling keeps HMR reliable.
    watch: { usePolling: true, interval: 300 },
  },
});
