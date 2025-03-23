package com.example.demo.Controllers;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

//@CrossOrigin(origins = "https://cst438-project2-33edc6317781.herokuapp.com")
@RestController
public class Controller {

    /*
    @GetMapping("/")
    public String index() {
        return "Hello this is the / endpoint.";
    }
*/


    @GetMapping("/greeting")
    public String greeting(){
        return "Greetings from Cris";
    }
}
