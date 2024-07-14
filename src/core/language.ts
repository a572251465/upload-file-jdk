import {LanguageEnumType, UploadProgressState} from "./types";
import {
    enLanguage,
    jpLanguage,
    UploadProgressStateText,
    zhLanguage,
} from "./constant";
import {currentChooseLanguage} from "./variable";
import i18next from "i18next";

/**
 * 选择的多语言
 *
 * @author lihh
 * @param key 设置类型
 */
export function getLng(key: UploadProgressState) {
  return UploadProgressStateText[key][currentChooseLanguage.current];
}

/**
 * 这里初期化 语言
 *
 * @author lihh
 * @param lng 表示语言
 */
export async function initLng(lng: LanguageEnumType) {
  await i18next.init({
    lng,
    resources: {
      ...(
        [
          [LanguageEnumType.ZH, zhLanguage],
          [LanguageEnumType.EN, enLanguage],
          [LanguageEnumType.JA_JP, jpLanguage],
        ] as Array<[LanguageEnumType, Record<string, string>]>
      ).reduce(
        (memo, curr) => {
          memo[curr[0]] = {
            translation: curr[1],
          };
          return memo;
        },
        {} as {
          [key: string]: { translation: Record<string, string> };
        },
      ),
    },
  });
}
