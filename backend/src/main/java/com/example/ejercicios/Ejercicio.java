package com.example.ejercicios;

import com.example.usuarios.Usuario;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "ejercicios")
public class Ejercicio {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	// nullable para permitir ejercicios "globales" (para todo el mundo)
	@ManyToOne(fetch = FetchType.LAZY, optional = true)
	@JoinColumn(name = "usuario_id", nullable = true)
	private Usuario usuario;

	@Column(nullable = false, length = 120)
	private String nombre;

	@Column(nullable = true, length = 2000)
	private String descripcion;

	protected Ejercicio() {
	}

	public Ejercicio(Usuario usuario, String nombre, String descripcion) {
		this.usuario = usuario;
		this.nombre = nombre;
		this.descripcion = descripcion;
	}

	public static Ejercicio global(String nombre, String descripcion) {
		return new Ejercicio(null, nombre, descripcion);
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
}

