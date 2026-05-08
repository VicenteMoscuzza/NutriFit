package com.example.registros;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.ejercicios.EjercicioRepository;
import com.example.registros.dto.RegistroEjercicioResponse;
import com.example.registros.dto.RegistroEjercicioUpsertRequest;
import com.example.usuarios.Usuario;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/registros/ejercicios")
public class RegistroEjercicioController {

	private final RegistroEjercicioRepository registroRepository;
	private final EjercicioRepository ejercicioRepository;

	public RegistroEjercicioController(RegistroEjercicioRepository registroRepository, EjercicioRepository ejercicioRepository) {
		this.registroRepository = registroRepository;
		this.ejercicioRepository = ejercicioRepository;
	}

	@GetMapping
	public List<RegistroEjercicioResponse> listar(@AuthenticationPrincipal Usuario usuario) {
		return registroRepository.findByUsuarioIdOrderByUpdatedAtDesc(usuario.getId())
				.stream()
				.map(r -> new RegistroEjercicioResponse(
						r.getEjercicio().getId(),
						r.getUltimoPesoMaxKg(),
						r.getUpdatedAt()))
				.toList();
	}

	@PutMapping("/{ejercicioId}")
	@ResponseStatus(HttpStatus.OK)
	public RegistroEjercicioResponse upsert(@AuthenticationPrincipal Usuario usuario,
			@PathVariable Long ejercicioId,
			@Valid @RequestBody RegistroEjercicioUpsertRequest req) {

		var ejercicio = ejercicioRepository.findByIdVisibleParaUsuario(ejercicioId, usuario.getId())
				.orElseThrow(() -> new IllegalArgumentException("Ejercicio no encontrado"));

		var existing = registroRepository.findByUsuarioIdAndEjercicioId(usuario.getId(), ejercicio.getId());
		var registro = existing.orElseGet(() -> new RegistroEjercicio(usuario, ejercicio, null));
		registro.setUltimoPesoMaxKg(req.ultimoPesoMaxKg());

		var saved = registroRepository.save(registro);
		return new RegistroEjercicioResponse(
				saved.getEjercicio().getId(),
				saved.getUltimoPesoMaxKg(),
				saved.getUpdatedAt());
	}
}

