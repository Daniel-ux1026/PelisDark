package com.pelisdark;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pelisdark.service.MailService;
import org.junit.jupiter.api.*;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.*;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import java.util.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("preview")
class ApiIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @MockitoBean MailService mail;
    String ip;
    record Pending(String id,String code) {}
    @BeforeEach void setup() { ip=UUID.randomUUID().toString(); }
    ResultActions request(MockHttpServletRequestBuilder request) throws Exception {
        return mvc.perform(request.with(r -> {r.setRemoteAddr(ip); return r;}));
    }
    Pending register() throws Exception {
        String email=UUID.randomUUID()+"@example.test";
        var result=request(post("/api/auth/register").with(csrf()).contentType("application/json")
            .content(json.writeValueAsString(Map.of("email",email,"password","A-long-password-123")))).andExpect(status().isOk()).andReturn();
        ArgumentCaptor<String> code=ArgumentCaptor.forClass(String.class);
        verify(mail).code(eq(email),code.capture());
        var body=json.readTree(result.getResponse().getContentAsString());
        assertFalse(body.has("code"));
        return new Pending(body.get("challengeId").asText(),code.getValue());
    }
    MockHttpSession login() throws Exception {
        Pending p=register();
        return (MockHttpSession)request(post("/api/auth/verify").with(csrf()).contentType("application/json")
            .content(json.writeValueAsString(Map.of("challengeId",p.id(),"code",p.code())))).andExpect(status().isOk()).andReturn().getRequest().getSession();
    }
    String profile(MockHttpSession session) throws Exception {
        return json.readTree(request(get("/api/profiles").session(session)).andExpect(status().isOk()).andReturn().getResponse().getContentAsString()).get(0).get("id").asText();
    }
    @Test void catalogIsPublicAndYearBounded() throws Exception {
        var data=json.readTree(request(get("/api/catalog")).andExpect(status().isOk()).andReturn().getResponse().getContentAsString());
        assertTrue(data.size()>=21);
        for(var m:data) assertTrue(m.get("year").asInt()>=2020 && m.get("year").asInt()<=2026);
    }
    @Test void unauthenticatedAndCsrfProtected() throws Exception {
        request(get("/api/profiles")).andExpect(status().isUnauthorized());
        request(post("/api/auth/login").contentType("application/json").content("{}")).andExpect(status().isForbidden());
        request(get("/api/csrf")).andExpect(status().isOk()).andExpect(jsonPath("$.token").isNotEmpty());
    }
    @Test void successfulCodeCannotBeReplayed() throws Exception {
        Pending p=register();
        String body=json.writeValueAsString(Map.of("challengeId",p.id(),"code",p.code()));
        request(post("/api/auth/verify").with(csrf()).contentType("application/json").content(body)).andExpect(status().isOk());
        request(post("/api/auth/verify").with(csrf()).contentType("application/json").content(body)).andExpect(status().isUnauthorized());
    }
    @Test void fifthIncorrectCodeLocksChallenge() throws Exception {
        Pending p=register();
        String wrong=p.code().equals("000000")?"111111":"000000";
        for(int i=0;i<5;i++) request(post("/api/auth/verify").with(csrf()).contentType("application/json")
            .content(json.writeValueAsString(Map.of("challengeId",p.id(),"code",wrong)))).andExpect(status().isUnauthorized());
        request(post("/api/auth/verify").with(csrf()).contentType("application/json")
            .content(json.writeValueAsString(Map.of("challengeId",p.id(),"code",p.code())))).andExpect(status().isUnauthorized());
    }
    @Test void profileIsolationAndPersistentLibrary() throws Exception {
        var alice=login(); var bob=login(); String id=profile(alice);
        request(put("/api/profiles/"+id+"/watchlist/dune2").session(alice).with(csrf())).andExpect(status().isOk());
        request(put("/api/profiles/"+id+"/ratings/dune2").session(alice).with(csrf()).contentType("application/json").content("{\"score\":5}")).andExpect(status().isOk());
        request(get("/api/profiles/"+id+"/library").session(alice)).andExpect(jsonPath("$.watchlist[0]").value("dune2")).andExpect(jsonPath("$.ratings.dune2").value(5));
        request(get("/api/profiles/"+id+"/library").session(bob)).andExpect(status().isNotFound());
        request(delete("/api/profiles/"+id+"/watchlist/dune2").session(bob).with(csrf())).andExpect(status().isNotFound());
        request(delete("/api/profiles/"+id).session(bob).with(csrf())).andExpect(status().isNotFound());
        request(delete("/api/profiles/"+id+"/watchlist/dune2").session(alice).with(csrf())).andExpect(status().isOk());
        request(get("/api/profiles/"+id+"/library").session(alice)).andExpect(jsonPath("$.watchlist").isEmpty());
    }
    @Test void validatesRatingsAndPasswords() throws Exception {
        var session=login(); String id=profile(session);
        request(put("/api/profiles/"+id+"/ratings/dune2").session(session).with(csrf()).contentType("application/json").content("{\"score\":6}")).andExpect(status().isBadRequest());
        request(post("/api/auth/register").with(csrf()).contentType("application/json").content("{\"email\":\"x@example.test\",\"password\":\"short\"}")).andExpect(status().isBadRequest());
    }
    @Test void atMostFiveProfilesAndCannotDeleteLast() throws Exception {
        var session=login(); String id=profile(session);
        request(delete("/api/profiles/"+id).session(session).with(csrf())).andExpect(status().isConflict());
        String body="{\"name\":\"Otro perfil\",\"color\":\"#22b8a0\",\"language\":\"es\",\"spoilers\":false}";
        for(int i=0;i<4;i++) request(post("/api/profiles").session(session).with(csrf()).contentType("application/json").content(body)).andExpect(status().isOk());
        request(post("/api/profiles").session(session).with(csrf()).contentType("application/json").content(body)).andExpect(status().isConflict());
    }
    @Test void logoutInvalidatesSession() throws Exception {
        var session=login();
        request(post("/api/auth/logout").session(session).with(csrf())).andExpect(status().isNoContent());
        assertTrue(session.isInvalid());
    }
}
