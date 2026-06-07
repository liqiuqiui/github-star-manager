import { useEffect, useRef } from "react";
import { useStarStore } from "@/stores/starStore";
import { fetchRepoInfo } from "@/services/github-api";
import { repoInfoQueue } from "@/lib/request-queue";
import { BackgroundMessageType, StarAction } from "@@/common/enums";
import type { BackgroundMessage } from "@@/common/types";

export function useMessageListener(
  token: string,
  isSyncing: boolean,
  syncFromGitHub: (token: string) => Promise<void>,
) {
  const { markDirty, removeRepo, addRepo } = useStarStore();
  // 跟踪正在请求中的仓库，防止重复请求
  const pendingReposRef = useRef(new Set<string>());

  useEffect(() => {
    const handleMessage = async (message: BackgroundMessage) => {
      switch (message.type) {
        case BackgroundMessageType.StarChange: {
          const { action, repoName } = message;

          if (action === StarAction.Unstar && repoName) {
            // unstar：直接从本地移除
            await removeRepo(repoName);
          } else if (action === StarAction.Star && repoName && token) {
            // 防止重复请求
            if (pendingReposRef.current.has(repoName)) {
              return;
            }
            pendingReposRef.current.add(repoName);

            // star：加入队列获取仓库信息
            repoInfoQueue.add(async () => {
              try {
                const repo = await fetchRepoInfo(token, repoName);
                if (repo) {
                  addRepo(repo);
                }
              } catch {
                // 网络错误或 API 限流，标记脏数据等待下次同步
                markDirty();
              } finally {
                pendingReposRef.current.delete(repoName);
              }
            });
          }
          break;
        }

        case BackgroundMessageType.MarkDirty:
          markDirty();
          break;

        case BackgroundMessageType.TriggerSync:
          if (token && !isSyncing) {
            syncFromGitHub(token);
          }
          break;
      }
    };

    browser.runtime.onMessage.addListener(handleMessage);
    return () => {
      // 组件卸载时清空队列和待处理集合
      repoInfoQueue.clear();
      pendingReposRef.current.clear();
      browser.runtime.onMessage.removeListener(handleMessage);
    };
  }, [token, isSyncing, syncFromGitHub, markDirty, removeRepo, addRepo]);
}
