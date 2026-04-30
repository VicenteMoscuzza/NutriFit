package com.example.rutinas.plan;

import java.time.Instant;

import com.example.rutinas.Rutina;
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
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
		name = "rutina_plan",
		uniqueConstraints = {
				@UniqueConstraint(columnNames = { "usuario_id", "dia_semana", "rutina_id" })
		})
public class RutinaPlan {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "usuario_id", nullable = false)
	private Usuario usuario;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "rutina_id", nullable = false)
	private Rutina rutina;

	@Column(name = "dia_semana", nullable = false)
	private Integer diaSemana;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	protected RutinaPlan() {
	}

	public RutinaPlan(Usuario usuario, Rutina rutina, Integer diaSemana) {
		this.usuario = usuario;
		this.rutina = rutina;
		this.diaSemana = diaSemana;
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

	public Rutina getRutina() {
		return rutina;
	}

	public Integer getDiaSemana() {
		return diaSemana;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}
}

