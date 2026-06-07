import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import "dayjs/locale/en";
import i18n from "../i18n";
import {
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from "../../common/constants";

// 根据 i18n 语言设置 dayjs locale
const updateDayjsLocale = () => {
  const lng = (i18n.language || DEFAULT_LANGUAGE).toLowerCase() as SupportedLanguage;
  const locale: SupportedLanguage = SUPPORTED_LANGUAGES.includes(lng) ? lng : DEFAULT_LANGUAGE;
  dayjs.locale(locale);
};

// 初始化
updateDayjsLocale();

// 监听语言变化
i18n.on("languageChanged", updateDayjsLocale);

export { dayjs };
