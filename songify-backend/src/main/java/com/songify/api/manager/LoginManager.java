package com.songify.api.manager;

import com.songify.api.model.User;
import com.songify.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class LoginManager {

    @Autowired
    private UserRepository userRepository;

    public ResponseEntity<User> tryLogin(String username, String passHash){
        //determine if given username and password belong to a user
        var user = this.userRepository.findByUsernameAndPassHash(username, passHash);
        //if so, return the user details and http 200 (OK) otherwise 404 not found
        if(user != null){ return new ResponseEntity<>(user, HttpStatus.OK);
        } else return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
}