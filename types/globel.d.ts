// types/global.d.ts
// 引入 Mongoose 模組中的 Mongoose 接口，它代表了連接後的 Mongoose 實例
import { Mongoose } from 'mongoose';

// 定義 global.mongoose 屬性所儲存的快取物件的結構
interface MongooseCache {
  conn: Mongoose | null; // conn 儲存 Mongoose 連接實例 (Mongoose 類型)
  promise: Promise<Mongoose> | null; // promise 儲存一個解析為 Mongoose 實例的 Promise
}

// 擴展 global 物件的類型，讓 TypeScript 知道它會有一個 mongoose 屬性
declare global {
  var mongoose: MongooseCache | undefined; // 全域的 mongoose 屬性可能是 MongooseCache 類型或 undefined
}