package com.example.childrencare.activities;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ProgressBar;
import android.widget.Toast;
import com.google.gson.JsonObject;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

import com.example.childrencare.R;
import com.example.childrencare.api.ApiClient;
import com.example.childrencare.api.ApiService;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class VNPayActivity extends AppCompatActivity {

    public static final String TAG = "VNPayActivity";

    private WebView webView;
    private ProgressBar progressBar;

    private String appointmentId;
    private String paymentUrl;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_vnpay);

        webView = findViewById(R.id.webview_vnpay);
        progressBar = findViewById(R.id.progress_vnpay);

        appointmentId = getIntent().getStringExtra("appointment_id");
        paymentUrl = getIntent().getStringExtra("payment_url");
        Log.e(TAG, "appointmentId from Intent: " + appointmentId); // <-- Thêm log này

        if (appointmentId == null) {
            Toast.makeText(this, "Appointment ID not passed!", Toast.LENGTH_LONG).show();
            finish();
            return;
        }
        if (paymentUrl == null || paymentUrl.isEmpty()) {
            Toast.makeText(this, "Payment URL not found", Toast.LENGTH_SHORT).show();
            finish();
            return;
        }

        webView.getSettings().setJavaScriptEnabled(true);

        webView.setWebViewClient(new WebViewClient() {

            // API >= 24
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                Log.e(TAG, "WebView URL (new): " + url);
                if (url.startsWith("myapp://vnpay_return")) {
                    handleVNPayCallback(url);
                    return true;
                }
                return false;
            }

            // API < 24
            @SuppressWarnings("deprecation")
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                Log.d(TAG, "WebView URL (deprecated): " + url);
                if (url.startsWith("myapp://vnpay_return")) {
                    handleVNPayCallback(url);
                    return true;
                }
                return false;
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                progressBar.setVisibility(android.view.View.GONE);
            }
        });

        webView.loadUrl(paymentUrl);
    }

    private void handleVNPayCallback(String url) {
        Uri uri = Uri.parse(url);

        // Log tất cả query parameter
        for (String paramName : uri.getQueryParameterNames()) {
            String value = uri.getQueryParameter(paramName);
            Log.d(TAG, "VNPay Callback Param: " + paramName + " = " + value);
        }

        String rspCode = uri.getQueryParameter("vnp_ResponseCode");
        Log.d(TAG, "VNPay Callback Response Code: " + rspCode);

        if ("00".equals(rspCode)) {
            Log.d(TAG, "Thanh Toán thành công: " + rspCode);
            // Thanh toán thành công → gọi backend cập nhật
            payAppointmentBackend();
        } else {
            Toast.makeText(this, "Thanh toán thất bại hoặc hủy!", Toast.LENGTH_SHORT).show();
            Intent intent = new Intent(VNPayActivity.this, BookingDetailActivity.class);
            intent.putExtra("appointment_id", appointmentId);
            startActivity(intent);
            finish();
        }
    }


    private void payAppointmentBackend() {
        ApiService apiService = ApiClient.getClient(this).create(ApiService.class);
        Call<JsonObject> call = apiService.payAppointment(appointmentId);

        call.enqueue(new Callback<JsonObject>() {
            @Override
            public void onResponse(Call<JsonObject> call, Response<JsonObject> response) {
                Log.d(TAG, "Backend Response Code: " + response.code());
                if (response.isSuccessful()) {
                    JsonObject appt = response.body();
                    if (appt != null) {
                        Log.d(TAG, "Appointment updated: " );
                        Toast.makeText(VNPayActivity.this, "Thanh toán hoàn tất!", Toast.LENGTH_SHORT).show();
                        Intent intent = new Intent(VNPayActivity.this, BookingDetailActivity.class);
                        intent.putExtra("appointment_id", appointmentId);
                        startActivity(intent);
                        finish();
                    } else {
                        Log.e(TAG, "Response body null");
                        Toast.makeText(VNPayActivity.this, "Cập nhật thanh toán thất bại: body null", Toast.LENGTH_LONG).show();
                        finish();
                    }
                } else {
                    try {
                        String errorBody = response.errorBody() != null ? response.errorBody().string() : "empty";
                        Log.e(TAG, "Response not successful: " + errorBody);
                        Toast.makeText(VNPayActivity.this, "Cập nhật thất bại: " + errorBody, Toast.LENGTH_LONG).show();
                    } catch (Exception e) {
                        Log.e(TAG, "Error reading errorBody", e);
                    }
                    // Không finish, để debug
                }
            }

            @Override
            public void onFailure(Call<JsonObject> call, Throwable t) {
                Log.e(TAG, "Network or API failure", t);
                Toast.makeText(VNPayActivity.this, "Lỗi mạng hoặc server: " + t.getMessage(), Toast.LENGTH_LONG).show();
                finish();
            }
        });
    }

}
