package com.example.childrencare.model;

import com.google.gson.annotations.SerializedName;

public class CreateAppointmentResponse {

    @SerializedName("_id")
    private String id;

    @SerializedName("userId")
    private String userId;

    @SerializedName("doctorId")
    private String  doctorId;

    @SerializedName("serviceTypeIds")
    private String service;  // giờ chỉ 1 service, không dùng List

    @SerializedName("scheduledAt")
    private String scheduledAt;   // ISO datetime

    @SerializedName("totalPrice")
    private int totalPrice;

    @SerializedName("paid")
    private boolean paid;

    @SerializedName("paymentMethod")
    private String paymentMethod; // "Cash", "Momo", "VNPay"

    @SerializedName("status")
    private String status;        // "pending", "confirmed", ...

    @SerializedName("paymentUrl")
    private String paymentUrl;
    // --- Getter & Setter ---
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }


    public String getService() { return service; }
    public void setService(String service) { this.service = service; }

    public String getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(String scheduledAt) { this.scheduledAt = scheduledAt; }

    public int getTotalPrice() { return totalPrice; }
    public void setTotalPrice(int totalPrice) { this.totalPrice = totalPrice; }

    public boolean isPaid() { return paid; }
    public void setPaid(boolean paid) { this.paid = paid; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPaymentUrl() {
        return paymentUrl;
    }

    public void setPaymentUrl(String paymentUrl) {
        this.paymentUrl = paymentUrl;
    }
}
