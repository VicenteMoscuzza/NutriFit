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
@Table(name = "saved_meal_items")
@Getter
@Setter
@NoArgsConstructor
public class ItemComidaGuardada {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "saved_meal_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private ComidaGuardada comidaGuardada;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "food_id", nullable = false)
    private Alimento alimento;

    @Column(name = "quantity_grams", nullable = false, precision = 6, scale = 2)
    private BigDecimal cantidadGramos;
}
