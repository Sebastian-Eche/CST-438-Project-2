package com.example.demo.Controllers;

import com.example.demo.Config.JwtUtils;
import com.example.demo.Service.AuthService;
import com.example.demo.Service.TierUserDetailsService;
import com.example.demo.Service.UserService;
import com.example.demo.Tables.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @MockBean
    private PasswordEncoder passwordEncoder;

    @MockBean
    private AuthenticationManager authenticationManager;

    @MockBean
    private JwtUtils jwtUtils;
    
    @MockBean
    private AuthService authService;
    
    @MockBean
    private TierUserDetailsService tierUserDetailsService;

    @Test
    @WithMockUser
    void testRegister_InvalidPassword() throws Exception {
        // Arrange
        String username = "baduser";
        String password = "abc";
        
        // Mock userService.getUserByUsername to return null (user doesn't exist)
        when(userService.getUserByUsername(username)).thenReturn(null);
        
        // Mock userService.validatePassword to return false for invalid password
        when(userService.validatePassword(password)).thenReturn(false);

        // Act & Assert
        mockMvc.perform(post("/auth/register")
                .param("username", username)
                .param("password", password))
                .andExpect(status().isBadRequest());
                // Just check status code since exact error message might vary
    }


    @Test
    @WithMockUser
    void testLogout_ReturnsSuccess() throws Exception {
        // Act & Assert
        mockMvc.perform(post("/auth/logout"))
                .andExpect(status().isOk());
                // Just check status code since exact return message might vary
    }
}