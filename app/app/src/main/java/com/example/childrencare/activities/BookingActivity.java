package com.example.childrencare.activities;

import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.childrencare.R;
import com.example.childrencare.api.ApiClient;
import com.example.childrencare.api.ApiService;
import com.example.childrencare.model.Appointment;
import com.example.childrencare.utils.TokenManager;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class BookingActivity extends AppCompatActivity {

    Spinner spDoctor;
    EditText etService, etDateTime;
    Button btnBook;
    TokenManager tokenManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_booking);

        spDoctor = findViewById(R.id.sp_doctor);
        etService = findViewById(R.id.et_service);
        etDateTime = findViewById(R.id.et_datetime);
        btnBook = findViewById(R.id.btn_book);

        tokenManager = new TokenManager(this);

        btnBook.setOnClickListener(v -> bookAppointment());
    }

    private void bookAppointment() {
        String doctorId = spDoctor.getSelectedItem().toString(); // TODO: map to doctorId
        String service = etService.getText().toString();
        String dateTime = etDateTime.getText().toString();

        Appointment appointment = new Appointment();
        appointment.setDoctorId(doctorId);
        appointment.setService(service);
        appointment.setDateTime(dateTime);
        appointment.setUserId("USER_ID"); // TODO: lấy từ login

        ApiService apiService = ApiClient.getClient(this).create(ApiService.class);
        apiService.createAppointment(appointment).enqueue(new Callback<Appointment>() {
            @Override
            public void onResponse(Call<Appointment> call, Response<Appointment> response) {
                if (response.isSuccessful() && response.body() != null) {
                    Toast.makeText(BookingActivity.this, "Appointment booked", Toast.LENGTH_SHORT).show();
                } else {
                    Toast.makeText(BookingActivity.this, "Booking failed", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<Appointment> call, Throwable t) {
                Toast.makeText(BookingActivity.this, t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }
}
