package com.example.demo.Repositories;

import com.example.demo.Tables.SubjectEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubjectEntryRepo extends JpaRepository<SubjectEntry, Integer> {
    List<SubjectEntry> findBySubject_Id(Integer id);
}