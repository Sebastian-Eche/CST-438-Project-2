// https://medium.com/@chandantechie/spring-boot-application-with-crud-operations-using-spring-data-jpa-and-mysql-23c8019660b1 about CRUD operation using JPA
// https://spring.io/guides/gs/accessing-data-mysql accessing data in Springboot **IMPORTANT** shows steps on how to work with database

package com.example.demo.Controllers;

import java.util.List;

import com.example.demo.Tables.Role;
import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.boot.SpringApplication;
// import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.security.Principal;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;


import com.example.demo.Service.UserService;
import com.example.demo.Tables.User;

//@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/user")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);
    @Autowired
    private UserService userService;

    @GetMapping("/")
    public String index() {
        return "THIS IS THE USER ROOT ROUTE";
    }

    //this one works and gets all the users from the database
    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<User>> getAllUsers(Principal principal) {
        logger.info("User '{}' is requesting /user/all", principal.getName());

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        logger.info("User roles: {}", auth.getAuthorities());

        List<User> users = userService.getAllUsers();
        if (users.isEmpty()) {
            logger.warn("No users found in database.");
            return ResponseEntity.status(404).body(null);
        }
        logger.info("Returning {} users.", users.size());
        return ResponseEntity.ok(users);
    }


    @GetMapping("/{id}")
    public User getUser(@PathVariable Integer id) {
        return userService.getUser(id);
    }

    @GetMapping("/username/{username}")
    public User getUserByUsername(@PathVariable String username) {
        return userService.getUserByUsername(username);
    }

    @PostMapping("/add")
    public boolean addUser(@RequestBody User user) {
        return userService.addUser(user);
    }

    @DeleteMapping("/deleteUser/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public boolean deleteUser(@PathVariable Integer id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userService.deleteUser(id);
    }

    @PatchMapping("/editUser/{id}")
    public ResponseEntity<String> editUser(@PathVariable Integer id, @RequestBody User userUpdates) {
        User existingUser = userService.getUser(id);
        if (existingUser == null) {
            return ResponseEntity.badRequest().body("User not found.");
        }

        // Validate password if it's being updated
        if (userUpdates.getPassword() != null) {
            if (userUpdates.getPassword().length() < 6) {
                return ResponseEntity.badRequest().body("Password must be at least 6 characters long.");
            }
            if (!userUpdates.getPassword().matches(".*[!@#$%^&*(),.?\":{}|<>].*")) {
                return ResponseEntity.badRequest().body("Password must contain at least one special character.");
            }
        }

        boolean success = userService.editUser(id, userUpdates);
        if (success) {
            return ResponseEntity.ok("Success: The user profile has been updated successfully.");
        } else {
            return ResponseEntity.internalServerError().body("Error: Could not update the user. Please try again later.");
        }
    }


    @PutMapping("/put")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<String> putUser(@RequestParam String username, @RequestParam String password, @RequestParam String role) {
        Role userRole = Role.valueOf(role);

        // Validate password before allowing user creation/update
        if (password.length() < 6) {
            return ResponseEntity.badRequest().body("Error: Password must be at least 6 characters long.");
        }
        if (!password.matches(".*[!@#$%^&*(),.?\":{}|<>].*")) {
            return ResponseEntity.badRequest().body("Error: Password must contain at least one special character.");
        }

        boolean success = userService.putUser(username, password, userRole);

        if (success) {
            return ResponseEntity.ok("Success: User has been added or updated.");
        } else {
            return ResponseEntity.internalServerError().body("Error: Failed to add or update user.");
        }
    }

}
