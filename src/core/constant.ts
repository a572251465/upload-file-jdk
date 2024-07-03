import {calculateChunkSize} from "./tools";
import {UploadProgressState} from "./types"; /* 上传进度状态文字 */

/* 上传进度状态文字 */
export const UploadProgressStateText: Record<
    Required<UploadProgressState>,
    string
> = {
    [UploadProgressState.Prepare]: "准备中 ...",
    [UploadProgressState.HashCalculationWaiting]: "Hash 计算等待中 ...",
    [UploadProgressState.Waiting]: "排队等待中 ...",
    [UploadProgressState.Uploading]: "切片文件 上传中 ...",
    [UploadProgressState.Merge]: "文件合并中 ...",
    [UploadProgressState.Done]: "完成",
    [UploadProgressState.QuickUpload]: "秒传成功",
    [UploadProgressState.BreakPointUpload]: "断点续传 准备中 ...",
    [UploadProgressState.OtherUploading]: "上传队列中包含相同的文件, 请稍后 ...",
    [UploadProgressState.Canceled]: "上传被取消",
    [UploadProgressState.Pause]: "上传已暂停",
    [UploadProgressState.Retry]: "上传失败, 重试中(%s) ...",
    [UploadProgressState.RetryFailed]: "重试失败, 上传被取消",
    [UploadProgressState.PauseRetry]: "暂停重试 ...",
    [UploadProgressState.NetworkDisconnected]: "网络掉线, 重试(%s) ...",
    [UploadProgressState.RefreshRetry]: "刷新重试 ..."
};

/* 计算 chunk size 大小，这是一个预估值 */
export const CHUNK_SIZE_30 = calculateChunkSize(30);
export const CHUNK_SIZE_100 = calculateChunkSize(100);
/* 上传的文件 订阅状态 */
export const UPLOADING_FILE_SUBSCRIBE_DEFINE =
    "UPLOADING_FILE_SUBSCRIBE_DEFINE";
/* 一旦 client端 向 uploader发送消息时, 需要发送该指令 */
export const REVERSE_CONTAINER_ACTION = "REVERSE_CONTAINER_ACTION";
/* 表示 持久化 local key */
export const PERSIST_LOCAL_KEY = "big.file.upload.state";
