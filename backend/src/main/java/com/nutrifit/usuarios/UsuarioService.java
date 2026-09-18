package com.nutrifit.usuarios;

import com.nutrifit.security.JwtService;
import com.nutrifit.usuarios.dto.LoginRequest;
import com.nutrifit.usuarios.dto.RegistroUsuarioRequest;
import com.nutrifit.usuarios.dto.UsuarioResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public UsuarioResponse registrar(RegistroUsuarioRequest request) {
        String email = request.email().trim().toLowerCase();
        if (usuarioRepository.existsByEmail(email)) {
            throw new EmailYaRegistradoException(email);
        }

        Usuario usuario = new Usuario();
        usuario.setEmail(email);
        usuario.setContrasena(passwordEncoder.encode(request.contrasena()));

        return UsuarioResponse.desde(usuarioRepository.save(usuario));
    }

    public SesionIniciada iniciarSesion(LoginRequest request) {
        String email = request.email().trim().toLowerCase();
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(CredencialesInvalidasException::new);

        if (!passwordEncoder.matches(request.contrasena(), usuario.getContrasena())) {
            throw new CredencialesInvalidasException();
        }

        String token = jwtService.generarToken(usuario.getEmail());
        return new SesionIniciada(token, UsuarioResponse.desde(usuario));
    }

    public UsuarioResponse obtenerPorEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .map(UsuarioResponse::desde)
                .orElseThrow(CredencialesInvalidasException::new);
    }

    public Usuario obtenerEntidadAutenticada(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(CredencialesInvalidasException::new);
    }

    public record SesionIniciada(String token, UsuarioResponse usuario) {
    }
}
