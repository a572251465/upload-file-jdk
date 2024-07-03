import {
    CurrentType,
    ProgressReturnType,
    UploadConfigType,
    UploadProgressState,
} from "./types";
import {IPLimitC} from "jsmethod-extra";

export const pLimit: CurrentType<IPLimitC | null> = {
    current: null,
};
// 表示 默认的配置文件
export const uploaderDefaultConfig: Required<UploadConfigType> = {
    concurrentLimit: 3,
    maxRetryTimes: 3,
    persist: false,
    req: {
        listFilesReq: null,
        sectionUploadReq: null,
        mergeUploadReq: null,
        verifyFileExistReq: null
    }
};

export const calculateNameWorker: CurrentType<null | Worker> = {
    current: null,
};
export const channel = new MessageChannel();
// 表示 上传文件的配置文件
export const calculateUploaderConfig: CurrentType<UploadConfigType | null> = {
    current: null,
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
// 表示 全局信息
export const globalInfoMapping: Record<string, Map<string, string>> = {};
// 判断是否有相同的文件上传中
export const sameFileUploadStateMapping: CurrentType<
    Map<string, Array<string>>
> = {
    current: new Map(),
};
// 全局的暂停指令
export const globalPauseStateMapping: CurrentType<Map<string, number>> = {
    current: new Map(),
};
// 等待计算 hash 的队列
export const globalWaitingHashCalculationQueue: CurrentType<
    Array<[File, string]>
> = {
    current: [],
};

// 这是一个默认的空方法
export function defaultEmptyFunction(arr: ProgressReturnType) {
    if (false) console.log(arr);
}
