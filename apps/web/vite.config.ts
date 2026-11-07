import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// In the sandbox the API is another compose service; outside it, localhost.
const apiTarget = process.env.API_URL || 'http://localhost:8000';

// The preview proxy reaches the dev server as <port>-<sandbox id>.<sandbox host
// domain>. Accept that one host only while running in the sandbox; outside it the
// list stays empty and Vite keeps its default localhost-only behaviour.
const sandboxHostDomain = process.env.BASE44_SANDBOX_HOST_DOMAIN;
const allowedHosts =
  process.env.BASE44_PREVIEW_MODE === '1' && sandboxHostDomain ? [`.${sandboxHostDomain}`] : [];

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // bind 0.0.0.0 so the preview proxy can reach the dev server
    port: 5173,
    strictPort: true,
    // Requests from the preview browser carry the public proxy host; Vite 6.1+
    // appends __VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS to this list on its own.
    allowedHosts,
    watch: {
      // Bind mounts on some hosts do not deliver native file events.
      usePolling: true,
      interval: 300,
    },
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
