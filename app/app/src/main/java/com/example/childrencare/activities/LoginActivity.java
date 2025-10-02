package com.example.childrencare.activities;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.util.Log;
import android.view.View;
import android.view.inputmethod.InputMethodManager;
import android.widget.Button;
import android.widget.EditText;
import android.widget.FrameLayout;

import androidx.appcompat.app.AppCompatActivity;

import com.example.childrencare.R;
import com.example.childrencare.api.ApiClient;
import com.example.childrencare.api.ApiService;
import com.example.childrencare.model.AuthResponse;
import com.example.childrencare.model.User;
import com.example.childrencare.utils.TokenManager;
import com.google.android.material.snackbar.Snackbar;

import org.json.JSONObject;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class LoginActivity extends AppCompatActivity {

    private EditText etEmail, etPassword;
    private Button btnLogin;
    private FrameLayout loadingOverlay;
    private TokenManager tokenManager;
    private static final String TAG = "LoginActivity";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        etEmail = findViewById(R.id.et_email);
        etPassword = findViewById(R.id.et_password);
        btnLogin = findViewById(R.id.btn_login);
        loadingOverlay = findViewById(R.id.loading_overlay);
        tokenManager = new TokenManager(this);

        btnLogin.setOnClickListener(v -> {
            hideKeyboard();
            login();
        });
    }

    /** Ẩn bàn phím khi bấm Login */
    private void hideKeyboard() {
        View view = getCurrentFocus();
        if (view != null) {
            InputMethodManager imm = (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
            imm.hideSoftInputFromWindow(view.getWindowToken(), 0);
        }
    }

    private void login() {
        String email = etEmail.getText().toString().trim();
        String password = etPassword.getText().toString().trim();

        if (email.isEmpty() || password.isEmpty()) {
            Snackbar.make(btnLogin, "Vui lòng nhập đầy đủ thông tin!", Snackbar.LENGTH_LONG).show();
            return;
        }

        // Hiển thị overlay ProgressBar
        loadingOverlay.setVisibility(View.VISIBLE);
        btnLogin.setEnabled(false);

        ApiService apiService = ApiClient.getClient(this).create(ApiService.class);
        Call<AuthResponse> call = apiService.login(new User(email, password));

        call.enqueue(new Callback<AuthResponse>() {
            @Override
            public void onResponse(Call<AuthResponse> call, Response<AuthResponse> response) {
                loadingOverlay.setVisibility(View.GONE);
                btnLogin.setEnabled(true);

                String message;
                if (response.isSuccessful() && response.body() != null) {
                    tokenManager.saveTokens(response.body().getAccessToken(), response.body().getRefreshToken());
                    tokenManager.saveUsername(response.body().getUsername());
                    message = "Đăng nhập thành công!";
                    Snackbar.make(btnLogin, message, Snackbar.LENGTH_LONG).show();

                    new Handler().postDelayed(() -> {
                        startActivity(new Intent(LoginActivity.this, MainActivity.class));
                        finish();
                    }, 500);

                } else {
                    message = "Đăng nhập thất bại!";
                    try {
                        if (response.errorBody() != null) {
                            String errorJson = response.errorBody().string();
                            Log.e(TAG, "Login failed. Code: " + response.code() + " | Body: " + errorJson);

                            JSONObject errorObj = new JSONObject(errorJson);
                            if (errorObj.has("message")) {
                                message = errorObj.getString("message");
                            } else if (errorObj.has("error")) {
                                message = errorObj.getString("error");
                            }
                        }
                    } catch (Exception e) {
                        Log.e(TAG, "Error parsing errorBody", e);
                        message = "Đăng nhập thất bại!";
                    }

                    Snackbar.make(btnLogin, message, Snackbar.LENGTH_LONG).show();
                }
            }

            @Override
            public void onFailure(Call<AuthResponse> call, Throwable t) {
                loadingOverlay.setVisibility(View.GONE);
                btnLogin.setEnabled(true);
                String failMsg = "Lỗi kết nối: " + t.getMessage();
                Snackbar.make(btnLogin, failMsg, Snackbar.LENGTH_LONG).show();
            }
        });
    }
}
