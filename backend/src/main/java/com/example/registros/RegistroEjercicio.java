package com.example.registros;

import java.math.BigDecimal;
import java.time.Instant;

import com.example.ejercicios.Ejercicio;
import com.example.usuarios.Usuario;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
		name = "registro_ejercicios",
		uniqueConstraints = {
				@UniqueConstraint(name = "uk_registro_ejercicio_usuario_ejercicio", columnNames = { "usuario_id", "ejercicio_id" })
		})
public class RegistroEjercicio {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "usuario_id", nullable = false)
	private Usuario usuario;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "ejercicio_id", nullable = false)
	private Ejercicio ejercicio;

	@Column(name = "ultimo_peso_max_kg", nullable = true, precision = 10, scale = 2)
	private BigDecimal ultimoPesoMaxKg;

	@Column(name = "ultimo_updated_at", nullable = false)
	private Instant updatedAt;

	protected RegistroEjercicio() {
	}

	public RegistroEjercicio(Usuario usuario, Ejercicio ejercicio, BigDecimal ultimoPesoMaxKg) {
		this.usuario = usuario;
		this.ejercicio = ejercicio;
		this.ultimoPesoMaxKg = ultimoPesoMaxKg;
	}

	@PrePersist
	void prePersist() {
		if (updatedAt == null) updatedAt = Instant.now();
	}

	@PreUpdate
	void preUpdate() {
		updatedAt = Instant.now();
	}

	public Long getId() {
		return id;
	}

	public Usuario getUsuario() {
		return usuario;
	}

	public Ejercicio getEjercicio() {
		return ejercicio;
	}

	public BigDecimal getUltimoPesoMaxKg() {
		return ultimoPesoMaxKg;
	}

	public void setUltimoPesoMaxKg(BigDecimal ultimoPesoMaxKg) {
		this.ultimoPesoMaxKg = ultimoPesoMaxKg;
	}

	public Instant getUpdatedAt() {
		return updatedAt;
	}
}

