package com.nutrifit.nutricion;

import com.nutrifit.alimentos.Alimento;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Table(name = "meal_log_items")
@Getter
@Setter
@NoArgsConstructor
public class ItemRegistroDiario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "meal_entry_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private ComidaRegistrada comidaRegistrada;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "food_id", nullable = false)
    private Alimento alimento;

    @Column(name = "quantity_grams", nullable = false, precision = 6, scale = 2)
    private BigDecimal cantidadGramos;

    @Column(name = "calculated_calories", nullable = false, precision = 6, scale = 2)
    private BigDecimal caloriasCalculadas;

    @Column(name = "calculated_protein", nullable = false, precision = 6, scale = 2)
    private BigDecimal proteinaCalculada;

    @Column(name = "calculated_carbs", nullable = false, precision = 6, scale = 2)
    private BigDecimal carbohidratosCalculados;

    @Column(name = "calculated_fat", nullable = false, precision = 6, scale = 2)
    private BigDecimal grasaCalculada;
}
