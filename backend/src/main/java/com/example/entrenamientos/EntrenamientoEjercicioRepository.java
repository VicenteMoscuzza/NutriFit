package com.example.entrenamientos;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EntrenamientoEjercicioRepository extends JpaRepository<EntrenamientoEjercicio, Long> {

	@Query("""
			select ee
			from EntrenamientoEjercicio ee
			join fetch ee.entrenamiento e
			join fetch ee.ejercicio
			left join fetch ee.series
			where ee.id = :id and e.usuario.id = :usuarioId
			""")
	Optional<EntrenamientoEjercicio> findByIdAndUsuarioIdWithSeries(@Param("id") Long id, @Param("usuarioId") Long usuarioId);
}
