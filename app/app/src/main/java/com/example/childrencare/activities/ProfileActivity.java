package com.example.childrencare.activities;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.widget.Button;
import android.widget.ImageView; // <-- Thêm import
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.childrencare.R;
import com.example.childrencare.api.ApiClient;
import com.example.childrencare.api.ApiService;
import com.example.childrencare.model.User;
import com.example.childrencare.utils.TokenManager;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ProfileActivity extends AppCompatActivity {

    private TextView tvAvatar, tvUsername, tvEmail;
    private Button btnLogout;
    private TokenManager tokenManager;
    private ApiService apiService;

    private ImageView ivBackArrow; // <-- Thêm biến cho nút back
    private TextView tvHeaderTitle, tvHeaderSubtitle; // <-- Thêm biến cho header text

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_profile);

        // Khởi tạo các view trong card
        tvAvatar = findViewById(R.id.tv_avatar);
        tvUsername = findViewById(R.id.tv_username);
        tvEmail = findViewById(R.id.tv_email);
        btnLogout = findViewById(R.id.btn_action);

        // (ĐÃ THÊM) Khởi tạo các view trong header
        ivBackArrow = findViewById(R.id.iv_back_arrow);
        tvHeaderTitle = findViewById(R.id.tv_header_title);
        tvHeaderSubtitle = findViewById(R.id.tv_header_subtitle);

        // (ĐÃ THÊM) Set text cho header
        tvHeaderTitle.setText("Profile");
        tvHeaderSubtitle.setText("Your account details");

        // Khởi tạo các thành phần khác
        tokenManager = new TokenManager(this);
        apiService = ApiClient.getClient(this).create(ApiService.class);

        // Gọi API lấy thông tin user
        fetchUserProfile();

        // (ĐÃ THÊM) Xử lý nút quay lại
        ivBackArrow.setOnClickListener(v -> finish());

        // Xử lý logout
        btnLogout.setOnClickListener(v -> {
            tokenManager.clearTokens(); // Xóa access token & refresh token
            Toast.makeText(this, "Đã đăng xuất", Toast.LENGTH_SHORT).show();

            Intent intent = new Intent(ProfileActivity.this, LoginActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            startActivity(intent);
        });
    }

    private void fetchUserProfile() {
        String accessToken = tokenManager.getAccessToken();
        if (accessToken == null || accessToken.isEmpty()) {
            Toast.makeText(this, "Token không hợp lệ, vui lòng đăng nhập lại", Toast.LENGTH_SHORT).show();
            return;
        }

        // Gọi API (token đã được interceptor tự thêm)
        apiService.getUserDetail().enqueue(new Callback<User>() {
            @Override
            public void onResponse(Call<User> call, Response<User> response) {
                if (response.isSuccessful() && response.body() != null) {
                    User user = response.body();
                    runOnUiThread(() -> updateUI(user.getUsername(), user.getEmail()));
                } else {
                    Log.e("ProfileActivity", "Response failed: " + response.code());
                    Toast.makeText(ProfileActivity.this, "Không thể lấy thông tin người dùng", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<User> call, Throwable t) {
                Log.e("ProfileActivity", "API error: " + t.getMessage());
                Toast.makeText(ProfileActivity.this, "Lỗi kết nối server!", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void updateUI(String username, String email) {
        if (username != null && !username.isEmpty()) {
            char firstLetter = Character.toUpperCase(username.charAt(0));
            tvAvatar.setText(String.valueOf(firstLetter));
            tvUsername.setText(username);
        } else {
            tvAvatar.setText("?");
            tvUsername.setText("Không rõ tên");
        }

        tvEmail.setText(email != null ? email : "Không có email");
    }
}