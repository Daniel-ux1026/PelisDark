package com.pelisdark.service;

import java.util.*;
import com.pelisdark.dto.Requests.ProfileInput;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ProfileService {
    private final JdbcTemplate db;
    public ProfileService(JdbcTemplate db) { this.db=db; }
    public record Profile(String id,String name,String color,String language,boolean spoilers) {}
    public List<Profile> profiles(String account) {
        return db.query("SELECT * FROM profiles WHERE account_id=? ORDER BY name",(r,n) -> new Profile(r.getString("id"),r.getString("name"),r.getString("color"),r.getString("language"),r.getBoolean("spoilers")),account);
    }
    public void owned(String account,String profile) {
        if(db.queryForObject("SELECT COUNT(*) FROM profiles WHERE id=? AND account_id=?",Integer.class,profile,account)!=1) throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Perfil no encontrado");
    }
    private void lockAccount(String account) { db.update("UPDATE accounts SET verified=verified WHERE id=?",account); }
    @Transactional public Profile create(String account,ProfileInput input) {
        lockAccount(account);
        if(profiles(account).size()>=5) throw new ResponseStatusException(HttpStatus.CONFLICT,"Puedes tener hasta cinco perfiles");
        String id=UUID.randomUUID().toString();
        db.update("INSERT INTO profiles(id,account_id,name,color,language,spoilers) VALUES(?,?,?,?,?,?)",id,account,input.name().strip(),input.color(),input.language(),input.spoilers());
        return new Profile(id,input.name().strip(),input.color(),input.language(),input.spoilers());
    }
    public void edit(String account,String id,ProfileInput input) {
        owned(account,id);
        db.update("UPDATE profiles SET name=?,color=?,language=?,spoilers=? WHERE id=? AND account_id=?",input.name().strip(),input.color(),input.language(),input.spoilers(),id,account);
    }
    @Transactional public void delete(String account,String id) {
        lockAccount(account); owned(account,id);
        if(profiles(account).size()<=1) throw new ResponseStatusException(HttpStatus.CONFLICT,"Conserva al menos un perfil");
        db.update("DELETE FROM profiles WHERE id=? AND account_id=?",id,account);
    }
    public Map<String,Object> library(String account,String profile) {
        owned(account,profile);
        Map<String,Integer> scores=new HashMap<>();
        db.query("SELECT media_id,score FROM ratings WHERE profile_id=?",r -> { scores.put(r.getString("media_id"),r.getInt("score")); },profile);
        return Map.of("watchlist",db.queryForList("SELECT media_id FROM watchlist WHERE profile_id=?",String.class,profile),"ratings",scores);
    }
    private void media(String id) {
        if(db.queryForObject("SELECT COUNT(*) FROM catalog WHERE id=?",Integer.class,id)!=1) throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Titulo no encontrado");
    }
    @Transactional public void watch(String account,String profile,String media,boolean save) {
        lockAccount(account); owned(account,profile); media(media);
        db.update("DELETE FROM watchlist WHERE profile_id=? AND media_id=?",profile,media);
        if(save) db.update("INSERT INTO watchlist(profile_id,media_id) VALUES(?,?)",profile,media);
    }
    @Transactional public void rate(String account,String profile,String media,int score) {
        lockAccount(account); owned(account,profile); media(media);
        db.update("DELETE FROM ratings WHERE profile_id=? AND media_id=?",profile,media);
        db.update("INSERT INTO ratings(profile_id,media_id,score) VALUES(?,?,?)",profile,media,score);
    }
}
