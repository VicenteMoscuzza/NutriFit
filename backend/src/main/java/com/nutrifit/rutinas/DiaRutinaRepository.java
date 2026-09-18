package com.nutrifit.rutinas;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DiaRutinaRepository extends JpaRepository<DiaRutina, Long> {

    Optional<DiaRutina> findByRutinaIdAndDiaSemana(Long rutinaId, Short diaSemana);
}
