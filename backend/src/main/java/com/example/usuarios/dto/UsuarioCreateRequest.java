package com.example.usuarios.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UsuarioCreateRequest(
		@NotBlank String nombre,
		@NotBlank @Email String email,
		@NotBlank @Size(min = 8, max = 72) String password,
		@NotNull @Past LocalDate fechaNacimiento
) {
}
