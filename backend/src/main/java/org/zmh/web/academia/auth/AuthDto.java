package org.zmh.web.academia.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDto {

    public record RegisterRequest(
            @NotBlank @Size(min = 3, max = 50) String username,
            @NotBlank @Email String email,
            @NotBlank @Size(min = 8) String password
    ) {}

    public record LoginRequest(
            @NotBlank String username,
            @NotBlank String password
    ) {}

    public record AuthResponse(String token, String username, String email) {}

    public record ProfileResponse(
            Long id,
            String username,
            String email,
            String createdAt,
            int pomodoroStudyMinutes,
            int pomodoroBreakMinutes
    ) {}

    public record UpdateProfileRequest(
            @Size(min = 3, max = 50) String username,
            @Email String email
    ) {}

    public record ChangePasswordRequest(
            @NotBlank String currentPassword,
            @NotBlank @Size(min = 8) String newPassword
    ) {}

    public record UpdatePreferencesRequest(
            int pomodoroStudyMinutes,
            int pomodoroBreakMinutes
    ) {}
}
