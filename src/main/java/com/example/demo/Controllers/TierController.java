package com.example.demo.Controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.demo.Service.TierService;
import com.example.demo.Tables.Tier;
import com.example.demo.Tables.Subject;
import com.example.demo.Tables.SubjectEntry;

//@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/tier")
public class TierController {

    @Autowired
    private TierService tierService;

    @GetMapping("/")
    public String index(){
        return "This is the TIER root route";
    }

    @GetMapping("/all")
    public List<Tier> getAllTiers(){
        return tierService.getAllTiers();
    }

    @GetMapping("/{id}")
    public Tier getTier(@PathVariable Integer id){
        return tierService.getTier(id);
    }

    //THIS RETURNS A LIST OF TIERS WITH THE SAME SUBJECT
    //could help when working with machine learning stuff to match the tiers with same subject
    @GetMapping("/subject/{subject}")
    public List<Tier> getTiersBySubject(@PathVariable String subject){
        return tierService.getTiersBySubject(subject);
    }

    @PostMapping("/add")
    public void addTier(@RequestBody Tier tier){
        tierService.addTier(tier);
    }

    @DeleteMapping("/delete/{id}")
    public void deleteTier(@PathVariable Integer id){
        tierService.deleteTier(id);
    }

    @PatchMapping("/edit/{id}")
    public void editTier(@PathVariable Integer id, @RequestBody Tier tierChanges){
        tierService.editTier(id, tierChanges);
    }

    @PutMapping("/change/{id}")
    public void putTier(@PathVariable Integer id, @RequestBody Tier tierChanges){
        tierService.putTier(id, tierChanges);
    }

    @GetMapping("/getByUserId/{userId}")
    public List<Tier> getByUserId(@PathVariable Integer userId){
        return tierService.getTierByUser(userId);
    }

    @GetMapping("/getSubjects")
    public List<Subject> getAllSubjects() {
        return tierService.getAllSubjects();
    }

    // Get all entries for a subject
    @GetMapping("/{subjectId}/entries")
    public List<SubjectEntry> getEntriesForSubject(@PathVariable Integer subjectId) {
        return tierService.getEntriesBySubjectId(subjectId);
    }

}
