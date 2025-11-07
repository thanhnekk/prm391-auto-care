// src/components/doctor/PrescriptionForm.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthProvider';
import { medicineService } from '../../services/medicineService';
import { prescriptionService } from '../../services/prescriptionService';
import './PrescriptionForm.css'; // CSS riêng

const PrescriptionForm = ({ appointment, onSaveSuccess }) => {
  const { auth } = useAuth(); // Lấy tên bác sĩ
  
  // State cho đơn thuốc
  const [medicines, setMedicines] = useState([]); // Mảng thuốc sẽ kê
  const [notes, setNotes] = useState('');
  
  // State cho việc tìm kiếm
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]); // Danh mục thuốc
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Gọi API tìm kiếm thuốc khi người dùng gõ
  useEffect(() => {
    if (searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }
    
    const delayDebounceFn = setTimeout(async () => {
      setIsLoadingSearch(true);
      try {
        const res = await medicineService.getAllMedicines(searchTerm);
        setSearchResults(res.data);
      } catch (err) {
        console.error("Lỗi tìm thuốc:", err);
      }
      setIsLoadingSearch(false);
    }, 300); // Chờ 300ms sau khi gõ

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Thêm thuốc từ danh mục (searchResults) vào đơn (medicines)
  const handleAddMedicine = (medicine) => {
    setMedicines([
      ...medicines,
      { 
        name: medicine.name, // "Snapshot" tên thuốc
        dosage: '', // Liều lượng
        duration: ''  // Thời gian
      }
    ]);
    setSearchTerm(''); // Xóa ô tìm kiếm
    setSearchResults([]);
  };
  
  // Cập nhật liều lượng/thời gian
  const handleMedicineChange = (index, field, value) => {
    const updatedMedicines = [...medicines];
    updatedMedicines[index][field] = value;
    setMedicines(updatedMedicines);
  };
  
  // Xóa thuốc khỏi đơn
  const handleRemoveMedicine = (index) => {
    const updatedMedicines = medicines.filter((_, i) => i !== index);
    setMedicines(updatedMedicines);
  };

  // Gửi đơn thuốc
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (medicines.length === 0) {
      setError('Phải kê ít nhất một loại thuốc.');
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    const prescriptionData = {
      appointmentId: appointment._id,
      doctorName: auth.user.username, // Lấy tên từ context
      notes: notes,
      medicines: medicines, // Mảng thuốc đã nhúng
    };

    try {
      await prescriptionService.createPrescription(prescriptionData);
      alert('Kê đơn thành công!');
      onSaveSuccess(); // Gọi callback để đóng form
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi lưu đơn thuốc');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="prescription-form-container">
      <h3>Kê đơn cho: {appointment.userId?.username}</h3>
      <p>Ngày khám: {new Date(appointment.scheduledAt).toLocaleString('vi-VN')}</p>
      
      <form onSubmit={handleSubmit}>
        {/* Phần thêm thuốc */}
        <div className="form-group search-medicine-group">
          <label>Tìm và Thêm thuốc</label>
          <input
            type="text"
            placeholder="Gõ tên thuốc..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {isLoadingSearch && <div>Đang tìm...</div>}
          {searchResults.length > 0 && (
            <ul className="search-results">
              {searchResults.map(med => (
                <li key={med._id} onClick={() => handleAddMedicine(med)}>
                  {med.name} ({med.unit})
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Phần danh sách thuốc đã thêm */}
        <div className="medicine-list">
          {medicines.length === 0 && <p>Chưa thêm thuốc nào.</p>}
          {medicines.map((med, index) => (
            <div key={index} className="medicine-item">
              <strong>{med.name}</strong>
              <input
                type="text"
                placeholder="Liều lượng (VD: Sáng 1 viên)"
                value={med.dosage}
                onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Thời gian (VD: 7 ngày)"
                value={med.duration}
                onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                required
              />
              <button type="button" onClick={() => handleRemoveMedicine(index)}>Xóa</button>
            </div>
          ))}
        </div>

        {/* Ghi chú */}
        <div className="form-group">
          <label>Ghi chú của Bác sĩ</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Dặn dò thêm (nếu có)"
          />
        </div>

        {error && <p className="error-message">{error}</p>}

        <div className="form-actions">
          <button type="submit" className="btn-save" disabled={submitting}>
            {submitting ? 'Đang lưu...' : 'Lưu Đơn thuốc'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PrescriptionForm;