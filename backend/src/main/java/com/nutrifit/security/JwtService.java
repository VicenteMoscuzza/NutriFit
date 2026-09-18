package com.nutrifit.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    public static final String COOKIE_SESION = "nutrifit_token";

    private final SecretKey clave;
    private final Duration expiracion;

    public JwtService(
            @Value("${nutrifit.security.jwt.secret}") String secreto,
            @Value("${nutrifit.security.jwt.expiration-minutes}") long expiracionMinutos) {
        this.clave = Keys.hmacShaKeyFor(secreto.getBytes(StandardCharsets.UTF_8));
        this.expiracion = Duration.ofMinutes(expiracionMinutos);
    }

    public String generarToken(String email) {
        Date ahora = new Date();
        Date expira = new Date(ahora.getTime() + expiracion.toMillis());

        return Jwts.builder()
                .subject(email)
                .issuedAt(ahora)
                .expiration(expira)
                .signWith(clave)
                .compact();
    }

    public Duration getExpiracion() {
        return expiracion;
    }

    public String extraerEmail(String token) {
        return parsearClaims(token).getSubject();
    }

    public boolean esValido(String token) {
        try {
            parsearClaims(token);
            return true;
        } catch (Exception ex) {
            return false;
        }
    }

    private Claims parsearClaims(String token) {
        return Jwts.parser()
                .verifyWith(clave)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
