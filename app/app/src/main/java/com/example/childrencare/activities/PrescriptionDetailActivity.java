package com.example.childrencare.activities;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import android.os.Bundle;
import android.util.Log;
import android.widget.TextView;
import android.widget.Toast;

import com.example.childrencare.R;
import com.example.childrencare.adapter.MedicineAdapter;
import com.example.childrencare.api.ApiClient;
import com.example.childrencare.api.ApiService;
import com.example.childrencare.model.Prescription;
import com.example.childrencare.utils.TokenManager;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class PrescriptionDetailActivity extends AppCompatActivity {

    private Toolbar toolbar;
    private TextView tvDoctorName, tvPrescriptionDate, tvNotes;
    private RecyclerView rvMedicines;
    private MedicineAdapter medicineAdapter;
    private ArrayList<com.example.childrencare.model.MedicineItem> medicineList;

    private ApiService apiService;
    private TokenManager tokenManager;
    private String appointmentId;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_prescription_detail);

        // Lấy appointmentId từ Intent
        appointmentId = getIntent().getStringExtra("APPOINTMENT_ID");
        if (appointmentId == null) {
            Toast.makeText(this, "Không có ID lịch hẹn", Toast.LENGTH_SHORT).show();
            finish();
            return;
        }

        // Khởi tạo APIService
        tokenManager = new TokenManager(this);
        apiService = ApiClient.getClient(this).create(ApiService.class);

        // Ánh xạ Views
        toolbar = findViewById(R.id.toolbarPrescriptionDetail);
        tvDoctorName = findViewById(R.id.tvDoctorName);
        tvPrescriptionDate = findViewById(R.id.tvPrescriptionDate);
        tvNotes = findViewById(R.id.tvNotes);
        rvMedicines = findViewById(R.id.rvMedicines);

        // Setup Toolbar
        setSupportActionBar(toolbar);
        if(getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        }
        toolbar.setNavigationOnClickListener(v -> onBackPressed());

        // Setup RecyclerView
        medicineList = new ArrayList<>();
        medicineAdapter = new MedicineAdapter(medicineList, this);
        rvMedicines.setLayoutManager(new LinearLayoutManager(this));
        rvMedicines.setAdapter(medicineAdapter);

        // Tải dữ liệu đơn thuốc
        fetchPrescriptionData();
    }

    private void fetchPrescriptionData() {
        apiService.getPrescriptionByAppointment(appointmentId)
                .enqueue(new Callback<Prescription>() {
                    @Override
                    public void onResponse(Call<Prescription> call, Response<Prescription> response) {
                        if (response.isSuccessful() && response.body() != null) {
                            Prescription prescription = response.body();
                            bindDataToViews(prescription);
                        } else {
                            Toast.makeText(PrescriptionDetailActivity.this, "Không tìm thấy đơn thuốc", Toast.LENGTH_SHORT).show();
                        }
                    }

                    @Override
                    public void onFailure(Call<Prescription> call, Throwable t) {
                        Log.e("PrescriptionDetail", "Error fetching prescription", t);
                        Toast.makeText(PrescriptionDetailActivity.this, "Lỗi: " + t.getMessage(), Toast.LENGTH_SHORT).show();
                    }
                });
    }

    private void bindDataToViews(Prescription prescription) {
        tvDoctorName.setText(prescription.getDoctorName());
        tvPrescriptionDate.setText(formatDate(prescription.getCreatedAt()));

        if (prescription.getNotes() != null && !prescription.getNotes().isEmpty()) {
            tvNotes.setText(prescription.getNotes());
        } else {
            tvNotes.setText("No texts note.");
        }

        // Cập nhật RecyclerView
        if (prescription.getMedicines() != null && !prescription.getMedicines().isEmpty()) {
            medicineList.clear();
            medicineList.addAll(prescription.getMedicines());
            medicineAdapter.notifyDataSetChanged();
        }
    }

    private String formatDate(String isoDate) {
        if (isoDate == null || isoDate.isEmpty()) return "N/A";

        try {
            SimpleDateFormat isoFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault());
            isoFormat.setTimeZone(TimeZone.getTimeZone("UTC"));
            Date date = isoFormat.parse(isoDate);
            SimpleDateFormat displayFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.getDefault());
            return date != null ? displayFormat.format(date) : isoDate;
        } catch (ParseException e) {
            e.printStackTrace();
            return isoDate;
        }
    }
}
