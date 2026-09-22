package com.nutrifit.entrenamiento;

import com.nutrifit.entrenamiento.dto.EntrenamientoDiaResponse;
import com.nutrifit.entrenamiento.dto.RegistrarSerieRequest;
import com.nutrifit.entrenamiento.dto.SerieEntrenamientoResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/entrenamiento")
@RequiredArgsConstructor
public class EntrenamientoController {

    private final EntrenamientoService entrenamientoService;

    @GetMapping("/dias/{diaId}")
    public ResponseEntity<EntrenamientoDiaResponse> obtenerDia(Authentication authentication, @PathVariable Long diaId) {
        return ResponseEntity.ok(entrenamientoService.obtenerEntrenamientoDelDia(authentication.getName(), diaId));
    }

    @PostMapping("/series")
    public ResponseEntity<SerieEntrenamientoResponse> registrarSerie(
            Authentication authentication,
            @Valid @RequestBody RegistrarSerieRequest request) {
        SerieEntrenamientoResponse creada = entrenamientoService.registrarSerie(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(creada);
    }

    @DeleteMapping("/series/{id}")
    public ResponseEntity<Void> eliminarSerie(Authentication authentication, @PathVariable Long id) {
        entrenamientoService.eliminarSerie(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
