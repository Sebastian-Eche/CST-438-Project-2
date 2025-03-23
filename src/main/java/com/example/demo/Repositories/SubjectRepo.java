package com.example.demo.Repositories;

import com.example.demo.Tables.Subject;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubjectRepo extends JpaRepository<Subject, Integer> {
}
