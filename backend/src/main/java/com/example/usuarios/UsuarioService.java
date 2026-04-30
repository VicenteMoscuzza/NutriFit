package com.example.usuarios;

import java.util.List;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.usuarios.dto.UsuarioCreateRequest;
import com.example.usuarios.dto.UsuarioResponse;

@Service
public class UsuarioService {
	private final UsuarioRepository usuarioRepository;
	private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

	public UsuarioService(UsuarioRepository usuarioRepository) {
		this.usuarioRepository = usuarioRepository;
	}

	@Transactional(readOnly = true)
	public List<UsuarioResponse> listar() {
		return usuarioRepository.findAll()
				.stream()
				.map(u -> new UsuarioResponse(u.getId(), u.getNombre(), u.getEmail(), u.getFechaNacimiento()))
				.toList();
	}

	@Transactional(readOnly = true)
	public UsuarioResponse obtener(Long id) {
		var u = usuarioRepository.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
		return new UsuarioResponse(u.getId(), u.getNombre(), u.getEmail(), u.getFechaNacimiento());
	}

	@Transactional
	public UsuarioResponse crear(UsuarioCreateRequest req) {
		usuarioRepository.findByEmail(req.email()).ifPresent(u -> {
			throw new IllegalArgumentException("Email ya registrado");
		});

		usuarioRepository.findByNombre(req.nombre()).ifPresent(u -> {
       		throw new IllegalArgumentException("Nombre de usuario ya registrado");
    	});

		var passwordHash = passwordEncoder.encode(req.password());
		var u = new Usuario(req.nombre(), req.email(), passwordHash, req.fechaNacimiento());
		var saved = usuarioRepository.save(u);
		return new UsuarioResponse(saved.getId(), saved.getNombre(), saved.getEmail(), saved.getFechaNacimiento());
	}
}
