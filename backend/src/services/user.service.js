const bcrypt = require("bcrypt");
const User = require("../models/user.model.js");
const Doctor = require('../models/doctor.model');
const { StatusCodes } = require("http-status-codes");
const BaseError = require("../utils/BaseError.js");
//const EmailService = require("../services/email.service.js");
//Create user
// services/user.service.js
const createUser = async (userData) => {
    try {
        console.log("📥 Received data in createUser:", userData); // Debug

        if (!userData || !userData.email) {
            throw new Error("Missing email in request body");
        }

        const user = await User.findOne({ email: userData.email });
        console.log("createUser is invoked");

        const passwordHash = await bcrypt.hash(userData.password, 10);
        userData.passwordHash = passwordHash;
        userData.role  = "user";

        if (!user) {
            const newUser = new User(userData);
            const savedUser = await newUser.save();
            return savedUser;
        } else {
            throw new Error("Email này đã có người sử dụng");
        }
    } catch (error) {
        throw new BaseError(
            StatusCodes.BAD_REQUEST,
            `Lỗi khi tạo người dùng mới: ${error.message}`
        );
    }
};

//Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        throw new BaseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Lỗi khi tìm người dùng: ${error.message}`
        );
    }
};

//Find user by eamil
const getUserByEmail = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.query.email });
        if (user == null) {
            return res.status(404).json({ message: "Người dùng không tồn tại" });
        } else {
            return res.status(200).json(user);
        }
    } catch (error) {
        throw new BaseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Lỗi khi tìm người dùng: ${error.message}`
        );
    }
};

//Update user by email
const updateUserByEmail = async (req, res) => {
    try {
        //find user by email
        const user = await User.findOne({ email: req.user.email });

        if (user == null) {
            throw new Error("Người dùng không tồn tại.");
        } else {
            //update user infor
            Object.assign(user, req.body);

            //password hash
            if (req.body.password != null) {
                user.password = await bcrypt.hash(req.body.password, 10);
                console.log("user Update", user);
            }

            const updatedUser = await user.save();

            return res
                .status(200)
                .json({
                    message: "Cập nhật thông tin người dùng thành công",
                    user: updatedUser,
                });
        }
    } catch (error) {
        throw new BaseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Lỗi cập nhật thông tin người dùng: ${error.message}`
        );
    }
};

//Delete user by email
const deleteUserByEmail = async (req, res) => {
    try {
        //find user by email
        const user = await User.findOne({ email: req.query.email });
        if (user == null) {
            throw new Error("Người dùng không tồn tại.");
        } else {
            //delete user
            await User.deleteOne({ email: user.email });
            return res.status(200).json({ message: "Xóa người dùng thành công." });
        }
    } catch (error) {
        throw new BaseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Lỗi khi xóa người dùng: ${error.message}`
        );
    }
};
//Find user by Id
const getUserByUserId = async (req, res) => {
    try {
        const user = await User.findById(req.query.userId);
        if (!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại" });
        }
        return res.status(200).json(user);
    } catch (error) {
        throw new BaseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Lỗi khi tìm người dùng: ${error.message}`
        );
    }
};
/// Find user by email (email decode từ access token) 
const getUserByEmail1 = async (email) => {
    try {
        const user = await User.findOne({ email })
            .select( 'username email');
        if (!user) {
            return null; // controller sẽ xử lý 404
        }
        return user; // trả về plain object hoặc Mongoose document
    } catch (error) {
        throw new Error(`Lỗi khi tìm người dùng: ${error.message}`);
    }
};

// Lấy danh sách user cho Admin (Phân trang, Lọc, Tìm kiếm)
const adminGetAllUsers = async (query) => {
  try {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    // Xây dựng bộ lọc (filters)
    const filters = {};
    if (query.role) {
      filters.role = query.role;
    }
    if (query.status) {
      filters.status = query.status;
    }
    // Tìm kiếm (email hoặc username)
    if (query.search) {
      filters.$or = [
        { email: { $regex: query.search, $options: 'i' } },
        { username: { $regex: query.search, $options: 'i' } },
      ];
    }
    // Không bao giờ trả về user đã bị xóa mềm, trừ khi Admin yêu cầu
    if (filters.status !== 'deleted') {
      filters.status = { $ne: 'deleted' };
    }

    const users = await User.find(filters)
      .select('-passwordHash') // Không bao giờ gửi hash
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments(filters);

    return {
      users,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
      totalUsers,
    };
  } catch (err) {
    throw new BaseError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      `Lỗi khi lấy danh sách người dùng (Admin): ${err.message}`
    );
  }
};

