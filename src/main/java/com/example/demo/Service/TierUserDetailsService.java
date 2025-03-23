package com.example.demo.Service;

import com.example.demo.Repositories.UserRepo;
import com.example.demo.Tables.User;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class TierUserDetailsService implements UserDetailsService {

    private final UserRepo userRepo;

    public TierUserDetailsService(UserRepo userRepo) {
        this.userRepo = userRepo;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepo.findByUsername(username);
        if (user == null) {
            throw new UsernameNotFoundException("User not found");
        } //comments for troubleshooting
        System.out.println(" Loading user from DB: " + user.getUsername());
        System.out.println("Stored password hash: " + user.getPassword());
        System.out.println(" Role from DB: " + user.getRole());


        return org.springframework.security.core.userdetails.User.withUsername(user.getUsername())
                .password(user.getPassword())
                .authorities(Collections.singletonList(new SimpleGrantedAuthority(user.getRole().toString())))
                .build();
    }
}