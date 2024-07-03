import {
    emitterAndTaker,
    equals,
    isArray,
    isEmpty,
    isFunction,
    isUndefined,
    strFormat,
    SubscriberSort,
} from "jsmethod-extra";
import {QueueElementBase, UploadProgressState} from "./types";
import {emitUploadProgressState} from "./tools";
import {useStore} from "./store";
import localforage from "localforage";
import {
    REVERSE_CONTAINER_ACTION,
    UPLOADING_FILE_SUBSCRIBE_DEFINE
} from "./constant";
import {
    calculateUploaderConfig,
    globalDoneCallbackMapping,
    globalInfoMapping,
    globalPauseStateMapping,
    globalProgressState
} from "./variable";
import {Logger} from "./Logger";
import {
    clearCacheStateHandler,
    progressNormalOrErrorCompletionHandler,
    restartUploadFileHandler,
    sameFileNeedProceedHandler
} from "../index";

const [addItemHandler, deleteItemHandler] = useStore();

emitterAndTaker.on(
    REVERSE_CONTAINER_ACTION,
    async function (uniqueCode: string, action: UploadProgressState) {
        // 如果是取消，但是map中已经不存在，说明可以直接删除的
        if (
            equals(action, UploadProgressState.Canceled) &&
            !globalProgressState.current.has(uniqueCode)
        ) {
            Logger.warning(
                strFormat("[%s] 进度已经完成了, 可以自行进行删除.", uniqueCode),
            );
            return;
        }

        // 判断 动作是否合法
        if (
            ![UploadProgressState.Pause, UploadProgressState.Canceled].includes(
                action,
            ) ||
            !globalProgressState.current.has(uniqueCode)
        )
            return;

        // 同时 修改状态
        globalProgressState.current.set(uniqueCode, action);

        switch (action) {
            case UploadProgressState.Canceled:
                emitUploadProgressState(UploadProgressState.Canceled, uniqueCode);
                break;
            case UploadProgressState.Pause: {
                // 是否已经被暂停了
                const isPaused = globalPauseStateMapping.current.get(uniqueCode);
                if (!isUndefined(isPaused))
                    await restartUploadFileHandler(
                        uniqueCode,
                        UploadProgressState.PauseRetry,
                    );
                break;
            }
        }
    },
);

// 订阅事件【UPLOADING_FILE_SUBSCRIBE_DEFINE】，每个状态改变 都会执行这个方法
emitterAndTaker.on(
    UPLOADING_FILE_SUBSCRIBE_DEFINE,
    async function (el: QueueElementBase) {
        // 同时订阅 判断指定的状态
        switch (el.type) {
            case UploadProgressState.RetryFailed:
            case UploadProgressState.Done:
            case UploadProgressState.Canceled:
            case UploadProgressState.QuickUpload:
                // 某个文件结束的时候，判断是否有相同的文件等待
                if (
                    [UploadProgressState.Done, UploadProgressState.QuickUpload].includes(
                        el.type,
                    )
                )
                    await sameFileNeedProceedHandler(el.uniqueCode!);

                progressNormalOrErrorCompletionHandler(el);
                clearCacheStateHandler(el.uniqueCode!);
                break;
            // 这里是暂停处理
            case UploadProgressState.Pause:
                // 设置暂停状态
                if (!globalPauseStateMapping.current.has(el.uniqueCode!))
                    globalPauseStateMapping.current.set(el.uniqueCode!, el.pauseIndex!);
        }
    },
    SubscriberSort.FIRST,
    10,
);

/**
 * 当 el 类型是 Done or QuickUpload 的时候监听
 *
 * @author lihh
 */
emitterAndTaker.on(
    UPLOADING_FILE_SUBSCRIBE_DEFINE,
    async function (el: QueueElementBase) {
        // 判断是否为 done or quickUpload
        switch (el.type) {
            case UploadProgressState.Done:
            case UploadProgressState.QuickUpload:
                const map = globalInfoMapping[el.uniqueCode!],
                    calculationHashName = map.get("calculationHashName")!,
                    fileName = map.get("fileName")!,
                    pMethods = globalDoneCallbackMapping.current.get(el.uniqueCode!);

                // 这里是执行 promise resolve 方法 以及 callback方法
                if (!isArray(pMethods)) {
                    Logger.warning(
                        strFormat(
                            "[%s(%s)] 无法获取到进度信息, 请联系开发者",
                            fileName,
                            el.uniqueCode!,
                        ),
                    );
                    return;
                }
                const [m1, , m3] = pMethods!;
                if (isFunction(m1)) m1([calculationHashName, fileName]);
                if (isFunction(m3)) m3([calculationHashName, fileName]);
                break;
        }
    },
    SubscriberSort.FIRST,
    5,
);

/* 这里为了 持久化 而订阅 */
emitterAndTaker.on(
    UPLOADING_FILE_SUBSCRIBE_DEFINE,
    async function (el: QueueElementBase) {
        // 是否开启 持久化
        if (!calculateUploaderConfig.current?.persist) return;
        /* 判断 是否支持 indexedDB */
        if (!localforage.supports(localforage.INDEXEDDB))
            return Logger.warning("暂时 不支持 indexedDB, 无法持久化");

        /* 判断状态是否处于完成状态 */
        if (
            [
                UploadProgressState.Done,
                UploadProgressState.QuickUpload,
                UploadProgressState.RetryFailed,
                UploadProgressState.Canceled,
            ].includes(el.type!)
        ) {
            /* 直接删除 */
            await deleteItemHandler(el.uniqueCode!);
            return;
        }

        /* 判断是否处于运行状态 */
        if (
            [
                UploadProgressState.Uploading,
                UploadProgressState.BreakPointUpload,
                UploadProgressState.Merge,
                UploadProgressState.Pause,
                UploadProgressState.Retry,
            ].includes(el.type!)
        ) {
            /* 汇集key */
            const mapInfo = globalInfoMapping[el.uniqueCode!];
            if (isEmpty(mapInfo)) {
                Logger.warning(strFormat("持久化订阅 %s 取到的值为空", el.uniqueCode!));
                return;
            }

            const values: Array<unknown> = [];
            for (const [key, value] of mapInfo) values.push(key, value);

            /* 添加集合 */
            await addItemHandler(el.uniqueCode!, values);
        }
    },
    SubscriberSort.FIRST,
    3,
);
