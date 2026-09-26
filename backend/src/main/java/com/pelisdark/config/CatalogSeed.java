package com.pelisdark.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pelisdark.entity.Media;
import com.pelisdark.repository.CatalogRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

@Component
public class CatalogSeed implements ApplicationRunner {
    private final CatalogRepository catalog;
    private final ObjectMapper json;
    public CatalogSeed(CatalogRepository catalog,ObjectMapper json) { this.catalog=catalog; this.json=json; }
    public void run(ApplicationArguments args) throws Exception {
        try(var stream=new ClassPathResource("catalog.json").getInputStream()) {
            for(Media m:json.readValue(stream,Media[].class)) catalog.insert(m);
        }
    }
}
