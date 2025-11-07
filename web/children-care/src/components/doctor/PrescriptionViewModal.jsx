// src/components/doctor/PrescriptionViewModal.jsx
import React from 'react';
import '../admin/FormModal.css'; // Tái sử dụng CSS Modal
import './PrescriptionViewModal.css'; // CSS riêng

const PrescriptionViewModal = ({ isOpen, onClose, prescription }) => {
  if (!isOpen || !prescription) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Chi tiết Đơn thuốc</h2>
        
        <div className="prescription-details">
          <p><strong>Bệnh nhân:</strong> {prescription.appointmentId?.userId?.username}</p>
          <p><strong>Bác sĩ kê đơn:</strong> {prescription.doctorName}</p>
          <p><strong>Ngày kê:</strong> {new Date(prescription.createdAt).toLocaleString('vi-VN')}</p>
          
          <hr />
          
          <h4>Thuốc đã kê:</h4>
          <table className="prescription-table">
            <thead>
              <tr>
                <th>Tên thuốc</th>
                <th>Liều lượng (Viên/Bữa)</th>
                <th>Thời gian (Bữa/Ngày)</th>
              </tr>
            </thead>
            <tbody>
              {prescription.medicines.map((med, index) => (
                <tr key={index}>
                  <td>{med.name}</td>
                  <td>{med.dosage}</td>
                  <td>{med.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {prescription.notes && (
            <>
              <hr />
              <h4>Ghi chú của Bác sĩ:</h4>
              <p className="notes-box">{prescription.notes}</p>
            </>
          )}
        </div>

        <div className="form-actions">
          <button type="button" onClick={onClose} className="btn-cancel">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionViewModal;