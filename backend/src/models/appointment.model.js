const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  serviceTypeIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ServiceType', required: true }],
  scheduledAt: { type: Date, required: true },
  totalPrice: { type: Number, required: true },          
  paid: { type: Boolean, default: false },
  paymentMethod: { type: String, enum: ['VNPay', 'Momo', 'Cash'] },
  status: { type: String, enum: ['pending', 'confirmed', 'canceled', 'done'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Appointment', appointmentSchema);
