package com.nutrifit.nutricion;

import com.nutrifit.nutricion.dto.AgregarItemRegistroRequest;
import com.nutrifit.nutricion.dto.ItemRegistroResponse;
import com.nutrifit.nutricion.dto.RegistroDiarioResponse;
import jakarta.validation.Valid;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/nutricion/registro")
@RequiredArgsConstructor
public class RegistroDiarioController {

    private final RegistroDiarioService registroDiarioService;

    @GetMapping
    public ResponseEntity<RegistroDiarioResponse> obtener(
            Authentication authentication,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return ResponseEntity.ok(registroDiarioService.obtenerRegistroDelDia(authentication.getName(), fecha));
    }

    @PostMapping("/items")
    public ResponseEntity<ItemRegistroResponse> agregarItem(
            Authentication authentication,
            @Valid @RequestBody AgregarItemRegistroRequest request) {
        ItemRegistroResponse creado = registroDiarioService.agregarItem(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<Void> eliminarItem(Authentication authentication, @PathVariable Long id) {
        registroDiarioService.eliminarItem(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
