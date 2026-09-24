package com.nutrifit.calendario;

import com.nutrifit.calendario.dto.DetalleDiaResponse;
import com.nutrifit.calendario.dto.DiaCalendarioResponse;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/calendario")
@RequiredArgsConstructor
public class CalendarioController {

    private final CalendarioService calendarioService;

    @GetMapping
    public ResponseEntity<List<DiaCalendarioResponse>> obtenerMes(
            Authentication authentication,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM") YearMonth mes) {
        YearMonth consulta = mes != null ? mes : YearMonth.now();
        return ResponseEntity.ok(calendarioService.obtenerMes(authentication.getName(), consulta));
    }

    @GetMapping("/{fecha}")
    public ResponseEntity<DetalleDiaResponse> obtenerDia(
            Authentication authentication,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return ResponseEntity.ok(calendarioService.obtenerDia(authentication.getName(), fecha));
    }
}
