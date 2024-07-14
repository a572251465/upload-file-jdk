export { SubscriberSort, emitterAndTaker, equals, isHas, isNotEmpty, strFormat } from 'jsmethod-extra';

declare enum UploadProgressState {
    Prepare = "Prepare",
    HashCalculationWaiting = "HashCalculationWaiting",
    Waiting = "Waiting",
    Uploading = "Uploading",
    Merge = "Merge",
    Done = "Done",
    QuickUpload = "QuickUpload",
    BreakPointUpload = "BreakPointUpload",
    OtherUploading = "OtherUploading",
    Pause = "Pause",
    PauseRetry = "PauseRetry",
    Canceled = "Canceled",
    RequestError = "RequestError",
    Retry = "Retry",
    NetworkDisconnected = "NetworkDisconnected",
    RetryFailed = "RetryFailed",
    RefreshRetry = "RefreshRetry"
}
interface ChunkFileType {
    chunk: Blob;
    chunkFileName: string;
}
type QueueElementBase = Partial<{
    type: UploadProgressState;
    uniqueCode: string;
    fileSize: number;
    step: number;
    progress: number;
    fileName: string;
    uploadFile: File;
    retryTimes: number;
    networkDisconnectedRetryTimes: number;
    pauseIndex: number;
    requestErrorMsg: string;
}>;
type UploadConfigType = Partial<{
    maxRetryTimes: number;
    concurrentLimit: number;
    persist: boolean;
    fileSizeLimitRules: Array<[number, number]>;
    language?: LanguageEnumType;
}> & {
    req: {
        listFilesReq: IListFilesReq | null;
        sectionUploadReq: ISectionUploadReq | null;
        mergeUploadReq: IMergeUploadReq | null;
        verifyFileExistReq: IVerifyFileExistReq | null;
    };
};
interface CurrentType<T = null> {
    current: T;
}
type ProgressReturnType = [baseDir: string, fileName: string];
type ICommonResponse<T = unknown> = {
    data: T;
    message?: string;
    msg?: string;
    success?: boolean;
    code: number;
};
declare enum HTTPEnumState {
    OK = "200"
}
declare enum LanguageEnumType {
    EN = "en",
    ZH = "zh",
    JA_JP = "ja_JP"
}
type IListFilesReq = (calculationHashCode: string) => Promise<ICommonResponse<Array<string>>>;
type ISectionUploadReq = (calculationHashCode: string, chunkFileName: string, formData: FormData) => Promise<ICommonResponse<boolean>>;
type IMergeUploadReq = (calculationHashCode: string, fileName: string) => Promise<ICommonResponse>;
type IVerifyFileExistReq = (calculationHashName: string) => Promise<ICommonResponse<boolean>>;

declare const UploadProgressStateText: Record<Required<UploadProgressState>, Record<LanguageEnumType, string>>;
declare const fileSizeLimitDefaultRules: Array<[number, number]>;
declare const UPLOADING_FILE_SUBSCRIBE_DEFINE = "UPLOADING_FILE_SUBSCRIBE_DEFINE";
declare const REVERSE_CONTAINER_ACTION = "REVERSE_CONTAINER_ACTION";
declare const SERVER_REQUEST_FAIL_MSG = "fetch fail, \u8BF7\u68C0\u67E5\u670D\u52A1";
declare const NO_MESSAGE_DEFAULT_VALUE = "\u672A\u63D0\u4F9B\u9519\u8BEF\u6D88\u606F";
declare const SOME_CONSTANT_VALUES: {
    KEY1: string;
    KEY2: string;
    KEY3: string;
    KEY4: string;
    KEY5: string;
    KEY6: string;
    KEY7: string;
    KEY8: string;
    KEY9: string;
};
declare const zhLanguage: Record<string, string>;
declare const jpLanguage: Record<string, string>;
declare const enLanguage: Record<string, string>;

/**
 * 固定小数点的方法
 *
 * @author lihh
 * @param size 大小
 * @param count 个数
 */
