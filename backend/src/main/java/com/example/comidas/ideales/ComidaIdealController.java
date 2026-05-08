package com.example.comidas.ideales;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

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

import com.example.alimentos.Alimento;
import com.example.alimentos.AlimentoRepository;
import com.example.comidas.dto.AlimentoItemResponse;
import com.example.comidas.dto.ComidaAlimentoUpsertRequest;
import com.example.comidas.dto.MacrosResponse;
import com.example.comidas.ideales.dto.ComidaIdealCreateRequest;
import com.example.comidas.ideales.dto.ComidaIdealResponse;
import com.example.usuarios.Usuario;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/comidas-ideales")
public class ComidaIdealController {

	private final ComidaIdealRepository comidaIdealRepository;
	private final AlimentoRepository alimentoRepository;

	public ComidaIdealController(ComidaIdealRepository comidaIdealRepository, AlimentoRepository alimentoRepository) {
		this.comidaIdealRepository = comidaIdealRepository;
		this.alimentoRepository = alimentoRepository;
	}

	@GetMapping
	public List<ComidaIdealResponse> listar(@AuthenticationPrincipal Usuario usuario) {
		return comidaIdealRepository.findByUsuarioIdOrderByTipoComidaAscCreatedAtAsc(usuario.getId())
				.stream()
				.map(this::toResponse)
				.toList();
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public ComidaIdealResponse crear(@AuthenticationPrincipal Usuario usuario, @Valid @RequestBody ComidaIdealCreateRequest req) {
		if (comidaIdealRepository.findByUsuarioIdAndTipoComida(usuario.getId(), req.tipoComida()).isPresent()) {
			throw new IllegalArgumentException("Ya tenés una comida ideal para ese momento del día");
		}
		var comida = new ComidaIdeal(usuario, req.nombre(), req.descripcion(), req.tipoComida());
		applyAlimentos(comida, req, usuario.getId());
		return toResponse(comidaIdealRepository.save(comida));
	}

	@PutMapping("/{id}")
	public ComidaIdealResponse actualizar(@AuthenticationPrincipal Usuario usuario,
			@PathVariable Long id,
			@Valid @RequestBody ComidaIdealCreateRequest req) {
		var comida = comidaIdealRepository.findByIdAndUsuarioId(id, usuario.getId())
				.orElseThrow(() -> new IllegalArgumentException("Comida ideal no encontrada"));
		if (comida.getTipoComida() != req.tipoComida()) {
			throw new IllegalArgumentException("No se puede cambiar el tipo de una comida ideal existente");
		}
		comida.setNombre(req.nombre());
		comida.setDescripcion(req.descripcion());
		comida.getAlimentos().clear();
		applyAlimentos(comida, req, usuario.getId());
		return toResponse(comidaIdealRepository.save(comida));
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void eliminar(@AuthenticationPrincipal Usuario usuario, @PathVariable Long id) {
		var comida = comidaIdealRepository.findByIdAndUsuarioId(id, usuario.getId())
				.orElseThrow(() -> new IllegalArgumentException("Comida ideal no encontrada"));
		comidaIdealRepository.delete(comida);
	}

	private void applyAlimentos(ComidaIdeal comida, ComidaIdealCreateRequest req, Long usuarioId) {
		if (req.alimentos() == null || req.alimentos().isEmpty()) return;

		var alimentoIds = req.alimentos().stream().map(ComidaAlimentoUpsertRequest::alimentoId).toList();
		var alimentos = alimentoRepository.findByIdsVisiblesParaUsuario(alimentoIds, usuarioId);
		if (alimentos.size() != alimentoIds.size()) {
			throw new IllegalArgumentException("Uno o más alimentos no existen o no están disponibles");
		}
		Map<Long, Alimento> byId = alimentos.stream().collect(Collectors.toMap(Alimento::getId, Function.identity()));
		for (var item : req.alimentos()) {
			var a = byId.get(item.alimentoId());
			if (a == null) throw new IllegalArgumentException("Uno o más alimentos no existen o no están disponibles");
			comida.getAlimentos().add(new ComidaIdealAlimento(comida, a, item.cantidadG()));
		}
	}

	private ComidaIdealResponse toResponse(ComidaIdeal comida) {
		var alimentos = comida.getAlimentos()
				.stream()
				.map(ca -> {
					var a = ca.getAlimento();
					var macros = macrosFor(a.getCaloriasPor100g(), a.getProteinasPor100g(), a.getCarbohidratosPor100g(),
							a.getGrasasPor100g(), a.getFibraPor100g(), ca.getCantidadG());
					return new AlimentoItemResponse(a.getId(), a.getNombre(), ca.getCantidadG(), macros);
				})
				.toList();

		var total = alimentos.stream()
				.map(AlimentoItemResponse::macros)
				.reduce(MacrosResponse.zero(), MacrosResponse::plus);

		return new ComidaIdealResponse(
				comida.getId(),
				comida.getTipoComida(),
				comida.getNombre(),
				comida.getDescripcion(),
				comida.getCreatedAt(),
				alimentos,
				total);
	}

	private static MacrosResponse macrosFor(double kcal100, double p100, double c100, double g100, double f100, double cantidadG) {
		double factor = cantidadG / 100.0;
		return new MacrosResponse(
				kcal100 * factor,
				p100 * factor,
				c100 * factor,
				g100 * factor,
				f100 * factor);
	}
}
