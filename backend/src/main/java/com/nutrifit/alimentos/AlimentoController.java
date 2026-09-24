package com.nutrifit.alimentos;

import com.nutrifit.alimentos.dto.AlimentoResponse;
import com.nutrifit.alimentos.dto.CrearAlimentoRequest;
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
@RequestMapping("/api/alimentos")
@RequiredArgsConstructor
public class AlimentoController {

    private final AlimentoService alimentoService;

    @GetMapping
    public ResponseEntity<List<AlimentoResponse>> listar(Authentication authentication) {
        return ResponseEntity.ok(alimentoService.listarParaUsuario(authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<AlimentoResponse> crear(
            Authentication authentication, @Valid @RequestBody CrearAlimentoRequest request) {
        AlimentoResponse creado = alimentoService.crear(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }
}
