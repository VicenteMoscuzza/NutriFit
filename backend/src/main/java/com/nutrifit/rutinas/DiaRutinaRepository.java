package com.nutrifit.rutinas;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DiaRutinaRepository extends JpaRepository<DiaRutina, Long> {

    List<DiaRutina> findByRutinaIdOrderByNumeroAsc(Long rutinaId);

    Optional<DiaRutina> findByIdAndRutinaUsuarioId(Long id, Long usuarioId);

    int countByRutinaId(Long rutinaId);
}
