package com.example.rutinas;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RutinaRepository extends JpaRepository<Rutina, Long> {
	String GLOBAL_USERNAME = "GLOBAL";

	@Query("""
			select r
			from Rutina r
			where (r.usuario.id = :usuarioId or r.usuario.nombre = :globalUsername)
			  and not exists (
			    select 1 from RutinaOculta ro
			    where ro.usuario.id = :usuarioId and ro.rutina.id = r.id
			  )
			order by r.createdAt desc
			""")
	List<Rutina> findVisiblesParaUsuarioOrderByCreatedAtDesc(
			@Param("usuarioId") Long usuarioId,
			@Param("globalUsername") String globalUsername);

	@Query("""
			select r
			from Rutina r
			where r.id = :id
			  and (r.usuario.id = :usuarioId or r.usuario.nombre = :globalUsername)
			  and not exists (
			    select 1 from RutinaOculta ro
			    where ro.usuario.id = :usuarioId and ro.rutina.id = r.id
			  )
			""")
	Optional<Rutina> findByIdVisibleParaUsuario(
			@Param("id") Long id,
			@Param("usuarioId") Long usuarioId,
			@Param("globalUsername") String globalUsername);

	Optional<Rutina> findByIdAndUsuarioId(Long id, Long usuarioId);

	List<Rutina> findByUsuarioNombreOrderByCreatedAtDesc(String nombre);
}

