import { isNotEmpty } from "jsmethod-extra";

export interface FiringTaskType {
  (fn: () => void): void;
}

export interface IPLimitC {
  firingTask(...argTask: Array<FiringTaskType>): void;
}

// 表示 单个实例
let instance: PLimit | null = null;

export class PLimit {
  // 表示 最大并发
  private readonly maxConcurrentRequests: number;
  // 表示 当前执行的任务数
  private currentExecuteTaskCount = 0;
  // 表示等待的任务
  private waitTasks: Array<FiringTaskType> = [];

  private constructor(maxConcurrentRequests: number) {
    this.maxConcurrentRequests = maxConcurrentRequests || 5;
  }

  /**
   * 获取到 PLimit 实例
   *
   * @author lihh
   * @param maxConcurrentRequests 最大并发数
   */
  static getInstance(maxConcurrentRequests: number) {
    // 判断单例是否存在
    if (isNotEmpty(instance)) return instance;
    instance = new PLimit(maxConcurrentRequests);
    return instance;
  }

  /**
   * 执行结束的回调
   *
   * @author lihh
   * @private
   */
  private doneCallback() {
    this.currentExecuteTaskCount -= 1;

    // 拿到新的任务
    const newTask = this.waitTasks.shift();
    if (isNotEmpty(newTask)) this.executeTask(newTask!);
  }

  /**
   * 表示执行任务
   *
   * @author lihh
   */
  private executeTask(asyncMethod: FiringTaskType) {
    // 判断 任务是否超过限制
    if (this.currentExecuteTaskCount >= this.maxConcurrentRequests) return;

    this.currentExecuteTaskCount += 1;
    Promise.resolve().then(() => {
      asyncMethod(this.doneCallback.bind(this));
    });
  }

  /**
   * 表示 发射任务
   *
   * @author lihh
   * @param argTasks 添加多个任务
   */
  firingTask(...argTasks: Array<FiringTaskType>) {
    // 判断当前执行任务 是否 大于 最大任务
    if (this.currentExecuteTaskCount >= this.maxConcurrentRequests) {
      // 直接 添加到等待任务中
      this.waitTasks.push(...argTasks);
      return;
    }

    // 如果能执行到这里的话，说明没到最大并发数
    // 计算剩下 可以执行的任务
    const maxCount = this.maxConcurrentRequests;
    // 如果条件【currentExecuteTaskCount == 0】的话，那么值 surplusCount 就是 5
    const surplusCount = Math.min(
      maxCount - this.currentExecuteTaskCount,
      maxCount,
      argTasks.length,
    );
    // 这里开始执行任务
    for (let i = 0; i < surplusCount; i++) this.executeTask(argTasks[i]);

    // 表示等待的任务 count
    const waitTaskCount = argTasks.length - surplusCount;
    if (waitTaskCount > 0) this.waitTasks.push(...argTasks.slice(surplusCount));
  }
}
