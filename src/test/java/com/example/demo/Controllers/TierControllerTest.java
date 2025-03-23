package com.example.demo.Controllers;

import com.example.demo.Service.TierService;
import com.example.demo.Service.TierUserDetailsService;
import com.example.demo.Tables.Subject;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.ArrayList;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class TierControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TierService tierService;
    
    @MockBean
    private TierUserDetailsService tierUserDetailsService;

    @Test
    @WithMockUser // This annotation sets up security context for the test
    void testGetTierRoot() throws Exception {
        mockMvc.perform(get("/tier/"))
                .andExpect(status().isOk())
                .andExpect(content().string("This is the TIER root route"));
    }

    @Test
    @WithMockUser
    void testGetAllSubjects_Returns200() throws Exception {
        // Arrange
        List<Subject> subjects = new ArrayList<>();
        when(tierService.getAllSubjects()).thenReturn(subjects);

        // Act & Assert
        mockMvc.perform(get("/tier/getSubjects"))
                .andExpect(status().isOk());
    }
}