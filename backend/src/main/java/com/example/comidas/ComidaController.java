package com.example.comidas;

import java.time.LocalDate;
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

import com.example.alimentos.AlimentoRepository;
import com.example.comidas.dto.AlimentoItemResponse;
import com.example.comidas.dto.ComidaCreateRequest;
import com.example.comidas.dto.ComidaResponse;
import com.example.usuarios.Usuario;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/comidas")
public class ComidaController {

	private final ComidaRepository comidaRepository;
	private final AlimentoRepository alimentoRepository;

	public ComidaController(ComidaRepository comidaRepository, AlimentoRepository alimentoRepository) {
		this.comidaRepository = comidaRepository;
		this.alimentoRepository = alimentoRepository;
	}

	@GetMapping
	public List<ComidaResponse> listar(@AuthenticationPrincipal Usuario usuario) {
		return comidaRepository.findByUsuarioIdOrderByFechaDescCreatedAtDesc(usuario.getId())
				.stream()
				.map(c -> new ComidaResponse(
						c.getId(),
						c.getNombre(),
						c.getDescripcion(),
						c.getFecha(),
						c.getCreatedAt(),
						c.getAlimentos()
								.stream()
								.map(ca -> new AlimentoItemResponse(
										ca.getAlimento().getId(),
										ca.getAlimento().getNombre()))
								.toList()))
				.toList();
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public ComidaResponse crear(@AuthenticationPrincipal Usuario usuario,
			@Valid @RequestBody ComidaCreateRequest req) {
		LocalDate fecha = req.fecha() != null ? req.fecha() : LocalDate.now();
		var comida = new Comida(usuario, req.nombre(), req.descripcion(), fecha);

		if (req.alimentoIds() != null && !req.alimentoIds().isEmpty()) {
			var alimentos = alimentoRepository.findAllById(req.alimentoIds());
			if (alimentos.size() != req.alimentoIds().size()) {
				throw new IllegalArgumentException("Uno o más alimentos no existen");
			}
			for (var a : alimentos) {
				comida.getAlimentos().add(new ComidaAlimento(comida, a));
			}
		}

		var saved = comidaRepository.save(comida);
		return new ComidaResponse(
				saved.getId(),
				saved.getNombre(),
				saved.getDescripcion(),
				saved.getFecha(),
				saved.getCreatedAt(),
				saved.getAlimentos()
						.stream()
						.map(ca -> new AlimentoItemResponse(
								ca.getAlimento().getId(),
								ca.getAlimento().getNombre()))
						.toList());
	}

	@PutMapping("/{id}")
	public ComidaResponse actualizar(@AuthenticationPrincipal Usuario usuario,
			@PathVariable Long id,
			@Valid @RequestBody ComidaCreateRequest req) {
		var comida = comidaRepository.findByIdAndUsuarioId(id, usuario.getId())
				.orElseThrow(() -> new IllegalArgumentException("Comida no encontrada"));

		comida.setNombre(req.nombre());
		comida.setDescripcion(req.descripcion());
		comida.setFecha(req.fecha() != null ? req.fecha() : LocalDate.now());

		comida.getAlimentos().clear();
		if (req.alimentoIds() != null && !req.alimentoIds().isEmpty()) {
			var alimentos = alimentoRepository.findAllById(req.alimentoIds());
			if (alimentos.size() != req.alimentoIds().size()) {
				throw new IllegalArgumentException("Uno o más alimentos no existen");
			}
			for (var a : alimentos) {
				comida.getAlimentos().add(new ComidaAlimento(comida, a));
			}
		}

		var saved = comidaRepository.save(comida);
		return new ComidaResponse(
				saved.getId(),
				saved.getNombre(),
				saved.getDescripcion(),
				saved.getFecha(),
				saved.getCreatedAt(),
				saved.getAlimentos()
						.stream()
						.map(ca -> new AlimentoItemResponse(
								ca.getAlimento().getId(),
								ca.getAlimento().getNombre()))
						.toList());
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void eliminar(@AuthenticationPrincipal Usuario usuario, @PathVariable Long id) {
		var comida = comidaRepository.findByIdAndUsuarioId(id, usuario.getId())
				.orElseThrow(() -> new IllegalArgumentException("Comida no encontrada"));
		comidaRepository.delete(comida);
	}
}

