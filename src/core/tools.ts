import {
  emitterAndTaker,
  equals,
  isEmpty,
  isFunction,
  isHas,
  isMap,
  isNotEmpty,
  isUndefined,
  sleep,
  strFormat,
  valueOrDefault,
} from "jsmethod-extra";
import {
  HTTPEnumState,
  ICommonResponse,
  QueueElementBase,
  UploadProgressState,
} from "./types";
import {
  calculateEmitNetworkSpeedTasks,
  calculateNameWorker,
  calculateUploaderConfig,
  currentInternetSpeed,
  globalConsumeOffset,
  globalFileSize,
  globalInfoMapping,
  globalNextCount,
  globalPLimitDoneSuccessCallback,
  globalProgressState,
  prevComputeNetworkSpeedInterval,
} from "./variable";
import {
  COMPUTE_NETWORK_BYTE_SIZE,
  CURRENT_CONSUME_BYTES,
  FILE_SIZE_CONST,
  INNER_PROGRESS_CONST,
  NETWORK_SPEED_CONST,
  NO_MESSAGE_DEFAULT_VALUE,
  SOME_CONSTANT_VALUES,
  UPLOAD_FILE_CONST,
  UPLOADING_FILE_SUBSCRIBE_DEFINE,
} from "./constant";
import {Logger} from "./Logger";
import i18next from "i18next";

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
 * 通过file本身 拿到 values
 *
 * @author lihh
 * @param file 文件
 */
export function getFileValuesHandler(file: File): string {
  const { lastModified, name, size, type } = file;
  return `${lastModified}&${name}&${size}&${type}`;
}

/**
 * 计算 当前上传的文件个数
 *
 * @author lihh
 */
export function computeCurrentUploadingCountHandler(): number {
  let count = 0;
  for (const val of globalProgressState.current.values())
    count += [UploadProgressState.Uploading].includes(val) ? 1 : 0;

  // 最少是 一个
  return Math.max(count, 1);
}

/**
 * 计算当前的网络
 *
 * @author lihh
 * @param uniqueCode 表示唯一的code, 用来获取文件
 * @param forceUpdate 是否强制更新
 */
export async function computeCurrentNetworkSpeedHandler(
  uniqueCode: string,
  forceUpdate = false,
) {
  // 表示 开始时间
  const startTime = +new Date();
  // 等待时间
  const waitTiming = currentInternetSpeed.current < 500 * 1024 ? 2000 : 5000;

  // 保证每次间隔最起码在5s以上
  if (
    !forceUpdate &&
    startTime - prevComputeNetworkSpeedInterval.current < waitTiming
  )
    return;

  const map = globalInfoMapping[uniqueCode];
  if (!isMap(map)) return;

  const file = map.get(UPLOAD_FILE_CONST) as unknown as File,
    { size: fileSize } = file,
    computedSize = Math.min(COMPUTE_NETWORK_BYTE_SIZE, fileSize);

  // 构建参数
  const calculationHashCode = `not_del_file_werwersfdsfdss23232`;
  const formData = new FormData();
  formData.append("file", file.slice(0, computedSize));

  try {
    await calculateUploaderConfig.current!.req.sectionUploadReq!(
      calculationHashCode,
      `${calculationHashCode}.mp4-1`,
      formData,
    );

    // 结束时间
    const endTime = +new Date();
    // 计算 花费时间, 按照每秒计算
    const duration = (endTime - startTime) / 1000;

    // 最少保证20k 上传速度
    currentInternetSpeed.current = Math.max(
      toFixedHandler(
        computedSize / duration / computeCurrentUploadingCountHandler(),
        0,
      ),
      COMPUTE_NETWORK_BYTE_SIZE,
    );
  } catch (e) {
    Logger.error(e as string, false);
  } finally {
    prevComputeNetworkSpeedInterval.current = +new Date();
    putGlobalInfoMappingHandler(
      uniqueCode,
      NETWORK_SPEED_CONST,
      currentInternetSpeed.current,
    );
  }
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

      // 针对 fileSize/ 以及消费偏移量 做处理 进行处理
      if (["fileSize", CURRENT_CONSUME_BYTES].includes(key as string)) {
        const globalInfo = equals(CURRENT_CONSUME_BYTES, key)
          ? globalConsumeOffset.current
          : globalFileSize.current;
        globalInfo.set(code, Number(value));
      }
    }
  }
}

/**
 * 这里是生成唯一的 code
 *
 * @author lihh
 */
export function generateUniqueCode() {
  return `upload_big_file_next_${(Math.random() * 1000000) | 0}_${globalNextCount.current++}`;
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
    uploadFile: map.get(UPLOAD_FILE_CONST) as unknown as File,
    fileName: map.get("fileName")!,
    progress: 0,
    retryTimes: 0,
    networkSpeed: currentInternetSpeed.current,
    requestErrorMsg: "",
    fileSize: map.get(FILE_SIZE_CONST) as unknown as number,
  };

  // 设置全局的进度状态
  globalProgressState.current.set(uniqueCode, type);

  // 但凡 牵扯到可能请求记录发生变化时，都要重新请求网速
  if (
    [
      UploadProgressState.Uploading,
      UploadProgressState.Pause,
      UploadProgressState.PauseRetry,
      UploadProgressState.Canceled,
      UploadProgressState.RequestError,
      UploadProgressState.RetryFailed,
    ].includes(type)
  )
    // 如果是上传状态的时，不需要重试状态
    calculateEmitNetworkSpeedTasks.current.push([
      uniqueCode,
      computeCurrentNetworkSpeedHandler,
    ]);
  return baseQueueElement;
}

