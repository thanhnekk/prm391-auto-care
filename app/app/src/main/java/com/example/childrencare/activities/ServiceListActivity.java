package com.example.childrencare.activities;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.childrencare.R;
import com.example.childrencare.adapter.DoctorAdapter;
import com.example.childrencare.api.ApiClient;
import com.example.childrencare.api.ApiService;
import com.example.childrencare.model.Doctor;
import com.example.childrencare.utils.TokenManager;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ServiceListActivity extends AppCompatActivity {

    RecyclerView recyclerView;
    DoctorAdapter adapter;
    TokenManager tokenManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_service_list);

        recyclerView = findViewById(R.id.recycler_view);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        tokenManager = new TokenManager(this);

        fetchDoctors();
    }

    private void fetchDoctors() {
        ApiService apiService = ApiClient.getClient(this).create(ApiService.class);
        apiService.getDoctors().enqueue(new Callback<List<Doctor>>() {
            @Override
            public void onResponse(Call<List<Doctor>> call, Response<List<Doctor>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    // Tạo adapter với 2 tham số: danh sách + listener
//                    adapter = new DoctorAdapter(response.body(), new DoctorAdapter.OnItemClickListener() {
//                        @Override
//                        public void onItemClick(Doctor doctor) {
//                            Toast.makeText(ServiceListActivity.this, "Clicked: " + doctor.getName(), Toast.LENGTH_SHORT).show();
//                            // TODO: mở DoctorDetailActivity nếu muốn
//                            // Intent intent = new Intent(ServiceListActivity.this, DoctorDetailActivity.class);
//                            // intent.putExtra("doctorId", doctor.getId());
//                            // startActivity(intent);
//                        }
//                    });
                    recyclerView.setAdapter(adapter);
                } else {
                    Toast.makeText(ServiceListActivity.this, "Failed to load doctors", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<List<Doctor>> call, Throwable t) {
                Toast.makeText(ServiceListActivity.this, t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }
}
