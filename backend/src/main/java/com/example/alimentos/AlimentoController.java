package com.example.alimentos;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.alimentos.dto.AlimentoCreateRequest;
import com.example.alimentos.dto.AlimentoResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/alimentos")
public class AlimentoController {

	private final AlimentoRepository alimentoRepository;

	public AlimentoController(AlimentoRepository alimentoRepository) {
		this.alimentoRepository = alimentoRepository;
	}

	@GetMapping
	public List<AlimentoResponse> listar() {
		return alimentoRepository.findAllByOrderByNombreAsc()
				.stream()
				.map(a -> new AlimentoResponse(
						a.getId(),
						a.getNombre(),
						a.getCaloriasPor100g(),
						a.getProteinasPor100g(),
						a.getCarbohidratosPor100g(),
						a.getGrasasPor100g(),
						a.getFibraPor100g(),
						a.getTamanoPorcionG(),
						a.getUnidadPorcion()))
				.toList();
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public AlimentoResponse crear(@Valid @RequestBody AlimentoCreateRequest req) {
		double fibra = req.fibraPor100g() != null ? req.fibraPor100g() : 0.0;
		var alimento = new Alimento(
				req.nombre(),
				req.caloriasPor100g(),
				req.proteinasPor100g(),
				req.carbohidratosPor100g(),
				req.grasasPor100g(),
				fibra,
				req.tamanoPorcionG(),
				req.unidadPorcion());
		var saved = alimentoRepository.save(alimento);
		return new AlimentoResponse(
				saved.getId(),
				saved.getNombre(),
				saved.getCaloriasPor100g(),
				saved.getProteinasPor100g(),
				saved.getCarbohidratosPor100g(),
				saved.getGrasasPor100g(),
				saved.getFibraPor100g(),
				saved.getTamanoPorcionG(),
				saved.getUnidadPorcion());
	}
}

