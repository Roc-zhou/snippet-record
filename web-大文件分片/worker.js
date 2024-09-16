import { createChunk } from './createChunk.js'

onmessage = async (e) => {
  const { file, chunkSize, start, end } = e.data
  const result = []
  for (let i = start; i < end; i++) {
    result.push(createChunk(file, i, chunkSize))
  }
  const chunks = await Promise.all(result)
  postMessage(chunks)
}