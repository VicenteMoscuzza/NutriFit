package com.example.rutinas;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RutinaOcultaRepository extends JpaRepository<RutinaOculta, Long> {
	boolean existsByUsuarioIdAndRutinaId(Long usuarioId, Long rutinaId);
}

