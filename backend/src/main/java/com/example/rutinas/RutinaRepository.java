package com.example.rutinas;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RutinaRepository extends JpaRepository<Rutina, Long> {
	List<Rutina> findByUsuarioIdOrderByCreatedAtDesc(Long usuarioId);
	Optional<Rutina> findByIdAndUsuarioId(Long id, Long usuarioId);
}

