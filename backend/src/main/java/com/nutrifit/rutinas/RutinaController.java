package com.nutrifit.rutinas;

import com.nutrifit.rutinas.dto.AgregarEjercicioRutinaRequest;
import com.nutrifit.rutinas.dto.CrearDiaRutinaRequest;
import com.nutrifit.rutinas.dto.DiaRutinaResponse;
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

    @GetMapping("/dias")
    public ResponseEntity<List<DiaRutinaResponse>> obtenerDias(Authentication authentication) {
        return ResponseEntity.ok(rutinaService.obtenerDias(authentication.getName()));
    }

    @PostMapping("/dias")
    public ResponseEntity<DiaRutinaResponse> agregarDia(
            Authentication authentication, @Valid @RequestBody CrearDiaRutinaRequest request) {
        DiaRutinaResponse creado = rutinaService.agregarDia(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @DeleteMapping("/dias/{diaId}")
    public ResponseEntity<Void> eliminarDia(Authentication authentication, @PathVariable Long diaId) {
        rutinaService.eliminarDia(authentication.getName(), diaId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/dias/{diaId}/ejercicios")
    public ResponseEntity<EjercicioRutinaResponse> agregarEjercicio(
            Authentication authentication,
            @PathVariable Long diaId,
            @Valid @RequestBody AgregarEjercicioRutinaRequest request) {
        EjercicioRutinaResponse creado = rutinaService.agregarEjercicio(authentication.getName(), diaId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @DeleteMapping("/dias-ejercicios/{id}")
    public ResponseEntity<Void> eliminarEjercicio(Authentication authentication, @PathVariable Long id) {
        rutinaService.eliminarEjercicio(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
