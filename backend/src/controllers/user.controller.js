// controllers/user.controller.js
const UserService = require("../services/user.service");

const createUser = async (req, res, next) => {
    try {
        console.log("📥 Received data in createUser:", req.body);
        const savedUser = await UserService.createUser(req.body);
        res.status(201).json(savedUser);
    } catch (err) { next(err); }
};

const getAllUsers = async (req, res, next) => {
    try {
        const users = await UserService.getAllUsers();
        res.status(200).json(users);
    } catch (err) { next(err); }
};

const getUserByEmail = async (req, res, next) => {
    try {
        console.log("Decoded user from JWT:", req.user);
        // Chỉ truyền email vào service, không truyền req/res
        const user = await UserService.getUserByEmail1(req.user.email);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Trả về object plain, tránh circular
        res.status(200).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        });
    } catch (err) {
        next(err);
    }
};


const updateUser = async (req, res, next) => {
    try {
        const updatedUser = await UserService.updateUserByEmail(req.user.email, req.body);
        res.status(200).json({ message: "Cập nhật thành công", user: updatedUser });
    } catch (err) { next(err); }
};

const deleteUser = async (req, res, next) => {
    try {
        const result = await UserService.deleteUserByEmail(req.query.email);
        res.status(200).json(result);
    } catch (err) { next(err); }
};

const adminGetAllUsers = async (req, res, next) => {
  try {
    // req.query sẽ chứa ?page=1&limit=10&role=user&search=...
    const result = await UserService.adminGetAllUsers(req.query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const adminGetUserById = async (req, res, next) => {
  try {
    const user = await UserService.adminGetUserById(req.params.id);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

const adminUpdateUser = async (req, res, next) => {
  try {
    const updatedUser = await UserService.adminUpdateUser(
      req.params.id, // ID người bị sửa
      req.body,
      req.user._id // ID của admin đang thao tác (lấy từ token)
    );
    res.status(200).json({ message: "Cập nhật thành công (Admin)", user: updatedUser });
  } catch (err) {
    next(err);
  }
};

const adminDeleteUser = async (req, res, next) => {
  try {
    const result = await UserService.adminDeleteUser(
      req.params.id, // ID người bị xóa
      req.user._id // ID của admin đang thao tác
    );
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
// Cập nhật module.exports
module.exports = {
  createUser,
  getAllUsers,
  getUserByEmail,
  updateUser,
  deleteUser,
  // --- Các hàm mới cho Admin ---
  adminGetAllUsers,
  adminGetUserById,
  adminUpdateUser,
  adminDeleteUser,
};