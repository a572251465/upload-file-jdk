import { LanguageEnumType, UploadProgressState } from "./types";

export const UploadProgressStateText: Record<
  Required<UploadProgressState>,
  Record<LanguageEnumType, string>
> = {
  [UploadProgressState.Prepare]: {
    [LanguageEnumType.ZH]: "准备中",
    [LanguageEnumType.EN]: "in preparation",
    [LanguageEnumType.JA_JP]: "準備中",
  },
  [UploadProgressState.HashCalculationWaiting]: {
    [LanguageEnumType.ZH]: "计算文件大小",
    [LanguageEnumType.EN]: "calculate file size",
    [LanguageEnumType.JA_JP]: "ファイルサイズの計算",
  },
  [UploadProgressState.Waiting]: {
    [LanguageEnumType.ZH]: "排队等待中",
    [LanguageEnumType.EN]: "waiting in line",
    [LanguageEnumType.JA_JP]: "キュー待ち中",
  },
  [UploadProgressState.Uploading]: {
    [LanguageEnumType.ZH]: "文件上传中",
    [LanguageEnumType.EN]: "file upload in progress",
    [LanguageEnumType.JA_JP]: "ファイルアップロード中",
  },
  [UploadProgressState.Merge]: {
    [LanguageEnumType.ZH]: "文件合并中",
    [LanguageEnumType.EN]: "file merging in progress",
    [LanguageEnumType.JA_JP]: "ファイル結合",
  },
  [UploadProgressState.Done]: {
    [LanguageEnumType.ZH]: "完成",
    [LanguageEnumType.EN]: "complete",
    [LanguageEnumType.JA_JP]: "完了",
  },
  [UploadProgressState.QuickUpload]: {
    [LanguageEnumType.ZH]: "秒传成功",
    [LanguageEnumType.EN]: "instant transmission successful",
    [LanguageEnumType.JA_JP]: "秒パス成功",
  },
  [UploadProgressState.BreakPointUpload]: {
    [LanguageEnumType.ZH]: "断点续传准备中",
    [LanguageEnumType.EN]: "resume from breakpoint is being prepared",
    [LanguageEnumType.JA_JP]: "ブレークポイント再送信準備中",
  },
  [UploadProgressState.OtherUploading]: {
    [LanguageEnumType.ZH]: "上传队列中包含相同的文件, 请稍后",
    [LanguageEnumType.EN]:
      "the upload queue contains the same file, please wait",
    [LanguageEnumType.JA_JP]:
      "アップロードキューには同じファイルが含まれています。後で",
  },
  [UploadProgressState.Canceled]: {
    [LanguageEnumType.ZH]: "上传被取消",
    [LanguageEnumType.EN]: "upload cancelled",
    [LanguageEnumType.JA_JP]: "アップロードがキャンセルされました",
  },
  [UploadProgressState.Pause]: {
    [LanguageEnumType.ZH]: "上传已暂停",
    [LanguageEnumType.EN]: "upload paused",
    [LanguageEnumType.JA_JP]: "アップロードが一時停止されました",
  },
  [UploadProgressState.Retry]: {
    [LanguageEnumType.ZH]: "上传失败, 重试中(%s)",
    [LanguageEnumType.EN]: "upload failed, trying again (%s)",
    [LanguageEnumType.JA_JP]: "アップロードに失敗しました、再試行中（%s）",
  },
  [UploadProgressState.RetryFailed]: {
    [LanguageEnumType.ZH]: "重试失败, 上传被取消",
    [LanguageEnumType.EN]: "retry failed, upload canceled",
    [LanguageEnumType.JA_JP]:
      "再試行に失敗し、アップロードがキャンセルされました",
  },
  [UploadProgressState.PauseRetry]: {
    [LanguageEnumType.ZH]: "暂停重试",
    [LanguageEnumType.EN]: "pause retry",
    [LanguageEnumType.JA_JP]: "再試行の一時停止",
  },
  [UploadProgressState.NetworkDisconnected]: {
    [LanguageEnumType.ZH]: "网络掉线, 重试(%s)",
    [LanguageEnumType.EN]: "network disconnection, retry (%s)",
    [LanguageEnumType.JA_JP]: "ネットワークオフライン、再試行（%s）",
  },
  [UploadProgressState.RefreshRetry]: {
    [LanguageEnumType.ZH]: "刷新重试",
    [LanguageEnumType.EN]: "refresh and retry",
    [LanguageEnumType.JA_JP]: "再試行のリフレッシュ",
  },
  [UploadProgressState.RequestError]: {
    [LanguageEnumType.ZH]: "请求失败, 请检查请求(%s)",
    [LanguageEnumType.EN]: "request failed, please check the request (%s)",
    [LanguageEnumType.JA_JP]:
      "要求に失敗しました。要求をチェックしてください(%s)",
  },
};

