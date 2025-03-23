package com.example.demo.Controllers;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;

// import com.example.demo.Service.TierEmbeddingService;
import com.example.demo.Service.TierService;
import com.example.demo.Tables.Tier;
import com.example.demo.Tables.Subject;
import com.example.demo.Tables.SubjectEntry;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/tier")
public class TierController {
    // @Autowired
    // private TierEmbeddingService embeddingService;

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


    @GetMapping("/compare") //id will be id of the tier you want to compare and subject is the tier you want to compares subject
    public String compareTiers(@RequestParam Integer id, @RequestParam String subject){
        List<Tier> tiers = tierService.getTiersBySubject(subject);
        Integer randNum = (int) Math.rint(Math.random() * (tiers.size()-1 - 0));
        Tier randomTier = tiers.get(randNum);
        Tier tierByID = tierService.getTier(id);
        String tierByIDText = "S: " + tierByID.getS() + " ^ A: " + tierByID.getA() + " ^ B: " + tierByID.getB() + " ^ C: " + tierByID.getC() + " ^ D: " + tierByID.getD() + " ^ F: " + tierByID.getF();
        String randomTierText = "S: " + randomTier.getS() + " ^ A: " + randomTier.getA() + " ^ B: " + randomTier.getB() + " ^ C: " + randomTier.getC() + " ^ D: " + randomTier.getD() + " ^ F: " + randomTier.getF();

        //everything below is to run the python file
        ProcessBuilder pb = new ProcessBuilder("python", "ml_embeddings/mlembedder.py", tierByIDText, randomTierText);
        pb.redirectErrorStream(true);
        Process process = null;
        try {
            process = pb.start();
        } catch (IOException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
        StringBuilder pythonOutput = new StringBuilder();
        pythonOutput.append("\n\n")
        String percentage = "";
        try {
            while ((percentage = reader.readLine()) != null) {
                pythonOutput.append(percentage);
            }
        } catch (IOException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }

        try {
            process.waitFor();
        } catch (InterruptedException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        // System.out.println(pythonOutput.toString());
        pythonOutput.append("\n")
        return pythonOutput.toString();
    }
    // @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN')")
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
