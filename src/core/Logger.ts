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
   */
  static error(message: string) {
    const errorMsg = this.prev() + message;
    throw new Error(errorMsg);
  }
}
