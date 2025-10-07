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
import com.example.childrencare.adapter.ServiceAdapter;
import com.example.childrencare.api.ApiClient;
import com.example.childrencare.api.ApiService;
import com.example.childrencare.model.ServiceType;
import com.example.childrencare.singleton.BookingSession;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ServiceListActivity extends AppCompatActivity {

    private RecyclerView recyclerServices;
    private ServiceAdapter adapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_service_list);

        recyclerServices = findViewById(R.id.recycler_services);
        recyclerServices.setLayoutManager(new LinearLayoutManager(this));

        loadAllServices();
    }

    private void loadAllServices() {
        ApiService apiService = ApiClient.getClient(this).create(ApiService.class);
        Call<List<ServiceType>> call = apiService.getAllServiceTypes();

        call.enqueue(new Callback<>() {
            @Override
            public void onResponse(@NonNull Call<List<ServiceType>> call, @NonNull Response<List<ServiceType>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    List<ServiceType> services = response.body();

                    adapter = new ServiceAdapter(services, service -> {
                        Log.d("ServiceListActivity", "Clicked service: " + service.getName() + ", id=" + service.getId());
                        BookingSession.getInstance().setSelectedService(service);
                        Intent intent = new Intent(ServiceListActivity.this, DoctorListActivity.class);
                        intent.putExtra("service_id", service.getId());
                        intent.putExtra("service_name", service.getName());
                        intent.putExtra("service_price", service.getPrice());
                        startActivity(intent);
                    });

                    recyclerServices.setAdapter(adapter);
                } else {
                    Toast.makeText(ServiceListActivity.this, "Failed to load services", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(@NonNull Call<List<ServiceType>> call, @NonNull Throwable t) {
                Toast.makeText(ServiceListActivity.this, "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }
}
