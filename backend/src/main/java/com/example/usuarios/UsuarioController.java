package com.example.usuarios;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.usuarios.dto.UsuarioCreateRequest;
import com.example.usuarios.dto.UsuarioResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {
	
	private final UsuarioService usuarioService;

	public UsuarioController(UsuarioService usuarioService) {
		this.usuarioService = usuarioService;
	}

	@GetMapping
	public List<UsuarioResponse> listar() {
		return usuarioService.listar();
	}

	@GetMapping("/{id}")
	public UsuarioResponse obtener(@PathVariable Long id) {
		return usuarioService.obtener(id);
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public UsuarioResponse crear(@Valid @RequestBody UsuarioCreateRequest req) {
		return usuarioService.crear(req);
	}
}
