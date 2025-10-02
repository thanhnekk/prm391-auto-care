package com.example.childrencare.utils;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Base64;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.KeyStore;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;

public class TokenManager {

    private static final String PREFS_NAME = "secure_prefs";
    private static final String KEY_ACCESS = "access_token";
    private static final String KEY_REFRESH = "refresh_token";
    private static final String KEY_USERNAME = "username"; // thêm lưu username
    private static final String ANDROID_KEYSTORE = "AndroidKeyStore";
    private static final String AES_KEY_ALIAS = "MY_AES_KEY";

    private final SharedPreferences prefs;
    private SecretKey secretKey;

    public TokenManager(Context context) {
        prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        try {
            secretKey = getOrCreateKey();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /** Tạo hoặc lấy key AES từ AndroidKeyStore */
    private SecretKey getOrCreateKey() throws GeneralSecurityException, IOException {
        KeyStore keyStore = KeyStore.getInstance(ANDROID_KEYSTORE);
        keyStore.load(null);

        if (!keyStore.containsAlias(AES_KEY_ALIAS)) {
            KeyGenerator keyGenerator = KeyGenerator.getInstance("AES", ANDROID_KEYSTORE);
            keyGenerator.init(new android.security.keystore.KeyGenParameterSpec.Builder(
                    AES_KEY_ALIAS,
                    android.security.keystore.KeyProperties.PURPOSE_ENCRYPT |
                            android.security.keystore.KeyProperties.PURPOSE_DECRYPT
            )
                    .setBlockModes(android.security.keystore.KeyProperties.BLOCK_MODE_GCM)
                    .setEncryptionPaddings(android.security.keystore.KeyProperties.ENCRYPTION_PADDING_NONE)
                    .setKeySize(256)
                    .build());
            return keyGenerator.generateKey();
        } else {
            KeyStore.SecretKeyEntry entry = (KeyStore.SecretKeyEntry) keyStore.getEntry(AES_KEY_ALIAS, null);
            return entry.getSecretKey();
        }
    }

    /** Mã hóa text */
    private String encrypt(String plainText) throws GeneralSecurityException {
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.ENCRYPT_MODE, secretKey);
        byte[] iv = cipher.getIV();
        byte[] encrypted = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));

        byte[] combined = new byte[iv.length + encrypted.length];
        System.arraycopy(iv, 0, combined, 0, iv.length);
        System.arraycopy(encrypted, 0, combined, iv.length, encrypted.length);

        return Base64.encodeToString(combined, Base64.DEFAULT);
    }

    /** Giải mã text */
    private String decrypt(String cipherText) throws GeneralSecurityException {
        byte[] combined = Base64.decode(cipherText, Base64.DEFAULT);
        byte[] iv = new byte[12];
        byte[] encrypted = new byte[combined.length - 12];

        System.arraycopy(combined, 0, iv, 0, 12);
        System.arraycopy(combined, 12, encrypted, 0, encrypted.length);

        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        GCMParameterSpec spec = new GCMParameterSpec(128, iv);
        cipher.init(Cipher.DECRYPT_MODE, secretKey, spec);

        byte[] decoded = cipher.doFinal(encrypted);
        return new String(decoded, StandardCharsets.UTF_8);
    }

    /** Lưu token (giữ nguyên hàm cũ) */
    public void saveTokens(String access, String refresh) {
        try {
            prefs.edit()
                    .putString(KEY_ACCESS, encrypt(access))
                    .putString(KEY_REFRESH, encrypt(refresh))
                    .apply();
        } catch (GeneralSecurityException e) {
            e.printStackTrace();
        }
    }

    /** Lấy access token */
    public String getAccessToken() {
        try {
            String enc = prefs.getString(KEY_ACCESS, null);
            return enc != null ? decrypt(enc) : null;
        } catch (GeneralSecurityException e) {
            e.printStackTrace();
            return null;
        }
    }

    /** Lấy refresh token */
    public String getRefreshToken() {
        try {
            String enc = prefs.getString(KEY_REFRESH, null);
            return enc != null ? decrypt(enc) : null;
        } catch (GeneralSecurityException e) {
            e.printStackTrace();
            return null;
        }
    }

    /** Lưu username (plain text, không mã hóa) */
    public void saveUsername(String username) {
        prefs.edit().putString(KEY_USERNAME, username).apply();
    }

    /** Lấy username */
    public String getUsername() {
        return prefs.getString(KEY_USERNAME, null);
    }

    /** Xóa token và username */
    public void clearTokens() {
        prefs.edit().clear().apply();
    }
}
