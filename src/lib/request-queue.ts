import PQueue from "p-queue";

/**
 * 仓库信息请求队列
 * - 并行 3 个请求
 * - 按添加顺序返回结果
 */
export const repoInfoQueue = new PQueue({
  concurrency: 3,
});
