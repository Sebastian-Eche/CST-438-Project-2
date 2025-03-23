package com.example.demo.Service;

import com.example.demo.Repositories.UserRepo;
import com.example.demo.Tables.Role;
import com.example.demo.Tables.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class AuthServiceTest {

    private UserRepo userRepo;
    private PasswordEncoder passwordEncoder;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        userRepo = mock(UserRepo.class);
        passwordEncoder = mock(PasswordEncoder.class);
        authService = new AuthService(userRepo, passwordEncoder);
    }

    @Test
    void testLogin_Success() {
        User user = new User("user", "encodedPass", Role.ROLE_USER);
        when(userRepo.findByUsername("user")).thenReturn(user);
        when(passwordEncoder.matches("rawPass", "encodedPass")).thenReturn(true);

        String result = authService.login("user", "rawPass");
        assertEquals("Login Successful", result);
    }

    @Test
    void testLogin_WrongPassword() {
        User user = new User("user", "encodedPass", Role.ROLE_USER);
        when(userRepo.findByUsername("user")).thenReturn(user);
        when(passwordEncoder.matches("wrongPass", "encodedPass")).thenReturn(false);

        String result = authService.login("user", "wrongPass");
        assertEquals("Invalid password!", result);
    }

    @Test
    void testLogin_UserNotFound() {
        when(userRepo.findByUsername("ghost")).thenReturn(null);

        String result = authService.login("ghost", "anything");
        assertEquals("User not found!", result);
    }
}
