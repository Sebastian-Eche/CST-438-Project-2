package com.example.demo.Service;

import java.util.List;

import com.example.demo.Tables.Role;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.demo.Repositories.UserRepo;
import com.example.demo.Tables.User;

@Service
public class UserService {

    @Autowired
    private UserRepo userRepo;

    //private BCryptPasswordEncoder bcrypt = new BCryptPasswordEncoder(10);
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepo userRepo, PasswordEncoder passwordEncoder) { // Inject via constructor
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

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
            user.setPassword(passwordEncoder.encode(user.getPassword()));
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
            if (!validatePassword(userUpdates.getPassword())) {
                return false; // Invalid password, update fails
            }
            existingUser.setPassword(passwordEncoder.encode(userUpdates.getPassword()));
        }
        //saves changes
        userRepo.save(existingUser);
        return true;
    }

    public boolean putUser(String username, String password, Role role){
        User existingUser = getUserByUsername(username);

        if (existingUser != null) {
            // Update existing user
            if (password != null && !password.isEmpty()) {
                existingUser.setPassword(passwordEncoder.encode(password));
            }
            existingUser.setRole(role);

            userRepo.save(existingUser);
            return true;
        } else {
            // Create new user
            User newUser = new User();
            newUser.setUsername(username);
            newUser.setPassword(passwordEncoder.encode(password));
            newUser.setRole(role);

            userRepo.save(newUser);
            return true;
        }
    }

    public boolean deleteAccount(Integer id, String password) {
        User existingUser = userRepo.findById(id).orElse(null);

        if (existingUser != null && passwordEncoder.matches(password, existingUser.getPassword())) {
            userRepo.deleteById(id);
            return true;
        }

        return false;
    }

    //checks if password is greater than or equal to 6 and has a special char
    public boolean validatePassword(String password) {
        return password.length() >= 6 && password.matches(".*[!@#$%^&*(),.?\":{}|<>].*");
    }


}