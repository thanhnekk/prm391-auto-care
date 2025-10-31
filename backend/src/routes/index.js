// routes/index.js
const userRoutes = require('./user.routes');
const authRoutes = require('./auth.routes'); // nếu có auth controller/login/logout
const doctorRoutes = require('./doctor.routes');
const appointmentRoutes = require('./appointment.routes');
const prescriptionRoutes = require('./prescription.routes');
const notificationRoutes = require('./notification.routes');
const serviceTypeRoutes = require('./servicetype.routes');
const medicineRoutes = require('./medicines.routes');
const applicationName = process.env.APPLICATION_NAME || 'api'; // fallback nếu chưa set

module.exports = (app) => {
    app.use(`/${applicationName}/users`, userRoutes);
    app.use(`/${applicationName}/auth`, authRoutes);
    app.use(`/${applicationName}/doctors`, doctorRoutes);
    app.use(`/${applicationName}/appointments`, appointmentRoutes);
    app.use(`/${applicationName}/prescriptions`, prescriptionRoutes);
    app.use(`/${applicationName}/notifications`, notificationRoutes);
    app.use(`/${applicationName}/servicetypes`, serviceTypeRoutes);
    app.use(`/${applicationName}/medicines`, medicineRoutes);
};
