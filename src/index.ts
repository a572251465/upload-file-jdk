import {
  equals,
  isArray,
  isEmpty,
  isFunction,
  isHas,
  isNotEmpty,
  isNumber,
  isString,
  PLimit,
  sleep,
  valueOrDefault,
} from "jsmethod-extra";
import {
  calculateNameWorker,
  calculateUploaderConfig,
  channel,
  cloneGlobalInfoMappingHandler,
  computeCurrentNetworkSpeedHandler,
  computedInnerProgressHandler,
  CURRENT_CONSUME_BYTES,
  currentChooseLanguage,
  currentInternetSpeed,
  emitPauseProgressState,
  emitRequestErrorProgressState,
  emitRetryProgressState,
  emitUploadingProgressState,
  emitUploadProgressState,
  EXT_NAME_CONST,
  FILE_SIZE_CONST,
  generateUniqueCode,
  getFileValuesHandler,
  globalConsumeOffset,
  globalDoneCallbackMapping,
  globalFileSize,
  globalInfoMapping,
  globalPauseStateMapping,
  globalProgressState,
  globalWaitingHashCalculationQueue,
  ICommonResponse,
  INNER_PROGRESS_CONST,
  isCallConfigMethod,
  LanguageEnumType,
  Logger,
  NETWORK_SPEED_CONST,
  pLimit,
  ProgressReturnType,
  putGlobalInfoMappingHandler,
  QueueElementBase,
  requestNormalReturnHandler,
  sameFileUploadStateMapping,
  SERVER_REQUEST_FAIL_MSG,
  SOME_CONSTANT_VALUES,
  StoreFactory,
  upConcurrentHandler,
  UPLOAD_FILE_CONST,
  UploadConfigType,
  uploaderDefaultConfig,
  UploadProgressState,
  useStore,
} from "./core";
import { initLng } from "./core/language";
import i18next from "i18next";

export * from "./core/types";
export * from "./core/constant";
export { getLng } from "./core/language";
export { toFixedHandler } from "./core/tools";
export {
  emitterAndTaker,
  SubscriberSort,
  equals,
  isHas,
  isNotEmpty,
  strFormat,
} from "jsmethod-extra";

const [
  addItemHandler,
  deleteItemHandler,
  getAllItemHandler,
  getItemHandler,
  getAllKeysHandler,
] = useStore();

/**
 * 重新 上传文件
 *
 * @author lihh
 * @param uniqueCode 文件 唯一的code
 * @param newType 要修改的状态
 */
export async function restartUploadFileHandler(
  uniqueCode: string,
  newType: UploadProgressState,
) {
  // 表示暂停后 重新启动
  const map = globalInfoMapping[uniqueCode],
    calculationHashName = map.get("calculationHashName")!;

  // 修改状态
  globalProgressState.current.set(uniqueCode, newType);
  emitUploadProgressState(newType, uniqueCode);

  // 重新开始上传
  await startUploadFileHandler(calculationHashName, uniqueCode);
}

/**
 * channel event port2 message 绑定事件
 *
 * @author lihh
 * @param event 事件对象
 */
channel.port2.onmessage = async function (event) {
  const { fileName: name } = event.data;

  const suffix = `${name.slice(name.indexOf("."))}`;
  await upConcurrentHandler(100);

  const getNameHandler = () =>
      `${(Math.random() * 100000) | 0}${+new Date()}${(Math.random() * 100000) | 0}`,
    newFileName = getNameHandler();
  channel.port2.postMessage(`${newFileName}${suffix}`);
};

/**
 * 相同文件 是否继续下载
 *
 * @author lihh
 * @param uniqueCode 文件 唯一的code
 */
export async function sameFileNeedProceedHandler(uniqueCode: string) {
  // 通过唯一的code 拿到map 集合
  const map = globalInfoMapping[uniqueCode!],
    calculationHashName = map.get("calculationHashName")!;

  // 从 map集合中 拿到除了【uniqueCode】 的其他code
  const uniqueCodeValues =
    sameFileUploadStateMapping.current.get(calculationHashName);
  if (isEmpty(uniqueCodeValues)) return;

  // 拿到剩余的 values
  const newUniqueCodeValues = uniqueCodeValues!.filter(
    (code) => !equals(code, uniqueCode),
  );
  // 等待的状态 批量上传
  newUniqueCodeValues!.forEach((code) =>
    restartUploadFileHandler(code, UploadProgressState.Waiting),
  );
}

