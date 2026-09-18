package com.nutrifit.entrenamiento;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SerieEntrenamientoRepository extends JpaRepository<SerieEntrenamiento, Long> {

    @Query("select s from SerieEntrenamiento s "
            + "where s.usuario.id = :usuarioId and s.fecha = :fecha "
            + "order by s.ejercicioRutina.id asc, s.numeroSerie asc")
    List<SerieEntrenamiento> buscarPorUsuarioYFecha(@Param("usuarioId") Long usuarioId, @Param("fecha") LocalDate fecha);

    int countByEjercicioRutinaIdAndUsuarioIdAndFecha(Long ejercicioRutinaId, Long usuarioId, LocalDate fecha);
}
