package com.example.childrencare.model;

public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private User user;
    private String username;
    public String getAccessToken() { return accessToken; }
    public String getRefreshToken() { return refreshToken; }
    public User getUser() { return user; }

    public String getUsername() {
        return username;
    }
}
