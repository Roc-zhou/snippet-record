import { createChunk } from './createChunk.js'

const inputFile = document.querySelector("#input-file");

inputFile.addEventListener("change", async function (e) {
  const file = e.target.files[0];
  console.time("cutFile");
  const chunks = await cutFile(file);
  console.timeEnd("cutFile");
  console.log(chunks);
});

const CHUNK_SIZE = 1024 * 1024 * 1; // 1M
const THREAD_COUNT = navigator.hardwareConcurrency || 4;

async function cutFile(file) {
  // 计算 hash cpu 密集型任务，使用 web worker
  const chunkCount = Math.ceil(file.size / CHUNK_SIZE);
  return new Promise(async (resolve, reject) => {
    // 总分片数
    // 每个线程处理多少分片
    const threadChunkCoundt = Math.ceil(chunkCount / THREAD_COUNT);
    const result = [];
    let finishWorkerCount = 0;
    // 分配线程
    for (let i = 0; i < THREAD_COUNT; i++) {
      const worker = new Worker("./worker.js", {
        type: "module",
      });
      worker.postMessage({
        file,
        start: i * threadChunkCoundt,
        end: Math.min((i + 1) * threadChunkCoundt, chunkCount),
        chunkSize: CHUNK_SIZE,
      });
      worker.onmessage = function (e) {
        result[i] = e.data;
        worker.terminate();
        finishWorkerCount++;
        if (finishWorkerCount === THREAD_COUNT) {
          resolve(result.flat());
        }
      };
    }
  });
  // const result = [];
  // for (let i = 0; i < chunkCount; i++) {
  //   const chunk = await createChunk(file, i, CHUNK_SIZE);
  //   result.push(chunk);
  // }
  // return result;
}