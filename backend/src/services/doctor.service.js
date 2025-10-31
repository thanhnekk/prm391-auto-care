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



// Admin

// Lấy danh sách bác sĩ (có phân trang/lọc cho Admin)
const adminGetAllDoctors = async (query) => {
  try {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    // Bộ lọc
    const filters = {};
    if (query.specialization) {
      filters.specialization = { $regex: query.specialization, $options: 'i' };
    }
    
    // Tìm kiếm (theo tên user hoặc email)
    let userFilters = {};
    if (query.search) {
      userFilters = {
        $or: [
          { username: { $regex: query.search, $options: 'i' } },
          { email: { $regex: query.search, $options: 'i' } },
        ],
        role: 'doctor', // Chỉ tìm trong số các doctor
      };
    } else {
        userFilters = { role: 'doctor' };
    }
    
    // Lấy danh sách user ID của các doctor phù hợp
    const matchingUsers = await User.find(userFilters).select('_id');
    const userIds = matchingUsers.map(u => u._id);

    // Filter chính: Lấy các doctor profile có userId nằm trong danh sách
    filters.userId = { $in: userIds };

    const doctors = await Doctor.find(filters)
      .populate('userId', 'username email status') // Lấy thông tin user
      .populate('serviceTypeIds', 'name price') // Lấy thông tin dịch vụ
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalDoctors = await Doctor.countDocuments(filters);

    return {
      doctors,
      currentPage: page,
      totalPages: Math.ceil(totalDoctors / limit),
      totalDoctors,
    };
  } catch (error) {
    throw new BaseError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      `Lỗi khi lấy danh sách bác sĩ (Admin): ${error.message}`
    );
  }
};

// Cập nhật hồ sơ bác sĩ (Admin thực hiện)
const adminUpdateDoctor = async (doctorId, updateData) => {
  try {
    // doctorId ở đây là ID của bản ghi 'Doctor', KHÔNG phải 'userId'
    const { specialization, experience, serviceTypeIds } = updateData;

    // Lọc ra các trường hợp lệ
    const dataToUpdate = {};
    if (specialization) dataToUpdate.specialization = specialization;
    if (experience !== undefined) dataToUpdate.experience = experience;
    if (serviceTypeIds) dataToUpdate.serviceTypeIds = serviceTypeIds;

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      doctorId,
      dataToUpdate,
      { new: true }
    );

    if (!updatedDoctor) {
      throw new BaseError(StatusCodes.NOT_FOUND, 'Không tìm thấy hồ sơ bác sĩ');
    }

    // Trả về bản ghi đã được populate đầy đủ
    return await Doctor.findById(updatedDoctor._id)
                        .populate('userId', 'username email')
                        .populate('serviceTypeIds');

  } catch (error) {
    if (error instanceof BaseError) throw error;
    throw new BaseError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      `Lỗi khi cập nhật hồ sơ bác sĩ (Admin): ${error.message}`
    );
  }
};

// Xóa hồ sơ bác sĩ (Admin thực hiện)
const adminDeleteDoctor = async (doctorId) => {
  try {
    // doctorId là ID của bản ghi 'Doctor'
    const doctorProfile = await Doctor.findByIdAndDelete(doctorId);

    if (!doctorProfile) {
      throw new BaseError(StatusCodes.NOT_FOUND, 'Không tìm thấy hồ sơ bác sĩ');
    }

    // Sau khi xóa hồ sơ, cần hạ role của user đó để tránh việc user có role 'doctor' mà không có hồ sơ.
    try {
      await User.findByIdAndUpdate(doctorProfile.userId, {
        role: 'user',
      });
    } catch (userError) {
      // Bỏ qua lỗi nếu user không tìm thấy,
      console.warn(`Lỗi khi hạ quyền user ${doctorProfile.userId}: ${userError.message}`);
    }

    return { message: 'Xóa hồ sơ bác sĩ và hạ quyền user thành công' };
  } catch (error) {
    if (error instanceof BaseError) throw error;
    throw new BaseError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      `Lỗi khi xóa hồ sơ bác sĩ (Admin): ${error.message}`
    );
  }
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  addServiceToDoctor,
  getDoctorsByService,
  // --- Các hàm mới cho Admin ---
  adminGetAllDoctors,
  adminUpdateDoctor,
  adminDeleteDoctor,
};