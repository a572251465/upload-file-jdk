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
}>;
type UploadConfigType = Partial<{
    maxRetryTimes: number;
    concurrentLimit: number;
    persist: boolean;
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
    message: string;
    success: boolean;
    code: number;
};
type IListFilesReq = (calculationHashCode: string) => Promise<ICommonResponse<Array<string>>>;
type ISectionUploadReq = (calculationHashCode: string, chunkFileName: string, formData: FormData) => Promise<ICommonResponse>;
type IMergeUploadReq = (calculationHashCode: string, fileName: string) => Promise<ICommonResponse>;
type IVerifyFileExistReq = (calculationHashName: string) => Promise<ICommonResponse>;

declare const UploadProgressStateText: Record<Required<UploadProgressState>, string>;
declare const CHUNK_SIZE_30: number;
declare const CHUNK_SIZE_100: number;
declare const UPLOADING_FILE_SUBSCRIBE_DEFINE = "UPLOADING_FILE_SUBSCRIBE_DEFINE";
declare const REVERSE_CONTAINER_ACTION = "REVERSE_CONTAINER_ACTION";
declare const PERSIST_LOCAL_KEY = "big.file.upload.state";

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
}

export { CHUNK_SIZE_100, CHUNK_SIZE_30, type ChunkFileType, type CurrentType, type ICommonResponse, type IListFilesReq, type IMergeUploadReq, type ISectionUploadReq, type IVerifyFileExistReq, PERSIST_LOCAL_KEY, type ProgressReturnType, type QueueElementBase, REVERSE_CONTAINER_ACTION, UPLOADING_FILE_SUBSCRIBE_DEFINE, type UploadConfigType, UploadProgressState, UploadProgressStateText, clearCacheStateHandler, computedBreakPointProgressHandler, generateTask, progressNormalOrErrorCompletionHandler, restartUploadFileHandler, sameFileNeedProceedHandler, splitFileUploadingHandler, startUploadFileHandler, uploadHandler };
