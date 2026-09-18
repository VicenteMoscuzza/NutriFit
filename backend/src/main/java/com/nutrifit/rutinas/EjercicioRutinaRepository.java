package com.nutrifit.rutinas;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EjercicioRutinaRepository extends JpaRepository<EjercicioRutina, Long> {

    @Query("select er from EjercicioRutina er "
            + "join fetch er.ejercicio "
            + "join fetch er.diaRutina "
            + "where er.diaRutina.rutina.id = :rutinaId "
            + "order by er.diaRutina.diaSemana asc, er.id asc")
    List<EjercicioRutina> buscarPorRutina(@Param("rutinaId") Long rutinaId);
}
