package com.example.childrencare.activities;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;
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
import com.example.childrencare.singleton.BookingSession;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class MainActivity extends AppCompatActivity {

    private TokenManager tokenManager;
    private RecyclerView recyclerFeatured;
    private ServiceAdapter adapter;
    private TextView tvSeeAll;
    LinearLayout btnProfile ;
    LinearLayout btnBookNow;
    @SuppressLint("SetTextI18n")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        ApiClient.setLogoutHandler(() -> {
            Toast.makeText(MainActivity.this, "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.", Toast.LENGTH_SHORT).show();
            startActivity(new Intent(MainActivity.this, LoginActivity.class));
            finish();
        });
        // Init views
        tokenManager = new TokenManager(this);
        TextView tvGreeting = findViewById(R.id.tv_greeting);
        recyclerFeatured = findViewById(R.id.recycler_featured_services);
        tvSeeAll = findViewById(R.id.tv_see_all);
        btnProfile = findViewById(R.id.btn_profile);
        btnBookNow = findViewById(R.id.btn_book_now);

        btnProfile.setOnClickListener(v ->
                startActivity(new Intent(MainActivity.this, ProfileActivity.class))
        );

        btnBookNow.setOnClickListener(v ->
                startActivity(new Intent(MainActivity.this, ServiceListActivity.class))
        );

        checkLoginStatus();

        // Greeting
        String username = tokenManager.getUsername();
        tvGreeting.setText("Hi, " + (username != null ? username : "User") + "!");

        // Load featured services (top 3)
        loadFeaturedServices();

        // “See all” chuyển sang ServiceListActivity
        tvSeeAll.setOnClickListener(v ->
                startActivity(new Intent(MainActivity.this, ServiceListActivity.class))
        );

    }

    private void loadFeaturedServices() {
        ApiService apiService = ApiClient.getClient(this).create(ApiService.class);
        Call<List<ServiceType>> call = apiService.getAllServiceTypes();

        call.enqueue(new Callback<>() {
            @Override
            public void onResponse(@NonNull Call<List<ServiceType>> call, @NonNull Response<List<ServiceType>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    List<ServiceType> allServices = response.body();

                    // Lấy top 3
                    List<ServiceType> top3Services = new ArrayList<>();
                    for (int i = 0; i < Math.min(3, allServices.size()); i++) {
                        top3Services.add(allServices.get(i));
                    }

                    adapter = new ServiceAdapter(top3Services, service -> {
                        Log.d("MainActivity", "Clicked service: " + service.getName() + ", id=" + service.getId());
                        BookingSession.getInstance().setSelectedService(service);
                        Intent intent = new Intent(MainActivity.this, DoctorListActivity.class);
                        intent.putExtra("service_id", service.getId());
                        intent.putExtra("service_name", service.getName());
                        startActivity(intent);
                    });

                    recyclerFeatured.setLayoutManager(
                            new LinearLayoutManager(MainActivity.this, LinearLayoutManager.HORIZONTAL, false)
                    );
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
