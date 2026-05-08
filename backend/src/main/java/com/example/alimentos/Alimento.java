package com.example.alimentos;

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
@Table(name = "alimentos")
public class Alimento {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	// null = alimento global (visible para todos salvo ocultos)
	@ManyToOne(fetch = FetchType.LAZY, optional = true)
	@JoinColumn(name = "usuario_id", nullable = true)
	private Usuario usuario;

	@Column(nullable = false, length = 100)
	private String nombre;

	@Column(name = "calorias_por_100g", nullable = false)
	private double caloriasPor100g;

	@Column(name = "proteinas_por_100g", nullable = false)
	private double proteinasPor100g;

	@Column(name = "carbohidratos_por_100g", nullable = false)
	private double carbohidratosPor100g;

	@Column(name = "grasas_por_100g", nullable = false)
	private double grasasPor100g;

	@Column(name = "fibra_por_100g", nullable = false)
	private double fibraPor100g = 0.0;

	@Column(name = "tamano_porcion_g", nullable = true)
	private Double tamanoPorcionG;

	@Column(name = "unidad_porcion", length = 30, nullable = true)
	private String unidadPorcion;

	protected Alimento() {
	}

	public Alimento(Usuario usuario, String nombre, double caloriasPor100g, double proteinasPor100g, double carbohidratosPor100g,
			double grasasPor100g, double fibraPor100g, Double tamanoPorcionG, String unidadPorcion) {
		this.usuario = usuario;
		this.nombre = nombre;
		this.caloriasPor100g = caloriasPor100g;
		this.proteinasPor100g = proteinasPor100g;
		this.carbohidratosPor100g = carbohidratosPor100g;
		this.grasasPor100g = grasasPor100g;
		this.fibraPor100g = fibraPor100g;
		this.tamanoPorcionG = tamanoPorcionG;
		this.unidadPorcion = unidadPorcion;
	}

	public static Alimento global(String nombre, double caloriasPor100g, double proteinasPor100g, double carbohidratosPor100g,
			double grasasPor100g, double fibraPor100g, Double tamanoPorcionG, String unidadPorcion) {
		return new Alimento(null, nombre, caloriasPor100g, proteinasPor100g, carbohidratosPor100g, grasasPor100g, fibraPor100g,
				tamanoPorcionG, unidadPorcion);
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

	public double getCaloriasPor100g() {
		return caloriasPor100g;
	}

	public void setCaloriasPor100g(double caloriasPor100g) {
		this.caloriasPor100g = caloriasPor100g;
	}

	public double getProteinasPor100g() {
		return proteinasPor100g;
	}

	public void setProteinasPor100g(double proteinasPor100g) {
		this.proteinasPor100g = proteinasPor100g;
	}

	public double getCarbohidratosPor100g() {
		return carbohidratosPor100g;
	}

	public void setCarbohidratosPor100g(double carbohidratosPor100g) {
		this.carbohidratosPor100g = carbohidratosPor100g;
	}

	public double getGrasasPor100g() {
		return grasasPor100g;
	}

	public void setGrasasPor100g(double grasasPor100g) {
		this.grasasPor100g = grasasPor100g;
	}

	public double getFibraPor100g() {
		return fibraPor100g;
	}

	public void setFibraPor100g(double fibraPor100g) {
		this.fibraPor100g = fibraPor100g;
	}

	public Double getTamanoPorcionG() {
		return tamanoPorcionG;
	}

	public void setTamanoPorcionG(Double tamanoPorcionG) {
		this.tamanoPorcionG = tamanoPorcionG;
	}

	public String getUnidadPorcion() {
		return unidadPorcion;
	}

	public void setUnidadPorcion(String unidadPorcion) {
		this.unidadPorcion = unidadPorcion;
	}
}

