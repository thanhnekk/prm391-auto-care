const ServiceTypeService = require("../services/servicetype.service");

const createServiceType = async (req, res, next) => {
    try {
        const serviceType = await ServiceTypeService.createServiceType(req.body);
        res.status(201).json(serviceType);
    } catch (err) { next(err); }
};

const getAllServiceTypes = async (req, res, next) => {
    try {
        const list = await ServiceTypeService.getAllServiceTypes();
        res.status(200).json(list);
    } catch (err) { next(err); }
};

const getServiceTypeById = async (req, res, next) => {
    try {
        const serviceType = await ServiceTypeService.getServiceTypeById(req.params.id);
        res.status(200).json(serviceType);
    } catch (err) { next(err); }
};

const updateServiceType = async (req, res, next) => {
    try {
        const updated = await ServiceTypeService.updateServiceTypeById(req.params.id, req.body);
        res.status(200).json({ message: "Cập nhật thành công", serviceType: updated });
    } catch (err) { next(err); }
};

const deleteServiceType = async (req, res, next) => {
    try {
        const result = await ServiceTypeService.deleteServiceTypeById(req.params.id);
        res.status(200).json(result);
    } catch (err) { next(err); }
};

module.exports = {
    createServiceType,
    getAllServiceTypes,
    getServiceTypeById,
    updateServiceType,
    deleteServiceType
};
