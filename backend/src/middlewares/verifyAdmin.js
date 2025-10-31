// backend/src/middlewares/verifyAdmin.js
const { verifyToken } = require('./verifyJWT');

const verifyAdmin = (req, res, next) => {
  // 1. Xác thực token trước (dùng lại hàm cũ)
  verifyToken(req, res, () => {
    // 2. Nếu token hợp lệ, kiểm tra quyền admin
    if (req.user.role === 'admin') {
      next(); // Là admin, cho phép đi tiếp
    } else {
      // 3. Nếu không phải admin, từ chối
      return res.status(403).json({ message: 'Forbidden: Yêu cầu quyền Admin' });
    }
  });
};

module.exports = { verifyAdmin };