package com.example.comidas.ideales;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ComidaIdealRepository extends JpaRepository<ComidaIdeal, Long> {

	List<ComidaIdeal> findByUsuarioIdOrderByTipoComidaAscCreatedAtAsc(Long usuarioId);

	Optional<ComidaIdeal> findByUsuarioIdAndTipoComida(Long usuarioId, int tipoComida);

	Optional<ComidaIdeal> findByIdAndUsuarioId(Long id, Long usuarioId);
}
