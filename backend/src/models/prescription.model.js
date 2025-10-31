// backend/src/models/prescription.model.js
const mongoose = require('mongoose');

// 1. Định nghĩa schema con cho thuốc (được nhúng vào đơn)
const prescribedMedicineSchema = new mongoose.Schema({
  name: { // Tên thuốc (được copy từ danh mục Medicine)
    type: String, 
    required: true 
  },
  dosage: { // Liều lượng, ví dụ: "Sáng 1 viên"
    type: String, 
    default: "" 
  },
  duration: { // Thời gian, ví dụ: "Dùng trong 7 ngày"
    type: String, 
    default: "" 
  }
}, { 
  _id: false, 
  timestamps: false 
});

// 2. Định nghĩa schema chính cho đơn thuốc
const prescriptionSchema = new mongoose.Schema({
  appointmentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Appointment', 
    required: true,
    unique: true // 1 lịch hẹn chỉ có 1 đơn thuốc
  },
  doctorName: { 
    type: String, 
    required: true 
  },
  notes: { // Ghi chú chung của bác sĩ
    type: String 
  },

  // 3. Nhúng mảng "thuốc đã kê"
  medicines: [prescribedMedicineSchema], 

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Tự động cập nhật 'updatedAt'
prescriptionSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Prescription', prescriptionSchema);