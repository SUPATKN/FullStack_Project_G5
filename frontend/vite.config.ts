import { defineConfig, HttpProxy, ProxyOptions } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

const configureFn = (proxy: HttpProxy.Server, _options: ProxyOptions) => {
  proxy.on("error", (err, _req, _res) => {
    console.log("proxy error", err);
  });
  proxy.on("proxyReq", (proxyReq, req, _res) => {
    console.log("Sending Request to the Target:", req.method, req.url);
  });
  proxy.on("proxyRes", (proxyRes, req, _res) => {
    console.log(
      "Received Response from the Target:",
      proxyRes.statusCode,
      req.url
    );
  });
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [tailwindcss(), autoprefixer()],
    },
  },
  server: {
    port: 5899,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: configureFn,
      },
      "/callback": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: configureFn,
      },
    },
  },
});
