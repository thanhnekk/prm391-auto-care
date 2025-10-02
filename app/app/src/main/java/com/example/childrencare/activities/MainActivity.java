package com.example.childrencare.activities;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.childrencare.R;
import com.example.childrencare.adapter.ServiceAdapter;
import com.example.childrencare.api.ApiClient;
import com.example.childrencare.api.ApiService;
import com.example.childrencare.model.ServiceType;
import com.example.childrencare.utils.TokenManager;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class MainActivity extends AppCompatActivity {

    private TokenManager tokenManager;
    private RecyclerView recyclerFeatured;
    private ServiceAdapter adapter;

    @SuppressLint("SetTextI18n")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        // Init views
        tokenManager = new TokenManager(this);
        TextView tvGreeting = findViewById(R.id.tv_greeting);
        recyclerFeatured = findViewById(R.id.recycler_featured_services);
        Button btnBooking = findViewById(R.id.btn_booking);
        ImageView imgProfile = findViewById(R.id.img_profile);

        checkLoginStatus();

        // Set greeting
        String username = tokenManager.getUsername();
        tvGreeting.setText("Hi, " + (username != null ? username : "User") + "!");

        // Load featured services from API
        loadFeaturedServices();

        // Button actions
        btnBooking.setOnClickListener(v -> startActivity(new Intent(MainActivity.this, ServiceListActivity.class)));
        imgProfile.setOnClickListener(v -> startActivity(new Intent(MainActivity.this, ProfileActivity.class)));
    }

    private void loadFeaturedServices() {
        ApiService apiService = ApiClient.getClient(this).create(ApiService.class);
        Call<List<ServiceType>> call = apiService.getAllServiceTypes();

        call.enqueue(new Callback<>() {
            @Override
            public void onResponse(@NonNull Call<List<ServiceType>> call, @NonNull Response<List<ServiceType>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    List<ServiceType> allServices = response.body();
                    adapter = new ServiceAdapter(allServices, service -> {
                        Log.e("MainActivity", "Clicked service: " + service.getName() + ", id=" + service.getId());
                        Intent intent = new Intent(MainActivity.this, DoctorListActivity.class);
                        intent.putExtra("service_id", service.getId());
                        startActivity(intent);
                    });

                    recyclerFeatured.setLayoutManager(new LinearLayoutManager(MainActivity.this, LinearLayoutManager.HORIZONTAL, false));
                    recyclerFeatured.setAdapter(adapter);
                } else {
                    Toast.makeText(MainActivity.this, "Failed to load services", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(@NonNull Call<List<ServiceType>> call, @NonNull Throwable t) {
                Toast.makeText(MainActivity.this, "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void checkLoginStatus() {
        String token = tokenManager.getAccessToken();
        if (token == null || token.isEmpty()) {
            startActivity(new Intent(this, LoginActivity.class));
            finish();
        }
    }
}
