package com.example.childrencare.model;

import java.util.List;

public class AppointmentRequest {
    private String doctorId;                 // bác sĩ được chọn
    private String serviceTypeId;     // danh sách dịch vụ (1)
    private String scheduledAt;              // thời gian hẹn (ISO 8601 format)
    private String paymentMethod;            // VNPay, Momo, hoặc Cash

    public AppointmentRequest(){}
    public AppointmentRequest(
            String doctorId,
            String serviceTypeId,
            String scheduledAt,
            double totalPrice,
            String paymentMethod
    ) {
        this.doctorId = doctorId;
        this.serviceTypeId = serviceTypeId;
        this.scheduledAt = scheduledAt;
        this.paymentMethod = paymentMethod;
    }

    // Getters & setters
    public String getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(String doctorId) {
        this.doctorId = doctorId;
    }

    public String getServiceTypeIds() {
        return serviceTypeId;
    }

    public void setServiceTypeIds(String serviceTypeIds) {
        this.serviceTypeId = serviceTypeIds;
    }

    public String getScheduledAt() {
        return scheduledAt;
    }

    public void setScheduledAt(String scheduledAt) {
        this.scheduledAt = scheduledAt;
    }


    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
}
