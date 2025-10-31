// backend/src/services/prescription.service.js
const Prescription = require("../models/prescription.model.js");
const BaseError = require("../utils/BaseError.js");
const { StatusCodes } = require("http-status-codes");

// Tạo 1 đơn thuốc (đã bao gồm thuốc)
const createPrescription = async (data) => {
    const { appointmentId, doctorName, notes, medicines } = data;

    if (!appointmentId || !doctorName) {
        throw new BaseError(StatusCodes.BAD_REQUEST, 'Thiếu thông tin Appointment ID hoặc Tên bác sĩ');
    }
    const existing = await Prescription.findOne({ appointmentId });
    if (existing) {
        throw new BaseError(StatusCodes.BAD_REQUEST, 'Lịch hẹn này đã có đơn thuốc.');
    }

    const prescription = new Prescription({
        appointmentId,
        doctorName,
        notes,
        medicines: medicines || [] // Mảng thuốc được nhúng
    });
    await prescription.save();
    return prescription;
};

// Cập nhật đơn thuốc (thay đổi ghi chú hoặc danh sách thuốc)
const updatePrescription = async (prescriptionId, data) => {
    const { notes, medicines } = data; 
    
    const prescription = await Prescription.findById(prescriptionId);
    if (!prescription) {
            throw new BaseError(StatusCodes.NOT_FOUND, 'Không tìm thấy đơn thuốc');
    }
    
    if (notes !== undefined) prescription.notes = notes;
    if (medicines) prescription.medicines = medicines; // Ghi đè mảng thuốc
    
    await prescription.save(); 
    return prescription;
};

// Lấy đơn thuốc theo ID Lịch hẹn
const getPrescriptionByAppointment = async (appointmentId) => {
    const pres = await Prescription.findOne({ appointmentId })
        .populate({ 
            path: 'appointmentId',
            select: 'userId doctorId scheduledAt',
            populate: [
                { path: 'userId', model: 'User', select: 'username email' },
                { path: 'doctorId', model: 'Doctor', select: 'specialization' }
            ]
        });
    
    if (!pres) {
        throw new BaseError(StatusCodes.NOT_FOUND, 'Không tìm thấy đơn thuốc cho lịch hẹn này');
    }
    return pres; 
};

// Lấy chi tiết 1 đơn thuốc (Admin)
const adminGetPrescriptionById = async (prescriptionId) => {
     const pres = await Prescription.findById(prescriptionId)
        .populate({ 
            path: 'appointmentId',
            select: 'userId doctorId scheduledAt status',
            populate: [
                { path: 'userId', model: 'User', select: 'username email' },
                { path: 'doctorId', model: 'Doctor', select: 'specialization' }
            ]
        });
    
    if (!pres) {
        throw new BaseError(StatusCodes.NOT_FOUND, 'Không tìm thấy đơn thuốc');
    }
    return pres;
};

// Lấy tất cả đơn thuốc (Admin)
const adminGetAllPrescriptions = async (query) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;
    const filters = {};
    if (query.doctorName) {
         filters.doctorName = { $regex: query.doctorName, $options: 'i' };
    }

    const prescriptions = await Prescription.find(filters)
        .populate({
            path: 'appointmentId',
            select: 'scheduledAt',
            populate: { path: 'userId', model: 'User', select: 'username' }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const totalPrescriptions = await Prescription.countDocuments(filters);

    return {
        prescriptions,
        currentPage: page,
        totalPages: Math.ceil(totalPrescriptions / limit),
        totalPrescriptions,
    };
};

// Xóa đơn thuốc (Admin)
const adminDeletePrescription = async (prescriptionId) => {
    const prescription = await Prescription.findByIdAndDelete(prescriptionId);
    if (!prescription) {
        throw new BaseError(StatusCodes.NOT_FOUND, 'Không tìm thấy đơn thuốc');
    }
    return { message: 'Đã xóa đơn thuốc thành công' };
};


module.exports = {
    createPrescription,
    updatePrescription,
    getPrescriptionByAppointment,
    adminGetPrescriptionById,
    adminGetAllPrescriptions,
    adminDeletePrescription,
};