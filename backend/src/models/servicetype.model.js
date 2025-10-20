const mongoose = require('mongoose');

const serviceTypeSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, "Tên dịch vụ là bắt buộc"], 
    unique: true, 
    trim: true 
  },
  description: { 
    type: String, 
    trim: true,
    default: "" 
  },
  imageUrl: {
    type: String, 
    trim: true,
    default: "" 
  },
  price: { 
    type: Number, 
    required: [true, "Giá dịch vụ là bắt buộc"], 
    min: [0, "Giá dịch vụ không thể âm"] 
  }
}, { 
  timestamps: true // tự động quản lý createdAt và updatedAt
});



module.exports = mongoose.model('ServiceType', serviceTypeSchema);
