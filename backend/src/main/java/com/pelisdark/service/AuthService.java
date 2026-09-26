package com.pelisdark.service;

import java.security.SecureRandom;
import java.nio.charset.StandardCharsets;
import java.util.*;
import com.pelisdark.repository.AccountRepository;
import com.pelisdark.dto.Requests.*;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {
    private final AccountRepository accounts;
    private final JdbcTemplate db;
    private final PasswordEncoder passwords;
    private final MailService mail;
    private final SecureRandom random=new SecureRandom();
    private final String dummy;
    public AuthService(AccountRepository accounts,JdbcTemplate db,PasswordEncoder passwords,MailService mail) {
        this.accounts=accounts; this.db=db; this.passwords=passwords; this.mail=mail;
        this.dummy=passwords.encode(UUID.randomUUID().toString());
    }
    private String normalized(String email) { return email.strip().toLowerCase(Locale.ROOT); }
    private void passwordSize(String value) {
        if(value.getBytes(StandardCharsets.UTF_8).length>72) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"La contrasena supera 72 bytes");
    }
    @Transactional
    public String register(Credentials input) {
        passwordSize(input.password());
        String email=normalized(input.email());
        if(accounts.byEmail(email).isPresent()) {
            passwords.matches(input.password(),dummy);
            return UUID.randomUUID().toString();
        }
        String id=UUID.randomUUID().toString();
        accounts.create(id,email,passwords.encode(input.password()));
        db.update("INSERT INTO profiles(id,account_id,name,color) VALUES(?,?,?,?)",UUID.randomUUID().toString(),id,"Mi perfil","#e43d52");
        return challenge(id,email);
    }
    @Transactional
    public String login(Credentials input) {
        passwordSize(input.password());
        var account=accounts.byEmail(normalized(input.email()));
        boolean valid=passwords.matches(input.password(),account.map(AccountRepository.Account::hash).orElse(dummy));
        if(account.isEmpty() || !valid) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Credenciales incorrectas");
        return challenge(account.get().id(),account.get().email());
    }
    private String challenge(String id,String email) {
        long now=System.currentTimeMillis();
        // Serialize issuance per account and enforce an account-level cooldown, not only IP throttling.
        db.update("UPDATE accounts SET verified=verified WHERE id=?",id);
        Integer recent=db.queryForObject("SELECT COUNT(*) FROM challenges WHERE account_id=? AND expires_at>?",Integer.class,id,now+540_000);
        if(recent!=null && recent>0) throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,"Espera un minuto antes de pedir otro codigo");
        db.update("DELETE FROM challenges WHERE expires_at<?",now-86_400_000);
        db.update("UPDATE challenges SET used=1 WHERE account_id=?",id);
        String code=String.format("%06d",random.nextInt(1_000_000));
        String challenge=UUID.randomUUID().toString();
        db.update("INSERT INTO challenges(id,account_id,code_hash,expires_at) VALUES(?,?,?,?)",challenge,id,passwords.encode(code),now+600_000);
        mail.code(email,code);
        return challenge;
    }
    @Transactional(noRollbackFor=ResponseStatusException.class)
    public String verify(Verification input) {
        int updated=db.update("UPDATE challenges SET attempts=attempts+1 WHERE id=? AND used=0 AND attempts<5 AND expires_at>?",input.challengeId(),System.currentTimeMillis());
        if(updated!=1) throw invalidCode();
        var row=db.queryForMap("SELECT account_id,code_hash FROM challenges WHERE id=?",input.challengeId());
        if(!passwords.matches(input.code(),(String)row.get("code_hash"))) throw invalidCode();
        if(db.update("UPDATE challenges SET used=1 WHERE id=? AND used=0",input.challengeId())!=1) throw invalidCode();
        String id=(String)row.get("account_id"); accounts.verified(id); return id;
    }
    private ResponseStatusException invalidCode() { return new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Codigo incorrecto, vencido o agotado"); }
    public Map<String,String> me(String id) { var a=accounts.byId(id); return Map.of("id",a.id(),"email",a.email()); }
    public void changePassword(String id,PasswordChange input) {
        passwordSize(input.newPassword());
        if(!passwords.matches(input.currentPassword(),accounts.byId(id).hash())) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Contrasena actual incorrecta");
        accounts.password(id,passwords.encode(input.newPassword()));
    }
}
