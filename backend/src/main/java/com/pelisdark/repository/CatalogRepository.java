package com.pelisdark.repository;

import com.pelisdark.entity.Media;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class CatalogRepository {
    private final JdbcTemplate db;
    public CatalogRepository(JdbcTemplate db) { this.db=db; }
    public List<Media> all() {
        return db.query("SELECT TOP 500 * FROM catalog ORDER BY release_year DESC,title",(r,n) -> new Media(r.getString("id"),r.getString("title"),r.getString("kind"),r.getInt("release_year"),r.getString("genre"),r.getString("description"),r.getString("poster"),r.getString("backdrop"),r.getString("trailer")));
    }
    public void insert(Media m) {
        int updated=db.update("UPDATE catalog SET title=?,kind=?,release_year=?,genre=?,description=?,poster=?,backdrop=?,trailer=? WHERE id=?",m.title(),m.kind(),m.year(),m.genre(),m.description(),m.poster(),m.backdrop(),m.trailer(),m.id());
        if(updated==0)
            db.update("INSERT INTO catalog(id,title,kind,release_year,genre,description,poster,backdrop,trailer) VALUES(?,?,?,?,?,?,?,?,?)",m.id(),m.title(),m.kind(),m.year(),m.genre(),m.description(),m.poster(),m.backdrop(),m.trailer());
    }
}
