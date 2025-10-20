package com.example.childrencare.activities;

import android.content.Context;
import android.os.Bundle;
import android.os.Handler;
import android.util.Log;
import android.view.View;
import android.view.inputmethod.InputMethodManager;
import android.widget.Button;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import com.example.childrencare.R;
import com.example.childrencare.api.ApiClient;
import com.example.childrencare.api.ApiService;
import com.example.childrencare.model.User;
import com.google.android.material.snackbar.Snackbar;

import org.json.JSONObject;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class RegisterActivity extends AppCompatActivity {

    private EditText etUsername, etEmail, etPassword, etConfirmPassword;
    private Button btnRegister;
    private TextView tvLoginLink;
    private FrameLayout loadingOverlay;
    private static final String TAG = "RegisterActivity";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_register);

        // Khởi tạo views
        etUsername = findViewById(R.id.et_username);
        etEmail = findViewById(R.id.et_email);
        etPassword = findViewById(R.id.et_password);
        etConfirmPassword = findViewById(R.id.et_confirm_password);
        btnRegister = findViewById(R.id.btn_register);
        tvLoginLink = findViewById(R.id.tv_login_link);
        loadingOverlay = findViewById(R.id.loading_overlay);

        // Nút đăng ký
        btnRegister.setOnClickListener(v -> {
            hideKeyboard();
            registerUser();
        });

        // Link quay lại đăng nhập
        tvLoginLink.setOnClickListener(v -> {
            // Đóng Activity hiện tại để quay lại LoginActivity
            finish();
        });
    }

    /** Ẩn bàn phím */
    private void hideKeyboard() {
        View view = getCurrentFocus();
        if (view != null) {
            InputMethodManager imm = (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
            imm.hideSoftInputFromWindow(view.getWindowToken(), 0);
        }
    }

    private void registerUser() {
        String username = etUsername.getText().toString().trim();
        String email = etEmail.getText().toString().trim();
        String password = etPassword.getText().toString().trim();
        String confirmPassword = etConfirmPassword.getText().toString().trim();

        // --- Bắt lỗi validation ---
        if (username.isEmpty() || email.isEmpty() || password.isEmpty() || confirmPassword.isEmpty()) {
            Snackbar.make(btnRegister, "Vui lòng nhập đầy đủ thông tin!", Snackbar.LENGTH_LONG).show();
            return;
        }

        if (username.length() <= 2) {
            Snackbar.make(btnRegister, "Username phải có trên 2 ký tự!", Snackbar.LENGTH_LONG).show();
            return;
        }

        if (password.length() <= 5) {
            Snackbar.make(btnRegister, "Mật khẩu phải có trên 5 ký tự!", Snackbar.LENGTH_LONG).show();
            return;
        }

        if (!password.equals(confirmPassword)) {
            Snackbar.make(btnRegister, "Mật khẩu xác nhận không khớp!", Snackbar.LENGTH_LONG).show();
            return;
        }
        // --- Kết thúc validation ---

        // Hiển thị loading
        loadingOverlay.setVisibility(View.VISIBLE);
        btnRegister.setEnabled(false);

        // Tạo đối tượng User để gửi đi
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(password);

        // Gọi API
        ApiService apiService = ApiClient.getClient(this).create(ApiService.class);
        Call<User> call = apiService.register(user);

        call.enqueue(new Callback<User>() {
            @Override
            public void onResponse(@NonNull Call<User> call, @NonNull Response<User> response) {
                // Ẩn loading
                loadingOverlay.setVisibility(View.GONE);
                btnRegister.setEnabled(true);
                String message;

                if (response.isSuccessful()) {
                    message = "Đăng ký thành công! Vui lòng đăng nhập.";
                    Snackbar.make(btnRegister, message, Snackbar.LENGTH_LONG).show();

                    // Tự động quay lại màn hình Login sau 1 giây
                    new Handler().postDelayed(() -> finish(), 1000);

                } else {
                    // Xử lý lỗi từ server (vd: email đã tồn tại)
                    message = "Đăng ký thất bại!";
                    try {
                        if (response.errorBody() != null) {
                            String errorJson = response.errorBody().string();
                            Log.e(TAG, "Register failed. Code: " + response.code() + " | Body: " + errorJson);

                            JSONObject errorObj = new JSONObject(errorJson);
                            if (errorObj.has("message")) {
                                message = errorObj.getString("message");
                            }
                        }
                    } catch (Exception e) {
                        Log.e(TAG, "Error parsing errorBody", e);
                    }
                    Snackbar.make(btnRegister, message, Snackbar.LENGTH_LONG).show();
                }
            }

            @Override
            public void onFailure(@NonNull Call<User> call, @NonNull Throwable t) {
                // Ẩn loading
                loadingOverlay.setVisibility(View.GONE);
                btnRegister.setEnabled(true);

                String failMsg = "Lỗi kết nối: " + t.getMessage();
                Log.e(TAG, "API call failed", t);
                Snackbar.make(btnRegister, failMsg, Snackbar.LENGTH_LONG).show();
            }
        });
    }
}