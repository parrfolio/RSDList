import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { networkInterfaces } from 'node:os'

function getLocalIP() {
    const interfaces = networkInterfaces()
    for (const name of Object.keys(interfaces)) {
        const names = interfaces[name]
        if (!names) continue
        for (const iface of names) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address
            }
        }
    }
    return 'localhost'
}

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        {
            name: 'vite-plugin-print-ip',
            apply: 'serve',
            configureServer(server) {
                return () => {
                    const localIP = getLocalIP()
                    console.log(`\n📱 Local IP: http://${localIP}:5173\n`)
                }
            },
        },
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
})
