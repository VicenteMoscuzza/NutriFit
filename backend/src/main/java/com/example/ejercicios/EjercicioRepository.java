package com.example.ejercicios;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EjercicioRepository extends JpaRepository<Ejercicio, Long> {
	Optional<Ejercicio> findByIdAndUsuarioId(Long id, Long usuarioId);

	@Query("""
			select e
			from Ejercicio e
			where e.id = :id
			  and (e.usuario is null or e.usuario.id = :usuarioId)
			""")
	Optional<Ejercicio> findByIdVisibleParaUsuario(@Param("id") Long id, @Param("usuarioId") Long usuarioId);

	@Query("""
			select e
			from Ejercicio e
			where (e.usuario is null or e.usuario.id = :usuarioId)
			  and not exists (
			    select 1 from EjercicioOculto eo
			    where eo.usuario.id = :usuarioId and eo.ejercicio.id = e.id
			  )
			order by e.nombre asc
			""")
	List<Ejercicio> findVisiblesParaUsuarioOrderByNombreAsc(@Param("usuarioId") Long usuarioId);

	@Query("""
			select e
			from Ejercicio e
			where e.id in :ids
			  and (e.usuario is null or e.usuario.id = :usuarioId)
			  and not exists (
			    select 1 from EjercicioOculto eo
			    where eo.usuario.id = :usuarioId and eo.ejercicio.id = e.id
			  )
			""")
	List<Ejercicio> findByIdsVisiblesParaUsuario(@Param("ids") List<Long> ids, @Param("usuarioId") Long usuarioId);

	List<Ejercicio> findByUsuarioIsNullOrderByNombreAsc();
}

