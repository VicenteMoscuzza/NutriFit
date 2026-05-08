package com.example.comidas.ideales.dto;

import java.util.List;

import com.example.comidas.dto.ComidaAlimentoUpsertRequest;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ComidaIdealCreateRequest(
		@NotNull @Min(1) @Max(4) Integer tipoComida,
		@NotBlank @Size(max = 120) String nombre,
		@Size(max = 2000) String descripcion,
		List<ComidaAlimentoUpsertRequest> alimentos
) {
}

