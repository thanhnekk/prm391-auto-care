// adapter/SlotAdapter.java
package com.example.childrencare.adapter;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.example.childrencare.R;
import com.example.childrencare.model.Slot;
import java.util.List;

public class SlotAdapter extends RecyclerView.Adapter<SlotAdapter.SlotViewHolder> {

    public interface SlotClickListener {
        void onSlotClick(Slot slot);
    }

    private final List<Slot> slots;
    private final SlotClickListener listener;
    private final Context context;

    public SlotAdapter(Context context, List<Slot> slots, SlotClickListener listener) {
        this.context = context;
        this.slots = slots;
        this.listener = listener;
    }

    @NonNull
    @Override
    public SlotViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_slot, parent, false);
        return new SlotViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull SlotViewHolder holder, int position) {
        Slot slot = slots.get(position);
        holder.tvTime.setText(slot.getStartTime() + " - " + slot.getEndTime());
        holder.itemView.setBackgroundColor(slot.isAvailable() ?
                context.getResources().getColor(R.color.slot_available) :
                context.getResources().getColor(R.color.slot_unavailable));
        holder.itemView.setOnClickListener(v -> {
            if (slot.isAvailable()) listener.onSlotClick(slot);
        });
    }

    @Override
    public int getItemCount() {
        return slots.size();
    }

    static class SlotViewHolder extends RecyclerView.ViewHolder {
        TextView tvTime;
        public SlotViewHolder(@NonNull View itemView) {
            super(itemView);
            tvTime = itemView.findViewById(R.id.tv_slot_time);
        }
    }
}
