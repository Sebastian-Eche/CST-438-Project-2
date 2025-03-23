package com.example.demo.Service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.example.demo.Repositories.UserRepo;
import com.example.demo.Tables.User;

@Service
public class AuthService {
    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepo userRepo, PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    public String login(String username, String rawPassword) {
        User existingUser = userRepo.findByUsername(username);

        if (existingUser == null) { // Handle null
            return "User not found!";
        }

        if (passwordEncoder.matches(rawPassword, existingUser.getPassword())) {
            return "Login Successful";
        } else {
            return "Invalid password!";
        }
    }

}
