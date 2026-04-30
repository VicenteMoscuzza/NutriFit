package com.example.rutinas.plan;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.rutinas.RutinaRepository;
import com.example.rutinas.plan.dto.RutinaPlanCreateRequest;
import com.example.rutinas.plan.dto.RutinaPlanItemResponse;
import com.example.rutinas.plan.dto.RutinaPlanRutinaResponse;
import com.example.usuarios.Usuario;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/rutina-plan")
public class RutinaPlanController {

	private final RutinaPlanRepository rutinaPlanRepository;
	private final RutinaRepository rutinaRepository;

	public RutinaPlanController(RutinaPlanRepository rutinaPlanRepository, RutinaRepository rutinaRepository) {
		this.rutinaPlanRepository = rutinaPlanRepository;
		this.rutinaRepository = rutinaRepository;
	}

	@GetMapping
	public List<RutinaPlanItemResponse> listar(@AuthenticationPrincipal Usuario usuario) {
		return rutinaPlanRepository.findByUsuarioIdOrderByDiaSemanaAscCreatedAtAsc(usuario.getId())
				.stream()
				.map(p -> new RutinaPlanItemResponse(
						p.getId(),
						p.getDiaSemana(),
						new RutinaPlanRutinaResponse(
								p.getRutina().getId(),
								p.getRutina().getNombre(),
								p.getRutina().getDescripcion())))
				.toList();
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public RutinaPlanItemResponse crear(@AuthenticationPrincipal Usuario usuario,
			@Valid @RequestBody RutinaPlanCreateRequest req) {
		// Validar que la rutina pertenezca al usuario
		var rutina = rutinaRepository.findByIdAndUsuarioId(req.rutinaId(), usuario.getId())
				.orElseThrow(() -> new IllegalArgumentException("Rutina no encontrada"));

		// Evitar duplicados (mismo día + misma rutina)
		var exists = rutinaPlanRepository.existsByUsuarioIdAndDiaSemanaAndRutinaId(
				usuario.getId(),
				req.diaSemana(),
				req.rutinaId());
		if (exists) {
			throw new IllegalArgumentException("Esa rutina ya está agregada a ese día");
		}

		var saved = rutinaPlanRepository.save(new RutinaPlan(usuario, rutina, req.diaSemana()));
		return new RutinaPlanItemResponse(
				saved.getId(),
				saved.getDiaSemana(),
				new RutinaPlanRutinaResponse(
						rutina.getId(),
						rutina.getNombre(),
						rutina.getDescripcion()));
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void eliminar(@AuthenticationPrincipal Usuario usuario, @PathVariable Long id) {
		var item = rutinaPlanRepository.findByIdAndUsuarioId(id, usuario.getId())
				.orElseThrow(() -> new IllegalArgumentException("Asignación no encontrada"));
		rutinaPlanRepository.delete(item);
	}
}

