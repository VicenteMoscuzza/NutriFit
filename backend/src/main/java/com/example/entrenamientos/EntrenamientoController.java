package com.example.entrenamientos;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Comparator;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.entrenamientos.dto.EjercicioEntrenamientoResponse;
import com.example.entrenamientos.dto.EntrenamientoIniciarRequest;
import com.example.entrenamientos.dto.EntrenamientoResponse;
import com.example.entrenamientos.dto.SerieResponse;
import com.example.entrenamientos.dto.SerieUpdateRequest;
import com.example.ejercicios.EjercicioRepository;
import com.example.registros.RegistroEjercicio;
import com.example.registros.RegistroEjercicioRepository;
import com.example.registros.RegistroRutinaEjercicio;
import com.example.registros.RegistroRutinaEjercicioRepository;
import com.example.rutinas.RutinaRepository;
import com.example.usuarios.Usuario;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/entrenamientos")
public class EntrenamientoController {

	private static final int SERIES_INICIALES = 3;

	private final EntrenamientoRepository entrenamientoRepository;
	private final EntrenamientoSerieRepository serieRepository;
	private final EntrenamientoEjercicioRepository ejercicioEntrenamientoRepository;
	private final RutinaRepository rutinaRepository;
	private final RegistroEjercicioRepository registroRepository;
	private final RegistroRutinaEjercicioRepository registroRutinaRepository;
	private final EjercicioRepository ejercicioRepository;

	public EntrenamientoController(
			EntrenamientoRepository entrenamientoRepository,
			EntrenamientoSerieRepository serieRepository,
			EntrenamientoEjercicioRepository ejercicioEntrenamientoRepository,
			RutinaRepository rutinaRepository,
			RegistroEjercicioRepository registroRepository,
			RegistroRutinaEjercicioRepository registroRutinaRepository,
			EjercicioRepository ejercicioRepository) {
		this.entrenamientoRepository = entrenamientoRepository;
		this.serieRepository = serieRepository;
		this.ejercicioEntrenamientoRepository = ejercicioEntrenamientoRepository;
		this.rutinaRepository = rutinaRepository;
		this.registroRepository = registroRepository;
		this.registroRutinaRepository = registroRutinaRepository;
		this.ejercicioRepository = ejercicioRepository;
	}

	@GetMapping("/activo")
	@Transactional(readOnly = true)
	public EntrenamientoResponse activo(@AuthenticationPrincipal Usuario usuario) {
		return entrenamientoRepository
				.findActivoWithDetails(usuario.getId(), EstadoEntrenamiento.EN_CURSO)
				.map(this::toResponse)
				.orElse(null);
	}