declare function toFixedHandler(size: number, count: number): number;

/**
 * 选择的多语言
 *
 * @author lihh
 * @param key 设置类型
 */
declare function getLng(key: UploadProgressState): string;

/**
 * 重新 上传文件
 *
 * @author lihh
 * @param uniqueCode 文件 唯一的code
 * @param newType 要修改的状态
 */
declare function restartUploadFileHandler(uniqueCode: string, newType: UploadProgressState): Promise<void>;
/**
 * 相同文件 是否继续下载
 *
 * @author lihh
 * @param uniqueCode 文件 唯一的code
 */
declare function sameFileNeedProceedHandler(uniqueCode: string): Promise<void>;
/**
 * 正常 异常结束的事件
 *
 * @author lihh
 * @param el queue 消息
 */
declare function progressNormalOrErrorCompletionHandler(el: QueueElementBase): void;
/**
 * 清除 缓存状态
 *
 * @author lihh
 */
declare function clearCacheStateHandler(uniqueCode: string): void;
/**
 * 计算断点续传的索引
 *
 * @author lihh
 * @param calculationHashCode web worker 计算的code
 * @param uniqueCode 表示唯一的code
 * @param step 表示步长
 */
declare function computedBreakPointProgressHandler(calculationHashCode: string, uniqueCode: string, step: number): Promise<number>;
/**
 * 分割文件 上传事件
 *
 * @author lihh
 * @param idx 开始索引
 * @param uniqueCode 唯一的code
 * @param calculationHashCode web worker 计算的hashCode
 * @param chunks 分割的文件
 * @param retryTimes 重试次数
 */
declare function splitFileUploadingHandler(idx: number, uniqueCode: string, calculationHashCode: string, chunks: Array<ChunkFileType>, retryTimes?: number): Promise<void>;
/**
 * 表示生成任务
 *
 * @author lihh
 * @param calculationHashCode 通过 webWorker 计算的hash值
 * @param uniqueCode 唯一的值
 * @param chunks 分割的文件
 */
declare function generateTask(calculationHashCode: string, uniqueCode: string, chunks: Array<ChunkFileType>): Promise<void>;
/**
 * 开始上传文件
 *
 * @author lihh
 * @param file 要上传的文件
 * @param calculationHashName 通过web worker 计算的hash名称
 * @param uniqueCode 生成的唯一 code
 */
declare function startUploadFileHandler(file: File, calculationHashName: string, uniqueCode: string): Promise<void>;
/**
 * 表示上传的事件
 *
 * @author lihh
 * @param uploadFile 要上传的文件
 * @param callback 默认的回调方法
 */
declare function uploadHandler(uploadFile: File, callback?: (arr: ProgressReturnType) => void): Promise<ProgressReturnType>;
declare namespace uploadHandler {
    var config: (config: UploadConfigType) => void;
    var lng: (language?: LanguageEnumType) => Promise<void>;
    var dynamicFileSizeLimitRules: (limitRules: Array<[number, number]>) => void;
}

export { type ChunkFileType, type CurrentType, HTTPEnumState, type ICommonResponse, type IListFilesReq, type IMergeUploadReq, type ISectionUploadReq, type IVerifyFileExistReq, LanguageEnumType, NO_MESSAGE_DEFAULT_VALUE, type ProgressReturnType, type QueueElementBase, REVERSE_CONTAINER_ACTION, SERVER_REQUEST_FAIL_MSG, SOME_CONSTANT_VALUES, UPLOADING_FILE_SUBSCRIBE_DEFINE, type UploadConfigType, UploadProgressState, UploadProgressStateText, clearCacheStateHandler, computedBreakPointProgressHandler, enLanguage, fileSizeLimitDefaultRules, generateTask, getLng, jpLanguage, progressNormalOrErrorCompletionHandler, restartUploadFileHandler, sameFileNeedProceedHandler, splitFileUploadingHandler, startUploadFileHandler, toFixedHandler, uploadHandler, zhLanguage };
