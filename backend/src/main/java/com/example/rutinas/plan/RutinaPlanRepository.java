package com.example.rutinas.plan;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RutinaPlanRepository extends JpaRepository<RutinaPlan, Long> {
	List<RutinaPlan> findByUsuarioIdOrderByDiaSemanaAscCreatedAtAsc(Long usuarioId);
	Optional<RutinaPlan> findByIdAndUsuarioId(Long id, Long usuarioId);
	boolean existsByUsuarioIdAndDiaSemanaAndRutinaId(Long usuarioId, Integer diaSemana, Long rutinaId);
}

