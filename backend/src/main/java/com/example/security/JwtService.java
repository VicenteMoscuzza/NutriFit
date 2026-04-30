package com.example.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;
import com.example.usuarios.Usuario;

import java.security.Key;
import java.util.Date;

@Component
public class JwtService {

    // Mínimo 32 caracteres para HS256
    private static final String SECRET = "nutrifit-clave-secreta-super-segura-2024";
    private static final long EXPIRATION_MS = 7L * 24 * 60 * 60 * 1000; // 7 días

    private Key getKey() {
        return Keys.hmacShaKeyFor(SECRET.getBytes());
    }

    public String generateToken(Usuario usuario) {
        return Jwts.builder()
                .setSubject(usuario.getEmail())       // identificador principal
                .claim("id", usuario.getId())
                .claim("nombre", usuario.getNombre())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_MS))
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractEmail(String token) {
        return getClaims(token).getSubject();
    }

    public boolean isTokenValid(String token) {
        try {
            getClaims(token); // lanza excepción si expiró o es inválido
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}