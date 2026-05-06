package com.example.ejercicios;

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

import com.example.ejercicios.dto.EjercicioCreateRequest;
import com.example.ejercicios.dto.EjercicioResponse;
import com.example.usuarios.Usuario;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/ejercicios")
public class EjercicioController {

	private final EjercicioRepository ejercicioRepository;
	private final EjercicioOcultoRepository ejercicioOcultoRepository;

	public EjercicioController(EjercicioRepository ejercicioRepository, EjercicioOcultoRepository ejercicioOcultoRepository) {
		this.ejercicioRepository = ejercicioRepository;
		this.ejercicioOcultoRepository = ejercicioOcultoRepository;
	}

	@GetMapping
	public List<EjercicioResponse> listar(@AuthenticationPrincipal Usuario usuario) {
		return ejercicioRepository.findVisiblesParaUsuarioOrderByNombreAsc(usuario.getId())
				.stream()
				.map(e -> new EjercicioResponse(e.getId(), e.getNombre(), e.getDescripcion()))
				.toList();
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public EjercicioResponse crear(@AuthenticationPrincipal Usuario usuario, @Valid @RequestBody EjercicioCreateRequest req) {
		var ejercicio = new Ejercicio(usuario, req.nombre(), req.descripcion());
		var saved = ejercicioRepository.save(ejercicio);
		return new EjercicioResponse(saved.getId(), saved.getNombre(), saved.getDescripcion());
	}

	@PutMapping("/{id}")
	public EjercicioResponse actualizar(@AuthenticationPrincipal Usuario usuario,
			@PathVariable Long id,
			@Valid @RequestBody EjercicioCreateRequest req) {
		// Si es propio, editamos in-place.
		var propio = ejercicioRepository.findByIdAndUsuarioId(id, usuario.getId());
		if (propio.isPresent()) {
			var ejercicio = propio.get();
			ejercicio.setNombre(req.nombre());
			ejercicio.setDescripcion(req.descripcion());
			var saved = ejercicioRepository.save(ejercicio);
			return new EjercicioResponse(saved.getId(), saved.getNombre(), saved.getDescripcion());
		}

		// Si es global, hacemos "copiar y ocultar" (edición solo para este usuario).
		var global = ejercicioRepository.findByIdVisibleParaUsuario(id, usuario.getId())
				.orElseThrow(() -> new IllegalArgumentException("Ejercicio no encontrado"));
		if (global.getUsuario() != null) {
			throw new IllegalArgumentException("Ejercicio no encontrado");
		}

		var created = ejercicioRepository.save(new Ejercicio(usuario, req.nombre(), req.descripcion()));
		if (!ejercicioOcultoRepository.existsByUsuarioIdAndEjercicioId(usuario.getId(), global.getId())) {
			ejercicioOcultoRepository.save(new EjercicioOculto(usuario, global));
		}
		return new EjercicioResponse(created.getId(), created.getNombre(), created.getDescripcion());
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void eliminar(@AuthenticationPrincipal Usuario usuario, @PathVariable Long id) {
		// Si es propio, borramos de verdad.
		var propio = ejercicioRepository.findByIdAndUsuarioId(id, usuario.getId());
		if (propio.isPresent()) {
			ejercicioRepository.delete(propio.get());
			return;
		}

		// Si es global, lo ocultamos solo para este usuario.
		var ejercicio = ejercicioRepository.findByIdVisibleParaUsuario(id, usuario.getId())
				.orElseThrow(() -> new IllegalArgumentException("Ejercicio no encontrado"));
		if (ejercicio.getUsuario() != null) {
			throw new IllegalArgumentException("Ejercicio no encontrado");
		}
		if (!ejercicioOcultoRepository.existsByUsuarioIdAndEjercicioId(usuario.getId(), ejercicio.getId())) {
			ejercicioOcultoRepository.save(new EjercicioOculto(usuario, ejercicio));
		}
	}
}

