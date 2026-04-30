package com.example.usuarios.dto;

import java.time.LocalDate;

public record UsuarioResponse(
		Long id,
		String nombre,
		String email,
		LocalDate fechaNacimiento
) {
}
