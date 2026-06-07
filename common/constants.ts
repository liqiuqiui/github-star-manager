/** 支持的语言列表 */
export const SUPPORTED_LANGUAGES = ["zh-cn", "en"] as const;

/** 支持的语言类型 */
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/** 默认语言（当浏览器语言不支持时使用） */
export const DEFAULT_LANGUAGE: SupportedLanguage = "en";

/** 语言显示名映射 */
export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  "zh-cn": "中文",
  en: "English",
};