/**
 * 正常 异常结束的事件
 *
 * @author lihh
 * @param el queue 消息
 */
export function progressNormalOrErrorCompletionHandler(el: QueueElementBase) {
  const { uniqueCode } = el;

  if (!isHas(globalInfoMapping, uniqueCode!)) return;
  // 拿到 calculationHashName
  const calculationHashName = globalInfoMapping[uniqueCode!].get(
    "calculationHashName",
  )!;
  // 判断 calculationHashName 是否存在
  if (!sameFileUploadStateMapping.current.has(calculationHashName)) return;

  // 判断 calculationHashName 对应的value 是否为空
  const uniqueCodeValue =
    sameFileUploadStateMapping.current.get(calculationHashName);
  if (isEmpty(uniqueCodeValue)) {
    sameFileUploadStateMapping.current.delete(calculationHashName);
    return;
  }

  // 此时的key 是 文件计算的hash值
  // 此时的value 是 每个文件唯一的 code
  // 假如 [xxx.mp4, [xxx01, xxx02, xxx03]]
  const index = uniqueCodeValue!.indexOf(uniqueCode!);
  if (index !== -1) {
    uniqueCodeValue?.splice(index, 1);
    // 循环判断 是否已经彻底删除
    progressNormalOrErrorCompletionHandler(el);
  }
}

/**
 * 清除 缓存状态
 *
 * @author lihh
 */
export function clearCacheStateHandler(uniqueCode: string) {
  // 如果有 file 上传完成 重新请求网络
  computeCurrentNetworkSpeedHandler(uniqueCode, true);

  // 删除缓存数据
  Reflect.deleteProperty(globalInfoMapping, uniqueCode);
  globalProgressState.current.delete(uniqueCode);
  globalDoneCallbackMapping.current.delete(uniqueCode);
  globalConsumeOffset.current.delete(uniqueCode);
  globalFileSize.current.delete(uniqueCode);
  globalPauseStateMapping.current.delete(uniqueCode);
}

/**
 * 计算断点续传的索引
 *
 * @author lihh
 * @param calculationHashCode web worker 计算的code
 * @param uniqueCode 表示唯一的code
 */
export async function computedBreakPointProgressHandler(
  calculationHashCode: string,
  uniqueCode: string,
): Promise<number> {
  let res: ICommonResponse<[number, number]> | null = null;

  try {
    // 从这里 判断是否断点续传
    res =
      await calculateUploaderConfig.current!.req.listFilesReq!(
        calculationHashCode,
      );
  } catch (e) {
    emitRequestErrorProgressState(uniqueCode, SERVER_REQUEST_FAIL_MSG);
    return Number.MAX_SAFE_INTEGER;
  }

  // 这里针对 code 做判断
  if (!requestNormalReturnHandler(res!, uniqueCode))
    return Number.MAX_SAFE_INTEGER;

  if (isEmpty(res.data)) res.data = [0, 0];
  const {
    data: [idx, consumeOffset],
  } = res!;
  // 这里更新下 最新的消费长度
  putGlobalInfoMappingHandler(uniqueCode, CURRENT_CONSUME_BYTES, consumeOffset);

  // 更新 文件进度状态
  const realProgress = computedInnerProgressHandler(uniqueCode);
  // 断点续传状态
  emitUploadingProgressState(
    equals(consumeOffset, 0)
      ? UploadProgressState.Uploading
      : UploadProgressState.BreakPointUpload,
    uniqueCode,
    realProgress,
  );
  // 断点续传，设置等待状态
  await sleep(1000);

  // 已经消费的索引
  return idx;
}

/**
 * 是否可以 继续执行
 *
 * @author lihh
 * @param uniqueCode 唯一的code
 */
function isCanNextExecute(uniqueCode: string) {
  return [
    UploadProgressState.Waiting,
    UploadProgressState.Uploading,
    UploadProgressState.Retry,
    UploadProgressState.PauseRetry,
    UploadProgressState.BreakPointUpload,
    UploadProgressState.RefreshRetry,
  ].includes(globalProgressState.current.get(uniqueCode)!);
}

/**
 * 是否需要中断
 *
 * @author lihh
 * @param uniqueCode 文件唯一的code
 */
