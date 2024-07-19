/* 进度状态 */
export enum UploadProgressState {
  // 准备中 计算唯一的hash码
  Prepare = "Prepare",
  // hash 计算等待中
  HashCalculationWaiting = "HashCalculationWaiting",
  // 上传等待中 目的是为了并发控制
  Waiting = "Waiting",
  // 上传中
  Uploading = "Uploading",
  // 表示合并文件中
  Merge = "Merge",
  // 上传完成
  Done = "Done",
  // 秒传
  QuickUpload = "QuickUpload",
  // 断点 续传
  BreakPointUpload = "BreakPointUpload",
  // 表示 其他元素上传中
  OtherUploading = "OtherUploading",
  // 暂停 状态
  Pause = "Pause",
  // 暂停 重试
  PauseRetry = "PauseRetry",
  // 被 取消状态
  Canceled = "Canceled",
  // 请求错误
  RequestError = "RequestError",
  // 重试状态
  Retry = "Retry",
  // 网络失联
  NetworkDisconnected = "NetworkDisconnected",
  // 重试失败
  RetryFailed = "RetryFailed",
  // 刷新重试
  RefreshRetry = "RefreshRetry",
}

/* 队列元素 */
export type QueueElementBase = Partial<{
  // 类型
  type: UploadProgressState;
  // 唯一标识
  uniqueCode: string;
  // 文件大小
  fileSize: number;
  // 这个 client 显示的进度
  progress: number;
  // 表示 网络速度
  networkSpeed: number;
  // 文件名称
  fileName: string;
  // 表示上传的文件
  uploadFile: File;
  // 重试次数
  retryTimes: number;
  // 表示请求错误消息
  requestErrorMsg: string;
}>;

/* 上传文件的 配置文件 */
export type UploadConfigType = Partial<{
  // 最大重试次数
  maxRetryTimes: number;
  // 并发限制次数
  concurrentLimit: number;
  // 是否持久化
  persist: boolean;
  // 表示语言类型
  language: LanguageEnumType;
  // 最大缓存 hash 数
  maxHashNameCount: number;
}> & {
  // 请求接口
  req: {
    listFilesReq: IListFilesReq | null;
    sectionUploadReq: ISectionUploadReq | null;
    mergeUploadReq: IMergeUploadReq | null;
    verifyFileExistReq: IVerifyFileExistReq | null;
  };
};

/* 表示 current 类型 */
export interface CurrentType<T = null> {
  current: T;
}

// 表示返回类型
export type ProgressReturnType = [baseDir: string, fileName: string];

// localforage 持久化枚举类型
export enum LocalforageTypeEnum {
  p1 = "p1",
  p2 = "p2",
}

// 表示 请求响应类型
export type ICommonResponse<T = unknown> = {
  data: T;
  message?: string;
  msg?: string;
  success?: boolean;
  code: number;
};

// 表示 http 返回状态
export enum HTTPEnumState {
  OK = "200",
}

// 表示语言类型
export enum LanguageEnumType {
  EN = "en",
  ZH = "zh",
  JA_JP = "ja_JP",
}

// 表示接口类型
export type IListFilesReq = (
  calculationHashCode: string,
  // [number, number] length, consumeSize
) => Promise<ICommonResponse<[number, number]>>;
export type ISectionUploadReq = (
  calculationHashCode: string,
  chunkFileName: string,
  formData: FormData,
) => Promise<ICommonResponse<boolean>>;
export type IMergeUploadReq = (
  calculationHashCode: string,
  fileName: string,
) => Promise<ICommonResponse>;
export type IVerifyFileExistReq = (
  calculationHashName: string,
) => Promise<ICommonResponse<boolean>>;
