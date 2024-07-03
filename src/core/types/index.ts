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
    // 重试状态
    Retry = "Retry",
    // 网络失联
    NetworkDisconnected = "NetworkDisconnected",
    // 重试失败
    RetryFailed = "RetryFailed",
    // 刷新重试
    RefreshRetry = "RefreshRetry",
}

/* 分割文件类型 */
export interface ChunkFileType {
    chunk: Blob;
    chunkFileName: string;
}

/* 队列元素 */
export type QueueElementBase = Partial<{
    // 类型
    type: UploadProgressState;
    // 唯一标识
    uniqueCode: string;
    // 文件大小
    fileSize: number;
    // 步长
    step: number;
    // 进度
    progress: number;
    // 文件名称
    fileName: string;
    // 表示上传的文件
    uploadFile: File;
    // 重试次数
    retryTimes: number;
    // 网络掉线 重试次数
    networkDisconnectedRetryTimes: number;
    // 暂停索引 -1 == 合并中
    pauseIndex: number;
}>;

/* 上传文件的 配置文件 */
export type UploadConfigType = Partial<{
    // 最大重试次数
    maxRetryTimes: number;
    // 并发限制次数
    concurrentLimit: number;
    // 是否持久化
    persist: boolean;
}> & {
    // 请求接口
    req: {
        listFilesReq: IListFilesReq | null,
        sectionUploadReq: ISectionUploadReq | null,
        mergeUploadReq: IMergeUploadReq | null,
        verifyFileExistReq: IVerifyFileExistReq | null
    }
};

/* 表示 current 类型 */
export interface CurrentType<T = null> {
    current: T;
}

// 表示返回类型
export type ProgressReturnType = [baseDir: string, fileName: string];

// 表示 请求响应类型
export type ICommonResponse<T = unknown> = {
    data: T;
    message: string;
    success: boolean;
    code: number;
};

// 表示接口类型
export type IListFilesReq = (calculationHashCode: string) => Promise<ICommonResponse<Array<string>>>
export type ISectionUploadReq = (calculationHashCode: string, chunkFileName: string, formData: FormData) => Promise<ICommonResponse>
export type IMergeUploadReq = (calculationHashCode: string, fileName: string) => Promise<ICommonResponse>
export type IVerifyFileExistReq = (calculationHashName: string) => Promise<ICommonResponse>