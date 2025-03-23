package com.example.demo.Controllers;

import com.example.demo.Service.TierUserDetailsService;
import com.example.demo.Service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;
    
    @MockBean
    private TierUserDetailsService tierUserDetailsService;

    @Test
    @WithMockUser
    void testGetUserRoot() throws Exception {
        mockMvc.perform(get("/user/"))
                .andDo(result -> System.out.println("❟ GET /user/ → " + result.getResponse().getContentAsString()))
                .andExpect(status().isOk())
                .andExpect(content().string("THIS IS THE USER ROOT ROUTE"));
    }

    @Test
    @WithMockUser(roles = "ADMIN") // Use ADMIN role since this endpoint requires it
    void testPutUser_InvalidPassword() throws Exception {
        // Mock validation in UserService
        when(userService.validatePassword(anyString())).thenReturn(false);
        
        mockMvc.perform(put("/user/put")
                        .param("username", "testuser")
                        .param("password", "abc")
                        .param("role", "ROLE_USER"))
                .andDo(result -> System.out.println("❟ PUT /user/put → " + result.getResponse().getContentAsString()))
                .andExpect(status().isBadRequest());
                // Just check status code since exact error message might vary
    }
}