const medicineSchema = new mongoose.Schema({
  prescriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription', required: true },
  name: { type: String, required: true },
  dosage: { type: String },  
  duration: { type: String }, 
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Medicine', medicineSchema);
