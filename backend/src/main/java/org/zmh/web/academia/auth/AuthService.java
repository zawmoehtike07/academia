package org.zmh.web.academia.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zmh.web.academia.auth.AuthDto.*;
import org.zmh.web.academia.exception.BadRequestException;
import org.zmh.web.academia.security.JwtUtils;
import org.zmh.web.academia.security.UserPrincipal;
import org.zmh.web.academia.user.User;
import org.zmh.web.academia.user.UserRepository;
import org.zmh.web.academia.user.preference.UserPreference;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByUsername(req.username())) {
            throw new BadRequestException("Username already taken: " + req.username());
        }
        if (userRepository.existsByEmail(req.email())) {
            throw new BadRequestException("Email already in use: " + req.email());
        }

        User user = User.builder()
                .username(req.username())
                .email(req.email())
                .password(passwordEncoder.encode(req.password()))
                .build();

        UserPreference pref = UserPreference.builder()
                .user(user)
                .pomodoroStudyMinutes(25)
                .pomodoroBreakMinutes(5)
                .build();

        user.setPreference(pref);
        userRepository.save(user);

        String token = jwtUtils.generateTokenFromUsername(user.getUsername());
        return new AuthResponse(token, user.getUsername(), user.getEmail());
    }

    public AuthResponse login(LoginRequest req) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.username(), req.password()));
        String token = jwtUtils.generateToken(authentication);
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return new AuthResponse(token, principal.getUsername(), principal.getEmail());
    }

    @Transactional(readOnly = true)
    public ProfileResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found"));
        return toProfileResponse(user);
    }

    @Transactional
    public ProfileResponse updateProfile(Long userId, UpdateProfileRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found"));

        if (req.username() != null && !req.username().equals(user.getUsername())) {
            if (userRepository.existsByUsername(req.username())) {
                throw new BadRequestException("Username already taken");
            }
            user.setUsername(req.username());
        }
        if (req.email() != null && !req.email().equals(user.getEmail())) {
            if (userRepository.existsByEmail(req.email())) {
                throw new BadRequestException("Email already in use");
            }
            user.setEmail(req.email());
        }
        userRepository.save(user);
        return toProfileResponse(user);
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found"));

        if (!passwordEncoder.matches(req.currentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(req.newPassword()));
        userRepository.save(user);
    }

    @Transactional
    public ProfileResponse updatePreferences(Long userId, UpdatePreferencesRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found"));
        UserPreference pref = user.getPreference();
        pref.setPomodoroStudyMinutes(req.pomodoroStudyMinutes());
        pref.setPomodoroBreakMinutes(req.pomodoroBreakMinutes());
        userRepository.save(user);
        return toProfileResponse(user);
    }

    private ProfileResponse toProfileResponse(User user) {
        return new ProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getCreatedAt().toString(),
                user.getPreference().getPomodoroStudyMinutes(),
                user.getPreference().getPomodoroBreakMinutes()
        );
    }
}
