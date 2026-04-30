package com.example.ejercicios;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.ejercicios.dto.EjercicioCreateRequest;
import com.example.ejercicios.dto.EjercicioResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/ejercicios")
public class EjercicioController {

	private final EjercicioRepository ejercicioRepository;

	public EjercicioController(EjercicioRepository ejercicioRepository) {
		this.ejercicioRepository = ejercicioRepository;
	}

	@GetMapping
	public List<EjercicioResponse> listar() {
		return ejercicioRepository.findAllByOrderByNombreAsc()
				.stream()
				.map(e -> new EjercicioResponse(e.getId(), e.getNombre(), e.getDescripcion()))
				.toList();
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public EjercicioResponse crear(@Valid @RequestBody EjercicioCreateRequest req) {
		var ejercicio = new Ejercicio(req.nombre(), req.descripcion());
		var saved = ejercicioRepository.save(ejercicio);
		return new EjercicioResponse(saved.getId(), saved.getNombre(), saved.getDescripcion());
	}
}

