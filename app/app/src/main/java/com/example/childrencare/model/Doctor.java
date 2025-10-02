package com.example.childrencare.model;

import com.google.gson.annotations.SerializedName;
import java.util.List;

public class Doctor {

    @SerializedName("_id")
    private String id;

    @SerializedName("userId")
    private User user;  // backend trả về object user

    @SerializedName("specialization")
    private String specialization;

    @SerializedName("experience")
    private int experience;

    @SerializedName("serviceTypeIds")
    private List<ServiceType> serviceTypes;

    // --- Getter & Setter ---
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public int getExperience() { return experience; }
    public void setExperience(int experience) { this.experience = experience; }

    public List<ServiceType> getServiceTypes() { return serviceTypes; }
    public void setServiceTypes(List<ServiceType> serviceTypes) { this.serviceTypes = serviceTypes; }

    // --- Convenience methods ---
    public String getName() {
        return user != null ? user.getUsername() : "Unknown";
    }

    public String getEmail() {
        return user != null ? user.getEmail() : "";
    }
}
