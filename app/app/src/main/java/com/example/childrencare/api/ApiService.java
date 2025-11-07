package com.example.childrencare.api;

import com.example.childrencare.model.*;
import com.google.gson.JsonObject;

import java.util.List;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Path;
import retrofit2.http.Query;

public interface ApiService {

    // Auth
    @POST("users/") // Đăng ký
    Call<User> register(@Body User user);

    @POST("auth/login") // Đăng nhập
    Call<AuthResponse> login(@Body User user);

    @POST("auth/logout") //Đăng xuất
    Call<AuthResponse> logout(@Body User user);

    @POST("auth/refresh-token") //Refresh Token
    Call<AuthResponse> refreshToken(@Body RefreshRequest refreshRequest);

    //User
    @GET("users/by-email") // Lấy thông tin user by email( Hiện ở main, profile,...)
    Call<User> getUserDetail();


    // Doctor
    @GET("doctor") // Lấy tất cả các doctor( admin)
    Call<List<Doctor>> getDoctors();

    @GET("doctor/{id}") // Lấy thông tin doctor by id
    Call<Doctor> getDoctorDetail(@Path("id") String id);

    // Appointment
    @POST("appointments") // Tạo lịch khám
    Call<CreateAppointmentResponse> createAppointment(@Body AppointmentRequest appointment);

    @GET("appointments/my") // Lấy thông tin lịch khám của user, sửa thành không tham số, dùng jwt tự động
    Call<List<Appointment>> getAppointmentsByUser();

    // Lấy appointment theo id, chỉ user sở hữu mới xem được
    @GET("appointments/{id}")
    Call<Appointment> getAppointmentByIdWithAuth(@Path("id") String appointmentId);

    @GET("appointments/slots/{doctorId}") // Check slot trống của doctor by id và date
    Call<List<Slot>> getDoctorSlots(@Path("doctorId") String doctorId, @Query("date") String date);

    // Thanh toán appointment VNPay thành công
    @POST("appointments/{id}/pay")
    Call<JsonObject> payAppointment(@Path("id") String appointmentId);
    // Thanh toán lại appointment VNPay
    @POST("appointments/{id}/repay")
    Call<JsonObject> repayAppointment(@Path("id") String appointmentId);
    // Hủy apm
    @POST("appointments/{id}/cancel")
    Call<JsonObject> cancelAppointment(@Path("id") String appointmentId);

    // Prescription
    @GET("prescriptions/by-appointment/{appointmentId}")
    Call<Prescription> getPrescriptionByAppointment(
            @Path("appointmentId") String appointmentId
    );
    // ===== ServiceType API (user-accessible) =====
    @GET("servicetypes") // Lấy list service của hệ thống
    Call<List<ServiceType>> getAllServiceTypes();

    @GET("servicetypes/{id}") // Xem thông tin chi tiết service
    Call<ServiceType> getServiceTypeById(@Path("id") String id);

    @GET("doctors/by-service/{serviceId}") // Lấy list doctor bởi service id
    Call<List<Doctor>> getDoctorsByService(@Path("serviceId") String serviceId);
}
