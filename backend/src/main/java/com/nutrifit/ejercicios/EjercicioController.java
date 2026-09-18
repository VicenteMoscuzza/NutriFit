package com.nutrifit.ejercicios;

import com.nutrifit.ejercicios.dto.CrearEjercicioRequest;
import com.nutrifit.ejercicios.dto.EjercicioResponse;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ejercicios")
@RequiredArgsConstructor
public class EjercicioController {

    private final EjercicioService ejercicioService;

    @GetMapping
    public ResponseEntity<List<EjercicioResponse>> listar(Authentication authentication) {
        return ResponseEntity.ok(ejercicioService.listarParaUsuario(authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<EjercicioResponse> crear(
            Authentication authentication, @Valid @RequestBody CrearEjercicioRequest request) {
        EjercicioResponse creado = ejercicioService.crear(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }
}
