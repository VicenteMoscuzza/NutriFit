package com.example.alimentos;

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

import com.example.alimentos.dto.AlimentoCreateRequest;
import com.example.alimentos.dto.AlimentoResponse;
import com.example.usuarios.Usuario;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/alimentos")
public class AlimentoController {

	private final AlimentoRepository alimentoRepository;
	private final AlimentoOcultoRepository alimentoOcultoRepository;

	public AlimentoController(AlimentoRepository alimentoRepository, AlimentoOcultoRepository alimentoOcultoRepository) {
		this.alimentoRepository = alimentoRepository;
		this.alimentoOcultoRepository = alimentoOcultoRepository;
	}

	@GetMapping
	public List<AlimentoResponse> listar(@AuthenticationPrincipal Usuario usuario) {
		return alimentoRepository.findVisiblesParaUsuarioOrderByNombreAsc(usuario.getId())
				.stream()
				.map(this::toResponse)
				.toList();
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public AlimentoResponse crear(@AuthenticationPrincipal Usuario usuario, @Valid @RequestBody AlimentoCreateRequest req) {
		double fibra = req.fibraPor100g() != null ? req.fibraPor100g() : 0.0;
		var alimento = new Alimento(
				usuario,
				req.nombre(),
				req.caloriasPor100g(),
				req.proteinasPor100g(),
				req.carbohidratosPor100g(),
				req.grasasPor100g(),
				fibra,
				req.tamanoPorcionG(),
				req.unidadPorcion());
		var saved = alimentoRepository.save(alimento);
		return toResponse(saved);
	}

	@PutMapping("/{id}")
	public AlimentoResponse actualizar(@AuthenticationPrincipal Usuario usuario,
			@PathVariable Long id,
			@Valid @RequestBody AlimentoCreateRequest req) {
		var propio = alimentoRepository.findByIdAndUsuarioId(id, usuario.getId());
		if (propio.isPresent()) {
			var a = propio.get();
			double fibra = req.fibraPor100g() != null ? req.fibraPor100g() : 0.0;
			a.setNombre(req.nombre());
			a.setCaloriasPor100g(req.caloriasPor100g());
			a.setProteinasPor100g(req.proteinasPor100g());
			a.setCarbohidratosPor100g(req.carbohidratosPor100g());
			a.setGrasasPor100g(req.grasasPor100g());
			a.setFibraPor100g(fibra);
			a.setTamanoPorcionG(req.tamanoPorcionG());
			a.setUnidadPorcion(req.unidadPorcion());
			return toResponse(alimentoRepository.save(a));
		}

		var global = alimentoRepository.findByIdVisibleParaUsuario(id, usuario.getId())
				.orElseThrow(() -> new IllegalArgumentException("Alimento no encontrado"));
		if (global.getUsuario() != null) {
			throw new IllegalArgumentException("Alimento no encontrado");
		}

		double fibra = req.fibraPor100g() != null ? req.fibraPor100g() : 0.0;
		var created = alimentoRepository.save(new Alimento(
				usuario,
				req.nombre(),
				req.caloriasPor100g(),
				req.proteinasPor100g(),
				req.carbohidratosPor100g(),
				req.grasasPor100g(),
				fibra,
				req.tamanoPorcionG(),
				req.unidadPorcion()));
		if (!alimentoOcultoRepository.existsByUsuarioIdAndAlimentoId(usuario.getId(), global.getId())) {
			alimentoOcultoRepository.save(new AlimentoOculto(usuario, global));
		}
		return toResponse(created);
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void eliminar(@AuthenticationPrincipal Usuario usuario, @PathVariable Long id) {
		var propio = alimentoRepository.findByIdAndUsuarioId(id, usuario.getId());
		if (propio.isPresent()) {
			alimentoRepository.delete(propio.get());
			return;
		}

		var alimento = alimentoRepository.findByIdVisibleParaUsuario(id, usuario.getId())
				.orElseThrow(() -> new IllegalArgumentException("Alimento no encontrado"));
		if (alimento.getUsuario() != null) {
			throw new IllegalArgumentException("Alimento no encontrado");
		}
		if (!alimentoOcultoRepository.existsByUsuarioIdAndAlimentoId(usuario.getId(), alimento.getId())) {
			alimentoOcultoRepository.save(new AlimentoOculto(usuario, alimento));
		}
	}

	private AlimentoResponse toResponse(Alimento a) {
		return new AlimentoResponse(
				a.getId(),
				a.getNombre(),
				a.getCaloriasPor100g(),
				a.getProteinasPor100g(),
				a.getCarbohidratosPor100g(),
				a.getGrasasPor100g(),
				a.getFibraPor100g(),
				a.getTamanoPorcionG(),
				a.getUnidadPorcion(),
				a.getUsuario() == null);
	}
}
