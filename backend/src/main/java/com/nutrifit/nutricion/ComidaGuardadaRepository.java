package com.nutrifit.nutricion;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ComidaGuardadaRepository extends JpaRepository<ComidaGuardada, Long> {

    List<ComidaGuardada> findByUsuarioIdOrderByNombreAsc(Long usuarioId);

    Optional<ComidaGuardada> findByIdAndUsuarioId(Long id, Long usuarioId);
}