function isNeedInterrupt(uniqueCode: string) {
  return !isCanNextExecute(uniqueCode);
}

/**
 * 分割文件 上传事件
 *
 * @author lihh
 * @param uniqueCode 唯一的code
 * @param calculationHashCode web worker 计算的hashCode
 * @param idx 索引的值
 * @param retryTimes 重试次数
 */
export async function splitFileUploadingHandler(
  uniqueCode: string,
  calculationHashCode: string,
  idx: number,
  retryTimes = 0,
) {
  let consumeOffset = globalConsumeOffset.current.get(uniqueCode)!;
  const fontSize = globalFileSize.current.get(uniqueCode)!,
    map = globalInfoMapping[uniqueCode]!,
    uploadFile = map.get(UPLOAD_FILE_CONST)! as unknown as File,
    extName = map.get(EXT_NAME_CONST)! as string;

  // 如果循环执行结束后，说明分片文件上传结束。
  for (
    ;
    idx < Number.MAX_SAFE_INTEGER &&
    consumeOffset < fontSize &&
    isCanNextExecute(uniqueCode);

  ) {
    await upConcurrentHandler(100);
    // 从这里拿到网速
    const networkSpeed = currentInternetSpeed.current,
      newConsumeOffset = consumeOffset + networkSpeed;

    // 表示 formData 参数
    const formData = new FormData();
    formData.append("file", uploadFile.slice(consumeOffset, newConsumeOffset));

    // 表示 新的偏移量
    consumeOffset = newConsumeOffset;

    let res: ICommonResponse<boolean> | null = null;
    try {
      res = await calculateUploaderConfig.current!.req.sectionUploadReq!(
        calculationHashCode,
        `${calculationHashCode}.${extName}-${idx}`,
        formData,
      );
    } catch (e) {
      emitRequestErrorProgressState(uniqueCode, SERVER_REQUEST_FAIL_MSG);
      return;
    }

    // 针对 code 做处理
    if (!requestNormalReturnHandler(res, uniqueCode)) return;

    // 判断是否写入成功
    if (res.data) {
      // 更新消费偏移量
      putGlobalInfoMappingHandler(
        uniqueCode,
        CURRENT_CONSUME_BYTES,
        consumeOffset,
      );

      // <补丁> 从这里判断下 是否暂停了, 防止并发覆盖状态
      // 可能已经暂停了，但是异步请求发送了，所以要放弃这次操作
      if (
        equals(
          UploadProgressState.Pause,
          globalProgressState.current.get(uniqueCode),
        )
      )
        continue;

      // 修改 上传中的状态
      emitUploadingProgressState(
        UploadProgressState.Uploading,
        uniqueCode,
        computedInnerProgressHandler(uniqueCode),
      );
      idx += 1;
    } else {
      // 判断 是否重试失败
      const { maxRetryTimes } = calculateUploaderConfig.current!;
      if (retryTimes >= maxRetryTimes!) {
        // 设置 重试失败 状态
        emitUploadProgressState(UploadProgressState.RetryFailed, uniqueCode);
        return;
      }

      // 表示 重试次数
      retryTimes += 1;
      // 修改为重试状态
      emitRetryProgressState(uniqueCode, retryTimes);
      // 一旦执行到这里，说明上传失败了。尝试重新上传
      await splitFileUploadingHandler(
        uniqueCode,
        calculationHashCode,
        idx,
        retryTimes,
      );
    }
  }

  // 表示当前的状态
  const currentProgressState = globalProgressState.current.get(uniqueCode)!;
  // 判断是否暂停指令停止的
  if (equals(UploadProgressState.Pause, currentProgressState))
    emitPauseProgressState(UploadProgressState.Pause, uniqueCode);
}

/**
 * 表示生成任务
 *
 * @author lihh
 * @param calculationHashCode 通过 webWorker 计算的hash值
 * @param uniqueCode 唯一的值
 */
