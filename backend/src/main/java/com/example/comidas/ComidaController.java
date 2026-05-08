package com.example.comidas;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
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
import com.example.comidas.dto.ComidaCalcularRequest;
import com.example.comidas.dto.ComidaCalcularResponse;
import com.example.comidas.dto.ComidaCreateRequest;
import com.example.comidas.dto.ComidaResponse;
import com.example.comidas.dto.MacrosResponse;
import com.example.rutinas.RutinaRepository;
import com.example.usuarios.Usuario;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/comidas")
public class ComidaController {

	private final ComidaRepository comidaRepository;
	private final ComidaOcultaRepository comidaOcultaRepository;
	private final AlimentoRepository alimentoRepository;

	public ComidaController(
			ComidaRepository comidaRepository,
			ComidaOcultaRepository comidaOcultaRepository,
			AlimentoRepository alimentoRepository) {
		this.comidaRepository = comidaRepository;
		this.comidaOcultaRepository = comidaOcultaRepository;
		this.alimentoRepository = alimentoRepository;
	}

	@GetMapping
	public List<ComidaResponse> listar(@AuthenticationPrincipal Usuario usuario) {
		var all = comidaRepository.findVisiblesParaUsuario(usuario.getId(), RutinaRepository.GLOBAL_USERNAME);
		var globals = all.stream().filter(ComidaController::esComidaGlobal).sorted(Comparator.comparingInt(Comida::getTipoComida)).toList();
		var propias = all.stream()
				.filter(c -> !esComidaGlobal(c))
				.sorted(Comparator.comparing(Comida::getFecha, Comparator.nullsLast(Comparator.reverseOrder()))
						.thenComparing(c -> c.getCreatedAt(), Comparator.reverseOrder()))
				.toList();
		var merged = new ArrayList<Comida>();
		merged.addAll(globals);
		merged.addAll(propias);
		return merged.stream().map(this::toResponse).toList();
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public ComidaResponse crear(@AuthenticationPrincipal Usuario usuario,
			@Valid @RequestBody ComidaCreateRequest req) {
		LocalDate fecha = req.fecha() != null ? req.fecha() : LocalDate.now();
		var comida = new Comida(usuario, req.nombre(), req.descripcion(), fecha, req.tipoComida());

		applyAlimentosToComida(comida, req, usuario.getId());

		var saved = comidaRepository.save(comida);
		return toResponse(saved);
	}

	@PostMapping("/calcular")
	public ComidaCalcularResponse calcular(@AuthenticationPrincipal Usuario usuario,
			@Valid @RequestBody ComidaCalcularRequest req) {
		var alimentoIds = req.alimentos().stream().map(ComidaAlimentoUpsertRequest::alimentoId).toList();
		var alimentos = alimentoRepository.findByIdsVisiblesParaUsuario(alimentoIds, usuario.getId());
		if (alimentos.size() != alimentoIds.size()) {
			throw new IllegalArgumentException("Uno o más alimentos no existen o no están disponibles");
		}
		Map<Long, Alimento> byId = alimentos.stream().collect(Collectors.toMap(a -> a.getId(), Function.identity()));

		var items = req.alimentos().stream().map(i -> {
			var a = byId.get(i.alimentoId());
			if (a == null) throw new IllegalArgumentException("Uno o más alimentos no existen");
			var macros = macrosFor(a.getCaloriasPor100g(), a.getProteinasPor100g(), a.getCarbohidratosPor100g(),
					a.getGrasasPor100g(), a.getFibraPor100g(), i.cantidadG());
			return new AlimentoItemResponse(a.getId(), a.getNombre(), i.cantidadG(), macros);
		}).toList();

		var total = items.stream().map(AlimentoItemResponse::macros).reduce(MacrosResponse.zero(), MacrosResponse::plus);
		return new ComidaCalcularResponse(items, total);
	}

	@PutMapping("/{id}")
	public ComidaResponse actualizar(@AuthenticationPrincipal Usuario usuario,
			@PathVariable Long id,
			@Valid @RequestBody ComidaCreateRequest req) {
		var propia = comidaRepository.findByIdAndUsuarioId(id, usuario.getId());
		if (propia.isPresent()) {
			var comida = propia.get();
			comida.setNombre(req.nombre());
			comida.setDescripcion(req.descripcion());
			comida.setFecha(req.fecha() != null ? req.fecha() : LocalDate.now());
			comida.setTipoComida(req.tipoComida());

			comida.getAlimentos().clear();
			applyAlimentosToComida(comida, req, usuario.getId());

			return toResponse(comidaRepository.save(comida));
		}

		var comidaGlobal = comidaRepository
				.findByIdVisibleParaUsuario(id, usuario.getId(), RutinaRepository.GLOBAL_USERNAME)
				.orElseThrow(() -> new IllegalArgumentException("Comida no encontrada"));
		var owner = comidaGlobal.getUsuario();
		final boolean esGlobal = owner != null && RutinaRepository.GLOBAL_USERNAME.equals(owner.getNombre());
		if (!esGlobal) {
			throw new IllegalArgumentException("Comida no encontrada");
		}

		LocalDate fecha = req.fecha() != null ? req.fecha() : LocalDate.now();
		var nueva = new Comida(usuario, req.nombre(), req.descripcion(), fecha, req.tipoComida());
		applyAlimentosToComida(nueva, req, usuario.getId());
		var savedNueva = comidaRepository.save(nueva);
		if (!comidaOcultaRepository.existsByUsuarioIdAndComidaId(usuario.getId(), comidaGlobal.getId())) {
			comidaOcultaRepository.save(new ComidaOculta(usuario, comidaGlobal));
		}
		return toResponse(savedNueva);
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void eliminar(@AuthenticationPrincipal Usuario usuario, @PathVariable Long id) {
		var propia = comidaRepository.findByIdAndUsuarioId(id, usuario.getId());
		if (propia.isPresent()) {
			comidaRepository.delete(propia.get());
			return;
		}

		var comida = comidaRepository
				.findByIdVisibleParaUsuario(id, usuario.getId(), RutinaRepository.GLOBAL_USERNAME)
				.orElseThrow(() -> new IllegalArgumentException("Comida no encontrada"));
		var owner = comida.getUsuario();
		final boolean esGlobal = owner != null && RutinaRepository.GLOBAL_USERNAME.equals(owner.getNombre());
		if (!esGlobal) {
			throw new IllegalArgumentException("Comida no encontrada");
		}
		if (!comidaOcultaRepository.existsByUsuarioIdAndComidaId(usuario.getId(), comida.getId())) {
			comidaOcultaRepository.save(new ComidaOculta(usuario, comida));
		}
	}

	private static boolean esComidaGlobal(Comida c) {
		return c.getUsuario() != null && RutinaRepository.GLOBAL_USERNAME.equals(c.getUsuario().getNombre());
	}

	private void applyAlimentosToComida(Comida comida, ComidaCreateRequest req, Long usuarioId) {
		if (req.alimentos() != null && !req.alimentos().isEmpty()) {
			var alimentoIds = req.alimentos().stream().map(ComidaAlimentoUpsertRequest::alimentoId).toList();
			var alimentos = alimentoRepository.findByIdsVisiblesParaUsuario(alimentoIds, usuarioId);
			if (alimentos.size() != alimentoIds.size()) {
				throw new IllegalArgumentException("Uno o más alimentos no existen o no están disponibles");
			}
			Map<Long, Alimento> byId = alimentos.stream()
					.collect(Collectors.toMap(a -> a.getId(), Function.identity()));
			for (var item : req.alimentos()) {
				var a = byId.get(item.alimentoId());
				if (a == null) throw new IllegalArgumentException("Uno o más alimentos no existen");
				comida.getAlimentos().add(new ComidaAlimento(comida, a, item.cantidadG()));
			}
			return;
		}

		if (req.alimentoIds() != null && !req.alimentoIds().isEmpty()) {
			var alimentos = alimentoRepository.findByIdsVisiblesParaUsuario(req.alimentoIds(), usuarioId);
			if (alimentos.size() != req.alimentoIds().size()) {
				throw new IllegalArgumentException("Uno o más alimentos no existen o no están disponibles");
			}
			for (var a : alimentos) {
				comida.getAlimentos().add(new ComidaAlimento(comida, a, 100.0));
			}
		}
	}

	private ComidaResponse toResponse(Comida comida) {
		var alimentosResp = comida.getAlimentos()
				.stream()
				.map(ca -> {
					var a = ca.getAlimento();
					var macros = macrosFor(a.getCaloriasPor100g(), a.getProteinasPor100g(), a.getCarbohidratosPor100g(),
							a.getGrasasPor100g(), a.getFibraPor100g(), ca.getCantidadG());
					return new AlimentoItemResponse(a.getId(), a.getNombre(), ca.getCantidadG(), macros);
				})
				.toList();

		var total = alimentosResp.stream()
				.map(AlimentoItemResponse::macros)
				.reduce(MacrosResponse.zero(), MacrosResponse::plus);

		boolean esPlantillaGlobal = esComidaGlobal(comida);

		return new ComidaResponse(
				comida.getId(),
				comida.getTipoComida(),
				esPlantillaGlobal,
				comida.getNombre(),
				comida.getDescripcion(),
				comida.getFecha(),
				comida.getCreatedAt(),
				alimentosResp,
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
