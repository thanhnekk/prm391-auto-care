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

module.exports = { createUser, getAllUsers, getUserByEmail, updateUser, deleteUser };
