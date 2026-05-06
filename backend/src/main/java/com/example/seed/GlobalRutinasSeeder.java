package com.example.seed;

import java.util.LinkedHashMap;
import java.util.List;
import java.time.LocalDate;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.example.ejercicios.Ejercicio;
import com.example.ejercicios.EjercicioRepository;
import com.example.rutinas.Rutina;
import com.example.rutinas.RutinaEjercicio;
import com.example.rutinas.RutinaRepository;
import com.example.usuarios.Usuario;
import com.example.usuarios.UsuarioRepository;

@Component
public class GlobalRutinasSeeder implements CommandLineRunner {

	private final EjercicioRepository ejercicioRepository;
	private final RutinaRepository rutinaRepository;
	private final UsuarioRepository usuarioRepository;
	private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

	public GlobalRutinasSeeder(EjercicioRepository ejercicioRepository, RutinaRepository rutinaRepository, UsuarioRepository usuarioRepository) {
		this.ejercicioRepository = ejercicioRepository;
		this.rutinaRepository = rutinaRepository;
		this.usuarioRepository = usuarioRepository;
	}

	@Override
	@Transactional
	public void run(String... args) {
		// Si ya existen rutinas globales, no tocamos nada.
		if (!rutinaRepository.findByUsuarioNombreOrderByCreatedAtDesc(RutinaRepository.GLOBAL_USERNAME).isEmpty()) return;

		// Usuario del sistema que "posee" las rutinas globales (para evitar NOT NULL en rutinas.usuario_id)
		var globalUser = usuarioRepository.findByNombre(RutinaRepository.GLOBAL_USERNAME)
				.orElseGet(() -> usuarioRepository.save(new Usuario(
						RutinaRepository.GLOBAL_USERNAME,
						"global@nutrifit.local",
						passwordEncoder.encode("change-me"),
						LocalDate.of(2000, 1, 1))));

		// Ejercicios globales base
		var ejercicios = new LinkedHashMap<String, String>();
		ejercicios.put("Sentadillas", "Ejercicio básico para tren inferior.");
		ejercicios.put("Flexiones", "Empuje para pecho, hombros y tríceps.");
		ejercicios.put("Remo con mancuerna", "Tirón para espalda y bíceps.");
		ejercicios.put("Plancha", "Core: mantener postura isométrica.");
		ejercicios.put("Zancadas", "Piernas y glúteos, unilateral.");
		ejercicios.put("Elevaciones laterales", "Hombro: deltoides medio.");

		for (var entry : ejercicios.entrySet()) {
			ejercicioRepository.save(Ejercicio.global(entry.getKey(), entry.getValue()));
		}

		var globals = ejercicioRepository.findByUsuarioIsNullOrderByNombreAsc();
		var byNombre = globals.stream().collect(java.util.stream.Collectors.toMap(Ejercicio::getNombre, e -> e));

		// 3 rutinas globales (para todo el mundo)
		crearRutinaGlobal(
				"Full Body (Base)",
				"Rutina global simple de cuerpo completo.",
				List.of("Sentadillas", "Flexiones", "Remo con mancuerna", "Plancha"),
				byNombre,
				globalUser);

		crearRutinaGlobal(
				"Tren Superior (Base)",
				"Rutina global enfocada en torso.",
				List.of("Flexiones", "Remo con mancuerna", "Elevaciones laterales", "Plancha"),
				byNombre,
				globalUser);

		crearRutinaGlobal(
				"Tren Inferior (Base)",
				"Rutina global enfocada en piernas y glúteos.",
				List.of("Sentadillas", "Zancadas", "Plancha"),
				byNombre,
				globalUser);
	}

	private void crearRutinaGlobal(
			String nombre,
			String descripcion,
			List<String> nombresEjercicios,
			java.util.Map<String, Ejercicio> byNombre,
			Usuario globalUser) {
		var rutina = new Rutina(globalUser, nombre, descripcion);
		for (var n : nombresEjercicios) {
			var e = byNombre.get(n);
			if (e != null) rutina.getEjercicios().add(new RutinaEjercicio(rutina, e));
		}
		rutinaRepository.save(rutina);
	}
}

