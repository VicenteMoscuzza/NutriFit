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

    @Query("select s from SerieEntrenamiento s "
            + "join fetch s.ejercicioRutina er "
            + "join fetch er.ejercicio "
            + "join fetch er.diaRutina "
            + "where s.usuario.id = :usuarioId and s.fecha = :fecha "
            + "order by er.id asc, s.numeroSerie asc")
    List<SerieEntrenamiento> buscarConEjercicioPorUsuarioYFecha(
            @Param("usuarioId") Long usuarioId, @Param("fecha") LocalDate fecha);

    @Query("select new com.nutrifit.entrenamiento.ResumenSeriesPorFecha(s.fecha, count(s)) "
            + "from SerieEntrenamiento s "
            + "where s.usuario.id = :usuarioId and s.fecha between :desde and :hasta "
            + "group by s.fecha")
    List<ResumenSeriesPorFecha> resumirPorFecha(
            @Param("usuarioId") Long usuarioId, @Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta);

    int countByEjercicioRutinaIdAndUsuarioIdAndFecha(Long ejercicioRutinaId, Long usuarioId, LocalDate fecha);
}
