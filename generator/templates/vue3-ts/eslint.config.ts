import path from "node:path";
import fs from "node:fs";

import { globalIgnores } from "eslint/config";
import { defineConfigWithVueTs, vueTsConfigs } from "@vue/eslint-config-typescript";
import pluginVue from "eslint-plugin-vue";
import pluginVitest from "@vitest/eslint-plugin";

import skipFormatting from "eslint-config-prettier/flat";
import unocss from "@unocss/eslint-config/flat";

// 读取 unplugin-auto-import 生成的 ESLint globals
const autoImportGlobalsPath = path.resolve("./.eslintrc-auto-import.json");
let autoImportGlobals = {};
if (fs.existsSync(autoImportGlobalsPath)) {
  autoImportGlobals = JSON.parse(fs.readFileSync(autoImportGlobalsPath, "utf-8")).globals || {};
}

export default defineConfigWithVueTs(
  {
    name: "app/files-to-lint",
    files: ["**/*.{vue,ts,mts,tsx}"],
  },

  globalIgnores(["**/dist/**", "**/dist-ssr/**", "**/coverage/**"]),

  {
    languageOptions: {
      globals: {
        ...autoImportGlobals,
      },
    },
  },

  unocss,

  ...pluginVue.configs["flat/essential"],
  vueTsConfigs.recommended,

  {
    ...pluginVitest.configs.recommended,
    files: ["src/**/__tests__/*"],
  },

  skipFormatting,
);
