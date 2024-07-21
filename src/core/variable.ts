import {
  CurrentType,
  LanguageEnumType,
  ProgressReturnType,
  UploadConfigType,
  UploadProgressState,
} from "./types";
import { IPLimitC } from "./PLimit";
import { COMPUTE_NETWORK_BYTE_SIZE } from "./constant";

export const pLimit: CurrentType<IPLimitC | null> = {
  current: null,
};
// 表示 默认的配置文件
export const uploaderDefaultConfig: Required<UploadConfigType> = {
  concurrentLimit: 2,
  maxRetryTimes: 3,
  persist: false,
  maxHashNameCount: 200,
  language: LanguageEnumType.ZH,
  req: {
    listFilesReq: null,
    sectionUploadReq: null,
    mergeUploadReq: null,
    verifyFileExistReq: null,
  },
};

export const calculateNameWorker: CurrentType<null | Worker> = {
  current: null,
};
export const channel = new MessageChannel();
// 表示 上传文件的配置文件
export const calculateUploaderConfig: CurrentType<UploadConfigType | null> = {
  current: null,
};
// 全局的 done callback
export const globalPLimitDoneSuccessCallback: CurrentType<
  Map<string, () => void>
> = {
  current: new Map(),
};
// 计算网速 将要发送的任务
export const calculateEmitNetworkSpeedTasks: CurrentType<
  Array<[string, (uniqueCode: string) => Promise<void>]>
> = {
  current: [],
};
// 表示 递归的值
export const globalNextCount: CurrentType<number> = {
  current: 0,
};
// 表示 是否第一次请求网速
export const isFirstRequestNetworkSpeed: CurrentType<boolean> = {
  current: true,
};
// 表示 上传进度的状态
export const globalProgressState: CurrentType<
  Map<string, UploadProgressState>
> = {
  current: new Map<string, UploadProgressState>(),
};
// 全局的 done callback 映射
export const globalDoneCallbackMapping: CurrentType<
  Map<
    string,
    [
      (arr: ProgressReturnType) => void,
      (error: unknown) => void,
      (arr: ProgressReturnType) => void,
    ]
  >
> = {
  current: new Map(),
};
// 表示是否计算 hash 名称中
export const isComputeFileHashName: CurrentType<boolean> = {
  current: false,
};
// 表示 全局信息
export const globalInfoMapping: Record<string, Map<string, string>> = {};
// 判断是否有相同的文件上传中
export const sameFileUploadStateMapping: CurrentType<
  Map<string, Array<string>>
> = {
  current: new Map(),
};
// 表示全局的文件size 大小
export const globalFileSize: CurrentType<Map<string, number>> = {
  current: new Map(),
};
// 表示全局消费的偏移量
export const globalConsumeOffset: CurrentType<Map<string, number>> = {
  current: new Map(),
};
// 表示当前选择的语言
export const currentChooseLanguage: CurrentType<LanguageEnumType> = {
  current: LanguageEnumType.ZH,
};
// 表示 全局暂停状态
export const globalPauseStateMapping: CurrentType<Map<string, boolean>> = {
  current: new Map(),
};
// 表示当前网络大小
export const currentInternetSpeed: CurrentType<number> = {
  current: COMPUTE_NETWORK_BYTE_SIZE,
};
// 等待计算 hash 的队列
export const globalWaitingHashCalculationQueue: CurrentType<
  Array<[File, string]>
> = {
  current: [],
};
// 表示是否调用过 config 方法
export const isCallConfigMethod: CurrentType<boolean> = {
  current: false,
};
// 表示上次计算网络的时间
export const prevComputeNetworkSpeedInterval: CurrentType<number> = {
  current: 0,
};
