package com.nutrifit.nutricion;

import com.nutrifit.nutricion.dto.AgregarItemComidaRequest;
import com.nutrifit.nutricion.dto.ComidaRegistradaResponse;
import com.nutrifit.nutricion.dto.CrearComidaDesdeGuardadaRequest;
import com.nutrifit.nutricion.dto.CrearComidaRequest;
import com.nutrifit.nutricion.dto.ItemRegistroResponse;
import com.nutrifit.nutricion.dto.RegistroDiarioResponse;
import com.nutrifit.nutricion.dto.RenombrarComidaRequest;
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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/nutricion/registro")
@RequiredArgsConstructor
public class RegistroDiarioController {

    private final RegistroDiarioService registroDiarioService;
    private final ComidaRegistradaService comidaRegistradaService;

    @GetMapping
    public ResponseEntity<RegistroDiarioResponse> obtener(
            Authentication authentication,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return ResponseEntity.ok(registroDiarioService.obtenerRegistroDelDia(authentication.getName(), fecha));
    }

    @PostMapping("/comidas")
    public ResponseEntity<ComidaRegistradaResponse> crearComida(
            Authentication authentication, @RequestBody(required = false) CrearComidaRequest request) {
        CrearComidaRequest cuerpo = request != null ? request : new CrearComidaRequest(null, null);
        ComidaRegistradaResponse creada = comidaRegistradaService.crearEnBlanco(authentication.getName(), cuerpo);
        return ResponseEntity.status(HttpStatus.CREATED).body(creada);
    }

    @PostMapping("/comidas/desde-guardada")
    public ResponseEntity<ComidaRegistradaResponse> crearComidaDesdeGuardada(
            Authentication authentication, @Valid @RequestBody CrearComidaDesdeGuardadaRequest request) {
        ComidaRegistradaResponse creada = comidaRegistradaService.crearDesdeGuardada(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(creada);
    }

    @PutMapping("/comidas/{id}")
    public ResponseEntity<ComidaRegistradaResponse> renombrarComida(
            Authentication authentication, @PathVariable Long id, @Valid @RequestBody RenombrarComidaRequest request) {
        return ResponseEntity.ok(comidaRegistradaService.renombrar(authentication.getName(), id, request));
    }

    @DeleteMapping("/comidas/{id}")
    public ResponseEntity<Void> eliminarComida(Authentication authentication, @PathVariable Long id) {
        comidaRegistradaService.eliminarComida(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/comidas/{id}/items")
    public ResponseEntity<ItemRegistroResponse> agregarItem(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody AgregarItemComidaRequest request) {
        ItemRegistroResponse creado = comidaRegistradaService.agregarItem(authentication.getName(), id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<Void> eliminarItem(Authentication authentication, @PathVariable Long id) {
        comidaRegistradaService.eliminarItem(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
