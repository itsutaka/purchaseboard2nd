# 購物訂單追蹤系統

購物訂單追蹤系統是一個基於 Next.js 和 MongoDB 開發的 Web 應用程式，旨在幫助組織管理和追蹤採購請求。員工可以提交想要購買的物品，而採購人員可以查看這些請求，了解需要購買什麼以及誰需要這些物品。

## 功能特點

- **用戶管理**：註冊、登入和基於角色的權限系統
- **採購請求**：員工可以創建採購請求，包含詳細資訊和優先級
- **請求追蹤**：查看所有請求的狀態，可按狀態篩選
- **狀態更新**：採購人員可更新請求狀態（待審核、已批准、已購買、已送達）
- **評論系統**：用戶和採購人員可以在訂單上進行溝通
- **儀表板**：摘要視圖顯示系統的關鍵指標

## 技術堆疊

- **前端框架**：Next.js 14.0
- **UI 庫**：Chakra UI
- **資料庫**：MongoDB（使用 Mongoose ODM）
- **身份驗證**：NextAuth.js
- **表單處理**：React Hook Form
- **數據驗證**：Zod
- **HTTP 客戶端**：Axios
- **日期處理**：date-fns

## 安裝與設置

### 環境要求

- Node.js 18.x 或更高版本
- MongoDB 資料庫

### 安裝步驟

1. 克隆此專案至本地:
```bash
git clone https://github.com/yourusername/purchase-order-tracker.git
cd purchase-order-tracker
```

2. 安裝依賴套件:
```bash
npm install
```

3. 建立環境變數文件：
   在專案根目錄創建 `.env.local` 文件，並添加以下內容：
```
MONGODB_URI=mongodb://localhost:27017/purchase-orders
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key_here
```

4. 啟動開發伺服器:
```bash
npm run dev
```

