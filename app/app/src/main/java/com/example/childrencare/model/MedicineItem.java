package com.example.childrencare.model;

import com.google.gson.annotations.SerializedName;

public class MedicineItem {
    @SerializedName("name")
    private String name;

    @SerializedName("dosage")
    private String dosage;

    @SerializedName("duration")
    private String duration;

    // Getters
    public String getName() {
        return name;
    }

    public String getDosage() {
        return dosage;
    }

    public String getDuration() {
        return duration;
    }
}