import { BackgroundMessageType, StarAction } from "./enums";

/** Star/Unstar 操作消息 */
export interface StarChangeMessage {
  type: BackgroundMessageType.StarChange;
  action: StarAction;
  repoName: string;
}

/** 标记脏数据消息 */
export interface MarkDirtyMessage {
  type: BackgroundMessageType.MarkDirty;
}

/** 定时同步触发消息 */
export interface TriggerSyncMessage {
  type: BackgroundMessageType.TriggerSync;
}

/** Background 发送到 Sidepanel 的所有消息类型 */
export type BackgroundMessage = StarChangeMessage | MarkDirtyMessage | TriggerSyncMessage;
