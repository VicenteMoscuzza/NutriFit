package com.example.alimentos;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AlimentoOcultoRepository extends JpaRepository<AlimentoOculto, Long> {
	boolean existsByUsuarioIdAndAlimentoId(Long usuarioId, Long alimentoId);
}
