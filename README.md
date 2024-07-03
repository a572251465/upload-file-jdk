# upload-file-jdk

> JavaScript JDK plugin for implementing breakpoint continuation

![](./images/big-file-upload.png);

## 实现功能
- [x]  大文件切割上传
- [x]  秒传
- [x]  断点续传
- [x]  并发控制
- [x]  暂停
- [x]  相同文件互斥上传
- [ ]  网络中断
- [x]  删除
- [x]  web worker 优雅降级（MessageChannel）
- [x]  失败重试
- [x]  Hash摘要算法 队列
- [x]  持久化方案(基于IndexedDB缓存)
- [x]  刷新留存

## 简单案例

- [前端demo](https://github.com/a572251465/big_file_upload-front)
- 后端demo
  - [Java版 后端demo](https://github.com/a572251465/big-file-upload_end_java.git)
  - [Node版 后端demo](https://github.com/a572251465/big-file-upload_end_java.git)

```html
<!-- index.html -->
<!-- 将 js/calculateNameWorker.js 添加到 index.html -->

<script src="/calculateNameWorker.js"></script>
<!-- 如果没有引入该js的话，jdk 会使用 MessageChannel 来做兼容 -->
```

```typescript
// index.vue
const [allProgress, cancelProgressHandler, pauseProgressHandler] = useBigFileUploadForVue();
// 页面通过 allProgress 来遍历状态
// cancelProgressHandler 取消进度的方法
// pauseProgressHandler 暂停进度的方法 

import {uploadHandler, UploadProgressState} from "upload-file-jdk";

// 参数req中 都是需要提供的方法
// 其他的参数都是可选的
uploadHandler.config({
    persist: true, req: {
        listFilesReq,
        sectionUploadReq,
        mergeUploadReq,
        verifyFileExistReq,
    }
});

// 传递的 上传文件 file
uploadHandler(file);
```

## 参数解析
### uploadHandler.config
```typescript
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
```

- maxRetryTimes 请求失败最大重试次数, 默认是3（可选参数）
- concurrentLimit 最大并发次数, 默认是3（可选参数）
- persist 是否需要持久化, 默认是false（可选参数）
- req
  - listFilesReq 获取已经上传的目录列表，实现断点续传（必选参数）
  - sectionUploadReq 分片上传（必选参数）
  - mergeUploadReq 合并 分片（必选参数）
  - verifyFileExistReq 验证文件是否已经上传成功，实现秒传（必选参数）

### uploadHandler
```javascript
import {uploadHandler} from "upload-file-jdk";

uploadHandler(xxx, function (res1) {
    const [newFileName, targetName] = res1;
}).then(function (res2) {
    const [newFileName, targetName] = res2;
})
```

- `uploadHandler` 不仅支持 Promise，而且支持 callback 回调
- `uploadHandler` 会返回一个数组 [上传的文件名, 原来的文件名]

### useBigFileUploadForVue
`Vue 版`
```typescript
const [allProgress, cancelProgressHandler, pauseProgressHandler] = useBigFileUploadForVue();
```
- allProgress 所有的进度状态
- cancelProgressHandler 取消进度的事件
  - 参数是代表进度的唯一的id uniqueCode
- pauseProgressHandler 暂停进度的事件
  - 参数是代表进度的唯一的id uniqueCode

`allProgress 类型`
```typescript
Array<QueueElementBase>

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
```
`cancelProgressHandler 类型`
```typescript
export type ICancelProgressHandler = (uniqueCode: string) => void
```

`pauseProgressHandler 类型`
```typescript
export type IPauseProgressHandler = (uniqueCode: string) => void
```

### useBigFileUploadForReact
`类同`

### 进度类型
```typescript
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
```