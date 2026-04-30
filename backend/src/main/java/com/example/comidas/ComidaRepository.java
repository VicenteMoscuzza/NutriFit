package com.example.comidas;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ComidaRepository extends JpaRepository<Comida, Long> {
	List<Comida> findByUsuarioIdOrderByFechaDescCreatedAtDesc(Long usuarioId);
	Optional<Comida> findByIdAndUsuarioId(Long id, Long usuarioId);
}

