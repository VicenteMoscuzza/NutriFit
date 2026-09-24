package com.nutrifit.nutricion;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ItemRegistroDiarioRepository extends JpaRepository<ItemRegistroDiario, Long> {

    @Query("select i from ItemRegistroDiario i "
            + "join fetch i.alimento "
            + "where i.registroDiario.id = :registroId "
            + "order by i.id asc")
    List<ItemRegistroDiario> buscarPorRegistro(@Param("registroId") Long registroId);

    Optional<ItemRegistroDiario> findByIdAndRegistroDiarioUsuarioId(Long id, Long usuarioId);
}
