const doctorScheduleSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  weekday: { type: Number, min: 0, max: 6, required: true }, // 0=Sunday
  startTime: { type: String, required: true }, // HH:mm
  endTime: { type: String, required: true },
  maxCapacity: { type: Number, required: true }
});

module.exports = mongoose.model('DoctorSchedule', doctorScheduleSchema);
