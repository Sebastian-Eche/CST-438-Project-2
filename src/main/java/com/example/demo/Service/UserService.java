package com.example.demo.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.demo.Repositories.UserRepo;
import com.example.demo.Tables.User;

@Service
public class UserService {

    @Autowired
    private UserRepo userRepo;

    private BCryptPasswordEncoder bcrypt = new BCryptPasswordEncoder(10); 

    public List<User> getAllUsers() {
        return userRepo.findAll();
    }

    public User getUser(Integer id){
        return userRepo.findById(id).orElse(null);
    }

    public User getUserByUsername(String username){
        return userRepo.findByUsername(username);
    }


    public boolean deleteUser(Integer id) {
        if (userRepo.existsById(id)) { //checks if user exists before deleting
            userRepo.deleteById(id);
            return true;
        }
        return false;
    }


    public boolean addUser(User user) {
        try {
            user.setPassword(bcrypt.encode(user.getPassword()));
            userRepo.save(user);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public boolean editUser(Integer id, User userUpdates) {
        User existingUser = userRepo.findById(id).orElse(null); //if user not found, sets exisitng user to null and returns false

        if (existingUser == null) {
            return false;
        }
        //updates username
        if (userUpdates.getUsername() != null) {
            existingUser.setUsername(userUpdates.getUsername());
        }//updates password
        if (userUpdates.getPassword() != null) {
            existingUser.setPassword(bcrypt.encode(userUpdates.getPassword()));
        }
        //saves changes
        userRepo.save(existingUser);
        return true;
    }

    public void putUser(Integer id, User newUser){
        User currentUser = userRepo.findById(id).orElse(null);

        currentUser.setUsername(newUser.getUsername());
        currentUser.setPassword(bcrypt.encode(newUser.getPassword()));

        userRepo.save(currentUser);
    }
}