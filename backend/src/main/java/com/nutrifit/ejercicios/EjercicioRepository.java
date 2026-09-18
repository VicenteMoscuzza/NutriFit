package com.nutrifit.ejercicios;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EjercicioRepository extends JpaRepository<Ejercicio, Long> {

    @Query("select e from Ejercicio e where e.esGlobal = true or e.usuario.id = :usuarioId "
            + "order by e.esGlobal desc, e.nombre asc")
    List<Ejercicio> buscarVisiblesParaUsuario(@Param("usuarioId") Long usuarioId);
}
