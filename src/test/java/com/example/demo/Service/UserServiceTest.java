package com.example.demo.Service;

import com.example.demo.Repositories.UserRepo;
import com.example.demo.Tables.Role;
import com.example.demo.Tables.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
//import org.mockito.Mockito;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

public class UserServiceTest {

    private UserRepo userRepo;
    private PasswordEncoder passwordEncoder;
    private UserService userService;

    @BeforeEach
    void setUp() {
        userRepo = mock(UserRepo.class);
        passwordEncoder = mock(PasswordEncoder.class);
        userService = new UserService(userRepo, passwordEncoder);
    }

    @Test
    void testAddUser_Success() {
        User user = new User("newuser", "Password@123", Role.ROLE_USER);

        when(passwordEncoder.encode(anyString())).thenReturn("hashedPass");
        when(userRepo.save(any(User.class))).thenReturn(user);

        boolean result = userService.addUser(user);
        assertTrue(result);
    }

    @Test
    void testAddUser_Exception() {
        User user = new User("fail", "Password@123", Role.ROLE_USER);

        when(passwordEncoder.encode(anyString())).thenReturn("hashedPass");
        doThrow(new RuntimeException("DB error")).when(userRepo).save(any());

        boolean result = userService.addUser(user);
        assertFalse(result);
    }

    @Test
    void testDeleteAccount_Success() {
        User user = new User("deleteMe", "hashedPass", Role.ROLE_USER);
        user.setId(1);

        when(userRepo.findById(1)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("realPass", "hashedPass")).thenReturn(true);

        boolean result = userService.deleteAccount(1, "realPass");
        assertTrue(result);
        verify(userRepo).deleteById(1);
    }

    @Test
    void testDeleteAccount_WrongPassword() {
        User user = new User("deleteMe", "hashedPass", Role.ROLE_USER);
        user.setId(1);

        when(userRepo.findById(1)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongPass", "hashedPass")).thenReturn(false);

        boolean result = userService.deleteAccount(1, "wrongPass");
        assertFalse(result);
        verify(userRepo, never()).deleteById(any());
    }

    @Test
    void testValidatePassword_Valid() {
        assertTrue(userService.validatePassword("Valid@123"));
    }

    @Test
    void testValidatePassword_Invalid() {
        assertFalse(userService.validatePassword("noSpecial"));
        assertFalse(userService.validatePassword("$$$"));
    }

    @Test
    void testEditUser_Success() {
        User original = new User("olduser", "pass", Role.ROLE_USER);
        original.setId(1);
        when(userRepo.findById(1)).thenReturn(Optional.of(original));
        when(passwordEncoder.encode(any())).thenReturn("hashed");

        User updates = new User("newuser", "New@123", Role.ROLE_USER);
        boolean result = userService.editUser(1, updates);

        assertTrue(result);
        verify(userRepo).save(any(User.class));
    }

    @Test
    void testEditUser_InvalidPassword() {
        User original = new User("olduser", "pass", Role.ROLE_USER);
        original.setId(1);
        when(userRepo.findById(1)).thenReturn(Optional.of(original));

        User updates = new User("newuser", "short", Role.ROLE_USER);
        boolean result = userService.editUser(1, updates);

        assertFalse(result);
        verify(userRepo, never()).save(any());
    }
}
