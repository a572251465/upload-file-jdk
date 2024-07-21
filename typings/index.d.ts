export { SubscriberSort, emitterAndTaker, equals, isHas, isNotEmpty, strFormat } from 'jsmethod-extra';

declare enum UploadProgressState {
    Prepare = "Prepare",
    HashCalculationWaiting = "HashCalculationWaiting",
    Waiting = "Waiting",
    WaitAddQueue = "WaitAddQueue",
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
type QueueElementBase = Partial<{
    type: UploadProgressState;
    uniqueCode: string;
    fileSize: number;
    progress: number;
    networkSpeed: number;
    fileName: string;
    uploadFile: File;
    retryTimes: number;
    requestErrorMsg: string;
}>;
type UploadConfigType = Partial<{
    maxRetryTimes: number;
    concurrentLimit: number;
    persist: boolean;
    language: LanguageEnumType;
    maxHashNameCount: number;
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
declare enum LocalforageTypeEnum {
    p1 = "p1",
    p2 = "p2"
}
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
type IListFilesReq = (calculationHashCode: string) => Promise<ICommonResponse<[number, number]>>;
type ISectionUploadReq = (calculationHashCode: string, chunkFileName: string, formData: FormData) => Promise<ICommonResponse<boolean>>;
type IMergeUploadReq = (calculationHashCode: string, fileName: string) => Promise<ICommonResponse>;
type IVerifyFileExistReq = (calculationHashName: string) => Promise<ICommonResponse<boolean>>;

declare const UploadProgressStateText: Record<Required<UploadProgressState>, Record<LanguageEnumType, string>>;
declare const COMPUTE_NETWORK_BYTE_SIZE: number;
declare const UPLOADING_FILE_SUBSCRIBE_DEFINE = "UPLOADING_FILE_SUBSCRIBE_DEFINE";
declare const REVERSE_CONTAINER_ACTION = "REVERSE_CONTAINER_ACTION";
declare const SERVER_REQUEST_FAIL_MSG = "fetch fail, \u8BF7\u68C0\u67E5\u670D\u52A1";
declare const NO_MESSAGE_DEFAULT_VALUE = "\u672A\u63D0\u4F9B\u9519\u8BEF\u6D88\u606F";
declare const INNER_PROGRESS_CONST = "innerProgress";
declare const CURRENT_CONSUME_BYTES = "currentConsumeBytes";
declare const FILE_SIZE_CONST = "fileSize";
declare const UPLOAD_FILE_CONST = "uploadFile";
declare const EXT_NAME_CONST = "extName";
declare const NETWORK_SPEED_CONST = "networkSpeed";
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
    KEY10: string;
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
 */
declare function computedBreakPointProgressHandler(calculationHashCode: string, uniqueCode: string): Promise<number>;
/**
 * 分割文件 上传事件
 *
 * @author lihh
 * @param uniqueCode 唯一的code
 * @param calculationHashCode web worker 计算的hashCode
 * @param idx 索引的值
 * @param retryTimes 重试次数
 */
declare function splitFileUploadingHandler(uniqueCode: string, calculationHashCode: string, idx: number, retryTimes?: number): Promise<void>;
/**
 * 开始执行任务
 *
 * @author lihh
 * @param calculationHashCode 通过 webWorker 计算的hash值
 * @param uniqueCode 唯一的值
 */
declare function startUploadFileNextHandler(calculationHashCode: string, uniqueCode: string): Promise<void>;
/**
 * 开始上传文件
 *
 * @author lihh
 * @param calculationHashName 通过web worker 计算的hash名称
 * @param uniqueCode 生成的唯一 code
 */
declare function startUploadFileHandler(calculationHashName: string, uniqueCode: string): Promise<void>;
/**
 * 这里生成任务 能让任务处理等待状态
 *
 * @author lihh
 * @param uniqueCode 每个文件对应 唯一的值
 */
declare function generatorTask(uniqueCode: string): void;
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
}

export { COMPUTE_NETWORK_BYTE_SIZE, CURRENT_CONSUME_BYTES, type CurrentType, EXT_NAME_CONST, FILE_SIZE_CONST, HTTPEnumState, type ICommonResponse, type IListFilesReq, type IMergeUploadReq, INNER_PROGRESS_CONST, type ISectionUploadReq, type IVerifyFileExistReq, LanguageEnumType, LocalforageTypeEnum, NETWORK_SPEED_CONST, NO_MESSAGE_DEFAULT_VALUE, type ProgressReturnType, type QueueElementBase, REVERSE_CONTAINER_ACTION, SERVER_REQUEST_FAIL_MSG, SOME_CONSTANT_VALUES, UPLOADING_FILE_SUBSCRIBE_DEFINE, UPLOAD_FILE_CONST, type UploadConfigType, UploadProgressState, UploadProgressStateText, clearCacheStateHandler, computedBreakPointProgressHandler, enLanguage, generatorTask, getLng, jpLanguage, progressNormalOrErrorCompletionHandler, restartUploadFileHandler, sameFileNeedProceedHandler, splitFileUploadingHandler, startUploadFileHandler, startUploadFileNextHandler, toFixedHandler, uploadHandler, zhLanguage };
