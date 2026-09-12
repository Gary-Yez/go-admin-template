import {resolve} from 'node:path'
import { defineConfig, searchForWorkspaceRoot } from 'vite'
import vue from '@vitejs/plugin-vue'
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
    include: ["vue", "pinia", "vue-router", "element-plus", "element-plus/es/locale/lang/zh-cn", "@element-plus/icons-vue", "axios", "nprogress", "echarts", "highlight.js", "dayjs"],
  },
  resolve: {dedupe: ["vue", "pinia", "vue-router", "element-plus"]},
  // 本地维护脚本传入源码目录，普通用户无需配置。
  server: process.env.GO_ADMIN_WEB_SOURCE ? {
    fs: {allow: [searchForWorkspaceRoot(process.cwd()), resolve(process.env.GO_ADMIN_WEB_SOURCE)]},
  } : undefined,
  base:"./",
  build: {
    outDir: '../server/dist',
    emptyOutDir: true,
  },
  envDir:"./"
})
