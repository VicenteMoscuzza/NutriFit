package com.example.registros;

import java.time.Instant;

import com.example.ejercicios.Ejercicio;
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
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
		name = "registro_rutina_ejercicios",
		uniqueConstraints = {
				@UniqueConstraint(
						name = "uk_registro_rutina_ejercicio",
						columnNames = { "usuario_id", "rutina_id", "ejercicio_id" })
		})
public class RegistroRutinaEjercicio {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "usuario_id", nullable = false)
	private Usuario usuario;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "rutina_id", nullable = false)
	private Rutina rutina;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "ejercicio_id", nullable = false)
	private Ejercicio ejercicio;

	@Column(name = "ultimas_reps", nullable = true)
	private Integer ultimasReps;

	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;

	protected RegistroRutinaEjercicio() {
	}

	public RegistroRutinaEjercicio(Usuario usuario, Rutina rutina, Ejercicio ejercicio, Integer ultimasReps) {
		this.usuario = usuario;
		this.rutina = rutina;
		this.ejercicio = ejercicio;
		this.ultimasReps = ultimasReps;
	}

	@PrePersist
	void prePersist() {
		if (updatedAt == null) updatedAt = Instant.now();
	}

	@PreUpdate
	void preUpdate() {
		updatedAt = Instant.now();
	}

	public Usuario getUsuario() {
		return usuario;
	}

	public Rutina getRutina() {
		return rutina;
	}

	public Ejercicio getEjercicio() {
		return ejercicio;
	}

	public Integer getUltimasReps() {
		return ultimasReps;
	}

	public void setUltimasReps(Integer ultimasReps) {
		this.ultimasReps = ultimasReps;
	}
}
