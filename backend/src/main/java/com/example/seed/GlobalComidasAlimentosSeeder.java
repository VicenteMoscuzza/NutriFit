package com.example.seed;

import java.time.LocalDate;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.example.alimentos.Alimento;
import com.example.alimentos.AlimentoRepository;
import com.example.comidas.Comida;
import com.example.comidas.ComidaRepository;
import com.example.rutinas.RutinaRepository;
import com.example.usuarios.Usuario;
import com.example.usuarios.UsuarioRepository;

@Component
@Order(100)
public class GlobalComidasAlimentosSeeder implements CommandLineRunner {

	private final AlimentoRepository alimentoRepository;
	private final ComidaRepository comidaRepository;
	private final UsuarioRepository usuarioRepository;
	private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

	public GlobalComidasAlimentosSeeder(
			AlimentoRepository alimentoRepository,
			ComidaRepository comidaRepository,
			UsuarioRepository usuarioRepository) {
		this.alimentoRepository = alimentoRepository;
		this.comidaRepository = comidaRepository;
		this.usuarioRepository = usuarioRepository;
	}

	@Override
	@Transactional
	public void run(String... args) {
		var globalUser = usuarioRepository.findByNombre(RutinaRepository.GLOBAL_USERNAME)
				.orElseGet(() -> usuarioRepository.save(new Usuario(
						RutinaRepository.GLOBAL_USERNAME,
						"global@nutrifit.local",
						passwordEncoder.encode("change-me"),
						LocalDate.of(2000, 1, 1))));

		if (alimentoRepository.findByUsuarioIsNullOrderByNombreAsc().isEmpty()) {
			alimentoRepository.save(Alimento.global("Avena", 389, 13.2, 67.7, 6.9, 10.6, 40.0, "cucharada"));
			alimentoRepository.save(Alimento.global("Huevo (entero)", 143, 12.6, 0.7, 9.5, 0.0, 50.0, "unidad"));
			alimentoRepository.save(Alimento.global("Pollo pechuga", 165, 31.0, 0.0, 3.6, 0.0, 100.0, null));
			alimentoRepository.save(Alimento.global("Arroz blanco cocido", 130, 2.7, 28.0, 0.3, 0.4, 150.0, "plato"));
			alimentoRepository.save(Alimento.global("Pan integral", 247, 13.0, 41.0, 4.2, 7.0, 30.0, "rebanada"));
			alimentoRepository.save(Alimento.global("Yogur natural", 61, 3.5, 4.7, 3.3, 0.0, 125.0, "pote"));
			alimentoRepository.save(Alimento.global("Manzana", 52, 0.3, 14.0, 0.2, 2.4, 182.0, "unidad mediana"));
			alimentoRepository.save(Alimento.global("Aceite de oliva", 884, 0.0, 0.0, 100.0, 0.0, 10.0, "cucharada"));
		}

		String[] nombres = { "Desayuno", "Almuerzo", "Merienda", "Cena" };
		LocalDate fechaPlantilla = LocalDate.of(2000, 1, 1);
		for (int tipo = 1; tipo <= 4; tipo++) {
			if (!comidaRepository.existsByUsuario_NombreAndTipoComida(RutinaRepository.GLOBAL_USERNAME, tipo)) {
				comidaRepository.save(new Comida(globalUser, nombres[tipo - 1], null, fechaPlantilla, tipo));
			}
		}
	}
}
