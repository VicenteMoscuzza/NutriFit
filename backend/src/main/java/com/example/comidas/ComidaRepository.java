package com.example.comidas;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ComidaRepository extends JpaRepository<Comida, Long> {

	@Query("""
			select c
			from Comida c
			where (c.usuario.id = :usuarioId or c.usuario.nombre = :globalUsername)
			  and not exists (
			    select 1 from ComidaOculta co
			    where co.usuario.id = :usuarioId and co.comida.id = c.id
			  )
			""")
	List<Comida> findVisiblesParaUsuario(
			@Param("usuarioId") Long usuarioId,
			@Param("globalUsername") String globalUsername);

	@Query("""
			select c
			from Comida c
			where c.id = :id
			  and (c.usuario.id = :usuarioId or c.usuario.nombre = :globalUsername)
			  and not exists (
			    select 1 from ComidaOculta co
			    where co.usuario.id = :usuarioId and co.comida.id = c.id
			  )
			""")
	Optional<Comida> findByIdVisibleParaUsuario(
			@Param("id") Long id,
			@Param("usuarioId") Long usuarioId,
			@Param("globalUsername") String globalUsername);

	Optional<Comida> findByIdAndUsuarioId(Long id, Long usuarioId);

	boolean existsByUsuario_NombreAndTipoComida(String usuarioNombre, int tipoComida);
}
