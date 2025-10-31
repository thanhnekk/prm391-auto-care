// backend/src/models/medicines.model.js
const mongoose = require('mongoose');

// Đây là DANH MỤC THUỐC (Master List)
const medicineSchema = new mongoose.Schema({
  name: { // Tên thuốc, ví dụ: "Paracetamol 500mg"
    type: String, 
    required: true,
    unique: true // Tên thuốc không được trùng
  },
  unit: { // Đơn vị, ví dụ: "Viên", "Gói", "Chai"
    type: String,
    default: "Viên"
  },
  description: { // Ghi chú (nếu có)
    type: String,
    default: ""
  }
}, { timestamps: true });

module.exports = mongoose.model('Medicine', medicineSchema);