package com.example.entrenamientos;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EntrenamientoSerieRepository extends JpaRepository<EntrenamientoSerie, Long> {

	@Query("""
			select s
			from EntrenamientoSerie s
			join fetch s.entrenamientoEjercicio ee
			join fetch ee.entrenamiento e
			join fetch ee.ejercicio
			where s.id = :id and e.usuario.id = :usuarioId
			""")
	Optional<EntrenamientoSerie> findByIdAndUsuarioId(@Param("id") Long id, @Param("usuarioId") Long usuarioId);
}
