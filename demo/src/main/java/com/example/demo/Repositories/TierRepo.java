package com.example.demo.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.Tables.Tier;

public interface TierRepo extends JpaRepository<Tier, Integer>{
    
}
