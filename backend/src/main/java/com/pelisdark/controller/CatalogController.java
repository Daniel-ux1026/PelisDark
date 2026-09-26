package com.pelisdark.controller;

import java.util.List;
import com.pelisdark.entity.Media;
import com.pelisdark.repository.CatalogRepository;
import org.springframework.web.bind.annotation.*;

@RestController
public class CatalogController {
    private final CatalogRepository catalog;
    public CatalogController(CatalogRepository catalog) { this.catalog=catalog; }
    @GetMapping("/api/catalog") public List<Media> catalog() { return catalog.all(); }
}