export async function generateTask(
  calculationHashCode: string,
  uniqueCode: string,
) {
  // 如果是异常状态，就没必要往下走了
  if (isNeedInterrupt(uniqueCode)) return;
  // 当一个任务添加进来后，重新请求网络
  computeCurrentNetworkSpeedHandler(uniqueCode, true);

  let idx = 0;
  // 判断是否为 暂停重试
  const currentProgressState = globalProgressState.current.get(uniqueCode)!;
  // 判断是否为 暂停重试
  if (equals(currentProgressState, UploadProgressState.PauseRetry))
    globalPauseStateMapping.current.delete(uniqueCode);
  else {
    idx = await computedBreakPointProgressHandler(
      calculationHashCode,
      uniqueCode,
    );
  }
  // 执行到这里，也许是请求错误了，就没必要向下走了
  if (isNeedInterrupt(uniqueCode)) return;

  // 开始分片上传
  await splitFileUploadingHandler(uniqueCode, calculationHashCode, idx);

  // 如果是异常的状态，就没必要往下走了
  if (isNeedInterrupt(uniqueCode)) return;

  // 修改状态 为 合并状态
  emitUploadProgressState(UploadProgressState.Merge, uniqueCode);

  // 开始尝试合并文件
  const extName = globalInfoMapping[uniqueCode].get("extName")!;

  let res: ICommonResponse | null = null;
  try {
    res = await calculateUploaderConfig.current!.req.mergeUploadReq!(
      calculationHashCode,
      `${calculationHashCode}.${extName}`,
    );
  } catch (e) {
    emitRequestErrorProgressState(uniqueCode, SERVER_REQUEST_FAIL_MSG);
    return;
  }
  if (res!.success)
    // 表示 合并成功
    emitUploadProgressState(UploadProgressState.Done, uniqueCode);
}

/**
 * check 上传配置 req属性的值
 *
 * @author lihh
 */
function checkUploaderConfigReqHandler() {
  if (isEmpty(calculateUploaderConfig.current?.req))
    Logger.error(
      i18next.t(SOME_CONSTANT_VALUES.KEY9) +
        " <calculateUploaderConfig.current.req>",
    );
  const req = calculateUploaderConfig.current!.req;

  // 请求方法限制判断
  if (
    !isFunction(req.listFilesReq) ||
    !isFunction(req.mergeUploadReq) ||
    !isFunction(req.sectionUploadReq) ||
    !isFunction(req.verifyFileExistReq)
  )
    Logger.error(
      i18next.t(SOME_CONSTANT_VALUES.KEY9) +
        " <calculateUploaderConfig.current.req>",
    );
}

/**
 * 上传文件 配置文件处理
 *
 * @author lihh
 */
function uploadFileConfigHandler() {
  checkUploaderConfigReqHandler();
}

/**
 * 开始上传文件
 *
 * @author lihh
 * @param calculationHashName 通过web worker 计算的hash名称
 * @param uniqueCode 生成的唯一 code
 */
export async function startUploadFileHandler(
  calculationHashName: string,
  uniqueCode: string,
) {
  // 判断默认配置
  uploadFileConfigHandler();

  let res: ICommonResponse<boolean> | null = null;
  try {
    // 进行请求 实现秒传
    res =
      await calculateUploaderConfig.current!.req.verifyFileExistReq!(
        calculationHashName,
      );
  } catch (e) {
    emitRequestErrorProgressState(uniqueCode, SERVER_REQUEST_FAIL_MSG);
    return;
  }
  // 这里针对code 做处理
  if (!requestNormalReturnHandler(res!, uniqueCode)) return;

  if (res!.data) {
    // 从这里 修改 秒传状态
    emitUploadProgressState(UploadProgressState.QuickUpload, uniqueCode);
    return;
  }

  const calculationHashCode = calculationHashName.split(".").shift()!;
  // 开始生成任务
  const task = generateTask.bind(null, calculationHashCode, uniqueCode);

  // 添加并且发射任务, 每次添加一个文件，就会发射文件
  if (!pLimit.current)
    pLimit.current = PLimit.getInstance(
      calculateUploaderConfig.current!.concurrentLimit!,
    );
  pLimit.current!.firingTask(task);
}

/**
 * 相同文件 上传处理
 *
 * @author lihh
 * @param calculationHashName 根据文件计算出 hash值
 * @param uniqueCode 每个文件对应 code
 */
function sameFileUploadingHandler(
  calculationHashName: string,
  uniqueCode: string,
) {
  let uniqueCodeArr =
    sameFileUploadStateMapping.current.get(calculationHashName);
  // 判断 是否为数组
  if (!isArray(uniqueCodeArr))
    sameFileUploadStateMapping.current.set(
      calculationHashName,
      (uniqueCodeArr = []),
    );

  // 添加到数组中
  uniqueCodeArr!.push(uniqueCode);
}

