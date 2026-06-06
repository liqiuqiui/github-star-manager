import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: "src",
  entrypointsDir: "../entrypoints",
  modules: ["@wxt-dev/module-react"],
  manifest: {
    permissions: ["storage", "alarms", "sidePanel", "webRequest"],
    host_permissions: ["https://api.github.com/*"],
    action: {
      default_icon: {
        16: "icon/16.png",
        32: "icon/32.png",
        48: "icon/48.png",
        96: "icon/96.png",
        128: "icon/128.png",
      },
    },
    web_accessible_resources: [
      {
        resources: ["icon/*.png"],
        matches: ["<all_urls>"],
      },
    ],
  },
  webExt: {
    disabled: true,
  },
});
