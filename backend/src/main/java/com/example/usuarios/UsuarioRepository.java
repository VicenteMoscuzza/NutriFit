package com.example.usuarios;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String email);
	Optional<Usuario> findByNombre(String nombre);

    // Login con email O con nombre
    @Query("SELECT u FROM Usuario u WHERE u.email = :val OR u.nombre = :val")
    Optional<Usuario> findByEmailOrNombre(@Param("val") String val);
}