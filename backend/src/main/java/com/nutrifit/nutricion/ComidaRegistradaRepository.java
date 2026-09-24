package com.nutrifit.nutricion;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ComidaRegistradaRepository extends JpaRepository<ComidaRegistrada, Long> {

    List<ComidaRegistrada> findByRegistroDiarioIdOrderByIdAsc(Long registroDiarioId);

    Optional<ComidaRegistrada> findByIdAndRegistroDiarioUsuarioId(Long id, Long usuarioId);

    int countByRegistroDiarioId(Long registroDiarioId);
}
