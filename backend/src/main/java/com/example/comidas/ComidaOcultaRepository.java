package com.example.comidas;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ComidaOcultaRepository extends JpaRepository<ComidaOculta, Long> {
	boolean existsByUsuarioIdAndComidaId(Long usuarioId, Long comidaId);
}
