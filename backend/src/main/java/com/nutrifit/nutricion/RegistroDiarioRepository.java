package com.nutrifit.nutricion;

import java.time.LocalDate;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RegistroDiarioRepository extends JpaRepository<RegistroDiario, Long> {

    Optional<RegistroDiario> findByUsuarioIdAndFecha(Long usuarioId, LocalDate fecha);
}
