import './spark-md5.js'

export const createChunk = (file, index, chunkSize) => {
  return new Promise((resolve, reject) => {
    const start = index * chunkSize
    const end = Math.min(start + chunkSize, file.size)
    const spark = new SparkMD5.ArrayBuffer()
    const reader = new FileReader()
    const blob = file.slice(start, end)
    reader.onload = function (e) {
      spark.append(e.target.result)
      resolve({
        start,
        end,
        index,
        hash: spark.end(),
        blob
      })
    }
    reader.readAsArrayBuffer(blob)
  })
}