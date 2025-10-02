// services/notification.service.js
const Notification = require("../models/notification.model.js");
const BaseError = require("../utils/BaseError.js");
const { StatusCodes } = require("http-status-codes");

// Tạo notification
const createNotification = async ({ userId, title, message }) => {
    const noti = new Notification({ userId, title, message, read: false });
    await noti.save();
    return noti;
};

// Lấy tất cả notification theo user
const getNotificationsByUser = async (userId) => {
    return await Notification.find({ userId }).sort({ createdAt: -1 });
};

// Đánh dấu đã đọc
const markAsRead = async (notificationId) => {
    const noti = await Notification.findById(notificationId);
    if (!noti) throw new BaseError(StatusCodes.NOT_FOUND, "Notification không tồn tại");
    noti.read = true;
    await noti.save();
    return noti;
};

module.exports = { createNotification, getNotificationsByUser, markAsRead };