/**
 * 计算 hash 名称的事件
 *
 * @author lihh
 * @param uploadFile 上传的文件
 * @param uniqueCode 唯一的code
 */
async function calculationHashNameHandler(
  uploadFile: File,
  uniqueCode: string,
) {
  // 修改状态为 等待状态
  if (
    !emitUploadProgressState(
      UploadProgressState.HashCalculationWaiting,
      uniqueCode,
    )
  )
    return;

  // 从缓存中 拿到hashName
  const calculationHashName = await getItemHandler(
    getFileValuesHandler(uploadFile) as unknown as object,
    StoreFactory.p2,
  );
  if (isNotEmpty(calculationHashName)) {
    await eventChangeCallbackHandler(uniqueCode, calculationHashName as string);
    return;
  }

  // 判断队列是否为空
  if (isEmpty(globalWaitingHashCalculationQueue.current)) {
    // 直接运行
    asyncWebWorkerActionHandler(uploadFile, uniqueCode);
  } else {
    // 添加到队列中
    globalWaitingHashCalculationQueue.current.push([uploadFile, uniqueCode]);
  }
}

/**
 * 唤醒 新的队列的元素
 *
 * @author lihh
 */
function wakeupNewQueueElementHandler() {
  // 队列为空的话 直接返回
  if (isEmpty(globalWaitingHashCalculationQueue.current)) return;
  const [uploadFile, uniqueCode] =
    globalWaitingHashCalculationQueue.current.shift()!;

  // 开始计算hash
  asyncWebWorkerActionHandler(uploadFile, uniqueCode);
}

/**
 * 将 hash name 保存到store缓存中
 *
 * @author lihh
 * @param uploadFile 上传文件
 * @param calculationHashName 计算的 hash name
 */
async function hashNameAddStoreHandler(
  uploadFile: File,
  calculationHashName: string,
) {
  const maxHashNameCount = calculateUploaderConfig.current!.maxHashNameCount;
  if (!isNumber(maxHashNameCount) || maxHashNameCount <= 0) return;

  const allKeys = await getAllKeysHandler(StoreFactory.p2);
  // 判断是否已经满了
  if (allKeys.length >= calculateUploaderConfig.current!.maxHashNameCount!)
    // 先删除一个
    await deleteItemHandler(allKeys[allKeys.length - 1], StoreFactory.p2);

  await addItemHandler(
    getFileValuesHandler(uploadFile),
    calculationHashName as unknown as object,
    StoreFactory.p2,
  );
}

/**
 * 事件 变化的回调(为了 兼容 worker)
 *
 * @author lihh
 * @param uniqueCode 每个文件唯一的code
 * @param event 事件对象
 */
async function eventChangeCallbackHandler(
  uniqueCode: string,
  event: MessageEvent<string> | string,
) {
  // 开始尝试 计算新的
  wakeupNewQueueElementHandler();

  const calculationHashName = isString(event) ? event : event.data;
  // 将 hashName 也保存起来
  putGlobalInfoMappingHandler(
    uniqueCode,
    "calculationHashName",
    calculationHashName,
  );
  // 将hash  以及 file 进行持久化
  const map = globalInfoMapping[uniqueCode],
    uploadFile = map.get(UPLOAD_FILE_CONST) as unknown as File;
  await hashNameAddStoreHandler(uploadFile, calculationHashName);

  // 判断 是否相同文件上传中
  if (sameFileUploadStateMapping.current.has(calculationHashName)) {
    sameFileUploadingHandler(calculationHashName, uniqueCode);
    // 克隆 mapping 信息
    cloneGlobalInfoMappingHandler(
      sameFileUploadStateMapping.current.get(calculationHashName)![0],
      uniqueCode,
    );

    emitUploadProgressState(UploadProgressState.OtherUploading, uniqueCode);
    return;
  }
  // 相同文件 处理
  sameFileUploadingHandler(calculationHashName, uniqueCode);

  // 修改状态为 等待状态
  if (!emitUploadProgressState(UploadProgressState.Waiting, uniqueCode)) return;
  // 开始上传文件
  await startUploadFileHandler(calculationHashName, uniqueCode);
}

/**
 * 异步 web worker 加载动作
 *
 * @author lihh
 * @param uploadFile 上传文件
 * @param uniqueCode 文件对应的唯一 code值
 */
