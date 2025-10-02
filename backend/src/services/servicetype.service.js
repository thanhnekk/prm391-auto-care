const ServiceType = require("../models/servicetype.model");
const { StatusCodes } = require("http-status-codes");
const BaseError = require("../utils/BaseError.js");

// Create new service type
const createServiceType = async (data) => {
    try {
        const existing = await ServiceType.findOne({ name: data.name });
        if (existing) {
            throw new Error("Service type này đã tồn tại");
        }
        const serviceType = new ServiceType(data);
        return await serviceType.save();
    } catch (err) {
        throw new BaseError(
            StatusCodes.BAD_REQUEST,
            `Lỗi khi tạo ServiceType: ${err.message}`
        );
    }
};

// Get all service types
const getAllServiceTypes = async () => {
    try {
        return await ServiceType.find();
    } catch (err) {
        throw new BaseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Lỗi khi lấy danh sách ServiceType: ${err.message}`
        );
    }
};

// Get service type by id
const getServiceTypeById = async (id) => {
    try {
        const serviceType = await ServiceType.findById(id);
        if (!serviceType) {
            throw new BaseError(StatusCodes.NOT_FOUND, "ServiceType không tồn tại");
        }
        return serviceType;
    } catch (err) {
        throw new BaseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Lỗi khi tìm ServiceType: ${err.message}`
        );
    }
};

// Update service type by id
const updateServiceTypeById = async (id, data) => {
    try {
        const serviceType = await ServiceType.findById(id);
        if (!serviceType) {
            throw new BaseError(StatusCodes.NOT_FOUND, "ServiceType không tồn tại");
        }
        Object.assign(serviceType, data, { updatedAt: new Date() });
        return await serviceType.save();
    } catch (err) {
        throw new BaseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Lỗi khi cập nhật ServiceType: ${err.message}`
        );
    }
};

// Delete service type by id
const deleteServiceTypeById = async (id) => {
    try {
        const serviceType = await ServiceType.findById(id);
        if (!serviceType) {
            throw new BaseError(StatusCodes.NOT_FOUND, "ServiceType không tồn tại");
        }
        await ServiceType.deleteOne({ _id: id });
        return { message: "Xóa ServiceType thành công" };
    } catch (err) {
        throw new BaseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Lỗi khi xóa ServiceType: ${err.message}`
        );
    }
};

module.exports = {
    createServiceType,
    getAllServiceTypes,
    getServiceTypeById,
    updateServiceTypeById,
    deleteServiceTypeById
};