5. 訪問 [http://localhost:3000](http://localhost:3000) 開始使用應用程式。

## MongoDB 資料庫設置

### 選項 1: 本地安裝 MongoDB

#### macOS (使用 Homebrew)
```bash
# 安裝 MongoDB
brew tap mongodb/brew
brew install mongodb-community

# 啟動 MongoDB 服務
brew services start mongodb-community
```

#### Windows
1. 從 [MongoDB 官網](https://www.mongodb.com/try/download/community) 下載安裝包
2. 按照安裝精靈指示安裝
3. 選擇「將 MongoDB 安裝為服務」選項
4. 安裝 MongoDB Compass (可選的圖形化界面)

#### Linux (Ubuntu)
```bash
# 安裝 MongoDB
sudo apt update
sudo apt install -y mongodb

# 啟動並啟用服務
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

#### 驗證本地 MongoDB 安裝
```bash
# 檢查 MongoDB 版本
mongod --version

# 連接到 MongoDB Shell
mongosh
```

### 選項 2: 使用 Docker 部署 MongoDB

使用 Docker 部署 MongoDB 是一個簡單且可攜的解決方案，尤其適合開發環境。

#### 前置需求
- 確保已安裝 [Docker](https://www.docker.com/get-started/)
- 確保 Docker 服務已啟動

#### 使用 Docker 命令啟動 MongoDB
```bash
# 啟動獨立的 MongoDB 容器
docker run --name mongodb -d -p 27017:27017 -v mongodb_data:/data/db mongo:latest

# 檢查容器狀態
docker ps -a

# 停止 MongoDB 容器
docker stop mongodb

# 啟動已停止的容器
docker start mongodb

# 刪除容器（會遺失資料，除非使用卷管理）
docker rm mongodb
```

#### 使用 Docker Compose 啟動 MongoDB
1. 在專案根目錄建立 `docker-compose.yml` 文件：

```yaml
version: '3'

services:
  mongodb:
    image: mongo:latest
    container_name: mongodb
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    restart: unless-stopped

volumes:
  mongodb_data:
```

2. 啟動 MongoDB 容器：
```bash
docker-compose up -d
```

3. 停止 MongoDB 容器：
```bash
docker-compose down
```

#### 連接到 Docker 中的 MongoDB
- 更新 `.env.local` 中的連接字串：
```
MONGODB_URI=mongodb://localhost:27017/purchase-orders
```

#### 使用 Docker 容器內的 MongoDB Shell
```bash
docker exec -it mongodb mongosh
```

### 選項 3: 使用 MongoDB Atlas（雲端選項）

1. 前往 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) 並創建帳戶
2. 創建新集群（選擇免費 M0 層級即可）
3. 在「Security」->「Database Access」中創建資料庫使用者
4. 在「Security」->「Network Access」中添加 IP 地址（開發環境可添加 `0.0.0.0/0` 允許所有 IP 訪問，但生產環境應限制）
5. 在「Databases」頁面點擊「Connect」並選擇「Connect your application」
6. 複製連接字串，格式如下：
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/purchase-orders?retryWrites=true&w=majority
   ```
7. 將連接字串添加到 `.env.local` 文件中的 `MONGODB_URI` 變數

### 初始化資料庫（可選）

可以創建一個腳本來初始化資料庫並添加初始資料：

1. 在專案中創建 `scripts` 目錄：
```bash
mkdir -p scripts
```

2. 創建初始化腳本 `scripts/init-db.js`：
```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

// 導入模型
const userModel = require('../models/user');
const orderModel = require('../models/order');

// 連接資料庫
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('已連接至 MongoDB'))
  .catch(err => console.error('無法連接至 MongoDB:', err));

// 預設管理員帳戶
const createAdmin = async () => {
  try {
    const existingAdmin = await userModel.findOne({ email: 'admin@example.com' });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = new userModel({
        name: '管理員',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        department: 'IT'
      });
      await admin.save();
      console.log('已建立管理員帳戶');
    } else {
      console.log('管理員帳戶已存在');
    }
  } catch (error) {
    console.error('建立管理員帳戶時出錯:', error);
  }
};

// 預設採購人員帳戶
const createStaff = async () => {
  try {
    const existingStaff = await userModel.findOne({ email: 'staff@example.com' });
    if (!existingStaff) {
      const hashedPassword = await bcrypt.hash('staff123', 10);
      const staff = new userModel({
        name: '採購專員',
        email: 'staff@example.com',
        password: hashedPassword,
        role: 'staff',
        department: '採購部'
      });
      await staff.save();
      console.log('已建立採購人員帳戶');
    } else {
      console.log('採購人員帳戶已存在');
    }
  } catch (error) {
    console.error('建立採購人員帳戶時出錯:', error);
  }
};

// 執行初始化
const init = async () => {
  await createAdmin();
  await createStaff();
  
  console.log('資料庫初始化完成!');
  mongoose.connection.close();
};

init();
```

3. 執行初始化腳本：
```bash
node scripts/init-db.js
```

### 資料庫管理工具

推薦使用以下工具來管理 MongoDB 資料庫：

- **MongoDB Compass**: 官方圖形化界面，可視化探索和操作資料
- **Studio 3T**: 功能強大的 MongoDB 管理工具，提供更多進階功能

### 資料庫備份

#### 本地 MongoDB 備份
```bash
# 備份資料庫
mongodump --uri="mongodb://localhost:27017/purchase-orders" --out=/path/to/backup/folder

# 恢復資料庫
mongorestore --uri="mongodb://localhost:27017/purchase-orders" /path/to/backup/folder
```

#### Docker MongoDB 備份
```bash
# 備份 Docker 中的 MongoDB
docker exec -it mongodb sh -c 'mongodump --archive' > mongodb_backup.archive

# 恢復備份到 Docker 中的 MongoDB
docker exec -it mongodb sh -c 'mongorestore --archive' < mongodb_backup.archive
```

#### MongoDB Atlas 備份
Atlas 提供自動備份功能，可在 Atlas 界面設置備份頻率和保留策略。

## 部署到 Firebase

Firebase 提供了一個強大且易於使用的平台來部署 Next.js 應用程式。以下是將此購物訂單追蹤系統部署到 Firebase 的步驟：

### 前置需求

1. 安裝 Firebase CLI：
```bash
# 使用 npm 安裝
npm install -g firebase-tools

# 或使用 curl 安裝獨立版本
curl -sL firebase.tools | bash
```

2. 登入 Firebase：
```bash
firebase login
```

3. 在 [Firebase 控制台](https://console.firebase.google.com/) 創建一個新項目

### 準備 Next.js 應用程式

1. 確保您的 Next.js 應用程式已配置為正確處理伺服器端渲染 (SSR)：

2. 修改 `next.config.js` 以支援 Firebase 部署：
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone', // 啟用獨立輸出模式
};

module.exports = nextConfig;
```

### 初始化 Firebase

1. 在專案根目錄運行 Firebase 初始化：
```bash
# 啟用 Web Frameworks 實驗性功能（支援 Next.js）
firebase experiments:enable webframeworks

# 初始化 Firebase 專案
firebase init hosting
```

2. 按照提示操作：
   - 選擇您剛創建的 Firebase 專案
   - 當詢問公共目錄時，指定 `source` 選項指向您的 Next.js 應用程式
   - 選擇「是」當詢問是否要設置單頁應用
   - 選擇「否」當詢問是否覆蓋 index.html

3. 修改生成的 `firebase.json` 文件以支援 Next.js：
```json
{
  "hosting": {
    "source": ".",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "frameworksBackend": {
      "region": "us-central1"
    }
  }
}
```

### 配置環境變數

1. 在 Firebase 專案設置環境變數：
```bash
# 為 MongoDB 連接設置環境變數
firebase functions:config:set mongodb.uri="mongodb+srv://username:password@cluster.mongodb.net/purchase-orders"
firebase functions:config:set nextauth.url="https://your-project-id.web.app"
firebase functions:config:set nextauth.secret="your-nextauth-secret-key"
```

2. 創建 `.env.production` 文件以在建置時使用：
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/purchase-orders
NEXTAUTH_URL=https://your-project-id.web.app
NEXTAUTH_SECRET=your-nextauth-secret-key
```

### 建置與部署

1. 建置 Next.js 應用程式：
```bash
npm run build
```

2. 部署到 Firebase：
```bash
firebase deploy
```

3. 完成後，Firebase 會提供一個部署 URL，類似：
```
✔ Deploy complete!

Project Console: https://console.firebase.google.com/project/your-project-id/overview
Hosting URL: https://your-project-id.web.app
```

### 自定義域名（可選）

1. 在 Firebase 控制台中，前往 Hosting 部分
2. 點擊「添加自定義域名」
3. 按照提示完成 DNS 記錄設置和網域驗證

### 持續集成/持續部署（CI/CD）

可以使用 GitHub Actions 設置自動部署：

1. 在專案中創建 `.github/workflows/firebase-deploy.yml` 文件：
```yaml
name: Firebase Deploy

on:
  push:
    branches: [ main ]

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: your-project-id
```

2. 在 GitHub 儲存庫設置中添加 `FIREBASE_SERVICE_ACCOUNT` 密鑰（可從 Firebase 專案設置中獲取）

### 故障排除

- **部署超時**：可能需要增加 Node.js 記憶體限制：
  ```bash
  NODE_OPTIONS=--max_old_space_size=4096 firebase deploy
  ```

- **API 路由問題**：確保所有 API 路由都在 `/api` 目錄下，並使用 Next.js 的 API 路由格式

- **MongoDB 連接問題**：確保您的 MongoDB Atlas 集群允許從 Firebase 函數 IP 範圍的訪問

## 專案結構

```
/purchase-order-tracker
├── app/                    # Next.js 應用程式路由
│   ├── page.tsx            # 首頁
│   ├── layout.tsx          # 主要佈局
│   ├── auth/               # 身份驗證相關頁面
│   │   ├── signin/         # 登入頁面
│   │   └── signup/         # 註冊頁面
│   ├── dashboard/          # 儀表板頁面
│   ├── orders/             # 訂單管理頁面
│   │   ├── page.tsx        # 訂單列表頁面
│   │   ├── create/         # 建立訂單頁面
│   │   └── [id]/           # 訂單詳情頁面
│   └── api/                # API 路由
│       └── orders/         # 訂單相關 API
├── components/             # 可重用元件
│   ├── layout/             # 佈局元件 (頁首、側邊欄等)
│   └── orders/             # 訂單相關元件
├── lib/                    # 工具和庫
│   └── db.ts               # 資料庫連接
├── models/                 # 資料模型
│   ├── user.ts             # 使用者模型
│   └── order.ts            # 訂單模型
├── styles/                 # 全局樣式
├── public/                 # 靜態資源
├── package.json            # 專案依賴和腳本
└── tsconfig.json           # TypeScript 配置
```

## 用戶角色

系統中定義了三種主要角色：

1. **普通用戶**：可以創建購物請求，查看自己的請求
2. **採購人員**：可以查看所有請求，更新請求狀態
3. **管理員**：具有所有權限，可以管理用戶和系統設置

## API 參考

### 訂單 API

- `GET /api/orders` - 獲取所有訂單
- `POST /api/orders` - 創建新訂單
- `GET /api/orders/:id` - 獲取單個訂單詳情
- `PATCH /api/orders/:id` - 更新訂單狀態
- `DELETE /api/orders/:id` - 刪除訂單
- `POST /api/orders/:id/comments` - 添加訂單評論

### 身份驗證 API

- `POST /api/auth/signin` - 用戶登入
- `POST /api/auth/signup` - 用戶註冊

## 故障排除

### MongoDB 連接問題

1. **無法連接到 MongoDB**:
   - 確認 MongoDB 服務是否正在運行
   - 如使用 Docker，確認容器是否正常運行 (`docker ps`)
   - 檢查 `.env.local` 中的 `MONGODB_URI` 是否正確
   - 確認網絡連接和防火牆設置

2. **身份驗證失敗**:
   - 檢查用戶名和密碼是否正確
   - 確認用戶是否有正確的資料庫權限

3. **慢查詢**:
   - 檢查資料模型是否設置了適當的索引

## 授權

本專案採用 MIT 授權協議。 