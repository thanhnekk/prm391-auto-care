// app/src/main/java/com/example/childrencare/model/Prescription.java
package com.example.childrencare.model;

import com.google.gson.annotations.SerializedName;
import java.util.List;

public class Prescription {

    @SerializedName("_id")
    private String id;

    @SerializedName("appointmentId")
    private CreateAppointmentResponse appointmentId;


    @SerializedName("doctorName")
    private String doctorName;

    @SerializedName("notes")
    private String notes;

    @SerializedName("createdAt")
    private String createdAt;

    // Đây là thay đổi quan trọng
    @SerializedName("medicines")
    private List<MedicineItem> medicines;

    // Getters
    public String getId() {
        return id;
    }

    public CreateAppointmentResponse getAppointmentId() {
        return appointmentId;
    }

    public String getDoctorName() {
        return doctorName;
    }

    public String getNotes() {
        return notes;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public List<MedicineItem> getMedicines() {
        return medicines;
    }
}