import { fileURLToPath, URL } from 'node:url'
import process from 'node:process'

import { defineConfig, loadEnv } from 'vite-plus'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { compression } from 'vite-plugin-compression2'
import viteRestart from 'vite-plugin-restart'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import UnoCSS from 'unocss/vite'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

import { VChartResolver } from './scripts/vite/unplugin-vue-components-resolvers.ts'

// https://vite.dev/config/
export default defineConfig(config => {
  const { mode } = config
  const env = loadEnv(mode, process.cwd(), '')
  const port = Number(env.VITE_PORT) || 5173
  const API_BASE = env.VITE_BASE_API || '/api'
  const WS_BASE = env.VITE_WEBSOCKET_BASE_API || '/ws'
  const UE_BASE = env.VITE_UE_BASE_API || '/ue'

  return {
    fmt: {
      printWidth: 100,
      singleQuote: true,
      semi: false,
      arrowParens: 'avoid',
      quoteProps: 'as-needed',
      endOfLine: 'lf',
      bracketSpacing: true,
      htmlWhitespaceSensitivity: 'css',
      proseWrap: 'preserve',
      tabWidth: 2,
      useTabs: false,
      trailingComma: 'all',
      ignorePatterns: [
        '**/dist/**',
        '**/coverage/**',
        '**/auto-imports.d.ts',
        '**/components.d.ts',
        'pnpm-lock.yaml',
      ],
    },
    lint: {
      plugins: ['eslint', 'typescript', 'unicorn', 'oxc', 'vue', 'vitest'],
      env: {
        browser: true,
      },
      categories: {
        correctness: 'error',
      },
      ignorePatterns: ['**/node_modules/**', '**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
    },
    test: { environment: 'jsdom', passWithNoTests: true },
    css: {
      devSourcemap: true,
      preprocessorOptions: {
        scss: {
          // 自动注入全局样式变量（如需要可启用）
          additionalData: '@use "@/assets/styles/scss-variables.scss" as *;',
        },
      },
    },

    plugins: [
      vue(),
      vueDevTools(),
      compression(),
      viteRestart({
        restart: ['.env*', 'vite.config.[jt]s', 'src/config/**/*', 'scripts/vite/**/*'],
      }),
      AutoImport({
        imports: [
          'vue',
          'vue-router',
          'pinia',
          '@vueuse/core',
          { '@vueuse/router': ['useRouteHash', 'useRouteQuery', 'useRouteParams'] },
        ],
        resolvers: [ElementPlusResolver({ importStyle: 'sass' })],
        dts: 'src/types/auto-imports.d.ts',
        eslintrc: {
          enabled: true,
        },
      }),
      Components({
        resolvers: [
          ElementPlusResolver({ importStyle: 'sass' }),
          IconsResolver({
            enabledCollections: ['ep'],
          }),
          VChartResolver,
        ],
        dirs: ['src/components', 'src/views', 'src/layout'],
        dts: 'src/types/components.d.ts',
      }),
      Icons({
        autoInstall: true,
      }),
      UnoCSS(),
      ViteImageOptimizer({}),
    ],

    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },

    server: {
      host: '0.0.0.0', // 局域网访问
      port,
      open: true,
      // 预热常用文件，提升首屏加载速度
      warmup: {
        clientFiles: ['./src/main.ts', './src/App.vue', './src/router/index.ts'],
      },
      proxy: {
        // HTTP API 代理
        [API_BASE]: {
          target: 'http://127.0.0.1:10002', // 后端接口地址
          changeOrigin: true,
          rewrite: path => path.replace(new RegExp(`^${API_BASE}`), ''),
        },

        // WebSocket 代理
        [WS_BASE]: {
          target: 'ws://127.0.0.1:10002', // WebSocket 地址
          // target: 'ws://localhost:10002', // WebSocket 地址
          changeOrigin: true,
          ws: true, // 开启 websocket 代理
          logLevel: 'debug',
          rewrite: path => path.replace(new RegExp(`^${WS_BASE}`), ''),
        },

        // UE
        [UE_BASE]: {
          target: 'http://127.0.0.1:901', // UE 地址
          changeOrigin: true,
          rewrite: path => path.replace(new RegExp(`^${UE_BASE}`), ''),
        },
      },
    },

    build: {
      rolldownOptions: {
        output: {
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',

          assetFileNames: assetInfo => {
            const name = assetInfo?.names?.[0] ?? ''
            if (!name) return 'assets/[name]-[hash][extname]'

            if (name.endsWith('.css')) {
              return 'css/[name]-[hash][extname]'
            }
            if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(name)) {
              return 'images/[name]-[hash][extname]'
            }
            if (/\.(woff2?|eot|ttf|otf)$/.test(name)) {
              return 'fonts/[name]-[hash][extname]'
            }
            return 'assets/[name]-[hash][extname]'
          },

          codeSplitting: {
            groups: [
              {
                name: 'framework',
                test: /node_modules[\\/]vue/,
                priority: 20,
              },
              {
                name: 'echarts',
                test: /node_modules[\\/]echarts/,
                priority: 15,
              },
              {
                name: 'element-plus',
                test: /node_modules[\\/]element-plus/,
                priority: 15,
              },
              {
                name: 'vendor',
                test: /node_modules/,
                priority: 10,
              },
            ],
          },
        },
      },
    },
  }
})
