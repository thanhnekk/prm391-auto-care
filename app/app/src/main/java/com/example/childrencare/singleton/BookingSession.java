package com.example.childrencare.singleton;

import com.example.childrencare.model.Doctor;
import com.example.childrencare.model.ServiceType;
import com.example.childrencare.model.Slot;
import com.example.childrencare.model.User;

public class BookingSession {
    private static BookingSession instance;

    private User currentUser;
    private ServiceType selectedService;
    private Doctor selectedDoctor;
    private Slot selectedSlot;
    private String paymentMethod;  // "Cash", "Momo", "VNPay"

    private BookingSession() {}

    public static BookingSession getInstance() {
        if (instance == null) {
            instance = new BookingSession();
        }
        return instance;
    }

    public void clear() {
        selectedService = null;
        selectedDoctor = null;
        selectedSlot = null;
        paymentMethod = null;
        // currentUser giữ nguyên nếu user vẫn login
    }

    // ===== Getters & Setters =====
    public User getCurrentUser() { return currentUser; }
    public void setCurrentUser(User currentUser) { this.currentUser = currentUser; }

    public ServiceType getSelectedService() { return selectedService; }
    public void setSelectedService(ServiceType selectedService) { this.selectedService = selectedService; }

    public Doctor getSelectedDoctor() { return selectedDoctor; }
    public void setSelectedDoctor(Doctor selectedDoctor) { this.selectedDoctor = selectedDoctor; }

    public Slot getSelectedSlot() { return selectedSlot; }
    public void setSelectedSlot(Slot selectedSlot) { this.selectedSlot = selectedSlot; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public double getTotalPrice() {
        return selectedService != null ? selectedService.getPrice() : 0;
    }
}
