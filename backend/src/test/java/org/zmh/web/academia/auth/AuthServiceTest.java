package org.zmh.web.academia.auth;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.zmh.web.academia.auth.AuthDto.*;
import org.zmh.web.academia.exception.BadRequestException;
import org.zmh.web.academia.security.JwtUtils;
import org.zmh.web.academia.security.UserPrincipal;
import org.zmh.web.academia.user.User;
import org.zmh.web.academia.user.UserRepository;
import org.zmh.web.academia.user.preference.UserPreference;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private JwtUtils jwtUtils;

    @InjectMocks
    private AuthService authService;

    private User testUser;
    private UserPreference testPreference;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .password("encoded_password")
                .createdAt(LocalDateTime.now())
                .build();

        testPreference = UserPreference.builder()
                .id(1L)
                .user(testUser)
                .pomodoroStudyMinutes(25)
                .pomodoroBreakMinutes(5)
                .build();

        testUser.setPreference(testPreference);
    }

    @Test
    void register_Success() {
        RegisterRequest req = new RegisterRequest("newuser", "new@example.com", "password123");

        when(userRepository.existsByUsername(req.username())).thenReturn(false);
        when(userRepository.existsByEmail(req.email())).thenReturn(false);
        when(passwordEncoder.encode(req.password())).thenReturn("encoded123");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(jwtUtils.generateTokenFromUsername(anyString())).thenReturn("mocked_jwt_token");

        AuthResponse response = authService.register(req);

        assertNotNull(response);
        assertEquals("mocked_jwt_token", response.token());
        assertEquals("newuser", response.username());
        assertEquals("new@example.com", response.email());

        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_ThrowsExceptionWhenUsernameTaken() {
        RegisterRequest req = new RegisterRequest("testuser", "new@example.com", "password123");
        when(userRepository.existsByUsername(req.username())).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.register(req));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void register_ThrowsExceptionWhenEmailTaken() {
        RegisterRequest req = new RegisterRequest("newuser", "test@example.com", "password123");
        when(userRepository.existsByUsername(req.username())).thenReturn(false);
        when(userRepository.existsByEmail(req.email())).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.register(req));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void login_Success() {
        LoginRequest req = new LoginRequest("testuser", "password123");
        Authentication auth = mock(Authentication.class);
        UserPrincipal principal = UserPrincipal.from(testUser);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(auth.getPrincipal()).thenReturn(principal);
        when(jwtUtils.generateToken(auth)).thenReturn("mocked_jwt_token");

        AuthResponse response = authService.login(req);

        assertNotNull(response);
        assertEquals("mocked_jwt_token", response.token());
        assertEquals("testuser", response.username());
        assertEquals("test@example.com", response.email());
    }

    @Test
    void getProfile_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        ProfileResponse response = authService.getProfile(1L);

        assertNotNull(response);
        assertEquals("testuser", response.username());
        assertEquals("test@example.com", response.email());
        assertEquals(25, response.pomodoroStudyMinutes());
        assertEquals(5, response.pomodoroBreakMinutes());
    }

    @Test
    void getProfile_ThrowsExceptionWhenUserNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(BadRequestException.class, () -> authService.getProfile(99L));
    }
}
