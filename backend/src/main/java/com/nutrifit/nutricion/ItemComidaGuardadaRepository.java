package com.nutrifit.nutricion;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ItemComidaGuardadaRepository extends JpaRepository<ItemComidaGuardada, Long> {

    @Query("select i from ItemComidaGuardada i "
            + "join fetch i.alimento "
            + "where i.comidaGuardada.id = :comidaId "
            + "order by i.id asc")
    List<ItemComidaGuardada> buscarPorComida(@Param("comidaId") Long comidaId);

    Optional<ItemComidaGuardada> findByIdAndComidaGuardadaUsuarioId(Long id, Long usuarioId);
}
