const doctorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  specialization: { type: String },
  experience: { type: Number },
  serviceTypeIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ServiceType' }], 
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Doctor', doctorSchema);
