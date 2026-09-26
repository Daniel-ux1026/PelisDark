package com.pelisdark.repository;

import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class AccountRepository {
    private final JdbcTemplate db;
    public AccountRepository(JdbcTemplate db) { this.db=db; }
    public record Account(String id, String email, String hash, boolean verified) {}
    public Optional<Account> byEmail(String email) {
        return db.query("SELECT * FROM accounts WHERE email=?", (r,n) ->
            new Account(r.getString("id"),r.getString("email"),r.getString("password_hash"),r.getBoolean("verified")), email).stream().findFirst();
    }
    public Account byId(String id) {
        return db.queryForObject("SELECT * FROM accounts WHERE id=?", (r,n) ->
            new Account(r.getString("id"),r.getString("email"),r.getString("password_hash"),r.getBoolean("verified")),id);
    }
    public void create(String id,String email,String hash) {
        db.update("INSERT INTO accounts(id,email,password_hash,verified) VALUES(?,?,?,0)",id,email,hash);
    }
    public void verified(String id) { db.update("UPDATE accounts SET verified=1 WHERE id=?",id); }
    public void password(String id,String hash) { db.update("UPDATE accounts SET password_hash=? WHERE id=?",hash,id); }
}
