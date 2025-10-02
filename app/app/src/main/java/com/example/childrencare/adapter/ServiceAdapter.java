package com.example.childrencare.adapter;

import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.childrencare.R;
import com.example.childrencare.model.ServiceType;

import java.util.List;

public class ServiceAdapter extends RecyclerView.Adapter<ServiceAdapter.ServiceViewHolder> {

    public interface OnServiceClickListener {
        void onServiceClick(ServiceType service);
    }

    private List<ServiceType> serviceList;
    private OnServiceClickListener listener;

    public ServiceAdapter(List<ServiceType> serviceList, OnServiceClickListener listener) {
        this.serviceList = serviceList;
        this.listener = listener;
    }

    @NonNull
    @Override
    public ServiceViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_service, parent, false);
        return new ServiceViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ServiceViewHolder holder, int position) {
        ServiceType service = serviceList.get(position);
        holder.tvName.setText(service.getName());

        holder.itemView.setOnClickListener(v -> {
            Log.e("ServiceAdapter", "Clicked service: " + service.getName() + ", id=" + service.getId());
            Toast.makeText(v.getContext(), "Clicked: " + service.getName(), Toast.LENGTH_SHORT).show();
            listener.onServiceClick(service);
        });
    }


    @Override
    public int getItemCount() {
        return serviceList.size();
    }

    static class ServiceViewHolder extends RecyclerView.ViewHolder {
        TextView tvName;
        ImageView imgService;

        public ServiceViewHolder(@NonNull View itemView) {
            super(itemView);
            tvName = itemView.findViewById(R.id.tv_service_name);
            imgService = itemView.findViewById(R.id.img_service);
        }
    }
}
