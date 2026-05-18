package com.example.entrenamientos;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EntrenamientoRepository extends JpaRepository<Entrenamiento, Long> {

	Optional<Entrenamiento> findByUsuarioIdAndEstado(Long usuarioId, EstadoEntrenamiento estado);

	@Query("""
			select e
			from Entrenamiento e
			left join fetch e.rutina
			left join fetch e.ejercicios ee
			left join fetch ee.ejercicio
			where e.id = :id and e.usuario.id = :usuarioId
			""")
	Optional<Entrenamiento> findByIdAndUsuarioIdWithDetails(@Param("id") Long id, @Param("usuarioId") Long usuarioId);

	@Query("""
			select e
			from Entrenamiento e
			left join fetch e.rutina
			left join fetch e.ejercicios ee
			left join fetch ee.ejercicio
			where e.usuario.id = :usuarioId and e.estado = :estado
			""")
	Optional<Entrenamiento> findActivoWithDetails(@Param("usuarioId") Long usuarioId, @Param("estado") EstadoEntrenamiento estado);
}