/**
 * 提交 请求失败的状态
 *
 * @author lihh
 * @param uniqueCode 每个文件唯一的code
 * @param errorMsg 错误的消息
 */
export function emitRequestErrorProgressState(
  uniqueCode: string,
  errorMsg: string,
) {
  if (isCanCommitProgressState(uniqueCode, UploadProgressState.RequestError))
    return;

  // 基础 进度状态
  const baseProgressState = generateBaseProgressState(
    UploadProgressState.RequestError,
    uniqueCode,
  );
  if (isEmpty(baseProgressState)) return;

  // 如果为空的话 设置默认的消息
  baseProgressState!.requestErrorMsg = valueOrDefault(
    errorMsg,
    NO_MESSAGE_DEFAULT_VALUE,
  );
  emitterAndTaker.emit(UPLOADING_FILE_SUBSCRIBE_DEFINE, baseProgressState);
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
): boolean {
  if (isCanCommitProgressState(uniqueCode, type)) return false;

  emitterAndTaker.emit(
    UPLOADING_FILE_SUBSCRIBE_DEFINE,
    generateBaseProgressState(type, uniqueCode),
  );
  return true;
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
 * 计算内部 progress 的长度
 *
 * @author lihh
 * @param uniqueCode 文件 唯一的code
 */
export function computedInnerProgressHandler(uniqueCode: string) {
  const infoMapping = globalInfoMapping[uniqueCode];

  let innerProgress = 0;
  if (!infoMapping.has(INNER_PROGRESS_CONST))
    Logger.warning(
      strFormat("<%s> %s", uniqueCode, i18next.t(SOME_CONSTANT_VALUES.KEY10)),
    );
  else {
    const fileSize = globalFileSize.current.get(uniqueCode)!,
      consumeOffset = globalConsumeOffset.current.get(uniqueCode)!;

    innerProgress = toFixedHandler(consumeOffset / fileSize, 10) * 100;
  }

  return innerProgress;
}

/**
 * 提交 上传的的进度状态
 *
 * @author lihh
 * @param type 类型
 * @param uniqueCode 唯一的code
 * @param realProgress 表示真实的进度
 */
export function emitUploadingProgressState(
  type: UploadProgressState,
  uniqueCode: string,
  realProgress: number,
) {
  if (isCanCommitProgressState(uniqueCode, type)) return;

  const baseProgressState = generateBaseProgressState(type, uniqueCode);
  if (isEmpty(baseProgressState)) return;
  baseProgressState!.progress = realProgress;

  emitterAndTaker.emit(UPLOADING_FILE_SUBSCRIBE_DEFINE, baseProgressState);
}

/**
 * 提交 暂停进度状态
 *
 * @author lihh
 * @param type 类型
 * @param uniqueCode 唯一的值
 */
export function emitPauseProgressState(
  type: UploadProgressState,
  uniqueCode: string,
) {
  if (isCanCommitProgressState(uniqueCode, type)) return;

  const baseProgressState = generateBaseProgressState(type, uniqueCode);
  if (isEmpty(baseProgressState)) return;

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
 * 发射 done 成功的回调
 *
 * @author lihh
 * @param uniqueCode 表示唯一的值
 */
export function firingDoneCallbackHandler(uniqueCode: string) {
  const doneCallback = globalPLimitDoneSuccessCallback.current.get(uniqueCode);
  if (!isFunction(doneCallback)) return;

  // 删除多余 doneCallback
  globalPLimitDoneSuccessCallback.current.delete(uniqueCode);
  doneCallback();
}

/**
 * 固定小数点的方法
 *
 * @author lihh
 * @param size 大小
 * @param count 个数
 */
export function toFixedHandler(size: number, count: number) {
  const sizeStr = `${size}`,
    idx = sizeStr.indexOf(".");

  if (equals(idx, -1)) return size;

  const sizeArr = sizeStr.split(".");
  if (count === 0) return Number(sizeArr[0]);
  return Number(`${sizeArr[0]}.${sizeArr[1].slice(0, count)}`);
}

/**
 * 判断请求能否正常返回
 *
 * @author lihh
 * @param rs 请求的返回值
 * @param uniqueCode 唯一的值
 * @returns true 表示可以正常执行 false 表示无法正常执行了
 */
export function requestNormalReturnHandler(
  rs: ICommonResponse,
  uniqueCode?: string,
): boolean {
  // 表示 返回状态
  let returnFlags = false;

  if (!isHas(rs, "success")) {
    returnFlags = equals(rs.code, HTTPEnumState.OK);
  } else {
    returnFlags = equals(rs.code, HTTPEnumState.OK) && !!rs.success;
  }

  if (!returnFlags && isNotEmpty(uniqueCode))
    emitRequestErrorProgressState(
      uniqueCode,
      rs.message || rs.msg || "暂无请求提示",
    );

  // 从这里打印log
  if (!returnFlags && isNotEmpty(rs))
    sleep(1000, function () {
      Logger.error(JSON.stringify(rs), false);
    });
  return returnFlags;
}

/**
 * 全局执行的
 *
 * @author lihh
 */
(function () {
  // 判断 work 是否已经加载完
  if (
    isEmpty(calculateNameWorker.current) &&
    !isUndefined(Worker) &&
    // @ts-ignore
    window.calculateNameWorker
  ) {
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
      Logger.warning(i18next.t(SOME_CONSTANT_VALUES.KEY6));
    }
  } else {
    Logger.warning(i18next.t(SOME_CONSTANT_VALUES.KEY6));
  }
})();
