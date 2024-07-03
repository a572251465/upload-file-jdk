import {
    emitterAndTaker,
    isEmpty,
    isHas,
    isUndefined,
    sleep,
    valueOrDefault,
} from "jsmethod-extra";
import {QueueElementBase, UploadProgressState} from "./types";
import {
    calculateNameWorker,
    globalInfoMapping,
    globalProgressState,
} from "./variable";
import {UPLOADING_FILE_SUBSCRIBE_DEFINE} from "./constant";
import {Logger} from "./Logger";

/**
 * 克隆全局的信息 映射事件
 *
 * @author lihh
 * @param source 来源
 * @param target 去向
 */
export function cloneGlobalInfoMappingHandler(source: string, target: string) {
    // 拿到 mapping 信息
    const map = globalInfoMapping[source];
    if (isEmpty(map)) return;

    // 设置 target 的值
    for (const [key, value] of map)
        putGlobalInfoMappingHandler(target, key, value);
}

/**
 * 设置 全局的信息
 *
 * @author lihh
 * @param args 传递的参数。如果只有一个参数的话，就是删除，三个参数，设置为添加
 */
export function putGlobalInfoMappingHandler(...args: Array<unknown>) {
    if (isEmpty(args)) return;

    if (args.length == 1)
        Reflect.deleteProperty(globalInfoMapping, args[0] as string);
    else {
        const params = args.slice(1),
            code = args[0] as string;
        if (params.length % 2 !== 0)
            throw new Error("global info mapping params error");
        for (let i = 0; i < params.length; i += 2) {
            const key = params[i],
                value = params[i + 1];

            let map;
            // 判断 key 是否存在
            if (!isHas(globalInfoMapping, code))
                // 设置默认值
                map = globalInfoMapping[code] = new Map();
            else map = globalInfoMapping[code];

            map.set(key, value);
        }
    }
}

/**
 * 计算 字节 大小
 *
 * @author lihh
 * @param c 传递的MB 大小
 */
export const calculateChunkSize = (c: number) => c * 1024 * 1024;

/**
 * 这里是生成唯一的 code
 *
 * @author lihh
 */
export function generateUniqueCode() {
    return `${+new Date()}-${(Math.random() * 100000) | 0}-${(Math.random() * 10000000) | 0}`;
}

/**
 * 是否可以 提交进度状态
 *
 * @author lihh
 * @param uniqueCode 进度唯一的 code
 * @param currentProgressType 当前的状态
 * @return true 不能继续了/ false 不能继续了
 */
export function isCanCommitProgressState(
    uniqueCode: string,
    currentProgressType: UploadProgressState,
) {
    return (
        [UploadProgressState.Pause].includes(
            globalProgressState.current.get(uniqueCode)!,
        ) &&
        ![UploadProgressState.Pause, UploadProgressState.Done].includes(
            currentProgressType,
        )
    );
}

/**
 * 生成 基础的进度状态
 *
 * @author lihh
 * @param type 进度类型
 * @param uniqueCode 表示唯一的 code
 */
export function generateBaseProgressState(
    type: UploadProgressState,
    uniqueCode: string,
) {
    const map = globalInfoMapping[uniqueCode];
    if (isEmpty(map)) return;

    // 表示 基础queue元素
    const baseQueueElement: Required<QueueElementBase> = {
        type,
        uniqueCode,
        uploadFile: map.get("uploadFile") as unknown as File,
        fileName: map.get("fileName")!,
        progress: 0,
        step: 0,
        retryTimes: 0,
        pauseIndex: 0,
        networkDisconnectedRetryTimes: 0,
        fileSize: map.get("fileSize") as unknown as number,
    };

    // 设置全局的进度状态
    globalProgressState.current.set(uniqueCode, type);
    return baseQueueElement;
}

/**
 * 提交 上传进度状态
 *
 * @author lihh
 * @param type 进度类型
 * @param uniqueCode 表示唯一的值
 */
export function emitUploadProgressState(
    type: UploadProgressState,
    uniqueCode: string,
) {
    if (isCanCommitProgressState(uniqueCode, type)) return;

    emitterAndTaker.emit(
        UPLOADING_FILE_SUBSCRIBE_DEFINE,
        generateBaseProgressState(type, uniqueCode),
    );
}

/**
 * 提交 重试状态
 *
 * @author lihh
 * @param uniqueCode 表示 唯一的code
 * @param retryTimes 重试次数
 */
export function emitRetryProgressState(uniqueCode: string, retryTimes: number) {
    if (isCanCommitProgressState(uniqueCode, UploadProgressState.Retry)) return;

    // 基础 进度状态
    const baseProgressState = generateBaseProgressState(
        UploadProgressState.Retry,
        uniqueCode,
    );
    if (isEmpty(baseProgressState)) return;
    baseProgressState!.retryTimes = retryTimes;

    emitterAndTaker.emit(UPLOADING_FILE_SUBSCRIBE_DEFINE, baseProgressState);
}

/**
 * 提交 上传的的进度状态
 *
 * @author lihh
 * @param type 类型
 * @param uniqueCode 唯一的code
 * @param step 步长
 */
export function emitUploadingProgressState(
    type: UploadProgressState,
    uniqueCode: string,
    step: number,
) {
    if (isCanCommitProgressState(uniqueCode, type)) return;

    const baseProgressState = generateBaseProgressState(type, uniqueCode);
    if (isEmpty(baseProgressState)) return;
    baseProgressState!.step = step;

    emitterAndTaker.emit(UPLOADING_FILE_SUBSCRIBE_DEFINE, baseProgressState);
}

/**
 * 提交 暂停进度状态
 *
 * @author lihh
 * @param type 类型
 * @param uniqueCode 唯一的值
 * @param pauseIndex 索引
 */
export function emitPauseProgressState(
    type: UploadProgressState,
    uniqueCode: string,
    pauseIndex: number,
) {
    if (isCanCommitProgressState(uniqueCode, type)) return;

    const baseProgressState = generateBaseProgressState(type, uniqueCode);
    if (isEmpty(baseProgressState)) return;
    baseProgressState!.pauseIndex = pauseIndex;

    emitterAndTaker.emit(UPLOADING_FILE_SUBSCRIBE_DEFINE, baseProgressState);
}

/**
 * 生产 提高并发的随机数
 *
 * @author lihh
 * @param unit 单位
 */
export async function upConcurrentHandler(unit: number) {
    await sleep((Math.random() * unit) | 0);
}

/**
 * 全局执行的
 *
 * @author lihh
 */
(function () {
    // 判断 work 是否已经加载完
    // @ts-ignore
    if (isEmpty(calculateNameWorker.current) && !isUndefined(Worker) && window.calculateNameWorker) {
        try {
            const workerPath = `${valueOrDefault(
                (
                    window as unknown as {
                        uploadJdk: { publicPath: string };
                    }
                )?.uploadJdk?.publicPath,
                "",
            )}/calculateNameWorker.js`;
            calculateNameWorker.current = new Worker(workerPath);
        } catch (e) {
            Logger.warning("不兼容web worker 或 未引入calculateNameWorker.js, 通过 MessageChannel 做兼容处理");
        }
    } else {
        Logger.warning("不兼容web worker 或 未引入calculateNameWorker.js, 通过 MessageChannel 做兼容处理");
    }
})();
