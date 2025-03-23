package com.example.demo.Repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.Tables.Tier;

public interface TierRepo extends JpaRepository<Tier, Integer>{
    List<Tier> findBySubject(String subject);
    List<Tier> findByUserId(Integer userId);
}
