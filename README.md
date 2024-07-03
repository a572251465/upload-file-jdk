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
- [x]  web worker 降级处理
- [x]  失败重试
- [x]  Hash摘要算法 队列
- [x]  持久化方案(基于IndexedDB缓存)
- [x]  刷新留存

## 使用案例

```typescript
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