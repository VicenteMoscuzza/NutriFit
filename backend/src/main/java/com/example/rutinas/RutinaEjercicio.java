package com.example.rutinas;

import com.example.ejercicios.Ejercicio;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "rutina_ejercicios")
public class RutinaEjercicio {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "rutina_id", nullable = false)
	private Rutina rutina;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "ejercicio_id", nullable = false)
	private Ejercicio ejercicio;

	protected RutinaEjercicio() {
	}

	public RutinaEjercicio(Rutina rutina, Ejercicio ejercicio) {
		this.rutina = rutina;
		this.ejercicio = ejercicio;
	}

	public Long getId() {
		return id;
	}

	public Rutina getRutina() {
		return rutina;
	}

	public Ejercicio getEjercicio() {
		return ejercicio;
	}
}

