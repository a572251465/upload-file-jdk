import { calculateChunkSize, fileSizeLimitRulesCheckHandler } from "./tools";
import { ChunkFileType } from "./types";
import { fileSizeLimitRules } from "./variable";

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
    const chunk = file.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
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
  const fileSizeSimple = fileSize / 1024 / 1024;
  let CHUNK_SIZE = 0;

  // check 限制文件大小 避免因为并发导致 check不到
  fileSizeLimitRulesCheckHandler();
  const limitRules = fileSizeLimitRules.current,
    firstItem = limitRules[0],
    lastItem = limitRules[limitRules.length - 1];

  // 临界值判断
  if (fileSizeSimple < firstItem[0])
    CHUNK_SIZE = calculateChunkSize(firstItem[1]);
  if (fileSizeSimple >= lastItem[0])
    CHUNK_SIZE = calculateChunkSize(lastItem[1]);

  // 内部循环判断
  let idx = 0;
  while (idx < limitRules.length - 1) {
    const currentItem = limitRules[idx],
      nextItem = limitRules[idx + 1];

    if (currentItem[0] <= fileSizeSimple && fileSizeSimple < nextItem[0]) {
      CHUNK_SIZE = calculateChunkSize(currentItem[1]);
      break;
    }

    ++idx;
  }

  return [Math.ceil(fileSize / CHUNK_SIZE), CHUNK_SIZE];
}