	@GetMapping("/{id}")
	@Transactional(readOnly = true)
	public EntrenamientoResponse obtener(@AuthenticationPrincipal Usuario usuario, @PathVariable Long id) {
		var entrenamiento = entrenamientoRepository
				.findByIdAndUsuarioIdWithDetails(id, usuario.getId())
				.orElseThrow(() -> new IllegalArgumentException("Entrenamiento no encontrado"));
		return toResponse(entrenamiento);
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	@Transactional
	public EntrenamientoResponse iniciar(@AuthenticationPrincipal Usuario usuario,
			@Valid @RequestBody EntrenamientoIniciarRequest req) {

		if (entrenamientoRepository.findByUsuarioIdAndEstado(usuario.getId(), EstadoEntrenamiento.EN_CURSO).isPresent()) {
			throw new IllegalArgumentException("Ya tenés un entrenamiento en curso. Finalizalo o continuá el actual.");
		}

		var rutina = rutinaRepository
				.findByIdVisibleParaUsuario(req.rutinaId(), usuario.getId(), RutinaRepository.GLOBAL_USERNAME)
				.orElseThrow(() -> new IllegalArgumentException("Rutina no encontrada"));

		var registrosPorEjercicio = registroRepository.findByUsuarioIdOrderByUpdatedAtDesc(usuario.getId())
				.stream()
				.collect(Collectors.toMap(r -> r.getEjercicio().getId(), RegistroEjercicio::getUltimoPesoMaxKg, (a, b) -> a));

		var repsPorEjercicio = registroRutinaRepository.findByUsuarioIdAndRutinaId(usuario.getId(), rutina.getId())
				.stream()
				.collect(Collectors.toMap(r -> r.getEjercicio().getId(), RegistroRutinaEjercicio::getUltimasReps, (a, b) -> a));

		var entrenamiento = new Entrenamiento(usuario, rutina);
		int orden = 0;
		for (var re : rutina.getEjercicios()) {
			var ejercicio = re.getEjercicio();
			var ee = new EntrenamientoEjercicio(entrenamiento, ejercicio, orden++);
			entrenamiento.getEjercicios().add(ee);

			var pesoSugerido = registrosPorEjercicio.get(ejercicio.getId());
			var repsSugeridas = repsPorEjercicio.get(ejercicio.getId());
			for (int n = 1; n <= SERIES_INICIALES; n++) {
				ee.getSeries().add(new EntrenamientoSerie(ee, n, pesoSugerido, repsSugeridas));
			}
		}

		if (entrenamiento.getEjercicios().isEmpty()) {
			throw new IllegalArgumentException("La rutina no tiene ejercicios");
		}

		var saved = entrenamientoRepository.save(entrenamiento);
		return toResponse(entrenamientoRepository.findByIdAndUsuarioIdWithDetails(saved.getId(), usuario.getId()).orElse(saved));
	}

	@PatchMapping("/series/{serieId}")
	@Transactional
	public SerieResponse actualizarSerie(@AuthenticationPrincipal Usuario usuario,
			@PathVariable Long serieId,
			@Valid @RequestBody SerieUpdateRequest req) {

		var serie = serieRepository
				.findByIdAndUsuarioId(serieId, usuario.getId())
				.orElseThrow(() -> new IllegalArgumentException("Serie no encontrada"));

		if (req.pesoKg() != null) {
			serie.setPesoKg(req.pesoKg());
		}
		if (req.reps() != null) {
			serie.setReps(req.reps());
		}
		if (req.completada() != null) {
			serie.setCompletada(req.completada());
		}

		var saved = serieRepository.save(serie);

		var ee = saved.getEntrenamientoEjercicio();
		var rutinaId = ee.getEntrenamiento().getRutina().getId();
		var ejercicioId = ee.getEjercicio().getId();

		if (saved.getReps() != null) {
			actualizarUltimasReps(usuario, rutinaId, ejercicioId, saved.getReps());
		}
		if (saved.isCompletada() && saved.getPesoKg() != null) {
			actualizarRegistroMaximo(usuario, ejercicioId, saved.getPesoKg());
		}

		return toSerieResponse(saved);
	}

	@DeleteMapping("/series/{serieId}")
	@Transactional
	public EjercicioEntrenamientoResponse eliminarSerie(@AuthenticationPrincipal Usuario usuario,
			@PathVariable Long serieId) {

		var serie = serieRepository
				.findByIdAndUsuarioId(serieId, usuario.getId())
				.orElseThrow(() -> new IllegalArgumentException("Serie no encontrada"));

		var ee = serie.getEntrenamientoEjercicio();
		if (ee.getEntrenamiento().getEstado() != EstadoEntrenamiento.EN_CURSO) {
			throw new IllegalArgumentException("El entrenamiento ya finalizó");
		}

		ee.getSeries().remove(serie);
		serieRepository.delete(serie);
		renumerarSeries(ee);

		return toEjercicioResponse(ee);
	}

	@PostMapping("/ejercicios/{ejercicioEntrenamientoId}/series")
	@ResponseStatus(HttpStatus.CREATED)
	@Transactional
	public SerieResponse agregarSerie(@AuthenticationPrincipal Usuario usuario,
			@PathVariable Long ejercicioEntrenamientoId) {

		var ee = ejercicioEntrenamientoRepository
				.findByIdAndUsuarioIdWithSeries(ejercicioEntrenamientoId, usuario.getId())
				.orElseThrow(() -> new IllegalArgumentException("Ejercicio de entrenamiento no encontrado"));

		if (ee.getEntrenamiento().getEstado() != EstadoEntrenamiento.EN_CURSO) {
			throw new IllegalArgumentException("El entrenamiento ya finalizó");
		}

		int siguiente = ee.getSeries().stream().mapToInt(EntrenamientoSerie::getNumeroSerie).max().orElse(0) + 1;
		BigDecimal pesoSugerido = ee.getSeries().stream()
				.filter(s -> s.getPesoKg() != null)
				.reduce((first, second) -> second)
				.map(EntrenamientoSerie::getPesoKg)
				.orElse(null);

		if (pesoSugerido == null) {
			pesoSugerido = registroRepository
					.findByUsuarioIdAndEjercicioId(usuario.getId(), ee.getEjercicio().getId())
					.map(RegistroEjercicio::getUltimoPesoMaxKg)
					.orElse(null);
		}

		Integer repsSugeridas = ee.getSeries().stream()
				.filter(s -> s.getReps() != null)
				.reduce((first, second) -> second)
				.map(EntrenamientoSerie::getReps)
				.orElse(null);

		if (repsSugeridas == null) {
			var rutinaId = ee.getEntrenamiento().getRutina().getId();
			repsSugeridas = registroRutinaRepository
					.findByUsuarioIdAndRutinaIdAndEjercicioId(usuario.getId(), rutinaId, ee.getEjercicio().getId())
					.map(RegistroRutinaEjercicio::getUltimasReps)
					.orElse(null);
		}

		var serie = new EntrenamientoSerie(ee, siguiente, pesoSugerido, repsSugeridas);
		ee.getSeries().add(serie);
		var saved = serieRepository.save(serie);
		return toSerieResponse(saved);
	}

	@PostMapping("/{id}/finalizar")
	@Transactional
	public EntrenamientoResponse finalizar(@AuthenticationPrincipal Usuario usuario, @PathVariable Long id) {
		var entrenamiento = entrenamientoRepository
				.findByIdAndUsuarioIdWithDetails(id, usuario.getId())
				.orElseThrow(() -> new IllegalArgumentException("Entrenamiento no encontrado"));

		if (entrenamiento.getEstado() == EstadoEntrenamiento.FINALIZADO) {
			return toResponse(entrenamiento);
		}

		entrenamiento.setEstado(EstadoEntrenamiento.FINALIZADO);
		entrenamiento.setFinishedAt(Instant.now());

		var rutinaId = entrenamiento.getRutina().getId();
		for (var ee : entrenamiento.getEjercicios()) {
			ee.getSeries().stream()
					.filter(s -> s.getReps() != null)
					.max(Comparator.comparingInt(EntrenamientoSerie::getNumeroSerie))
					.ifPresent(s -> actualizarUltimasReps(
							usuario, rutinaId, ee.getEjercicio().getId(), s.getReps()));
		}

		entrenamientoRepository.save(entrenamiento);
		return toResponse(entrenamiento);
	}

	private void actualizarRegistroMaximo(Usuario usuario, Long ejercicioId, BigDecimal pesoKg) {
		var existing = registroRepository.findByUsuarioIdAndEjercicioId(usuario.getId(), ejercicioId);
		if (existing.isPresent()) {
			var registro = existing.get();
			var actual = registro.getUltimoPesoMaxKg();
			if (actual == null || pesoKg.compareTo(actual) > 0) {
				registro.setUltimoPesoMaxKg(pesoKg);
				registroRepository.save(registro);
			}
			return;
		}

		var ejercicio = ejercicioRepository.findByIdVisibleParaUsuario(ejercicioId, usuario.getId())
				.orElse(null);
		if (ejercicio == null) return;

		registroRepository.save(new RegistroEjercicio(usuario, ejercicio, pesoKg));
	}

	private void actualizarUltimasReps(Usuario usuario, Long rutinaId, Long ejercicioId, Integer reps) {
		var rutina = rutinaRepository
				.findByIdVisibleParaUsuario(rutinaId, usuario.getId(), RutinaRepository.GLOBAL_USERNAME)
				.orElse(null);
		if (rutina == null) return;

		var ejercicio = ejercicioRepository.findByIdVisibleParaUsuario(ejercicioId, usuario.getId()).orElse(null);
		if (ejercicio == null) return;

		var existing = registroRutinaRepository.findByUsuarioIdAndRutinaIdAndEjercicioId(
				usuario.getId(), rutinaId, ejercicioId);
		var registro = existing.orElseGet(() -> new RegistroRutinaEjercicio(usuario, rutina, ejercicio, null));
		registro.setUltimasReps(reps);
		registroRutinaRepository.save(registro);
	}

	private void renumerarSeries(EntrenamientoEjercicio ee) {
		var ordenadas = ee.getSeries().stream()
				.sorted(Comparator.comparingInt(EntrenamientoSerie::getNumeroSerie))
				.toList();
		for (int i = 0; i < ordenadas.size(); i++) {
			ordenadas.get(i).setNumeroSerie(i + 1);
		}
		serieRepository.saveAll(ordenadas);
	}

	private EjercicioEntrenamientoResponse toEjercicioResponse(EntrenamientoEjercicio ee) {
		return new EjercicioEntrenamientoResponse(
				ee.getId(),
				ee.getEjercicio().getId(),
				ee.getEjercicio().getNombre(),
				ee.getEjercicio().getDescripcion(),
				ee.getOrden(),
				ee.getSeries().stream()
						.sorted(Comparator.comparingInt(EntrenamientoSerie::getNumeroSerie))
						.map(this::toSerieResponse)
						.toList());
	}

	private EntrenamientoResponse toResponse(Entrenamiento e) {
		// Inicializa series (carga en batch vía @BatchSize, sin MultipleBagFetchException)
		e.getEjercicios().forEach(ee -> ee.getSeries().size());

		var ejercicios = e.getEjercicios().stream()
				.sorted(Comparator.comparingInt(EntrenamientoEjercicio::getOrden))
				.map(this::toEjercicioResponse)
				.toList();

		return new EntrenamientoResponse(
				e.getId(),
				e.getRutina().getId(),
				e.getRutina().getNombre(),
				e.getEstado(),
				e.getStartedAt(),
				e.getFinishedAt(),
				ejercicios);
	}

	private SerieResponse toSerieResponse(EntrenamientoSerie s) {
		return new SerieResponse(
				s.getId(),
				s.getNumeroSerie(),
				s.getPesoKg(),
				s.getReps(),
				s.isCompletada(),
				s.getCompletadaAt());
	}
}
