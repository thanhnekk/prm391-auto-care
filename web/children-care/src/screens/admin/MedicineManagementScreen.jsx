// src/screens/admin/MedicineManagementScreen.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { medicineService } from '../../services/medicineService';
import MedicineFormModal from '../../components/admin/MedicineFormModal';
import './AdminCRUD.css'; // Tái sử dụng CSS cũ

const MedicineManagementScreen = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);

  const loadMedicines = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await medicineService.getAllMedicines(); 
      setMedicines(response.data);
    } catch (err) {
      setError('Lỗi tải dữ liệu: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMedicines();
  }, [loadMedicines]);

  const handleCreate = () => {
    setSelectedMedicine(null);
    setIsModalOpen(true);
  };

  const handleEdit = (medicine) => {
    setSelectedMedicine(medicine);
    setIsModalOpen(true);
  };

  const handleSave = async (formData) => {
    try {
      if (selectedMedicine) {
        await medicineService.updateMedicine(selectedMedicine._id, formData);
      } else {
        await medicineService.createMedicine(formData);
      }
      setIsModalOpen(false);
      loadMedicines(); // Tải lại bảng
    } catch (err) {
      console.error(err);
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (medicineId) => {
    if (window.confirm('Bạn có chắc muốn xóa thuốc này khỏi danh mục?')) {
      try {
        await medicineService.deleteMedicine(medicineId);
        loadMedicines(); // Tải lại bảng
      } catch (err) {
        console.error(err);
        alert('Lỗi khi xóa: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <div className="admin-crud-screen">
      <div className="screen-header">
        <h1>Quản lý Danh mục thuốc</h1>
        <button onClick={handleCreate} className="btn-create">
          + Thêm mới
        </button>
      </div>
      
      {loading && <div>Đang tải...</div>}
      {error && <div className="error-message">{error}</div>}
      
      {!loading && !error && (
        <table className="crud-table">
          <thead>
            <tr>
              <th>Tên Thuốc</th>
              <th>Đơn vị</th>
              <th>Mô tả</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {medicines.map((med) => (
              <tr key={med._id}>
                <td>{med.name}</td>
                <td>{med.unit}</td>
                <td>{med.description}</td>
                <td>
                  <button onClick={() => handleEdit(med)} className="btn-edit">
                    Sửa
                  </button>
                  <button onClick={() => handleDelete(med._id)} className="btn-delete">
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal Form */}
      <MedicineFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        medicine={selectedMedicine}
      />
    </div>
  );
};

export default MedicineManagementScreen;