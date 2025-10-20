package com.example.childrencare.activities;

import android.app.DatePickerDialog;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.DatePicker;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.childrencare.R;
import com.example.childrencare.adapter.AppointmentAdapter;
import com.example.childrencare.api.ApiClient;
import com.example.childrencare.api.ApiService;
import com.example.childrencare.model.Appointment;
import com.google.android.material.chip.Chip;
import com.google.android.material.chip.ChipGroup;
import com.google.android.material.textfield.TextInputEditText;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class BookingListActivity extends AppCompatActivity {

    private RecyclerView recyclerAppointments;
    private ProgressBar progressLoading;
    private ChipGroup chipGroupStatus;
    private TextInputEditText etDateFilter;

    private AppointmentAdapter adapter;
    private List<Appointment> allAppointments = new ArrayList<>();

    private String selectedStatus = "all";
    private String selectedDate = "";
    private ImageView ivBackArrow;

    private TextView tvEmptyList;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_booking_list);

        recyclerAppointments = findViewById(R.id.recycler_appointments);
        progressLoading = findViewById(R.id.progress_loading);
        chipGroupStatus = findViewById(R.id.chip_group_status);
        etDateFilter = findViewById(R.id.et_date_filter);
        ivBackArrow = findViewById(R.id.iv_back_arrow);
        tvEmptyList = findViewById(R.id.tv_empty_list);

        ivBackArrow.setOnClickListener(v -> finish());
        recyclerAppointments.setLayoutManager(new LinearLayoutManager(this));
        adapter = new AppointmentAdapter(new ArrayList<>(), appointment -> {
            // Khi click item → mở BookingDetailActivity
            Intent intent = new Intent(BookingListActivity.this, BookingDetailActivity.class);
            intent.putExtra("appointment_id", appointment.getId()); startActivity(intent);
        });
        recyclerAppointments.setAdapter(adapter);

        setupStatusFilter();
        setupDateFilter();

        loadAppointments();
    }

    private void setupStatusFilter() {
        chipGroupStatus.setOnCheckedChangeListener((group, checkedId) -> {
            if (checkedId == -1) {
                selectedStatus = "all";
            } else {
                Chip chip = findViewById(checkedId);
                selectedStatus = chip.getText().toString().toLowerCase();
            }
            applyFilters();
        });
    }

    private void setupDateFilter() {
        etDateFilter.setOnClickListener(v -> {
            Calendar cal = Calendar.getInstance();
            DatePickerDialog dpd = new DatePickerDialog(BookingListActivity.this,
                    (view, year, month, dayOfMonth) -> {
                        month += 1;
                        selectedDate = String.format("%04d-%02d-%02d", year, month, dayOfMonth);
                        etDateFilter.setText(selectedDate);
                        applyFilters();
                    },
                    cal.get(Calendar.YEAR), cal.get(Calendar.MONTH), cal.get(Calendar.DAY_OF_MONTH));
            dpd.show();
        });
    }

    private void loadAppointments() {
        progressLoading.setVisibility(View.VISIBLE);

        recyclerAppointments.setVisibility(View.GONE); // Ẩn list khi đang tải
        tvEmptyList.setVisibility(View.GONE);         // Ẩn thông báo rỗng khi đang tải

        ApiService apiService = ApiClient.getClient(this).create(ApiService.class);
        apiService.getAppointmentsByUser().enqueue(new Callback<List<Appointment>>() {
            @Override
            public void onResponse(@NonNull Call<List<Appointment>> call, @NonNull Response<List<Appointment>> response) {
                progressLoading.setVisibility(View.GONE);
                if (response.isSuccessful() && response.body() != null) {
                    allAppointments = response.body();
                    applyFilters(); // Hàm này xử lý hiển thị list hoặc thông báo rỗng
                } else {
                    // Xử lý lỗi API (vd: 404, 500)
                    tvEmptyList.setText("Failed to load appointments");
                    tvEmptyList.setVisibility(View.VISIBLE);
                    // ------------------
                }
            }

            @Override
            public void onFailure(@NonNull Call<List<Appointment>> call, @NonNull Throwable t) {
                progressLoading.setVisibility(View.GONE);
                // Xử lý lỗi kết nối
                tvEmptyList.setText("Error: " + t.getMessage());
                tvEmptyList.setVisibility(View.VISIBLE);
                // ------------------
            }
        });
    }

    private void applyFilters() {
        List<Appointment> filtered = new ArrayList<>();
        for (Appointment appt : allAppointments) {
            boolean statusMatch = selectedStatus.equals("all") || appt.getStatus().equalsIgnoreCase(selectedStatus);

            boolean dateMatch = true;
            if (!selectedDate.isEmpty()) {
                // Thêm kiểm tra null để tránh crash
                if (appt.getScheduledAt() != null && appt.getScheduledAt().length() >= 10) {
                    String apptDate = appt.getScheduledAt().substring(0, 10); // yyyy-MM-dd
                    dateMatch = apptDate.equals(selectedDate);
                } else {
                    dateMatch = false; // Không có ngày thì không match
                }
            }

            if (statusMatch && dateMatch) filtered.add(appt);
        }
        adapter.updateList(filtered);

        // Logic để hiển thị list hoặc thông báo rỗng
        if (filtered.isEmpty()) {
            recyclerAppointments.setVisibility(View.GONE);
            tvEmptyList.setVisibility(View.VISIBLE);

            // Hiển thị thông báo dựa trên ngữ cảnh
            if (allAppointments.isEmpty()) {
                // Nếu danh sách gốc đã rỗng
                tvEmptyList.setText("You have no appointments yet.");
            } else {
                // Nếu danh sách gốc có nhưng bị lọc hết
                tvEmptyList.setText("No appointments match your filter.");
            }
        } else {
            recyclerAppointments.setVisibility(View.VISIBLE);
            tvEmptyList.setVisibility(View.GONE);
        }
    }
}