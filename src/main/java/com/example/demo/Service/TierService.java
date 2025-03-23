package com.example.demo.Service;

import java.util.List;

import com.example.demo.Tables.SubjectEntry;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.Repositories.TierRepo;
import com.example.demo.Tables.Tier;


import com.example.demo.Repositories.SubjectRepo;
import com.example.demo.Tables.Subject;

import com.example.demo.Repositories.SubjectEntryRepo;
import com.example.demo.Tables.SubjectEntry;


@Service
public class TierService {
    @Autowired
    private TierRepo tierRepo;

    @Autowired
    private SubjectRepo subjectRepo;

    @Autowired
    private SubjectEntryRepo subjectEntryRepo;

    public TierService(TierRepo tierRepo, SubjectRepo subjectRepo, SubjectEntryRepo subjectEntryRepo) {
        this.tierRepo = tierRepo;
        this.subjectRepo = subjectRepo;
        this.subjectEntryRepo = subjectEntryRepo;
    }

    public List<Tier> getAllTiers(){
        return tierRepo.findAll();
    }

    public Tier getTier(Integer id){
        return tierRepo.findById(id).orElse(null);
    }

    public List<Tier> getTierByUser(Integer userId) {
        return tierRepo.findByUserId(userId);
    }

    public List<Tier> getTiersBySubject(String subject){
        return tierRepo.findBySubject(subject);
    }

    public void addTier(Tier tier){
        tierRepo.save(tier);
    }

    public void deleteTier(Integer id){
        if(tierRepo.existsById(id)){
            tierRepo.deleteById(id);
        }
    }

    public void editTier(Integer id, Tier changesToTier) {
        Tier tierByID = tierRepo.findById(id).orElse(null);
    
        if (tierByID == null) {
            System.err.println("tierByID: " + tierByID + " is null");
            return;
        }
    
        if (changesToTier.getS() != null) {
            tierByID.setS(changesToTier.getS());
        }
        if (changesToTier.getA() != null) {
            tierByID.setA(changesToTier.getA());
        }
        if (changesToTier.getB() != null) {
            tierByID.setB(changesToTier.getB());
        }
        if (changesToTier.getC() != null) {
            tierByID.setC(changesToTier.getC());
        }
        if (changesToTier.getD() != null) {
            tierByID.setD(changesToTier.getD());
        }
        if (changesToTier.getF() != null) {
            tierByID.setF(changesToTier.getF());
        }
    
        tierRepo.save(tierByID);
    }
    
    public void putTier(Integer id, Tier newTier){
        Tier currentTier = tierRepo.findById(id).orElse(null);

        currentTier.setS(newTier.getS());
        currentTier.setA(newTier.getA());
        currentTier.setB(newTier.getB());
        currentTier.setC(newTier.getC());
        currentTier.setD(newTier.getD());
        currentTier.setF(newTier.getF());

        tierRepo.save(currentTier);
    }

    public List<Subject> getAllSubjects() {
        return subjectRepo.findAll();
    }

    public List<SubjectEntry> getAllEntries() {
        return subjectEntryRepo.findAll();
    }

    public List<SubjectEntry> getEntriesBySubjectId(Integer subjectId) {
        return subjectEntryRepo.findBySubject_Id(subjectId);
    }
}
