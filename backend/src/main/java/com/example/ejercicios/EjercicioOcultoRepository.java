package com.example.ejercicios;

import org.springframework.data.jpa.repository.JpaRepository;

public interface EjercicioOcultoRepository extends JpaRepository<EjercicioOculto, Long> {
	boolean existsByUsuarioIdAndEjercicioId(Long usuarioId, Long ejercicioId);
}

