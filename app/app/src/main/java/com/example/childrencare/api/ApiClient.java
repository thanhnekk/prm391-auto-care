package com.example.childrencare.api;

import android.content.Context;
import android.util.Log;

import com.example.childrencare.model.AuthResponse;
import com.example.childrencare.model.RefreshRequest;
import com.example.childrencare.utils.TokenManager;

import java.io.IOException;

import okhttp3.Interceptor;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.logging.HttpLoggingInterceptor;
import retrofit2.Call;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class ApiClient {

    private static final String BASE_URL = "https://prm391-auto-care.onrender.com/childrencare/";
    private static final String TAG = "ApiClient";
    private static Retrofit retrofit;

    private static LogoutHandler logoutHandler;

    public interface LogoutHandler {
        void onLogout();
    }

    public static void setLogoutHandler(LogoutHandler handler) {
        logoutHandler = handler;
    }

    private static void forceLogout(TokenManager tokenManager) {
        tokenManager.clearTokens();
        if (logoutHandler != null) {
            new android.os.Handler(android.os.Looper.getMainLooper()).post(() -> logoutHandler.onLogout());
        }
    }
    public static Retrofit getClient(Context context) {
        if (retrofit == null) {
            TokenManager tokenManager = new TokenManager(context);

            HttpLoggingInterceptor logging = new HttpLoggingInterceptor();
            logging.setLevel(HttpLoggingInterceptor.Level.BODY);

            OkHttpClient client = new OkHttpClient.Builder()
                    .addInterceptor(new AuthInterceptor(context, tokenManager))
                    .addInterceptor(logging)
                    .build();

            retrofit = new Retrofit.Builder()
                    .baseUrl(BASE_URL)
                    .client(client)
                    .addConverterFactory(GsonConverterFactory.create())
                    .build();
        }
        return retrofit;
    }

    public static ApiService getApiService(Context context) {
        return getClient(context).create(ApiService.class);
    }

    // ===========================
    // 🔐 Auth Interceptor nội bộ
    // ===========================
    private static class AuthInterceptor implements Interceptor {

        private final Context context;
        private final TokenManager tokenManager;

        public AuthInterceptor(Context context, TokenManager tokenManager) {
            this.context = context;
            this.tokenManager = tokenManager;
        }

        @Override
        public Response intercept(Chain chain) throws IOException {
            Request original = chain.request();
            String accessToken = tokenManager.getAccessToken();

            // Không thêm token cho các API auth
            boolean isAuthRequest = original.url().encodedPath().contains("/auth/");
            Request.Builder builder = original.newBuilder();

            if (!isAuthRequest && accessToken != null && !accessToken.isEmpty()) {
                builder.header("Authorization", "Bearer " + accessToken);
            }

            Response response = chain.proceed(builder.build());

            // Nếu token hết hạn
            if (response.code() == 401 && !isAuthRequest) {
                Log.w(TAG, "Access token expired → trying to refresh...");

                synchronized (this) { // đảm bảo chỉ refresh 1 lần
                    String refreshToken = tokenManager.getRefreshToken();

                    if (refreshToken != null && !refreshToken.isEmpty()) {
                        ApiService authService = new Retrofit.Builder()
                                .baseUrl(BASE_URL)
                                .addConverterFactory(GsonConverterFactory.create())
                                .build()
                                .create(ApiService.class);

                        Call<AuthResponse> refreshCall = authService.refreshToken(new RefreshRequest(refreshToken));

                        try {
                            retrofit2.Response<AuthResponse> refreshResponse = refreshCall.execute();

                            if (refreshResponse.isSuccessful() && refreshResponse.body() != null) {
                                String newAccess = refreshResponse.body().getAccessToken();
                                String newRefresh = refreshResponse.body().getRefreshToken();
                                tokenManager.saveTokens(newAccess, newRefresh);
                                Log.i(TAG, "✅ Token refreshed successfully.");

                                // Gửi lại request cũ với token mới
                                Request newRequest = original.newBuilder()
                                        .removeHeader("Authorization")
                                        .addHeader("Authorization", "Bearer " + newAccess)
                                        .build();

                                response.close();
                                return chain.proceed(newRequest);
                            } else {
                                Log.e(TAG, "❌ Refresh token failed. Logging out user.");
                                ApiClient.forceLogout(tokenManager);
                            }
                        } catch (Exception e) {
                            Log.e(TAG, "Error refreshing token: " + e.getMessage(), e);
                            ApiClient.forceLogout(tokenManager);

                        }
                    } else {
                        Log.e(TAG, "No refresh token available, forcing logout.");
                        ApiClient.forceLogout(tokenManager);

                    }
                }
            }

            return response;
        }
    }
}
