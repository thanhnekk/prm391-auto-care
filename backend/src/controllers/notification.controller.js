// controllers/notification.controller.js
const NotificationService = require("../services/notification.service");

const getNotifications = async (req, res, next) => {
    try {
        const list = await NotificationService.getNotificationsByUser(req.user.id);
        res.status(200).json(list);
    } catch (err) { next(err); }
};

const markAsRead = async (req, res, next) => {
    try {
        const noti = await NotificationService.markAsRead(req.params.id);
        res.status(200).json(noti);
    } catch (err) { next(err); }
};

module.exports = { getNotifications, markAsRead };
