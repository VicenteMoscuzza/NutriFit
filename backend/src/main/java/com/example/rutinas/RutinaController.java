package com.example.rutinas;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.ejercicios.EjercicioRepository;
import com.example.rutinas.dto.EjercicioItemResponse;
import com.example.rutinas.dto.RutinaCreateRequest;
import com.example.rutinas.dto.RutinaResponse;
import com.example.usuarios.Usuario;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/rutinas")
public class RutinaController {

	private final RutinaRepository rutinaRepository;
	private final EjercicioRepository ejercicioRepository;

	public RutinaController(RutinaRepository rutinaRepository, EjercicioRepository ejercicioRepository) {
		this.rutinaRepository = rutinaRepository;
		this.ejercicioRepository = ejercicioRepository;
	}

	@GetMapping
	public List<RutinaResponse> listar(@AuthenticationPrincipal Usuario usuario) {
		return rutinaRepository.findByUsuarioIdOrderByCreatedAtDesc(usuario.getId())
				.stream()
				.map(r -> new RutinaResponse(
						r.getId(),
						r.getNombre(),
						r.getDescripcion(),
						r.getCreatedAt(),
						r.getEjercicios()
								.stream()
								.map(re -> new EjercicioItemResponse(
										re.getEjercicio().getId(),
										re.getEjercicio().getNombre(),
										re.getEjercicio().getDescripcion()))
								.toList()))
				.toList();
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public RutinaResponse crear(@AuthenticationPrincipal Usuario usuario,
			@Valid @RequestBody RutinaCreateRequest req) {
		var rutina = new Rutina(usuario, req.nombre(), req.descripcion());

		if (req.ejercicioIds() != null && !req.ejercicioIds().isEmpty()) {
			var ejercicios = ejercicioRepository.findAllById(req.ejercicioIds());
			if (ejercicios.size() != req.ejercicioIds().size()) {
				throw new IllegalArgumentException("Uno o más ejercicios no existen");
			}
			for (var e : ejercicios) {
				rutina.getEjercicios().add(new RutinaEjercicio(rutina, e));
			}
		}

		var saved = rutinaRepository.save(rutina);
		return new RutinaResponse(
				saved.getId(),
				saved.getNombre(),
				saved.getDescripcion(),
				saved.getCreatedAt(),
				saved.getEjercicios()
						.stream()
						.map(re -> new EjercicioItemResponse(
								re.getEjercicio().getId(),
								re.getEjercicio().getNombre(),
								re.getEjercicio().getDescripcion()))
						.toList());
	}

	@PutMapping("/{id}")
	public RutinaResponse actualizar(@AuthenticationPrincipal Usuario usuario,
			@PathVariable Long id,
			@Valid @RequestBody RutinaCreateRequest req) {
		var rutina = rutinaRepository.findByIdAndUsuarioId(id, usuario.getId())
				.orElseThrow(() -> new IllegalArgumentException("Rutina no encontrada"));

		rutina.setNombre(req.nombre());
		rutina.setDescripcion(req.descripcion());

		// Reemplazar relación con ejercicios
		rutina.getEjercicios().clear();
		if (req.ejercicioIds() != null && !req.ejercicioIds().isEmpty()) {
			var ejercicios = ejercicioRepository.findAllById(req.ejercicioIds());
			if (ejercicios.size() != req.ejercicioIds().size()) {
				throw new IllegalArgumentException("Uno o más ejercicios no existen");
			}
			for (var e : ejercicios) {
				rutina.getEjercicios().add(new RutinaEjercicio(rutina, e));
			}
		}

		var saved = rutinaRepository.save(rutina);
		return new RutinaResponse(
				saved.getId(),
				saved.getNombre(),
				saved.getDescripcion(),
				saved.getCreatedAt(),
				saved.getEjercicios()
						.stream()
						.map(re -> new EjercicioItemResponse(
								re.getEjercicio().getId(),
								re.getEjercicio().getNombre(),
								re.getEjercicio().getDescripcion()))
						.toList());
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void eliminar(@AuthenticationPrincipal Usuario usuario, @PathVariable Long id) {
		var rutina = rutinaRepository.findByIdAndUsuarioId(id, usuario.getId())
				.orElseThrow(() -> new IllegalArgumentException("Rutina no encontrada"));
		rutinaRepository.delete(rutina);
	}
}

