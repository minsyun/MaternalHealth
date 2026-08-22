import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// const repoName = 'MaternalHealthManagementSystem'; 

export default defineConfig({
  plugins: [vue()],
  base: '/maternal/',
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://192.168.100.6:3002', // 你的後端伺服器地址
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'), // 保持 /api 路徑
        proxyTimeout: 15000, // 增加代理等待時間
        timeout: 15000,
      }
    }
  }
})
