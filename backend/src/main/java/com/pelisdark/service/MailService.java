package com.pelisdark.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class MailService {
    private final JavaMailSender mail;
    private final String from;
    public MailService(JavaMailSender mail,@Value("${app.mail-from}") String from) { this.mail=mail; this.from=from; }
    public void code(String email,String code) {
        SimpleMailMessage message=new SimpleMailMessage();
        message.setFrom(from); message.setTo(email); message.setSubject("PelisDark: confirma tu acceso");
        message.setText("Tu codigo de acceso es: "+code+"\nCaduca en 10 minutos y solo puede usarse una vez.\nSi no solicitaste este acceso, no compartas el codigo.");
        mail.send(message);
    }
}
