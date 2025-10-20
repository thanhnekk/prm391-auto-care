package com.example.childrencare.activities;

import android.content.Intent;
import android.nfc.Tag;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.util.Log;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.TextView;
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
import com.example.childrencare.singleton.BookingSession;

public class DoctorListActivity extends AppCompatActivity {

    RecyclerView recyclerDoctors;
    DoctorAdapter adapter;
    EditText etSearchDoctor;
    TextView tvServiceDescription;
    TextView tvServiceName;
    TextView tvServicePrice;
    private ImageView ivBackArrow;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_doctor_list);

        recyclerDoctors = findViewById(R.id.recycler_doctors);
        recyclerDoctors.setLayoutManager(new LinearLayoutManager(this));

        etSearchDoctor = findViewById(R.id.et_search_doctor);
        tvServiceDescription = findViewById(R.id.tv_service_description);
        tvServiceName = findViewById(R.id.tv_selected_service_name);
        tvServicePrice = findViewById(R.id.tv_selected_service_price);
        ivBackArrow = findViewById(R.id.iv_back_arrow);
        ivBackArrow.setOnClickListener(v -> finish());
        if (BookingSession.getInstance().getSelectedService() == null) {
            Log.e("DoctorListActivity", "Selected service is null!");
        }

        if (BookingSession.getInstance().getSelectedService() != null) {
            tvServiceName.setText(BookingSession.getInstance().getSelectedService().getName());
            tvServiceDescription.setText(BookingSession.getInstance().getSelectedService().getDescription());
            double price = BookingSession.getInstance().getSelectedService().getPrice();
            tvServicePrice.setText(String.format("%,.0f VND", price));
        }

        String serviceId = BookingSession.getInstance().getSelectedService().getId();
        String serviceName = getIntent().getStringExtra("service_name");
        double servicePrice = getIntent().getDoubleExtra("service_price",0);
        String serviceDescription = BookingSession.getInstance().getSelectedService().getDescription();

        // Hiển thị mô tả service
        tvServiceDescription.setText(serviceDescription);

        loadDoctors(serviceId);

        // Filter khi nhập search
        etSearchDoctor.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) { }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                if (adapter != null) {
                    adapter.filter(s.toString());
                }
            }

            @Override
            public void afterTextChanged(Editable s) { }
        });
    }

    private void loadDoctors(String serviceId) {
        if (serviceId == null || serviceId.isEmpty()) return;

        ApiService apiService = ApiClient.getClient(this).create(ApiService.class);
        Call<List<Doctor>> call = apiService.getDoctorsByService(serviceId);
        call.enqueue(new Callback<List<Doctor>>() {
            @Override
            public void onResponse(@NonNull Call<List<Doctor>> call, @NonNull Response<List<Doctor>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    List<Doctor> doctors = response.body();
                    adapter = new DoctorAdapter(doctors, serviceId, doctor -> {
                        BookingSession.getInstance().setSelectedDoctor(doctor);
                        Intent intent = new Intent(DoctorListActivity.this, SlotSelectActivity.class);
                        intent.putExtra("doctor_id", doctor.getId());
                        intent.putExtra("doctor_name", doctor.getName());
                        intent.putExtra("service_name", BookingSession.getInstance().getSelectedService().getName());
                        intent.putExtra("service_price", BookingSession.getInstance().getSelectedService().getPrice());
                        startActivity(intent);
                    });
                    recyclerDoctors.setAdapter(adapter);
                }
            }

            @Override
            public void onFailure(@NonNull Call<List<Doctor>> call, @NonNull Throwable t) { }
        });
    }
}
