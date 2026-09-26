package com.pelisdark.dto;

import jakarta.validation.constraints.*;

public final class Requests {
    private Requests() {}
    public record Credentials(@NotBlank @Email @Size(max=254) String email,
                              @NotBlank @Size(min=12,max=64) String password) {}
    public record Verification(@NotBlank @Pattern(regexp="[a-f0-9-]{36}") String challengeId,
                               @NotBlank @Pattern(regexp="[0-9]{6}") String code) {}
    public record ProfileInput(@NotBlank @Size(max=40) String name,
                               @NotBlank @Pattern(regexp="#(?:e43d52|22b8a0|ecbb53|639cf4)") String color,
                               @NotBlank @Pattern(regexp="es|en") String language, boolean spoilers) {}
    public record Rating(@Min(1) @Max(5) int score) {}
    public record PasswordChange(@NotBlank @Size(max=64) String currentPassword,
                                 @NotBlank @Size(min=12,max=64) String newPassword) {}
}
