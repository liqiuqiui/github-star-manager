import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: "src",
  entrypointsDir: "../entrypoints",
  modules: ["@wxt-dev/module-react"],
  manifest: {
    permissions: ["storage", "alarms", "sidePanel"],
  },
  webExt: {
    disabled: true,
  },
});
