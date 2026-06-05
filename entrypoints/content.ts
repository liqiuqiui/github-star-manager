export default defineContentScript({
  matches: ["*://github.com/*"],
  main() {
    console.log("GitHub Star Manager content script loaded");

    // 通知 background script 内容脚本已加载
    const notifyStarChange = (action: string, repoName?: string) => {
      browser.runtime
        .sendMessage({
          type: "GITHUB_STAR_CHANGED",
          action,
          repoName,
          timestamp: Date.now(),
        })
        .catch(() => {
          // 忽略错误
        });
    };

    // 监听 star 按钮点击
    const observeStarButtons = () => {
      // 选择器：GitHub 的 star 按钮
      const starButtonSelector =
        'button[aria-label*="star"], button[aria-label*="Star"], form[action*="/star"] button';

      // 使用事件委托监听点击
      document.addEventListener("click", (event) => {
        const target = event.target as HTMLElement;
        const starButton = target.closest(starButtonSelector);

        if (starButton) {
          // 获取仓库名称
          const repoName = getRepoName();
          if (repoName) {
            // 延迟通知，等待 GitHub 处理完成
            setTimeout(() => {
              const isStarred = checkIfStarred(starButton);
              notifyStarChange(isStarred ? "star" : "unstar", repoName);
            }, 500);
          }
        }
      });
    };

    // 监听 star 列表操作
    const observeStarLists = () => {
      // 监听列表弹窗的出现
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            if (node instanceof HTMLElement) {
              // 检测 star 列表弹窗
              const listDialog = node.querySelector(
                '[class*="star-list"], [class*="StarList"], [data-view-component*="star-list"]',
              );
              if (listDialog || node.matches?.('[class*="star-list"]')) {
                observeListChanges(node);
              }
            }
          }
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    };

    // 监听列表内的变化
    const observeListChanges = (container: HTMLElement) => {
      const listObserver = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          // 检测列表项的添加/删除
          if (mutation.type === "childList") {
            if (mutation.addedNodes.length > 0) {
              notifyStarChange("list-add");
            }
            if (mutation.removedNodes.length > 0) {
              notifyStarChange("list-remove");
            }
          }

          // 检测列表名称变化（重命名）
          if (
            mutation.type === "characterData" ||
            (mutation.type === "attributes" && mutation.attributeName === "value")
          ) {
            notifyStarChange("list-rename");
          }
        }
      });

      listObserver.observe(container, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
      });
    };

    // 获取当前页面的仓库名称
    const getRepoName = (): string | null => {
      const path = window.location.pathname;
      const match = path.match(/^\/([^/]+\/[^/]+)/);
      return match ? match[1] : null;
    };

    // 检查按钮是否表示已 star
    const checkIfStarred = (button: Element): boolean => {
      const ariaLabel = button.getAttribute("aria-label") || "";
      const text = button.textContent || "";
      return (
        ariaLabel.toLowerCase().includes("unstar") ||
        text.toLowerCase().includes("unstar") ||
        ariaLabel.toLowerCase().includes("已 star")
      );
    };

    // 监听页面导航（SPA 路由变化）
    const observeNavigation = () => {
      let lastUrl = window.location.href;

      const navigationObserver = new MutationObserver(() => {
        const currentUrl = window.location.href;
        if (currentUrl !== lastUrl) {
          lastUrl = currentUrl;
          // URL 变化时重新初始化监听
          init();
        }
      });

      navigationObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });

      // 也监听 popstate 事件
      window.addEventListener("popstate", () => {
        setTimeout(init, 100);
      });
    };

    // 初始化
    const init = () => {
      observeStarButtons();
      observeStarLists();
    };

    // 启动
    init();
    observeNavigation();

    console.log("GitHub Star Manager content script initialized");
  },
});
