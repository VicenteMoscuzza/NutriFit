package com.nutrifit.usuarios;

import com.nutrifit.security.JwtService;
import com.nutrifit.usuarios.dto.LoginRequest;
import com.nutrifit.usuarios.dto.RegistroUsuarioRequest;
import com.nutrifit.usuarios.dto.UsuarioResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UsuarioService usuarioService;
    private final JwtService jwtService;

    @PostMapping("/registro")
    public ResponseEntity<UsuarioResponse> registrar(@Valid @RequestBody RegistroUsuarioRequest request) {
        UsuarioResponse usuario = usuarioService.registrar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(usuario);
    }

    @PostMapping("/login")
    public ResponseEntity<UsuarioResponse> login(@Valid @RequestBody LoginRequest request) {
        UsuarioService.SesionIniciada sesion = usuarioService.iniciarSesion(request);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookieSesion(sesion.token()).toString())
                .body(sesion.usuario());
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookieExpirada().toString())
                .build();
    }

    @GetMapping("/me")
    public ResponseEntity<UsuarioResponse> yo(Authentication authentication) {
        return ResponseEntity.ok(usuarioService.obtenerPorEmail(authentication.getName()));
    }

    private ResponseCookie cookieSesion(String token) {
        return ResponseCookie.from(JwtService.COOKIE_SESION, token)
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/")
                .maxAge(jwtService.getExpiracion())
                .build();
    }

    private ResponseCookie cookieExpirada() {
        return ResponseCookie.from(JwtService.COOKIE_SESION, "")
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/")
                .maxAge(0)
                .build();
    }
}
