package com.example.childrencare.activities;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.childrencare.R;
import com.example.childrencare.adapter.DoctorAdapter;
import com.example.childrencare.api.ApiClient;
import com.example.childrencare.api.ApiService;
import com.example.childrencare.model.Doctor;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class DoctorListActivity extends AppCompatActivity {

    RecyclerView recyclerDoctors;
    DoctorAdapter adapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Log.e("DoctorListActivity", "onCreate start");
        setContentView(R.layout.activity_doctor_list);

        recyclerDoctors = findViewById(R.id.recycler_doctors);
        recyclerDoctors.setLayoutManager(new LinearLayoutManager(this));

        String serviceId = getIntent().getStringExtra("service_id");

        loadDoctors(serviceId);
    }

    private void loadDoctors(String serviceId) {
        if (serviceId == null || serviceId.isEmpty()) {
            Toast.makeText(this, "Service ID is null or empty!", Toast.LENGTH_SHORT).show();
            Log.e("DoctorListActivity", "Service ID null or empty!");
            return;
        }

        Log.d("DoctorListActivity", "Calling API with serviceId: " + serviceId);

        ApiService apiService = ApiClient.getClient(this).create(ApiService.class);
        Call<List<Doctor>> call = apiService.getDoctorsByService(serviceId);

        call.enqueue(new Callback<List<Doctor>>() {
            @Override
            public void onResponse(@NonNull Call<List<Doctor>> call, @NonNull Response<List<Doctor>> response) {
                Log.d("DoctorListActivity", "API Response code: " + response.code());
                if (response.isSuccessful() && response.body() != null) {
                    List<Doctor> doctors = response.body();
                    Log.d("DoctorListActivity", "Doctors received: " + doctors.size());

                    adapter = new DoctorAdapter(doctors, serviceId, doctor -> {
                        Intent intent = new Intent(DoctorListActivity.this, SlotSelectActivity.class);
                        intent.putExtra("doctor_id", doctor.getId());
                        startActivity(intent);
                    });
                    recyclerDoctors.setAdapter(adapter);
                } else {
                    Log.e("DoctorListActivity", "Failed to load doctors, response body: " + response.errorBody());
                    Toast.makeText(DoctorListActivity.this, "Failed to load doctors", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<List<Doctor>> call, Throwable t) {
                Log.e("DoctorListActivity", "API call failed: " + t.getMessage(), t);
                Toast.makeText(DoctorListActivity.this, "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

}
