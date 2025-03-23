package com.example.demo.Service;

import com.example.demo.Repositories.SubjectEntryRepo;
import com.example.demo.Repositories.SubjectRepo;
import com.example.demo.Repositories.TierRepo;
import com.example.demo.Tables.Subject;
import com.example.demo.Tables.Tier;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.*;

public class TierServiceTest {

    private TierRepo tierRepo;
    private TierService tierService;
    private SubjectRepo subjectRepo;
    private SubjectEntryRepo subjectEntryRepo;

    @BeforeEach
    void setUp() {
        tierRepo = mock(TierRepo.class);
        subjectRepo = mock(SubjectRepo.class);
        subjectEntryRepo = mock(SubjectEntryRepo.class);
        tierService = new TierService(tierRepo, subjectRepo, subjectEntryRepo);
    }

    @Test
    void testEditTier_NullTier() {
        when(tierRepo.findById(1)).thenReturn(Optional.empty());

        tierService.editTier(1, new Tier());
        verify(tierRepo, never()).save(any());
    }

    @Test
    void testEditTier_ValidUpdate() {
        Tier existing = new Tier("Math", "A1", "A2", "A3", "A4", "A5", "A6", 1);
        existing.setId(1);

        Tier update = new Tier(null, "S1", "A1", "B1", "C1", "D1", "F1", 1);
        when(tierRepo.findById(1)).thenReturn(Optional.of(existing));

        tierService.editTier(1, update);

        verify(tierRepo).save(any(Tier.class));
    }

    @Test
    void testGetTierByUser() {
        List<Tier> mockTiers = List.of(new Tier("Test", "S1", "A1", "", "", "", "", 1));
        when(tierRepo.findByUserId(1)).thenReturn(mockTiers);

        List<Tier> result = tierService.getTierByUser(1);
        assertEquals(1, result.size());
        assertEquals("Test", result.get(0).getSubject());
    }

    @Test
    void testPutTier_ReplacesAllValues() {
        Tier existing = new Tier("Old", "oldS", "oldA", "oldB", "oldC", "oldD", "oldF", 1);
        Tier updated = new Tier("New", "newS", "newA", "newB", "newC", "newD", "newF", 1);

        when(tierRepo.findById(1)).thenReturn(Optional.of(existing));

        tierService.putTier(1, updated);

        verify(tierRepo).save(argThat(t -> t.getS().equals("newS") &&
                t.getA().equals("newA") &&
                t.getB().equals("newB") &&
                t.getC().equals("newC") &&
                t.getD().equals("newD") &&
                t.getF().equals("newF")));
    }

    @Test
    void testGetAllSubjects_ReturnsSubjects() {
        Subject subject1 = new Subject("Math");
        Subject subject2 = new Subject("History");

        when(subjectRepo.findAll()).thenReturn(List.of(subject1, subject2));

        List<Subject> result = tierService.getAllSubjects();

        assertEquals(2, result.size());
        assertEquals("Math", result.get(0).getName());
    }

    @Test
    void testGetTiersBySubject_ReturnsMatchingTiers() {
        Tier tier = new Tier("Gaming", "S", "A", "B", "C", "D", "F", 1);

        when(tierRepo.findBySubject("Gaming")).thenReturn(List.of(tier));

        List<Tier> result = tierService.getTiersBySubject("Gaming");

        assertEquals(1, result.size());
        assertEquals("Gaming", result.get(0).getSubject());
    }

}
