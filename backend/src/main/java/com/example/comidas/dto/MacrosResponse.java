package com.example.comidas.dto;

public record MacrosResponse(
		double calorias,
		double proteinas,
		double carbohidratos,
		double grasas,
		double fibra
) {
	public static MacrosResponse zero() {
		return new MacrosResponse(0, 0, 0, 0, 0);
	}

	public MacrosResponse plus(MacrosResponse other) {
		return new MacrosResponse(
				this.calorias + other.calorias,
				this.proteinas + other.proteinas,
				this.carbohidratos + other.carbohidratos,
				this.grasas + other.grasas,
				this.fibra + other.fibra);
	}
}

