package com.example.childrencare.activities;

import android.app.DatePickerDialog;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.widget.*;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.example.childrencare.R;
import com.example.childrencare.adapter.DoctorAdapter;
import com.example.childrencare.adapter.ServiceAdapter;
import com.example.childrencare.adapter.SlotAdapter;
import com.example.childrencare.api.ApiClient;
import com.example.childrencare.api.ApiService;
import com.example.childrencare.model.*;
import com.example.childrencare.utils.TokenManager;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

import java.time.LocalDate;
import java.util.*;

public class BookingActivity extends AppCompatActivity {

    private ApiService apiService;
    private TokenManager tokenManager;

    private RecyclerView recyclerBooking;
    private ProgressBar progressBooking;
    private TextView tvBookingTitle;
    private Button btnConfirmBooking;
    private Button btnPickDate;

    private String selectedServiceId;
    private String selectedDoctorId;
    private Slot selectedSlot;
    private String selectedDate; // yyyy-MM-dd

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_booking);

        apiService = ApiClient.getClient(this).create(ApiService.class);
        tokenManager = new TokenManager(this);

        recyclerBooking = findViewById(R.id.recycler_booking);
        progressBooking = findViewById(R.id.progress_booking);
        tvBookingTitle = findViewById(R.id.tv_booking_title);
        btnConfirmBooking = findViewById(R.id.btn_booking_confirm);
        btnPickDate = findViewById(R.id.btn_pick_date);

        recyclerBooking.setLayoutManager(new LinearLayoutManager(this));

        // Lấy dữ liệu truyền nếu có (luồng đầy đủ)
        selectedServiceId = getIntent().getStringExtra("service_id");
        selectedDoctorId = getIntent().getStringExtra("doctor_id");
        selectedDate = getIntent().getStringExtra("date"); // optional
        // slot truyền có thể là startTime string (tùy implement BE), nhưng chúng ta dùng selectedSlot object after selection

        // default date = today
        if (selectedDate == null) if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            selectedDate = LocalDate.now().toString();
        }
        btnPickDate.setText(selectedDate);

        // thiết lập button chọn ngày
        btnPickDate.setOnClickListener(v -> showDatePicker());

        // quyết định bước bắt đầu
        if (selectedServiceId == null) {
            loadServiceList();
        } else if (selectedDoctorId == null) {
            loadDoctorList(selectedServiceId);
        } else {
            // đã có doctor (luồng đầy đủ vào booking) → show date & slots
            loadSlotList(selectedDoctorId, selectedDate);
        }

        btnConfirmBooking.setOnClickListener(v -> confirmBooking());
    }

    // ==================== DatePicker ====================
    private void showDatePicker() {
        Calendar cal = Calendar.getInstance();
        DatePickerDialog dpd = new DatePickerDialog(this,
                (view, year, month, dayOfMonth) -> {
                    month = month + 1;
                    String m = (month < 10) ? "0" + month : String.valueOf(month);
                    String d = (dayOfMonth < 10) ? "0" + dayOfMonth : String.valueOf(dayOfMonth);
                    selectedDate = year + "-" + m + "-" + d;
                    btnPickDate.setText(selectedDate);
                    // nếu đã chọn doctor thì reload slot ngày mới
                    if (selectedDoctorId != null) loadSlotList(selectedDoctorId, selectedDate);
                },
                cal.get(Calendar.YEAR),
                cal.get(Calendar.MONTH),
                cal.get(Calendar.DAY_OF_MONTH));
        dpd.show();
    }

    // ==================== Load Services ====================
    private void loadServiceList() {
        tvBookingTitle.setText("Select a Service");
        progressBooking.setVisibility(View.VISIBLE);
        apiService.getAllServiceTypes().enqueue(new Callback<List<ServiceType>>() {
            @Override
            public void onResponse(@NonNull Call<List<ServiceType>> call, @NonNull Response<List<ServiceType>> response) {
                progressBooking.setVisibility(View.GONE);
                if (response.isSuccessful() && response.body() != null) {
                    ServiceAdapter adapter = new ServiceAdapter(response.body(), service -> {
                        selectedServiceId = service.getId();
                        loadDoctorList(selectedServiceId);
                    });
                    recyclerBooking.setAdapter(adapter);
                } else {
                    Toast.makeText(BookingActivity.this, "Không tải được danh sách dịch vụ", Toast.LENGTH_SHORT).show();
                }
            }
            @Override
            public void onFailure(@NonNull Call<List<ServiceType>> call, @NonNull Throwable t) {
                progressBooking.setVisibility(View.GONE);
                Toast.makeText(BookingActivity.this, "Lỗi: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    // ==================== Load Doctors ====================
    private void loadDoctorList(String serviceId) {
        tvBookingTitle.setText("Select a Doctor");
        progressBooking.setVisibility(View.VISIBLE);
        apiService.getDoctorsByService(serviceId).enqueue(new Callback<List<Doctor>>() {
            @Override
            public void onResponse(@NonNull Call<List<Doctor>> call, @NonNull Response<List<Doctor>> response) {
                progressBooking.setVisibility(View.GONE);
                if (response.isSuccessful() && response.body() != null) {
                    DoctorAdapter adapter = new DoctorAdapter(response.body(), serviceId, doctor -> {
                        selectedDoctorId = doctor.getId();
                        // khi chọn doctor → show slot cho ngày đã chọn
                        loadSlotList(selectedDoctorId, selectedDate);
                    });
                    recyclerBooking.setAdapter(adapter);
                } else {
                    Toast.makeText(BookingActivity.this, "Không tìm thấy bác sĩ cho dịch vụ này", Toast.LENGTH_SHORT).show();
                }
            }
            @Override
            public void onFailure(@NonNull Call<List<Doctor>> call, @NonNull Throwable t) {
                progressBooking.setVisibility(View.GONE);
                Toast.makeText(BookingActivity.this, "Lỗi: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    // ==================== Load Slots (ảo, từ BE) ====================
    private void loadSlotList(String doctorId, String date) {
        tvBookingTitle.setText("Select a Time Slot");
        progressBooking.setVisibility(View.VISIBLE);
        selectedSlot = null;
        btnConfirmBooking.setVisibility(View.GONE);

        apiService.getDoctorSlots(doctorId, date).enqueue(new Callback<List<Slot>>() {
            @Override
            public void onResponse(@NonNull Call<List<Slot>> call, @NonNull Response<List<Slot>> response) {
                progressBooking.setVisibility(View.GONE);
                if (response.isSuccessful() && response.body() != null) {
                    List<Slot> slots = response.body();
                    SlotAdapter adapter = new SlotAdapter(BookingActivity.this, slots, slot -> {
                        selectedSlot = slot;
                        // highlight selection: here simplest is show toast + show confirm button
                        Toast.makeText(BookingActivity.this,
                                "Chọn: " + slot.getStartTime() + " - " + slot.getEndTime(),
                                Toast.LENGTH_SHORT).show();
                        btnConfirmBooking.setVisibility(View.VISIBLE);
                    });
                    recyclerBooking.setAdapter(adapter);
                } else {
                    Toast.makeText(BookingActivity.this, "Không tải được slot", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(@NonNull Call<List<Slot>> call, @NonNull Throwable t) {
                progressBooking.setVisibility(View.GONE);
                Toast.makeText(BookingActivity.this, "Lỗi: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    // ==================== Confirm Booking ====================
    private void confirmBooking() {
        if (selectedDoctorId == null || selectedServiceId == null || selectedSlot == null) {
            Toast.makeText(this, "Chưa chọn đủ service/doctor/slot", Toast.LENGTH_SHORT).show();
            return;
        }

        // build scheduledAt ISO string: assume local timezone and slot.startTime is "HH:mm"
        String scheduledAtIso = selectedDate + "T" + selectedSlot.getStartTime() + ":00";

        // compute totalPrice by fetching service detail or assume price in ServiceType model
        // For simplicity: call getServiceTypeById then submit
        progressBooking.setVisibility(View.VISIBLE);
        apiService.getServiceTypeById(selectedServiceId).enqueue(new Callback<ServiceType>() {
            @Override
            public void onResponse(@NonNull Call<ServiceType> call, @NonNull Response<ServiceType> response) {
                if (response.isSuccessful() && response.body() != null) {
                    double price = response.body().getPrice(); // assume getPrice exists and returns double


                    AppointmentRequest req = new AppointmentRequest(
                            selectedDoctorId,
                            selectedServiceId,
                            scheduledAtIso,
                            price,
                            "Cash" // default, you can add selection UI
                    );

                    apiService.createAppointment(req).enqueue(new Callback<Appointment>() {
                        @Override
                        public void onResponse(@NonNull Call<Appointment> call, @NonNull Response<Appointment> response) {
                            progressBooking.setVisibility(View.GONE);
                            if (response.isSuccessful()) {
                                Toast.makeText(BookingActivity.this, "✅ Đặt lịch thành công!", Toast.LENGTH_LONG).show();
                                finish();
                            } else {
                                Toast.makeText(BookingActivity.this, "❌ Đặt lịch thất bại: " + response.code(), Toast.LENGTH_SHORT).show();
                            }
                        }
                        @Override
                        public void onFailure(@NonNull Call<Appointment> call, @NonNull Throwable t) {
                            progressBooking.setVisibility(View.GONE);
                            Toast.makeText(BookingActivity.this, "Lỗi: " + t.getMessage(), Toast.LENGTH_SHORT).show();
                        }
                    });

                } else {
                    progressBooking.setVisibility(View.GONE);
                    Toast.makeText(BookingActivity.this, "Lỗi lấy giá dịch vụ", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(@NonNull Call<ServiceType> call, @NonNull Throwable t) {
                progressBooking.setVisibility(View.GONE);
                Toast.makeText(BookingActivity.this, "Lỗi: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }
}
