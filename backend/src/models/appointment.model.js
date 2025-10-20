const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  serviceTypeIds: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceType', required: true },
  scheduledAt: { type: Date, required: true },
  totalPrice: { type: Number, required: true },

  // Thanh toán
  paid: { type: Boolean, default: false },           // Trạng thái thanh toán
  paymentMethod: { type: String, enum: ['VNPay','Cash'], default: 'Cash' },
  txnRef: { type: String, default: null },          // Mã giao dịch merchant (vnp_TxnRef)
  transactionNo: { type: String, default: null },   // Mã giao dịch cổng thanh toán (vnp_TransactionNo)

  // Trạng thái lịch hẹn
  status: { type: String, enum: ['pending', 'confirmed', 'canceled', 'done'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Cập nhật updatedAt tự động
appointmentSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Appointment', appointmentSchema);
