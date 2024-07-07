export class Logger {
  private static prev() {
    return "[Big-File-Upload]: ";
  }

  /**
   * 警告消息
   *
   * @author lihh
   * @param message 发送的消息
   */
  static warning(message: string) {
    console.warn(this.prev() + message);
  }

  /**
   * 错误消息打印
   *
   * @author lihh
   * @param message 错误的消息
   * @param errFlag 是否直接报错
   */
  static error(message: string, errFlag = true) {
    const errorMsg = this.prev() + message;
    if (!errFlag) console.error(message);
    else throw new Error(errorMsg);
  }
}
