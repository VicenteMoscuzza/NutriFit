package com.nutrifit.nutricion;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RegistroDiarioRepository extends JpaRepository<RegistroDiario, Long> {

    Optional<RegistroDiario> findByUsuarioIdAndFecha(Long usuarioId, LocalDate fecha);

    @Query("select new com.nutrifit.nutricion.ResumenNutricionPorFecha("
            + "r.fecha, count(distinct c.id), sum(i.caloriasCalculadas), sum(i.proteinaCalculada), "
            + "sum(i.carbohidratosCalculados), sum(i.grasaCalculada)) "
            + "from ItemRegistroDiario i join i.comidaRegistrada c join c.registroDiario r "
            + "where r.usuario.id = :usuarioId and r.fecha between :desde and :hasta "
            + "group by r.fecha")
    List<ResumenNutricionPorFecha> resumirPorFecha(
            @Param("usuarioId") Long usuarioId, @Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta);
}
