package com.example.childrencare.activities;

import android.annotation.SuppressLint;
import android.app.AlertDialog;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.RadioButton;
import android.widget.RadioGroup;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import com.example.childrencare.R;
import com.example.childrencare.api.ApiClient;
import com.example.childrencare.api.ApiService;
import com.example.childrencare.model.Appointment;
import com.example.childrencare.model.AppointmentRequest;
import com.example.childrencare.singleton.BookingSession;
import com.google.gson.Gson;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class PaymentActivity extends AppCompatActivity {

    // Views
    private TextView tvSummaryDoctor, tvSummaryService, tvSummaryDate, tvSummarySlot, tvSummaryPrice;
    private RadioGroup rgPayment;
    private Button btnPay;
    private ImageView ivBackArrow;
    private ProgressBar loadingIndicator;

    // Data
    private String doctorId, doctorName, serviceId, serviceName, date, time;
    private double servicePrice;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_payment);

        // Khởi tạo Views
        initViews();

        // Lấy dữ liệu
        getDataFromIntent();

        // Hiển thị thông tin
        populateData();

        // Setup Listeners
        setupListeners();
    }

    private void initViews() {
        // Summary Card Views
        tvSummaryDoctor = findViewById(R.id.tv_summary_doctor);
        tvSummaryService = findViewById(R.id.tv_summary_service);
        tvSummaryDate = findViewById(R.id.tv_summary_date);
        tvSummarySlot = findViewById(R.id.tv_summary_slot);
        tvSummaryPrice = findViewById(R.id.tv_summary_price);

        // Payment Views
        rgPayment = findViewById(R.id.rg_payment);
        btnPay = findViewById(R.id.btn_pay);

        // Other Views
        ivBackArrow = findViewById(R.id.iv_back_arrow);
        loadingIndicator = findViewById(R.id.loading_indicator);
    }

    private void getDataFromIntent() {
        doctorId = getIntent().getStringExtra("doctor_id");
        doctorName = getIntent().getStringExtra("doctor_name");
        serviceId = BookingSession.getInstance().getSelectedService().getId();
        serviceName = getIntent().getStringExtra("service_name");
        date = getIntent().getStringExtra("date"); // yyyy-MM-dd
        time = getIntent().getStringExtra("time"); // HH:mm - HH:mm
        servicePrice = BookingSession.getInstance().getTotalPrice();
    }

    @SuppressLint("SetTextI18n")
    private void populateData() {
        tvSummaryDoctor.setText(doctorName);
        tvSummaryService.setText(serviceName);
        tvSummaryDate.setText(date);
        tvSummarySlot.setText(time);
        tvSummaryPrice.setText(servicePrice + " VND");
    }

    private void setupListeners() {
        ivBackArrow.setOnClickListener(v -> finish()); // Quay lại màn hình trước

        btnPay.setOnClickListener(v -> {
            int selectedId = rgPayment.getCheckedRadioButtonId();
            if (selectedId == -1) {
                Toast.makeText(PaymentActivity.this, "Please select payment method", Toast.LENGTH_SHORT).show();
                return;
            }

            RadioButton selectedRadio = findViewById(selectedId);
            String paymentMethod = selectedRadio.getText().toString(); // "Cash", "VNPay"

            // Hiển thị dialog xác nhận
            showConfirmationDialog(paymentMethod);
        });
    }

    private void showConfirmationDialog(String paymentMethod) {
        new AlertDialog.Builder(this)
                .setTitle("Confirm Booking")
                .setMessage("Are you sure you want to book this appointment with payment method: " + paymentMethod + "?")
                .setPositiveButton("Confirm", (dialog, which) -> {
                    // Người dùng nhấn "Confirm" -> bắt đầu tạo appointment
                    createAppointment(paymentMethod);
                })
                .setNegativeButton("Cancel", null) // "Cancel" sẽ không làm gì, chỉ đóng dialog
                .show();
    }

    private void createAppointment(String paymentMethod) {
        // Hiển thị loading
        loadingIndicator.setVisibility(View.VISIBLE);
        btnPay.setEnabled(false); // Vô hiệu hóa nút

        ApiService apiService = ApiClient.getClient(this).create(ApiService.class);

        try {
            // Chuyển slot + date sang ISO 8601
            SimpleDateFormat sdfInput = new SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault());
            String startTime = time.split(" - ")[0];
            Date localDate = sdfInput.parse(date + " " + startTime);

            SimpleDateFormat sdfUtc = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US);
            sdfUtc.setTimeZone(java.util.TimeZone.getTimeZone("UTC"));
            String scheduledAt = sdfUtc.format(localDate);

            Log.e("AppointmentRequest", "DoctorId: " + doctorId);
            Log.e("AppointmentRequest", "ServiceId: " + serviceId);
            Log.e("AppointmentRequest", "ScheduledAt (UTC): " + scheduledAt);
            Log.e("AppointmentRequest", "Payment Method: " + paymentMethod);

            AppointmentRequest request = new AppointmentRequest();
            request.setDoctorId(doctorId);
            request.setServiceTypeIds(serviceId); // Đảm bảo API của bạn chấp nhận 1 ID
            request.setScheduledAt(scheduledAt);
            request.setPaymentMethod(paymentMethod);

            Call<Appointment> call = apiService.createAppointment(request);
            call.enqueue(new Callback<>() {
                @Override
                public void onResponse(@NonNull Call<Appointment> call, @NonNull Response<Appointment> response) {
                    // Ẩn loading
                    loadingIndicator.setVisibility(View.GONE);
                    btnPay.setEnabled(true); // Kích hoạt lại nút

                    if (response.isSuccessful() && response.body() != null) {
                        Appointment appointment = response.body();
                        Toast.makeText(PaymentActivity.this, "Appointment created!", Toast.LENGTH_SHORT).show();

                        if (appointment.getId() == null) {
                            Toast.makeText(PaymentActivity.this, "Error: Received null appointment ID", Toast.LENGTH_SHORT).show();
                            return;
                        }

                        if(paymentMethod.equals("Cash")){
                            // Cash → sang BookingDetail
                            Intent intent = new Intent(PaymentActivity.this, BookingDetailActivity.class);
                            intent.putExtra("appointment_id", appointment.getId());
                            startActivity(intent);
                            finish();
                        } else if(paymentMethod.equals("VNPay")){
                            // VNPay → sang VNPayActivity
                            Intent intent = new Intent(PaymentActivity.this, VNPayActivity.class);
                            intent.putExtra("appointment_id", appointment.getId());
                            intent.putExtra("payment_url", appointment.getPaymentUrl());
                            startActivity(intent);
                            finish();
                        }
                    } else {
                        // Xử lý lỗi từ server
                        handleApiError(response);
                    }
                }

                @Override
                public void onFailure(@NonNull Call<Appointment> call, @NonNull Throwable t) {
                    // Ẩn loading
                    loadingIndicator.setVisibility(View.GONE);
                    btnPay.setEnabled(true); // Kích hoạt lại nút

                    Toast.makeText(PaymentActivity.this, "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
                    Log.e("AppointmentRequest", "API Failure: " + t.getMessage());
                }
            });

        } catch (Exception e) {
            e.printStackTrace();
            Toast.makeText(this, "Invalid date/slot format", Toast.LENGTH_SHORT).show();
            Log.e("AppointmentRequest", "Date parsing error: " + e.getMessage());
            // Ẩn loading nếu có lỗi parse
            loadingIndicator.setVisibility(View.GONE);
            btnPay.setEnabled(true);
        }
    }

    private void handleApiError(Response<Appointment> response) {
        String errorMessage = "Unknown error";
        if (response.errorBody() != null) {
            try {
                String errorJson = response.errorBody().string();
                JSONObject obj = new JSONObject(errorJson);
                errorMessage = obj.optString("message", "Error " + response.code());
            } catch (IOException | JSONException e) {
                Log.e("API_ERROR", "Error parsing error body", e);
                errorMessage = "Error " + response.code();
            }
        }
        Toast.makeText(PaymentActivity.this, errorMessage, Toast.LENGTH_LONG).show();
        Log.e("API_ERROR", "Code: " + response.code() + ", Message: " + errorMessage);
    }
}