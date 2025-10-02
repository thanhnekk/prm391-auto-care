// services/doctor.service.js
const Doctor = require("../models/doctor.model.js");
const User = require("../models/user.model.js");
const ServiceType = require("../models/servicetype.model.js");
const BaseError = require("../utils/BaseError.js");
const { StatusCodes } = require("http-status-codes");

// Lấy tất cả bác sĩ, có thể filter theo chuyên môn hoặc serviceType
const getAllDoctors = async (filter = {}) => {
    try {
        return await Doctor.find(filter).populate("userId serviceTypeIds");
    } catch (error) {
        throw new BaseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Lỗi khi lấy danh sách bác sĩ: ${error.message}`
        );
    }
};

// Lấy bác sĩ theo ID
const getDoctorById = async (doctorId) => {
    try {
        const doctor = await Doctor.findById(doctorId).populate("userId serviceTypeIds");
        if (!doctor) throw new BaseError(StatusCodes.NOT_FOUND, "Bác sĩ không tồn tại");
        return doctor;
    } catch (error) {
        throw new BaseError(
            error.status || StatusCodes.INTERNAL_SERVER_ERROR,
            `Lỗi khi lấy bác sĩ: ${error.message}`
        );
    }
};

// Thêm dịch vụ cho bác sĩ
const addServiceToDoctor = async (doctorId, serviceTypeId) => {
    try {
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) throw new BaseError(StatusCodes.NOT_FOUND, "Bác sĩ không tồn tại");
        if (!doctor.doctorServices.includes(serviceTypeId)) {
            doctor.doctorServices.push(serviceTypeId);
            await doctor.save();
        }
        return doctor;
    } catch (error) {
        throw new BaseError(
            error.status || StatusCodes.INTERNAL_SERVER_ERROR,
            `Lỗi khi thêm dịch vụ cho bác sĩ: ${error.message}`
        );
    }
};

// Lấy danh sách bác sĩ theo serviceTypeId
const getDoctorsByService = async (serviceTypeId) => {
    try {
        // Tìm tất cả bác sĩ có serviceTypeId trong mảng doctorServices
        const doctors = await Doctor.find({ serviceTypeIds: serviceTypeId })
            .populate({
                path: 'userId',
                select: 'username email role' // chọn các field muốn trả về
            })
            .populate({
                path: 'serviceTypeIds',
                select: 'name description price' // trả về thông tin dịch vụ
            })
            .select('specialization experience userId serviceTypeIds'); 
        return doctors;
    } catch (error) {
        throw new BaseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Lỗi khi lấy bác sĩ theo dịch vụ: ${error.message}`
        );
    }
};

module.exports = {
    getAllDoctors,
    getDoctorById,
    addServiceToDoctor,
    getDoctorsByService, // thêm hàm mới vào export
};
