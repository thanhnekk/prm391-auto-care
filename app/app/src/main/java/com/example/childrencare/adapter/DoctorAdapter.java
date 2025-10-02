package com.example.childrencare.adapter;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

//import com.bumptech.glide.Glide;
import com.example.childrencare.R;
import com.example.childrencare.model.Doctor;
import com.example.childrencare.model.ServiceType;

import java.util.ArrayList;
import java.util.List;

public class DoctorAdapter extends RecyclerView.Adapter<DoctorAdapter.DoctorViewHolder> {

    public interface OnItemClickListener {
        void onItemClick(Doctor doctor);
    }

    private final List<Doctor> doctorList;
    private final OnItemClickListener listener;
    private final String currentServiceId; // thêm để biết service đang xem

    public DoctorAdapter(List<Doctor> doctorList, String currentServiceId, OnItemClickListener listener) {
        this.doctorList = doctorList;
        this.listener = listener;
        this.currentServiceId = currentServiceId;
    }

    @NonNull
    @Override
    public DoctorViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_doctor, parent, false);
        return new DoctorViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull DoctorViewHolder holder, int position) {
        Doctor doctor = doctorList.get(position);

        // Hiển thị tên
        holder.tvName.setText(doctor.getName());

        // Hiển thị chuyên khoa
        holder.tvSpecialty.setText("Specialization: " + (doctor.getSpecialization() != null ? doctor.getSpecialization() : "N/A"));
        holder.tvExperience.setText(
                doctor.getExperience() + " years experience"
        );
        // Load avatar nếu có URL
//        Glide.with(holder.itemView.getContext())
//                .load(doctor.getUser() != null ? doctor.getUser().getAvatarUrl() : null)
//                .placeholder(R.drawable.ic_person)
//                .circleCrop()
//                .into(holder.imgAvatar);

        // Lấy danh sách "Other Services"
        List<String> otherServiceNames = new ArrayList<>();
        if (doctor.getServiceTypes() != null) {
            for (ServiceType s : doctor.getServiceTypes()) {
                if (s.getId() != null && !s.getId().equals(currentServiceId)) {
                    otherServiceNames.add(s.getName());
                }
            }
        }

        // Nếu có dịch vụ khác thì hiển thị, ngược lại ẩn
        if (!otherServiceNames.isEmpty()) {
            holder.tvOtherServices.setVisibility(View.VISIBLE);
            holder.tvOtherServices.setText("Other Services: " + String.join(", ", otherServiceNames));
        } else {
            holder.tvOtherServices.setVisibility(View.GONE);
        }

        // Xử lý click
        holder.itemView.setOnClickListener(v -> listener.onItemClick(doctor));
    }

    @Override
    public int getItemCount() {
        return doctorList != null ? doctorList.size() : 0;
    }

    static class DoctorViewHolder extends RecyclerView.ViewHolder {
        TextView tvName, tvSpecialty, tvOtherServices, tvExperience;
        ImageView imgAvatar;

        public DoctorViewHolder(@NonNull View itemView) {
            super(itemView);
            tvName = itemView.findViewById(R.id.tv_doctor_name);
            tvSpecialty = itemView.findViewById(R.id.tv_doctor_specialty);
            tvExperience = itemView.findViewById(R.id.tv_doctor_experience);
            tvOtherServices = itemView.findViewById(R.id.tv_other_services);
            imgAvatar = itemView.findViewById(R.id.img_doctor_avatar);
        }
    }
}
