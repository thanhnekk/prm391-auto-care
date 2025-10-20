package com.example.childrencare.model;

import com.google.gson.annotations.SerializedName;

public class ServiceType {
    @SerializedName("_id")
    private String id;
    private String name;
    private String description;
    private double price;
    private  String imageUrl;
    private String createdAt;
    private String updatedAt;

    public ServiceType() {}

    public ServiceType(String name, String description, double price) {
        this.name = name;
        this.description = description;

        this.price = price;
    }

    // ===== Getter & Setter =====
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}