// 计算网络的 byte size
export const COMPUTE_NETWORK_BYTE_SIZE = 20 * 1024;

/* 上传的文件 订阅状态 */
export const UPLOADING_FILE_SUBSCRIBE_DEFINE =
  "UPLOADING_FILE_SUBSCRIBE_DEFINE";
/* 一旦 client端 向 uploader发送消息时, 需要发送该指令 */
export const REVERSE_CONTAINER_ACTION = "REVERSE_CONTAINER_ACTION";
// 服务请求失败 提示
export const SERVER_REQUEST_FAIL_MSG = "fetch fail, 请检查服务";
// 表示空消息的默认值
export const NO_MESSAGE_DEFAULT_VALUE = "未提供错误消息";
// 表示 内部进度的固定值
export const INNER_PROGRESS_CONST = "innerProgress";
// 表示 消费的字节数
export const CURRENT_CONSUME_BYTES = "currentConsumeBytes";
// 表示 文件大小 const
export const FILE_SIZE_CONST = "fileSize";
// 表示 上传文件
export const UPLOAD_FILE_CONST = "uploadFile";
// 表示 后缀名称
export const EXT_NAME_CONST = "extName";
// 表示网络速度
export const NETWORK_SPEED_CONST = "networkSpeed";

// 一些固定值
export const SOME_CONSTANT_VALUES = {
  KEY1: "KEY1",
  KEY2: "KEY2",
  KEY3: "KEY3",
  KEY4: "KEY4",
  KEY5: "KEY5",
  KEY6: "KEY6",
  KEY7: "KEY7",
  KEY8: "KEY8",
  KEY9: "KEY9",
  KEY10: "KEY10",
};

// 表示 zh 语言
export const zhLanguage: Record<string, string> = {
  [SOME_CONSTANT_VALUES.KEY6]:
    "不兼容web worker 或 未引入calculateNameWorker.js, 通过 MessageChannel 做兼容处理",
  [SOME_CONSTANT_VALUES.KEY7]: "暂时 不支持 indexedDB, 无法持久化",
  [SOME_CONSTANT_VALUES.KEY8]: "进度已经完成了, 可以自行进行删除.",
  [SOME_CONSTANT_VALUES.KEY9]: "请配置请求方法",
  [SOME_CONSTANT_VALUES.KEY10]: "暂时无进度",
};

// 表示 jp 语言
export const jpLanguage: Record<string, string> = {
  [SOME_CONSTANT_VALUES.KEY6]:
    "非互換WebワーカーまたはcalculateNameWorker.jsを導入せず、MessageChannelによる互換処理",
  [SOME_CONSTANT_VALUES.KEY7]:
    "一時的にindexedDBをサポートしておらず、持続化できません",
  [SOME_CONSTANT_VALUES.KEY8]:
    "進行状況はすでに完了しているので、自分で削除することができます。",
  [SOME_CONSTANT_VALUES.KEY9]: "要求方法を設定してください",
  [SOME_CONSTANT_VALUES.KEY10]: "しばらく進行なし",
};

// 表示 en 语言
export const enLanguage: Record<string, string> = {
  [SOME_CONSTANT_VALUES.KEY6]:
    "incompatible with web workers or without introducing calculateNameWorker.js, compatibility is handled through the Message Channel",
  [SOME_CONSTANT_VALUES.KEY7]:
    "indexedDB is currently not supported and cannot be persisted",
  [SOME_CONSTANT_VALUES.KEY8]:
    "the progress has been completed and can be deleted on your own",
  [SOME_CONSTANT_VALUES.KEY9]: "please configure the request method",
  [SOME_CONSTANT_VALUES.KEY10]: "No progress temporarily",
};