// Lấy chi tiết 1 user bất kỳ (cho Admin)
const adminGetUserById = async (id) => {
  try {
    const user = await User.findById(id).select('-passwordHash');
    if (!user) {
      throw new BaseError(StatusCodes.NOT_FOUND, 'Không tìm thấy người dùng');
    }
    return user;
  } catch (err) {
    // Xử lý lỗi nếu ID không hợp lệ
    throw new BaseError(
      StatusCodes.BAD_REQUEST,
      `Lỗi khi tìm người dùng (Admin): ${err.message}`
    );
  }
};

//Cập nhật user (do Admin thực hiện)
const adminUpdateUser = async (id, updateData, adminId) => {
  try {
    // === LOGIC 1: NGĂN TỰ SỬA ===
    // Admin có thể tự sửa tên/email, nhưng KHÔNG được tự đổi role/status
    if (id === adminId && (updateData.role || updateData.status)) {
      throw new BaseError(
        StatusCodes.BAD_REQUEST,
        'Bạn không thể tự thay đổi role hoặc status của chính mình.'
      );
    }

    // Lấy thông tin user TRƯỚC KHI sửa
    const userBeforeUpdate = await User.findById(id);
    if (!userBeforeUpdate) {
      throw new BaseError(StatusCodes.NOT_FOUND, 'Không tìm thấy người dùng');
    }
    const oldRole = userBeforeUpdate.role;
    
    // Chỉ cho phép Admin cập nhật các trường này
    const { username, email, role, status } = updateData;
    const dataToUpdate = { username, email, role, status };

    const updatedUser = await User.findByIdAndUpdate(
      id,
      dataToUpdate,
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!updatedUser) {
      throw new BaseError(StatusCodes.NOT_FOUND, 'Không tìm thấy người dùng');
    }

    // === LOGIC 2: TỰ ĐỘNG TẠO HỒ SƠ DOCTOR ===
    const newRole = updatedUser.role;
    // Nếu role cũ KHÔNG PHẢI doctor VÀ role mới LÀ doctor
    if (oldRole !== 'doctor' && newRole === 'doctor') {
      // Kiểm tra xem hồ sơ doctor đã tồn tại chưa 
      const existingDoctor = await Doctor.findOne({ userId: updatedUser._id });
      if (!existingDoctor) {
        // Tạo hồ sơ rỗng
        const newDoctorProfile = new Doctor({
          userId: updatedUser._id,
          specialization: 'Chưa cập nhật',
          experience: 0,
          serviceTypeIds: [],
        });
        await newDoctorProfile.save();
        console.log(`Đã tự động tạo hồ sơ Doctor cho user: ${updatedUser.email}`);
      }
    }
    // Không xử lý trường hợp hạ role từ doctor -> user

    return updatedUser;
    
  } catch (err) {
    // Truyền lỗi BaseError ra ngoài
    if (err instanceof BaseError) throw err;
    // Các lỗi khác
    throw new BaseError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      `Lỗi khi cập nhật người dùng (Admin): ${err.message}`
    );
  }
};

// Xóa mềm 1 user (do Admin thực hiện)
const adminDeleteUser = async (id, adminId) => {
  try {
    // === LOGIC 1: NGĂN TỰ XÓA ===
    if (id === adminId) {
      throw new BaseError(
        StatusCodes.BAD_REQUEST,
        'Bạn không thể tự xóa chính mình.'
      );
    }
    const user = await User.findById(id);
    if (!user) {
      throw new BaseError(StatusCodes.NOT_FOUND, 'Không tìm thấy người dùng');
    }
    user.status = 'deleted';
    await user.save();

    return { message: 'Xóa mềm người dùng thành công' };
  } catch (err) {
    if (err instanceof BaseError) throw err;
    throw new BaseError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      `Lỗi khi xóa người dùng (Admin): ${err.message}`
    );
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserByEmail,
  updateUserByEmail,
  deleteUserByEmail,
  getUserByUserId,
  getUserByEmail1,
  adminGetAllUsers,
  adminGetUserById,
  adminUpdateUser,
  adminDeleteUser,
};