package com.example.rutinas;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import com.example.usuarios.Usuario;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.CascadeType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "rutinas")
public class Rutina {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "usuario_id", nullable = false)
	private Usuario usuario;

	@Column(nullable = false, length = 120)
	private String nombre;

	@Column(nullable = true, length = 2000)
	private String descripcion;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	@OneToMany(mappedBy = "rutina", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<RutinaEjercicio> ejercicios = new ArrayList<>();

	protected Rutina() {
	}

	public Rutina(Usuario usuario, String nombre, String descripcion) {
		this.usuario = usuario;
		this.nombre = nombre;
		this.descripcion = descripcion;
	}

	@PrePersist
	void prePersist() {
		if (createdAt == null) createdAt = Instant.now();
	}

	public Long getId() {
		return id;
	}

	public Usuario getUsuario() {
		return usuario;
	}

	public String getNombre() {
		return nombre;
	}

	public void setNombre(String nombre) {
		this.nombre = nombre;
	}

	public String getDescripcion() {
		return descripcion;
	}

	public void setDescripcion(String descripcion) {
		this.descripcion = descripcion;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

	public List<RutinaEjercicio> getEjercicios() {
		return ejercicios;
	}

	public void setEjercicios(List<RutinaEjercicio> ejercicios) {
		this.ejercicios = ejercicios;
	}
}

