import {CHUNK_SIZE_100, CHUNK_SIZE_30} from "./constant";
import {calculateChunkSize} from "./tools";
import {ChunkFileType} from "./types";

/**
 * 创建 file chunks 切割
 *
 * @author lihh
 * @param file 要切割的文件
 * @param fileName file 对应的 hash值
 */
export function createFileChunks(file: File, fileName: string) {
    // 表示 chunks
    const chunks: Array<ChunkFileType> = [];

    // 分割文件个数 以及每次切割大小
    const [chunkCount, CHUNK_SIZE] = calculateChunkCount(file.size);
    for (let i = 0; i < chunkCount; i++) {
        let chunk = file.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
        chunks.push({
            chunk,
            chunkFileName: `${fileName}-${i}`,
        });
    }

    return chunks;
}

/**
 * 计算 要分割文件的个数
 *
 * @author lihh
 * @param fileSize 表示文件大小
 */
export function calculateChunkCount(fileSize: number): [number, number] {
    let CHUNK_SIZE = 0;

    if (fileSize <= CHUNK_SIZE_30) {
        CHUNK_SIZE = calculateChunkSize(2);
    } else if (fileSize > CHUNK_SIZE_30 && fileSize <= CHUNK_SIZE_100) {
        CHUNK_SIZE = calculateChunkSize(4);
    } else {
        CHUNK_SIZE = calculateChunkSize(8);
    }

    return [Math.ceil(fileSize / CHUNK_SIZE), CHUNK_SIZE];
}
