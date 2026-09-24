package com.nutrifit.nutricion;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ItemRegistroDiarioRepository extends JpaRepository<ItemRegistroDiario, Long> {

    @Query("select i from ItemRegistroDiario i "
            + "join fetch i.alimento "
            + "where i.comidaRegistrada.id = :comidaId "
            + "order by i.id asc")
    List<ItemRegistroDiario> buscarPorComida(@Param("comidaId") Long comidaId);

    Optional<ItemRegistroDiario> findByIdAndComidaRegistradaRegistroDiarioUsuarioId(Long id, Long usuarioId);
}
