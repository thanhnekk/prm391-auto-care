package com.example.childrencare.activities;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.Toast;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.childrencare.R;
import com.example.childrencare.adapter.SlotAdapter;
import com.example.childrencare.api.ApiClient;
import com.example.childrencare.api.ApiService;
import com.example.childrencare.model.Slot;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.datepicker.MaterialDatePicker;
import com.google.android.material.textfield.TextInputEditText;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Locale;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import com.example.childrencare.singleton.BookingSession;
import androidx.recyclerview.widget.GridLayoutManager;

public class SlotSelectActivity extends AppCompatActivity {

    private RecyclerView recyclerSlots;
    private SlotAdapter adapter;
    private TextInputEditText etDate;
    private Button btnBook;
    private TextView tvServiceName, tvDoctorName;
    private ImageView ivBackArrow;
    private String selectedDate;
    private String selectedSlotTime;
    private String doctorId, serviceName, doctorName;
    private String servicePrice;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_slot_select);

        // Views
        recyclerSlots = findViewById(R.id.recycler_slots);
        etDate = findViewById(R.id.et_date);
        btnBook = findViewById(R.id.btn_book);
        tvServiceName = findViewById(R.id.tv_service_name);
        tvDoctorName = findViewById(R.id.tv_doctor_name);
        ivBackArrow = findViewById(R.id.iv_back_arrow);
        recyclerSlots.setLayoutManager(new LinearLayoutManager(this));

        // Nhận dữ liệu từ Intent
        doctorId = BookingSession.getInstance().getSelectedDoctor().getId();
        serviceName = getIntent().getStringExtra("service_name");
        doctorName = getIntent().getStringExtra("doctor_name");
        servicePrice = getIntent().getStringExtra("service_price");
        tvServiceName.setText("Service: " + (serviceName != null ? serviceName : "N/A"));
        tvDoctorName.setText("Doctor: " + (doctorName != null ? doctorName : "N/A"));

        setupDatePicker();
        setupBookButton();
        ivBackArrow.setOnClickListener(v -> finish());
    }

    private void setupDatePicker() {
        etDate.setOnClickListener(v -> {
            MaterialDatePicker<Long> datePicker = MaterialDatePicker.Builder.datePicker()
                    .setTitleText("Select Appointment Date")
                    .setSelection(MaterialDatePicker.todayInUtcMilliseconds())
                    .build();

            datePicker.addOnPositiveButtonClickListener(selection -> {
                @SuppressLint("SimpleDateFormat")
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
                selectedDate = sdf.format(new Date(selection));
                etDate.setText(selectedDate);
                loadSlots(doctorId, selectedDate);
            });

            datePicker.show(getSupportFragmentManager(), "DATE_PICKER");
        });
    }

    private void setupBookButton() {
        btnBook.setOnClickListener(v -> {
            if (selectedSlotTime == null) {
                Toast.makeText(this, "Please select a slot first!", Toast.LENGTH_SHORT).show();
                return;
            }

            // Tách giờ bắt đầu từ slot
            Intent intent = new Intent(SlotSelectActivity.this, PaymentActivity.class);
            intent.putExtra("doctor_id", doctorId);
            intent.putExtra("service_name", serviceName);
            intent.putExtra("doctor_name", doctorName);
            intent.putExtra("date", selectedDate);
            intent.putExtra("time", selectedSlotTime);
            intent.putExtra("service_price", servicePrice);
            startActivity(intent);
        });
    }


    private void loadSlots(String doctorId, String date) {
        ApiService apiService = ApiClient.getClient(this).create(ApiService.class);
        Call<List<Slot>> call = apiService.getDoctorSlots(doctorId, date);

        call.enqueue(new Callback<>() {
            @Override
            public void onResponse(@NonNull Call<List<Slot>> call, @NonNull Response<List<Slot>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    List<Slot> slots = response.body();
                    Log.e("SLOT_DEBUG", "Received slots: " + slots.size());
                    adapter = new SlotAdapter(SlotSelectActivity.this, slots, slot -> {
                        selectedSlotTime = slot.getStartTime() + " - " + slot.getEndTime();
                        Toast.makeText(SlotSelectActivity.this, "Selected: " + selectedSlotTime, Toast.LENGTH_SHORT).show();
                        btnBook.setEnabled(true);
                    });

                    recyclerSlots.setAdapter(adapter);
                } else {
                    Toast.makeText(SlotSelectActivity.this, "No available slots for this date", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(@NonNull Call<List<Slot>> call, @NonNull Throwable t) {
                Toast.makeText(SlotSelectActivity.this, "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }
}
