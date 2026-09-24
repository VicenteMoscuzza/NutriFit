package com.nutrifit.nutricion;

import com.nutrifit.nutricion.dto.AgregarItemComidaGuardadaRequest;
import com.nutrifit.nutricion.dto.ComidaGuardadaResponse;
import com.nutrifit.nutricion.dto.CrearComidaGuardadaRequest;
import com.nutrifit.nutricion.dto.ItemComidaGuardadaResponse;
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
@RequestMapping("/api/nutricion/comidas-guardadas")
@RequiredArgsConstructor
public class ComidaGuardadaController {

    private final ComidaGuardadaService comidaGuardadaService;

    @GetMapping
    public ResponseEntity<List<ComidaGuardadaResponse>> listar(Authentication authentication) {
        return ResponseEntity.ok(comidaGuardadaService.listar(authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<ComidaGuardadaResponse> crear(
            Authentication authentication, @Valid @RequestBody CrearComidaGuardadaRequest request) {
        ComidaGuardadaResponse creada = comidaGuardadaService.crear(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(creada);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(Authentication authentication, @PathVariable Long id) {
        comidaGuardadaService.eliminar(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/items")
    public ResponseEntity<ItemComidaGuardadaResponse> agregarItem(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody AgregarItemComidaGuardadaRequest request) {
        ItemComidaGuardadaResponse creado = comidaGuardadaService.agregarItem(authentication.getName(), id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<Void> eliminarItem(Authentication authentication, @PathVariable Long id) {
        comidaGuardadaService.eliminarItem(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
