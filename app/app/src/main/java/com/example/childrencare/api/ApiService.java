package com.example.childrencare.api;

import com.example.childrencare.model.*;

import java.util.List;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Path;

public interface ApiService {

    // Auth
    @POST("auth/register")
    Call<User> register(@Body User user);

    @POST("auth/login")
    Call<AuthResponse> login(@Body User user);

    @POST("auth/logout")
    Call<AuthResponse> logout(@Body User user);

    @POST("auth/refresh")
    Call<AuthResponse> refreshToken(@Body RefreshRequest refreshRequest);

    //User
    @GET("users/by-email")
    Call<User> getUserDetail();

    // Doctor
    @GET("doctor")
    Call<List<Doctor>> getDoctors();

    @GET("doctor/{id}")
    Call<Doctor> getDoctorDetail(@Path("id") String id);

    // Appointment
    @POST("appointment")
    Call<Appointment> createAppointment(@Body Appointment appointment);

    @GET("appointment/user/{userId}")
    Call<List<Appointment>> getAppointmentsByUser(@Path("userId") String userId);

    // Prescription
    @GET("prescription/appointment/{appointmentId}")
    Call<List<Prescription>> getPrescriptionByAppointment(@Path("appointmentId") String appointmentId);

    // ===== ServiceType API (user-accessible) =====
    @GET("servicetypes")
    Call<List<ServiceType>> getAllServiceTypes();

    @GET("servicetypes/{id}")
    Call<ServiceType> getServiceTypeById(@Path("id") String id);

    @GET("doctors/by-service/{serviceId}")
    Call<List<Doctor>> getDoctorsByService(@Path("serviceId") String serviceId);
}
