package com.pelisdark.controller;

import java.security.Principal;
import java.util.*;
import jakarta.validation.Valid;
import com.pelisdark.dto.Requests.*;
import com.pelisdark.service.ProfileService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profiles")
public class ProfileController {
    private final ProfileService service;
    public ProfileController(ProfileService service) { this.service=service; }
    @GetMapping public List<ProfileService.Profile> list(Principal user) { return service.profiles(user.getName()); }
    @PostMapping public ProfileService.Profile create(Principal user,@Valid @RequestBody ProfileInput input) { return service.create(user.getName(),input); }
    @PutMapping("/{id}") public void edit(Principal user,@PathVariable String id,@Valid @RequestBody ProfileInput input) { service.edit(user.getName(),id,input); }
    @DeleteMapping("/{id}") public void delete(Principal user,@PathVariable String id) { service.delete(user.getName(),id); }
    @GetMapping("/{id}/library") public Map<String,Object> library(Principal user,@PathVariable String id) { return service.library(user.getName(),id); }
    @PutMapping("/{id}/watchlist/{media}") public void save(Principal user,@PathVariable String id,@PathVariable String media) { service.watch(user.getName(),id,media,true); }
    @DeleteMapping("/{id}/watchlist/{media}") public void unsave(Principal user,@PathVariable String id,@PathVariable String media) { service.watch(user.getName(),id,media,false); }
    @PutMapping("/{id}/ratings/{media}") public void rate(Principal user,@PathVariable String id,@PathVariable String media,@Valid @RequestBody Rating rating) { service.rate(user.getName(),id,media,rating.score()); }
}
