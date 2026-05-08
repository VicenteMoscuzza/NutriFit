package com.example.alimentos;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AlimentoRepository extends JpaRepository<Alimento, Long> {
	Optional<Alimento> findByIdAndUsuarioId(Long id, Long usuarioId);

	@Query("""
			select a
			from Alimento a
			where a.id = :id
			  and (a.usuario is null or a.usuario.id = :usuarioId)
			""")
	Optional<Alimento> findByIdVisibleParaUsuario(@Param("id") Long id, @Param("usuarioId") Long usuarioId);

	@Query("""
			select a
			from Alimento a
			where (a.usuario is null or a.usuario.id = :usuarioId)
			  and not exists (
			    select 1 from AlimentoOculto ao
			    where ao.usuario.id = :usuarioId and ao.alimento.id = a.id
			  )
			order by a.nombre asc
			""")
	List<Alimento> findVisiblesParaUsuarioOrderByNombreAsc(@Param("usuarioId") Long usuarioId);

	@Query("""
			select a
			from Alimento a
			where a.id in :ids
			  and (a.usuario is null or a.usuario.id = :usuarioId)
			  and not exists (
			    select 1 from AlimentoOculto ao
			    where ao.usuario.id = :usuarioId and ao.alimento.id = a.id
			  )
			""")
	List<Alimento> findByIdsVisiblesParaUsuario(@Param("ids") List<Long> ids, @Param("usuarioId") Long usuarioId);

	List<Alimento> findByUsuarioIsNullOrderByNombreAsc();
}

