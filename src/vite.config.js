import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
    base: "/calorie-tracker/",   // your repo name
    plugins: [
        VitePWA({
            registerType: "autoUpdate",
            manifest: {
                name: "Calorie Tracker",
                short_name: "Calories",
                display: "standalone",
                background_color: "#111318",
                theme_color: "#4f46e5",
                icons: [
                    { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
                    { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
                    { src: "pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
                ],
            },
        }),
    ],
});