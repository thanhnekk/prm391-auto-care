package com.example.childrencare.activities;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.childrencare.R;
import com.example.childrencare.adapter.AppointmentAdapter;
import com.example.childrencare.api.ApiClient;
import com.example.childrencare.api.ApiService;
import com.example.childrencare.model.Appointment;
import com.example.childrencare.utils.TokenManager;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class BookingListActivity extends AppCompatActivity {

    private ApiService apiService;
    private TokenManager tokenManager;

    private RecyclerView recyclerAppointments;
    private ProgressBar progressLoading;
    private TextView tvTitle;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_booking_list);

        apiService = ApiClient.getClient(this).create(ApiService.class);
        tokenManager = new TokenManager(this);

        recyclerAppointments = findViewById(R.id.recycler_appointments);
        progressLoading = findViewById(R.id.progress_loading);
        tvTitle = findViewById(R.id.tv_title);

        recyclerAppointments.setLayoutManager(new LinearLayoutManager(this));

        tvTitle.setText("My Appointments");

        loadAppointments();
    }

    private void loadAppointments() {
        progressLoading.setVisibility(View.VISIBLE);

        Call<List<Appointment>> call = apiService.getAppointmentsByUser();
        call.enqueue(new Callback<List<Appointment>>() {
            @Override
            public void onResponse(@NonNull Call<List<Appointment>> call, @NonNull Response<List<Appointment>> response) {
                progressLoading.setVisibility(View.GONE);
                if (response.isSuccessful() && response.body() != null) {
                    List<Appointment> appointments = response.body();
                    if (appointments.isEmpty()) {
                        Toast.makeText(BookingListActivity.this, "Bạn chưa có lịch khám nào", Toast.LENGTH_SHORT).show();
                    }

                    AppointmentAdapter adapter = new AppointmentAdapter(appointments, appointment -> {
                        // Khi click item → mở BookingDetailActivity
                        Intent intent = new Intent(BookingListActivity.this, BookingDetailActivity.class);
                        intent.putExtra("appointment_id", appointment.getId());
                        startActivity(intent);
                    });

                    recyclerAppointments.setAdapter(adapter);

                } else {
                    Toast.makeText(BookingListActivity.this, "Lỗi tải danh sách: " + response.code(), Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(@NonNull Call<List<Appointment>> call, @NonNull Throwable t) {
                progressLoading.setVisibility(View.GONE);
                Toast.makeText(BookingListActivity.this, "Lỗi kết nối: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }
}
