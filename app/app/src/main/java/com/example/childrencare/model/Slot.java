package com.example.childrencare.model;

public class Slot {
    private String startTime;
    private String endTime;
    private boolean available;

    public String getStartTime() { return startTime; }
    public String getEndTime() { return endTime; }
    public boolean isAvailable() { return available; }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }
}
