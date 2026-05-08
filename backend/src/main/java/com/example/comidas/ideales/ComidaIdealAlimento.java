package com.example.comidas.ideales;

import com.example.alimentos.Alimento;

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
@Table(name = "comida_ideal_alimentos")
public class ComidaIdealAlimento {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "comida_ideal_id", nullable = false)
	private ComidaIdeal comidaIdeal;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "alimento_id", nullable = false)
	private Alimento alimento;

	@Column(name = "cantidad_g", nullable = false)
	private double cantidadG;

	protected ComidaIdealAlimento() {
	}

	public ComidaIdealAlimento(ComidaIdeal comidaIdeal, Alimento alimento, double cantidadG) {
		this.comidaIdeal = comidaIdeal;
		this.alimento = alimento;
		this.cantidadG = cantidadG;
	}

	public Long getId() {
		return id;
	}

	public ComidaIdeal getComidaIdeal() {
		return comidaIdeal;
	}

	public Alimento getAlimento() {
		return alimento;
	}

	public double getCantidadG() {
		return cantidadG;
	}

	public void setCantidadG(double cantidadG) {
		this.cantidadG = cantidadG;
	}
}

