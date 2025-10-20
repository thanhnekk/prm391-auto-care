package com.example.childrencare.adapter;

import android.annotation.SuppressLint;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.example.childrencare.R;
import com.example.childrencare.model.ServiceType;

import java.text.NumberFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class ServiceAdapter extends RecyclerView.Adapter<ServiceAdapter.ServiceViewHolder> {

    public interface OnServiceClickListener {
        void onServiceClick(ServiceType service);
    }

    private List<ServiceType> serviceList;        // danh sách hiển thị
    private List<ServiceType> serviceListFull;    // danh sách gốc
    private OnServiceClickListener listener;

    public ServiceAdapter(List<ServiceType> serviceList, OnServiceClickListener listener) {
        this.serviceList = serviceList;
        this.serviceListFull = new ArrayList<>(serviceList); // copy để filter
        this.listener = listener;
    }

    @NonNull
    @Override
    public ServiceViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_service, parent, false);
        return new ServiceViewHolder(view);
    }

    @SuppressLint("SetTextI18n")
    @Override
    public void onBindViewHolder(@NonNull ServiceViewHolder holder, int position) {
        ServiceType service = serviceList.get(position);
        NumberFormat formatter = NumberFormat.getInstance(new Locale("vi", "VN"));
        String priceString = formatter.format(service.getPrice()) + " VND";

        holder.tvName.setText(service.getName());
        holder.tvDescription.setText(service.getDescription());
        holder.tvPrice.setText(priceString);

        Glide.with(holder.imgService.getContext())
                .load(service.getImageUrl())
                .placeholder(R.drawable.ic_launcher_background)
                .into(holder.imgService);

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

    // -----------------------------
    // Filter theo tên service
    // -----------------------------
    public void filter(String query) {
        query = query.toLowerCase().trim();
        serviceList.clear();
        if (query.isEmpty()) {
            serviceList.addAll(serviceListFull);
        } else {
            for (ServiceType service : serviceListFull) {
                if (service.getName().toLowerCase().contains(query)) {
                    serviceList.add(service);
                }
            }
        }
        notifyDataSetChanged();
    }

    static class ServiceViewHolder extends RecyclerView.ViewHolder {
        TextView tvName, tvDescription, tvPrice;
        ImageView imgService;

        public ServiceViewHolder(@NonNull View itemView) {
            super(itemView);
            tvName = itemView.findViewById(R.id.tv_service_name);
            tvDescription = itemView.findViewById(R.id.tv_service_description);
            tvPrice = itemView.findViewById(R.id.tv_service_price);
            imgService = itemView.findViewById(R.id.img_service);
        }
    }
}
