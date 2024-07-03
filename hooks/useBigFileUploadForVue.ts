import {
    emitterAndTaker,
    equals,
    isHas,
    isNotEmpty,
    QueueElementBase,
    REVERSE_CONTAINER_ACTION,
    strFormat,
    UPLOADING_FILE_SUBSCRIBE_DEFINE,
    UploadProgressState,
    UploadProgressStateText,
} from "upload-file-jdk";
import {ref} from "vue";

export type QueueElementBaseExtend = Required<
    QueueElementBase & {
    stateDesc: string;
    downSize: number;
}
>;
const allProgress = ref<Array<QueueElementBaseExtend>>([]);
export type ProgressStateType = typeof allProgress;

/**
 * 取消 进度的事件
 *
 * @author lihh
 * @param uniqueCode 唯一的值
 */
function cancelProgressHandler(uniqueCode: string) {
    emitterAndTaker.emit(
        REVERSE_CONTAINER_ACTION,
        uniqueCode,
        UploadProgressState.Canceled,
    );
}

/**
 * 暂停 进度的事件
 *
 * @author lihh
 * @param uniqueCode 唯一的值
 */
function pauseProgressHandler(uniqueCode: string) {
    emitterAndTaker.emit(
        REVERSE_CONTAINER_ACTION,
        uniqueCode,
        UploadProgressState.Pause,
    );
}

/**
 * 表示 大文件上传的 hook
 *
 * @author lihh
 * @return [ProgressStateType, (uniqueCode: string) => void, (uniqueCode: string) => void] [上述的状态, 取消事件, 暂停事件]
 */
export function useBigFileUploadForVue(): [
    ProgressStateType,
    (uniqueCode: string) => void,
    (uniqueCode: string) => void,
] {
    // 添加收到消息的订阅事件
    emitterAndTaker.on(
        UPLOADING_FILE_SUBSCRIBE_DEFINE,
        function (el: QueueElementBaseExtend) {
            // 判断是否存在 用来判断是否要添加
            let existingElement = allProgress.value.find((item) =>
                equals(item.uniqueCode, el.uniqueCode),
            );
            // 索引
            const index = allProgress.value.findIndex((item) =>
                equals(item.uniqueCode, el.uniqueCode),
            );
            // 判断 元素是否存在
            if (existingElement) {
                existingElement.type = el.type;
                // 判断 downSize 是否存在
                if (!isHas(existingElement, "downSize")) existingElement.downSize = 0;
            }

            switch (el.type) {
                case UploadProgressState.Prepare: {
                    if (isNotEmpty(existingElement)) return;

                    existingElement = el;
                    existingElement.downSize = 0;

                    // 如果是准备阶段的话 就要添加了
                    allProgress.value.unshift(el);
                    break;
                }
                case UploadProgressState.RefreshRetry: {
                    if (isNotEmpty(existingElement)) return;

                    existingElement = el;
                    existingElement!.downSize =
                        (existingElement!.progress * existingElement!.fileSize) / 100;

                    allProgress.value.unshift(el);
                    break;
                }
                case UploadProgressState.Uploading: {
                    // 从 这里进行进度条累加
                    const progress = existingElement!.progress,
                        sum = progress + el.step;
                    existingElement!.progress = sum > 100 ? 100 : sum;
                    existingElement!.downSize =
                        (existingElement!.progress * existingElement!.fileSize) / 100;

                    break;
                }
                // 判断是否断点续传
                case UploadProgressState.BreakPointUpload: {
                    // 断点续传中 直接设置滚动状态
                    existingElement!.progress = el.step;
                    break;
                }
                // 判断是否重试中
                case UploadProgressState.Retry: {
                    existingElement!.stateDesc = strFormat(
                        existingElement!.stateDesc,
                        el.retryTimes + "",
                    );
                    break;
                }
                // 表示 这是一个取消状态
                case UploadProgressState.Canceled: {
                    if (index !== -1) allProgress.value.splice(index, 1);
                    break;
                }
                case UploadProgressState.Merge:
                case UploadProgressState.QuickUpload:
                case UploadProgressState.Done: {
                    existingElement!.progress = 100;
                    break;
                }
            }

            // 判断 元素是否存在
            if (existingElement)
                // 修改显示描述
                existingElement.stateDesc =
                    UploadProgressStateText[existingElement!.type];
        },
    );

    return [allProgress, cancelProgressHandler, pauseProgressHandler];
}
