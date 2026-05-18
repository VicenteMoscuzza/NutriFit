package com.example.registros;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RegistroRutinaEjercicioRepository extends JpaRepository<RegistroRutinaEjercicio, Long> {

	List<RegistroRutinaEjercicio> findByUsuarioIdAndRutinaId(Long usuarioId, Long rutinaId);

	Optional<RegistroRutinaEjercicio> findByUsuarioIdAndRutinaIdAndEjercicioId(
			Long usuarioId, Long rutinaId, Long ejercicioId);
}
