export enum SyncFrequency {
  /** 每天 */
  Daily = "daily",
  /** 每周 */
  Weekly = "weekly",
  /** 每月 */
  Monthly = "monthly",
}

/** Background 消息类型 */
export enum BackgroundMessageType {
  /** 外部 star/unstar 操作 */
  StarChange = "STAR_CHANGE",
  /** 标记需要完整同步 */
  MarkDirty = "MARK_DIRTY",
  /** 定时同步触发 */
  TriggerSync = "TRIGGER_SYNC",
  /** 打开 sidepanel */
  OpenSidepanel = "OPEN_SIDEPANEL",
}

/** Star 操作类型 */
export enum StarAction {
  Star = "star",
  Unstar = "unstar",
}