function asyncWebWorkerActionHandler(uploadFile: File, uniqueCode: string) {
  // 判断是否加载 worker
  if (isNotEmpty(calculateNameWorker.current)) {
    // 将 上传的文件 发送给 webWorker 来计算hash
    calculateNameWorker.current!.postMessage({
      file: uploadFile,
      flag: "file",
    });
    // 添加订阅事件
    calculateNameWorker.current!.onmessage = eventChangeCallbackHandler.bind(
      null,
      uniqueCode,
    );
  } else {
    channel.port1.postMessage({ fileName: uploadFile.name });
    // 使用 MessageChannel 来兼容 web Worker
    channel.port1.onmessage = eventChangeCallbackHandler.bind(null, uniqueCode);
  }
}

/**
 * 表示上传的事件
 *
 * @author lihh
 * @param uploadFile 要上传的文件
 * @param callback 默认的回调方法
 */
export function uploadHandler(
  uploadFile: File,
  callback?: (arr: ProgressReturnType) => void,
) {
  return new Promise<ProgressReturnType>(async (resolve, reject) => {
    // 每个文件分配一个code，唯一的code
    const uniqueCode = generateUniqueCode();

    globalDoneCallbackMapping.current.set(uniqueCode, [
      resolve,
      reject,
      callback!,
    ]);

    // 表示文件名称
    const { name: fileName, size: fileSize } = uploadFile;
    // 表示文件后缀
    const extName = fileName.split(".").pop()!;
    // 将属性设置为全局属性，方便获取
    putGlobalInfoMappingHandler(
      uniqueCode,
      "fileName",
      fileName,
      "uniqueCode",
      uniqueCode,
      FILE_SIZE_CONST,
      fileSize,
      EXT_NAME_CONST,
      extName,
      UPLOAD_FILE_CONST,
      uploadFile,
      // 此时表示内部进度
      INNER_PROGRESS_CONST,
      0,
      // 表示当前消费的字节数
      CURRENT_CONSUME_BYTES,
      0,
      NETWORK_SPEED_CONST,
      currentInternetSpeed.current,
    );
    // 修改状态
    if (!emitUploadProgressState(UploadProgressState.Prepare, uniqueCode))
      return;

    // 计算 hash 名称的事件
    await calculationHashNameHandler(uploadFile, uniqueCode);
  });
}

/**
 * 上传文件的配置
 *
 * @author lihh
 * @param config 配置文件
 */
uploadHandler.config = function (config: UploadConfigType) {
  const req = valueOrDefault(
    calculateUploaderConfig.current && calculateUploaderConfig.current?.req,
    {},
  );

  // 全局设置 配置文件
  calculateUploaderConfig.current = Object.assign(
    {},
    uploaderDefaultConfig,
    config,
  );

  if (isNotEmpty(Object.keys(req!)))
    calculateUploaderConfig.current!.req = req!;

  uploadHandler.lng(config.language);

  // 表示调用过
  isCallConfigMethod.current = true;
};

/**
 * 设置 语言
 *
 * @author lihh
 * @param language 设置语言
 */
uploadHandler.lng = async function (language?: LanguageEnumType) {
  // 设置 当前选择的语言
  const chooseLanguage =
    isEmpty(language) ||
    ![
      LanguageEnumType.EN,
      LanguageEnumType.ZH,
      LanguageEnumType.JA_JP,
    ].includes(language!)
      ? LanguageEnumType.ZH
      : language!;

  currentChooseLanguage.current = chooseLanguage;
  // 从这里初始化 语言
  await initLng(chooseLanguage);
};

// 直接运行的方法
(async function () {
  /* 1. 从 indexedDB 中拿到数据 */
  const rs = await getAllItemHandler();
  if (isEmpty(rs)) return;

  /* 2. 拿到数据后 设置到Map中 */
  for (const r in rs) putGlobalInfoMappingHandler(r, ...rs[r]);

  /* 3. 挨个发送，从而设置状态 */
  const allKeys = Object.keys(rs!);
  for (const key of allKeys) {
    /* 修改状态 */
    emitUploadProgressState(UploadProgressState.RefreshRetry, key);
    /* 重新提交事件 */
    const map = globalInfoMapping[key]!,
      calculationHashName = map.get("calculationHashName")!;
    await startUploadFileHandler(calculationHashName, key);
  }
})();
