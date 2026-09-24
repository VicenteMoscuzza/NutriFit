package com.nutrifit.alimentos;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AlimentoRepository extends JpaRepository<Alimento, Long> {

    @Query("select a from Alimento a where a.esGlobal = true or a.usuario.id = :usuarioId "
            + "order by a.esGlobal desc, a.nombre asc")
    List<Alimento> buscarVisiblesParaUsuario(@Param("usuarioId") Long usuarioId);
}
