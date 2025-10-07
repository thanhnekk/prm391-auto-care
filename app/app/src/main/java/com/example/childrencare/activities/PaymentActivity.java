package com.example.childrencare.activities;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.widget.Button;
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

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import com.example.childrencare.singleton.BookingSession;
import com.google.gson.Gson;

public class PaymentActivity extends AppCompatActivity {

    private TextView tvDoctor, tvService, tvDate, tvSlot, tvPrice;
    private RadioGroup rgPayment;
    private Button btnPay;

    private String doctorId, doctorName, serviceId, serviceName, date, time;
    private double servicePrice;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_payment);

        // Views
        tvDoctor = findViewById(R.id.tv_doctor);
        tvService = findViewById(R.id.tv_service);
        tvDate = findViewById(R.id.tv_date);
        tvSlot = findViewById(R.id.tv_slot);
        tvPrice = findViewById(R.id.tv_price);
        rgPayment = findViewById(R.id.rg_payment);
        btnPay = findViewById(R.id.btn_pay);

        // Lấy dữ liệu từ intent
        doctorId = getIntent().getStringExtra("doctor_id");
        doctorName = getIntent().getStringExtra("doctor_name");
        serviceId = BookingSession.getInstance().getSelectedService().getId();
        serviceName = getIntent().getStringExtra("service_name");
        date = getIntent().getStringExtra("date");
        time = getIntent().getStringExtra("time");
        servicePrice = BookingSession.getInstance().getTotalPrice();

        // Hiển thị thông tin
        tvDoctor.setText("Doctor: " + doctorName);
        tvService.setText("Service: " + serviceName);
        tvDate.setText("Date: " + date);
        tvSlot.setText("Slot: " +time);
        tvPrice.setText("Price: " + servicePrice + " VND");

        btnPay.setOnClickListener(v -> {
            int selectedId = rgPayment.getCheckedRadioButtonId();
            if (selectedId == -1) {
                Toast.makeText(PaymentActivity.this, "Please select payment method", Toast.LENGTH_SHORT).show();
                return;
            }

            RadioButton selectedRadio = findViewById(selectedId);
            String paymentMethod = selectedRadio.getText().toString(); // "Cash", "VNPay"

            createAppointment(paymentMethod);
        });
    }

    private void createAppointment(String paymentMethod) {
        ApiService apiService = ApiClient.getClient(this).create(ApiService.class);

        // Chuyển slot + date sang ISO 8601
        try {
            SimpleDateFormat sdfInput = new SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault());
            String startTime = time.split(" - ")[0];
            Date localDate = sdfInput.parse(date + " " + startTime);

            // Chuyển sang UTC
            SimpleDateFormat sdfUtc = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US);
            sdfUtc.setTimeZone(java.util.TimeZone.getTimeZone("UTC"));
            String scheduledAt = sdfUtc.format(localDate);
// --- Log dữ liệu BookingSession ---
            BookingSession session = BookingSession.getInstance();
            Log.e("BookingSession", "Selected Service: " + session.getSelectedService());
            Log.e("BookingSession", "Selected Doctor: " + session.getSelectedDoctor());
            Log.e("BookingSession", "Total Price: " + session.getTotalPrice());

            // --- Log dữ liệu trước khi gửi request ---
            Log.e("AppointmentRequest", "DoctorId: " + doctorId);
            Log.e("AppointmentRequest", "ServiceId: " + serviceId);
            Log.e("AppointmentRequest", "ScheduledAt (UTC): " + scheduledAt);
            Log.e("AppointmentRequest", "Payment Method: " + paymentMethod);
            AppointmentRequest request = new AppointmentRequest();
            request.setDoctorId(doctorId);
            request.setServiceTypeIds(serviceId);
            request.setScheduledAt(scheduledAt);
            request.setPaymentMethod(paymentMethod);

            Call<Appointment> call = apiService.createAppointment(request);
            call.enqueue(new Callback<>() {
                @Override
                public void onResponse(@NonNull Call<Appointment> call, @NonNull Response<Appointment> response) {
                    if (response.isSuccessful() && response.body() != null) {
                        Appointment appointment = response.body();

                        // Log bằng Gson để xem toàn bộ JSON backend trả về
                        Gson gson = new Gson();
                        String json = gson.toJson(appointment);
                        Log.e("PaymentActivity", "Raw appointment from backend: " + json);

                        Toast.makeText(PaymentActivity.this, "Appointment created!", Toast.LENGTH_SHORT).show();

                        if (appointment.getId() == null) {
                            Log.e("PaymentActivity", "WARNING: appointment ID is null!");
                        }
                        if(paymentMethod.equals("Cash")){
                            // Cash → sang BookingDetail luôn
                            Intent intent = new Intent(PaymentActivity.this, BookingDetailActivity.class);
                            intent.putExtra("appointment_id", appointment.getId());
                            startActivity(intent);
                            finish();
                        } else if(paymentMethod.equals("VNPay")){
                            // VNPay → mở màn hình thanh toán
                            Intent intent = new Intent(PaymentActivity.this, VNPayActivity.class);
                            intent.putExtra("appointment_id", appointment.getId());
                            intent.putExtra("payment_url", appointment.getPaymentUrl()); // BE trả về URL VNPay
                            startActivity(intent);
                            finish();
                        }
                        }else {
                        Toast.makeText(PaymentActivity.this, "Failed to create appointment", Toast.LENGTH_SHORT).show();
                    }
                }

                @Override
                public void onFailure(@NonNull Call<Appointment> call, @NonNull Throwable t) {
                    Toast.makeText(PaymentActivity.this, "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
                    Log.e("AppointmentRequest", "Payment Method: " + t.getMessage());
                }
            });

        } catch (Exception e) {
            e.printStackTrace();
            Toast.makeText(this, "Invalid date/slot", Toast.LENGTH_SHORT).show();
        }
    }
}
