// app/src/main/java/com/example/childrencare/adapter/MedicineAdapter.java
package com.example.childrencare.adapter;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.example.childrencare.R;
import com.example.childrencare.model.MedicineItem;
import java.util.List;

public class MedicineAdapter extends RecyclerView.Adapter<MedicineAdapter.MedicineViewHolder> {

    private List<MedicineItem> medicineList;
    private Context context;

    public MedicineAdapter(List<MedicineItem> medicineList, Context context) {
        this.medicineList = medicineList;
        this.context = context;
    }

    @NonNull
    @Override
    public MedicineViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_medicine, parent, false);
        return new MedicineViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull MedicineViewHolder holder, int position) {
        MedicineItem medicine = medicineList.get(position);
        holder.tvMedicineName.setText(medicine.getName());
        holder.tvMedicineDosage.setText(medicine.getDosage());
        holder.tvMedicineDuration.setText(medicine.getDuration());
    }

    @Override
    public int getItemCount() {
        return medicineList != null ? medicineList.size() : 0;
    }

    public static class MedicineViewHolder extends RecyclerView.ViewHolder {
        TextView tvMedicineName, tvMedicineDosage, tvMedicineDuration;

        public MedicineViewHolder(@NonNull View itemView) {
            super(itemView);
            tvMedicineName = itemView.findViewById(R.id.tvMedicineName);
            tvMedicineDosage = itemView.findViewById(R.id.tvMedicineDosage);
            tvMedicineDuration = itemView.findViewById(R.id.tvMedicineDuration);
        }
    }
}