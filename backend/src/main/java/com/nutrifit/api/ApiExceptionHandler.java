package com.nutrifit.api;

import com.nutrifit.alimentos.AlimentoNoDisponibleException;
import com.nutrifit.entrenamiento.SerieEntrenamientoNoEncontradaException;
import com.nutrifit.nutricion.ComidaGuardadaNoEncontradaException;
import com.nutrifit.nutricion.ComidaRegistradaNoEncontradaException;
import com.nutrifit.nutricion.ItemComidaGuardadaNoEncontradoException;
import com.nutrifit.nutricion.ItemRegistroDiarioNoEncontradoException;
import com.nutrifit.rutinas.DiaRutinaNoEncontradoException;
import com.nutrifit.rutinas.EjercicioNoDisponibleException;
import com.nutrifit.rutinas.EjercicioRutinaNoEncontradoException;
import com.nutrifit.usuarios.CredencialesInvalidasException;
import com.nutrifit.usuarios.EmailYaRegistradoException;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> manejarValidacion(MethodArgumentNotValidException ex) {
        Map<String, String> errores = new LinkedHashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errores.put(error.getField(), error.getDefaultMessage());
        }

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("mensaje", "Error de validación");
        body.put("errores", errores);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(EmailYaRegistradoException.class)
    public ResponseEntity<Map<String, Object>> manejarEmailDuplicado(EmailYaRegistradoException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("mensaje", ex.getMessage()));
    }

    @ExceptionHandler(CredencialesInvalidasException.class)
    public ResponseEntity<Map<String, Object>> manejarCredencialesInvalidas(CredencialesInvalidasException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("mensaje", ex.getMessage()));
    }

    @ExceptionHandler(DiaRutinaNoEncontradoException.class)
    public ResponseEntity<Map<String, Object>> manejarDiaRutinaNoEncontrado(DiaRutinaNoEncontradoException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("mensaje", ex.getMessage()));
    }

    @ExceptionHandler(EjercicioNoDisponibleException.class)
    public ResponseEntity<Map<String, Object>> manejarEjercicioNoDisponible(EjercicioNoDisponibleException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("mensaje", ex.getMessage()));
    }

    @ExceptionHandler(EjercicioRutinaNoEncontradoException.class)
    public ResponseEntity<Map<String, Object>> manejarEjercicioRutinaNoEncontrado(EjercicioRutinaNoEncontradoException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("mensaje", ex.getMessage()));
    }

    @ExceptionHandler(SerieEntrenamientoNoEncontradaException.class)
    public ResponseEntity<Map<String, Object>> manejarSerieEntrenamientoNoEncontrada(SerieEntrenamientoNoEncontradaException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("mensaje", ex.getMessage()));
    }

    @ExceptionHandler(AlimentoNoDisponibleException.class)
    public ResponseEntity<Map<String, Object>> manejarAlimentoNoDisponible(AlimentoNoDisponibleException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("mensaje", ex.getMessage()));
    }

    @ExceptionHandler(ItemRegistroDiarioNoEncontradoException.class)
    public ResponseEntity<Map<String, Object>> manejarItemRegistroDiarioNoEncontrado(ItemRegistroDiarioNoEncontradoException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("mensaje", ex.getMessage()));
    }

    @ExceptionHandler(ComidaGuardadaNoEncontradaException.class)
    public ResponseEntity<Map<String, Object>> manejarComidaGuardadaNoEncontrada(ComidaGuardadaNoEncontradaException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("mensaje", ex.getMessage()));
    }

    @ExceptionHandler(ItemComidaGuardadaNoEncontradoException.class)
    public ResponseEntity<Map<String, Object>> manejarItemComidaGuardadaNoEncontrado(ItemComidaGuardadaNoEncontradoException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("mensaje", ex.getMessage()));
    }

    @ExceptionHandler(ComidaRegistradaNoEncontradaException.class)
    public ResponseEntity<Map<String, Object>> manejarComidaRegistradaNoEncontrada(ComidaRegistradaNoEncontradaException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("mensaje", ex.getMessage()));
    }
}
