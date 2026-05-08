package com.example.registros;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RegistroEjercicioRepository extends JpaRepository<RegistroEjercicio, Long> {
	Optional<RegistroEjercicio> findByUsuarioIdAndEjercicioId(Long usuarioId, Long ejercicioId);

	@Query("""
			select r
			from RegistroEjercicio r
			where r.usuario.id = :usuarioId
			order by r.updatedAt desc
			""")
	List<RegistroEjercicio> findByUsuarioIdOrderByUpdatedAtDesc(@Param("usuarioId") Long usuarioId);
}

