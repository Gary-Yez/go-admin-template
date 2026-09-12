import { defineConfig, searchForWorkspaceRoot } from 'vite'
import { realpathSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
const webRoot = fileURLToPath(new URL('.', import.meta.url))
const adminWebRoot = realpathSync(fileURLToPath(new URL('./node_modules/@gary-yez/go-admin-web', import.meta.url)))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: tag => tag === 'iconify-icon'
        }
      }
    })
  ],
  // 公共包包含 Vue/TS 源码，由项目统一编译，避免预构建吞掉动态页面。
  optimizeDeps: {
    exclude: ["@gary-yez/go-admin-web"],
    include: ["vue", "pinia", "vue-router", "element-plus", "element-plus/es/locale/lang/zh-cn", "@element-plus/icons-vue", "axios", "nprogress", "echarts", "highlight.js", "highlight.js/lib/core", "highlight.js/lib/languages/go", "highlight.js/lib/languages/typescript", "highlight.js/lib/languages/javascript", "highlight.js/lib/languages/xml", "highlight.js/lib/languages/css", "dayjs"],
  },
  // 解析公共包真实路径，使本地目录链接可以正常热更新。
  resolve: {
    preserveSymlinks: false,
    dedupe: ["vue", "pinia", "vue-router", "element-plus", "axios"]
  },
  server: {
    fs: {
      allow: [searchForWorkspaceRoot(webRoot), adminWebRoot]
    }
  },
  base:"./",
  build: {
    outDir: '../server/dist',
    emptyOutDir: true,
  },
  envDir:"./"
})
