package com.example.childrencare.adapter;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.childrencare.R;
import com.example.childrencare.model.Appointment;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.TimeZone;

public class AppointmentAdapter extends RecyclerView.Adapter<AppointmentAdapter.ViewHolder> {

    public interface OnItemClickListener {
        void onItemClick(Appointment appointment);
    }

    private List<Appointment> appointments;
    private final OnItemClickListener listener;

    public AppointmentAdapter(List<Appointment> appointments, OnItemClickListener listener) {
        this.appointments = appointments;
        this.listener = listener;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_appointment, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Appointment appt = appointments.get(position);

        holder.tvDoctorName.setText(appt.getDoctor() != null ? appt.getDoctor().getName() : "Unknown Doctor");
        holder.tvServiceName.setText("Service: " + (appt.getService() != null ? appt.getService().getName() : "N/A"));

        String scheduledAt = appt.getScheduledAt();
        try {
            SimpleDateFormat utcFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
            utcFormat.setTimeZone(TimeZone.getTimeZone("UTC"));
            Date date = utcFormat.parse(scheduledAt);

            SimpleDateFormat localFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm");
            localFormat.setTimeZone(TimeZone.getDefault());
            holder.tvScheduledAt.setText("Date: " + localFormat.format(date));
        } catch (ParseException e) {
            holder.tvScheduledAt.setText("Date: " + scheduledAt);
            e.printStackTrace();
        }

        holder.tvStatus.setText("Status: " + appt.getStatus());

        // Set click listener cho cả item
        holder.itemView.setOnClickListener(v -> listener.onItemClick(appt));
    }

    @Override
    public int getItemCount() {
        return appointments.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvDoctorName, tvServiceName, tvScheduledAt, tvStatus;

        public ViewHolder(@NonNull View itemView) {
            super(itemView);
            tvDoctorName = itemView.findViewById(R.id.tv_doctor_name);
            tvServiceName = itemView.findViewById(R.id.tv_service_name);
            tvScheduledAt = itemView.findViewById(R.id.tv_scheduled_at);
            tvStatus = itemView.findViewById(R.id.tv_status);
        }
    }
}
