export default defineContentScript({
  matches: ["*://github.com/*"],
  main() {
    console.log("GitHub Star Manager content script loaded");
    // Star 检测已移至 background.ts 使用 webRequest API 实现
  },
});
