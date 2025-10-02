package com.example.childrencare.model;

import com.google.gson.annotations.SerializedName;

public class User {

    @SerializedName("_id")
    private String id;              // để map JSON từ API

    @SerializedName("username")
    private String username;        // để map JSON từ API

    @SerializedName("email")
    private String email;

    @SerializedName("role")
    private String role;

    private String password;        // giữ lại cho code khác sử dụng
    private String name;            // nếu code khác dùng

    public User() {}

    public User(String email, String password) {
        this.email = email;
        this.password = password;
    }

    // --- Getter & Setter ---
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
