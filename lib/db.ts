// lib/db.ts
// 引入 mongoose 模組本身，以及 Mongoose 接口類型
import mongoose, { Mongoose } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/purchase-orders';

// dbConnect 函數將返回一個 Mongoose 實例的 Promise
async function dbConnect(): Promise<Mongoose> {
  // 確保 global.mongoose 在使用前被初始化
  if (!global.mongoose) {
    global.mongoose = { conn: null, promise: null };
  }

  // 將 global.mongoose 賦值給一個局部常量，這樣 TypeScript 就能保證它不是 undefined
  const currentCached = global.mongoose;

  // 如果已經存在連接實例，直接返回它
  if (currentCached.conn) {
    return currentCached.conn;
  }

  // 如果沒有連接實例，但有一個正在進行的連接 Promise，等待它完成
  if (!currentCached.promise) {
    const opts = {
      bufferCommands: false,
    };

    // 發起 Mongoose 連接，並將其 Promise 儲存起來
    currentCached.promise = mongoose.connect(MONGODB_URI, opts).then((_mongoose: Mongoose) => {
      // 連接成功後，將 Mongoose 實例儲存到 conn 屬性中
      currentCached.conn = _mongoose;
      return _mongoose; // 這個 Promise 解析為 Mongoose 實例
    });
  }

  // 等待連接 Promise 完成，並返回連接後的 Mongoose 實例
  return await currentCached.promise;
}

export default dbConnect;