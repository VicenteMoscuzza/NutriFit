package com.nutrifit.rutinas;

import com.nutrifit.rutinas.dto.AgregarEjercicioRutinaRequest;
import com.nutrifit.rutinas.dto.DiaSemanaResponse;
import com.nutrifit.rutinas.dto.EjercicioRutinaResponse;
import jakarta.validation.Valid;
import java.util.List;
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
@RequestMapping("/api/rutinas")
@RequiredArgsConstructor
public class RutinaController {

    private final RutinaService rutinaService;

    @GetMapping("/semana")
    public ResponseEntity<List<DiaSemanaResponse>> obtenerSemana(Authentication authentication) {
        return ResponseEntity.ok(rutinaService.obtenerSemana(authentication.getName()));
    }

    @PostMapping("/dias/{diaSemana}/ejercicios")
    public ResponseEntity<EjercicioRutinaResponse> agregarEjercicio(
            Authentication authentication,
            @PathVariable int diaSemana,
            @Valid @RequestBody AgregarEjercicioRutinaRequest request) {
        EjercicioRutinaResponse creado = rutinaService.agregarEjercicio(authentication.getName(), diaSemana, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @DeleteMapping("/dias-ejercicios/{id}")
    public ResponseEntity<Void> eliminarEjercicio(Authentication authentication, @PathVariable Long id) {
        rutinaService.eliminarEjercicio(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
