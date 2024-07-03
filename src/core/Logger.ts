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
}