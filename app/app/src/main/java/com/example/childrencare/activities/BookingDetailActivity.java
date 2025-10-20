package com.example.childrencare.activities;

import android.annotation.SuppressLint;
import android.app.AlertDialog;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;
import androidx.core.widget.NestedScrollView;

import com.example.childrencare.R;
import com.example.childrencare.api.ApiClient;
import com.example.childrencare.api.ApiService;
import com.example.childrencare.model.Appointment;
import com.google.gson.JsonObject; // <-- Thêm import này

import java.text.NumberFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class BookingDetailActivity extends AppCompatActivity {

    private String appointmentId;

    // Views
    private ProgressBar loadingIndicator;
    private NestedScrollView contentScrollView;
    private TextView tvBookingId, tvStatusHeader, tvServiceName, tvServiceType, tvDate, tvTime;
    private TextView tvStatusCard, tvDoctorName, tvDoctorSpecialization, tvDoctorExperience;
    private TextView tvServiceFee, tvPaymentMethod, tvPaymentStatus;
    private ImageView ivPaymentStatus;
    private LinearLayout llActionButtons;
    private Button btnCancel, btnHome,btnPayNow;
    private ImageView ivBackArrow;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_booking_detail);

        // Khởi tạo Views
        initViews();

        appointmentId = getIntent().getStringExtra("appointment_id");
        if (appointmentId == null) {
            Toast.makeText(this, "No appointment ID", Toast.LENGTH_SHORT).show();
            finish();
            return;
        }
        ivBackArrow = findViewById(R.id.iv_back_arrow);
        ivBackArrow.setOnClickListener(v -> finish());
        setupListeners();
        loadAppointmentDetails(appointmentId);
    }

    private void initViews() {
        loadingIndicator = findViewById(R.id.loading_indicator);
        contentScrollView = findViewById(R.id.content_scroll_view);

        tvBookingId = findViewById(R.id.tv_booking_id);
        tvServiceName = findViewById(R.id.tv_service_name);
        tvServiceType = findViewById(R.id.tv_service_type);
        tvDate = findViewById(R.id.tv_date);
        tvTime = findViewById(R.id.tv_time);
        tvStatusCard = findViewById(R.id.tv_status_card);
        tvDoctorName = findViewById(R.id.tv_doctor_name);
        tvDoctorSpecialization = findViewById(R.id.tv_doctor_specialization);
        tvDoctorExperience = findViewById(R.id.tv_doctor_experience);
        tvServiceFee = findViewById(R.id.tv_service_fee);
        tvPaymentMethod = findViewById(R.id.tv_payment_method);
        tvPaymentStatus = findViewById(R.id.tv_payment_status);
        ivPaymentStatus = findViewById(R.id.iv_payment_status);
        llActionButtons = findViewById(R.id.ll_action_buttons);
        btnCancel = findViewById(R.id.btn_cancel);
        btnHome = findViewById(R.id.btn_home);
        btnPayNow = findViewById(R.id.btn_pay_now);
    }

    private void setupListeners() {
        btnHome.setOnClickListener(v -> {
            Intent intent = new Intent(BookingDetailActivity.this, MainActivity.class);
            intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            startActivity(intent);
            finish();
        });

        // ĐÃ CẬP NHẬT: Kích hoạt dialog xác nhận
        btnCancel.setOnClickListener(v -> {
            // Hiển thị dialog xác nhận trước khi hủy
            new AlertDialog.Builder(this)
                    .setTitle("Cancel Appointment")
                    .setMessage("Are you sure you want to cancel this appointment?")
                    .setPositiveButton("Yes", (dialog, which) -> cancelAppointment(appointmentId))
                    .setNegativeButton("No", null)
                    .show();
        });
    }

    private void loadAppointmentDetails(String id) {
        // Show loading
        loadingIndicator.setVisibility(View.VISIBLE);
        contentScrollView.setVisibility(View.GONE);

        ApiService apiService = ApiClient.getClient(this).create(ApiService.class);
        Call<Appointment> call = apiService.getAppointmentByIdWithAuth(id);

        call.enqueue(new Callback<>() {
            @SuppressLint("SetTextI18n")
            @Override
            public void onResponse(@NonNull Call<Appointment> call, @NonNull Response<Appointment> response) {
                // Hide loading
                loadingIndicator.setVisibility(View.GONE);

                if (response.isSuccessful() && response.body() != null) {
                    contentScrollView.setVisibility(View.VISIBLE);
                    Appointment a = response.body();
                    populateData(a);

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
                // Hide loading
                loadingIndicator.setVisibility(View.GONE);

                // Log chi tiết stack trace
                android.util.Log.e("BookingDetail", "API call failed", t);
                Toast.makeText(BookingDetailActivity.this, "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    @SuppressLint("SetTextI18n")
    private void populateData(Appointment a) {
        // Header
        tvBookingId.setText("#ID: "+a.getId());

        // Service Card
        if(a.getService() != null) {
            tvServiceName.setText(a.getService().getName());
            tvServiceType.setText("In-Person");
        } else {
            tvServiceName.setText("N/A");
            tvServiceType.setText("N/A");
        }

        // Date/Time Card
        String[] dateTime = formatDateTime(a.getScheduledAt());
        tvDate.setText(dateTime[0]);
        tvTime.setText(dateTime[1]);

        // Status Card
        tvStatusCard.setText(a.getStatus());

        // Doctor Card
        if(a.getDoctor() != null && a.getDoctor().getUser() != null) {
            tvDoctorName.setText(a.getDoctor().getUser().getName());
            tvDoctorSpecialization.setText(a.getDoctor().getSpecialization());
            tvDoctorExperience.setText(a.getDoctor().getExperience()+"years experience");
        } else {
            tvDoctorName.setText("N/A");
            tvDoctorSpecialization.setText("N/A");
            tvDoctorExperience.setText("N/A");
        }

        // Payment Card
        double totalPrice = a.getTotalPrice(); // Hoặc int, tuỳ kiểu dữ liệu
        NumberFormat formatter = NumberFormat.getInstance(new Locale("vi", "VN"));
        String formattedPrice = formatter.format(totalPrice);
        tvServiceFee.setText(formattedPrice+"VND");
        tvPaymentMethod.setText(a.getPaymentMethod() != null ? a.getPaymentMethod() : "N/A");

        // Payment Status Logic
        Boolean paymentStatus = a.isPaid();
        String paymentMethod = a.getPaymentMethod();

        if (paymentStatus) {
            tvPaymentStatus.setText("Payment Completed");
            tvPaymentStatus.setTextColor(ContextCompat.getColor(this, android.R.color.holo_green_dark));
            ivPaymentStatus.setImageResource(android.R.drawable.ic_input_add);
            ivPaymentStatus.setColorFilter(ContextCompat.getColor(this, android.R.color.holo_green_dark));
        } else if ("VNPay".equalsIgnoreCase(paymentMethod)) {
            tvPaymentStatus.setText("Payment Uncompleted");
            tvPaymentStatus.setTextColor(ContextCompat.getColor(this, R.color.slot_unavailable)); // Màu vàng/cam
            ivPaymentStatus.setImageResource(android.R.drawable.ic_dialog_alert); // Icon chấm than
            ivPaymentStatus.setColorFilter(ContextCompat.getColor(this, R.color.purple_200));
        } else {
            tvPaymentStatus.setText("Pay at clinic");
            tvPaymentStatus.setTextColor(ContextCompat.getColor(this, android.R.color.darker_gray));
            ivPaymentStatus.setImageResource(android.R.drawable.ic_menu_info_details);
            ivPaymentStatus.setColorFilter(ContextCompat.getColor(this, android.R.color.darker_gray));
        }


        llActionButtons.setVisibility(View.VISIBLE);

        // Nút Cancel chỉ hiển thị khi status là "Pending"(VNPay), "Pending,Confirmed"(Cash)
        if ("Pending".equalsIgnoreCase(a.getStatus())||("Confirmed".equalsIgnoreCase(a.getStatus()))&&!paymentStatus&&"Cash".equalsIgnoreCase(paymentMethod)) {
            btnCancel.setVisibility(View.VISIBLE);
        } else {
            btnCancel.setVisibility(View.GONE);
        }
        // Nút Pay Now: chỉ hiển thị nếu Pending + VNPay + chưa thanh toán
        if ("Pending".equalsIgnoreCase(a.getStatus()) &&
                "VNPay".equalsIgnoreCase(paymentMethod) &&
                !paymentStatus) {
            btnPayNow.setVisibility(View.VISIBLE);
            btnPayNow.setOnClickListener(v -> repayAppointment(a.getId()));
        } else {
            btnPayNow.setVisibility(View.GONE);
        }
    }

    /**
     * Tách chuỗi DateTime (ví dụ: "2024-11-15T10:00:00") thành ngày và giờ
     */
    private String[] formatDateTime(String dateTimeStr) {
        if (dateTimeStr == null) {
            return new String[]{"N/A", "N/A"};
        }

        SimpleDateFormat inputFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault());
        SimpleDateFormat dateFormat = new SimpleDateFormat("MMM dd, yyyy", Locale.getDefault());
        SimpleDateFormat timeFormat = new SimpleDateFormat("hh:mm a", Locale.getDefault());

        try {
            Date date = inputFormat.parse(dateTimeStr);
            if (date != null) {
                String formattedDate = dateFormat.format(date);
                String formattedTime = timeFormat.format(date);
                return new String[]{formattedDate, formattedTime};
            }
        } catch (ParseException e) {
            android.util.Log.e("BookingDetail", "Error parsing date: " + dateTimeStr, e);
            return new String[]{dateTimeStr, ""};
        }
        return new String[]{"N/A", "N/A"};
    }

    /**
     * ĐÃ CẬP NHẬT: Triển khai API hủy lịch hẹn
     */
    private void cancelAppointment(String id) {
        Toast.makeText(this, "Đang xử lý hủy...", Toast.LENGTH_SHORT).show();

        ApiService apiService = ApiClient.getClient(this).create(ApiService.class);
        Call<JsonObject> call = apiService.cancelAppointment(id); // Dùng Call<JsonObject> như trong ApiService

        call.enqueue(new Callback<JsonObject>() {
            @Override
            public void onResponse(@NonNull Call<JsonObject> call, @NonNull Response<JsonObject> response) {
                if (response.isSuccessful()) {
                    Toast.makeText(BookingDetailActivity.this, "Appointment Cancelled", Toast.LENGTH_SHORT).show();

                    // Cập nhật UI
                    tvStatusCard.setText("Canceled");

                    // Ẩn nút Cancel đi
                    btnCancel.setVisibility(View.GONE);
                } else {
                    // Xử lý lỗi
                    String errorMsg = "Failed to cancel appointment";
                    try {
                        if (response.errorBody() != null) {
                            errorMsg += ": " + response.errorBody().string();
                        }
                        android.util.Log.e("BookingDetail", "Cancel failed. Code: " + response.code() + ", Msg: " + errorMsg);
                    } catch (Exception e) {
                        android.util.Log.e("BookingDetail", "Error reading error body", e);
                    }
                    Toast.makeText(BookingDetailActivity.this, errorMsg, Toast.LENGTH_LONG).show();
                }
            }

            @Override
            public void onFailure(@NonNull Call<JsonObject> call, @NonNull Throwable t) {
                android.util.Log.e("BookingDetail", "API call failed (cancel)", t);
                Toast.makeText(BookingDetailActivity.this, "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }
    /**
     * Gọi API repay để lấy paymentUrl và mở VNPayActivity
     */
    private void repayAppointment(String appointmentId) {
        ApiService apiService = ApiClient.getClient(this).create(ApiService.class);
        Call<JsonObject> call = apiService.repayAppointment(appointmentId);

        call.enqueue(new Callback<>() {
            @Override
            public void onResponse(@NonNull Call<JsonObject> call, @NonNull Response<JsonObject> response) {
                if (response.isSuccessful() && response.body() != null) {
                    JsonObject body = response.body();
                    String paymentUrl = "";
                    if (body.has("paymentUrl") && !body.get("paymentUrl").isJsonNull()) {
                        paymentUrl = body.get("paymentUrl").getAsString();
                    }

                    if (!paymentUrl.isEmpty()) {
                        Intent intent = new Intent(BookingDetailActivity.this, VNPayActivity.class);
                        intent.putExtra("appointment_id", appointmentId);
                        intent.putExtra("payment_url", paymentUrl);
                        startActivity(intent);
                    } else {
                        Toast.makeText(BookingDetailActivity.this, "Không lấy được payment URL", Toast.LENGTH_SHORT).show();
                    }
                } else {
                    Toast.makeText(BookingDetailActivity.this, "Failed to get payment URL", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(@NonNull Call<JsonObject> call, @NonNull Throwable t) {
                Toast.makeText(BookingDetailActivity.this, "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }
}