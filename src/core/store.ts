import localforage from "localforage";
import {isEmpty} from "jsmethod-extra";

/* 设置 配置参数 */
localforage.config({
    storeName: "big_file_upload",
    driver: localforage.INDEXEDDB,
    name: "myApp"
});

/**
 * 删除 item 事件
 *
 * @author lihh
 * @param key 主键 key
 */
async function deleteItemHandler(key: string) {
    const allKeys = await localforage.keys();
    if (isEmpty(allKeys)) return;

    await localforage.removeItem(key);
}

/**
 * 拿到全部的item
 *
 * @author lihh
 */
async function getAllItemHandler() {
    /* 首先 判断是否支持 indexedDB */
    if (!localforage.supports(localforage.INDEXEDDB)) return null;

    const allKeys = await localforage.keys();
    if (isEmpty(allKeys)) return null;

    const arrayValues: Record<string, Array<unknown>> = {};
    for (const arrayKey of allKeys) {
        arrayValues[arrayKey] = await localforage.getItem(arrayKey) as Array<unknown>;
    }
    return arrayValues;
}

/**
 * 添加 item事件
 *
 * @author lihh
 * @param key 添加的 key
 * @param value value 的集合
 */
async function addItemHandler(key: string, value: Array<unknown>) {
    await localforage.setItem(key, value);
}

/**
 * 表示全局的store hook
 *
 * @author lihh
 */
export function useStore(): [typeof addItemHandler, typeof deleteItemHandler, typeof getAllItemHandler] {
    return [addItemHandler, deleteItemHandler, getAllItemHandler];
}