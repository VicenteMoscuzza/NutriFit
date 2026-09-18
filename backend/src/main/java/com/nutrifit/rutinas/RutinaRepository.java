package com.nutrifit.rutinas;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RutinaRepository extends JpaRepository<Rutina, Long> {

    Optional<Rutina> findByUsuarioId(Long usuarioId);
}
