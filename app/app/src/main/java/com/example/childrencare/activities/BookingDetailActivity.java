package com.example.childrencare.activities;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import com.example.childrencare.R;
import com.example.childrencare.api.ApiClient;
import com.example.childrencare.api.ApiService;
import com.example.childrencare.model.Appointment;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class BookingDetailActivity extends AppCompatActivity {

    private TextView tvDoctor, tvService, tvDate, tvSlot, tvPrice, tvPaymentMethod, tvStatus;
    private String appointmentId;
    private Button btnHome;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_booking_detail);

        tvDoctor = findViewById(R.id.tv_doctor);
        tvService = findViewById(R.id.tv_service);
        tvDate = findViewById(R.id.tv_date);
        tvPrice = findViewById(R.id.tv_price);
        tvPaymentMethod = findViewById(R.id.tv_payment_method);
        tvStatus = findViewById(R.id.tv_status);
        btnHome = findViewById(R.id.btn_home);

        appointmentId = getIntent().getStringExtra("appointment_id");
        if (appointmentId == null) {
            Toast.makeText(this, "No appointment ID", Toast.LENGTH_SHORT).show();
            finish();
            return;
        }

        loadAppointmentDetails(appointmentId);
        btnHome.setOnClickListener(v -> {
            Intent intent = new Intent(BookingDetailActivity.this, MainActivity.class);
            // Nếu muốn clear stack để tránh back quay lại BookingDetail:
            intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            startActivity(intent);
            finish();
        });
    }

    private void loadAppointmentDetails(String id) {
        ApiService apiService = ApiClient.getClient(this).create(ApiService.class);
        Call<Appointment> call = apiService.getAppointmentByIdWithAuth(id);

        call.enqueue(new Callback<>() {
            @SuppressLint("SetTextI18n")
            @Override
            public void onResponse(@NonNull Call<Appointment> call, @NonNull Response<Appointment> response) {
                if (response.isSuccessful() && response.body() != null) {
                    Appointment a = response.body();
                    tvDoctor.setText("Doctor: " + (a.getDoctor() != null ? a.getDoctor().getUser().getName() : "N/A"));
                    tvService.setText("Service: " + (a.getService() != null ? a.getService().getName() : "N/A"));
                    tvDate.setText("Date: " + a.getScheduledAt());
                    tvPrice.setText("Price: " + a.getTotalPrice());
                    tvPaymentMethod.setText("Payment: " + (a.getPaymentMethod() != null ? a.getPaymentMethod() : "N/A"));
                    tvStatus.setText("Status: " + a.getStatus());

                    // Log chi tiết object
                    android.util.Log.d("BookingDetail", "Appointment loaded: " + a.toString());
                } else {
                    // Log chi tiết lỗi
                    String errorBody = "";
                    try {
                        if (response.errorBody() != null) {
                            errorBody = response.errorBody().string();
                        }
                    } catch (Exception e) {
                        android.util.Log.e("BookingDetail", "Error reading errorBody", e);
                    }

                    android.util.Log.e("BookingDetail", "Response failed. Code: " + response.code() +
                            ", message: " + response.message() +
                            ", errorBody: " + errorBody);

                    Toast.makeText(BookingDetailActivity.this, "Failed to load details. See log.", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(@NonNull Call<Appointment> call, @NonNull Throwable t) {
                // Log chi tiết stack trace
                android.util.Log.e("BookingDetail", "API call failed", t);
                Toast.makeText(BookingDetailActivity.this, "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

}
