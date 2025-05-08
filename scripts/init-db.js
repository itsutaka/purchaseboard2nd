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
