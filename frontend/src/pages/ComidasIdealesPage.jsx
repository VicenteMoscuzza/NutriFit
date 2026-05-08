import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import styles from "./SectionPage.module.css";
import ui from "./ListForm.module.css";
import { listAlimentos } from "../api/alimentos";
import { createComidaIdeal, deleteComidaIdeal, listComidasIdeales, updateComidaIdeal } from "../api/comidasIdeales";
import logo from "../assets/Logo.png";

const TIPOS = [
  { tipo: 1, label: "Desayuno" },
  { tipo: 2, label: "Almuerzo" },
  { tipo: 3, label: "Merienda" },
  { tipo: 4, label: "Cena" },
];

export default function ComidasIdealesPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [items, setItems] = useState([]);
  const [alimentos, setAlimentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /** null | { id: number|null, tipoComida: number } */
  const [editing, setEditing] = useState(null);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [selectedAlimentoIds, setSelectedAlimentoIds] = useState(() => new Set());
  const [cantidadesPorId, setCantidadesPorId] = useState(() => ({}));
  const [saving, setSaving] = useState(false);

  async function refresh() {
    setError("");
    setLoading(true);
    try {
      const [data, al] = await Promise.all([listComidasIdeales(), listAlimentos()]);
      setItems(Array.isArray(data) ? data : []);
      setAlimentos(Array.isArray(al) ? al : []);
    } catch (e) {
      const msg = e.response?.data?.detail || e.response?.data?.message || "No se pudieron cargar las comidas ideales";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  function itemPorTipo(tipo) {
    return items.find((x) => x.tipoComida === tipo) ?? null;
  }

  function toggleAlimento(id) {
    setSelectedAlimentoIds((prev) => {
      const next = new Set(prev);
      const willRemove = next.has(id);
      if (willRemove) next.delete(id);
      else next.add(id);

      setCantidadesPorId((prevCant) => {
        const nextCant = { ...prevCant };
        if (willRemove) delete nextCant[id];
        else nextCant[id] = nextCant[id] ?? 100;
        return nextCant;
      });

      return next;
    });
  }

  function setCantidad(id, value) {
    setCantidadesPorId((prev) => ({ ...prev, [id]: value }));
  }

  function startEditExisting(c) {
    setEditing({ id: c.id, tipoComida: c.tipoComida });
    setNombre(c.nombre ?? "");
    setDescripcion(c.descripcion ?? "");
    const ids = Array.isArray(c.alimentos) ? c.alimentos.map((x) => x.id) : [];
    setSelectedAlimentoIds(new Set(ids));
    const nextCant = {};
    if (Array.isArray(c.alimentos)) {
      c.alimentos.forEach((x) => {
        nextCant[x.id] = x.cantidadG ?? 100;
      });
    }
    setCantidadesPorId(nextCant);
  }

  function startCreateForTipo(tipo) {
    const def = TIPOS.find((t) => t.tipo === tipo);
    setEditing({ id: null, tipoComida: tipo });
    setNombre(def?.label ?? "");
    setDescripcion("");
    setSelectedAlimentoIds(new Set());
    setCantidadesPorId({});
  }

  function resetForm() {
    setEditing(null);
    setNombre("");
    setDescripcion("");
    setSelectedAlimentoIds(new Set());
    setCantidadesPorId({});
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!editing) return;
    setError("");
    setSaving(true);
    try {
      const alimentosPayload = Array.from(selectedAlimentoIds).map((id) => ({
        alimentoId: id,
        cantidadG: Number(cantidadesPorId[id] ?? 100),
      }));
      const payload = {
        tipoComida: editing.tipoComida,
        nombre,
        descripcion,
        alimentos: alimentosPayload,
      };

      if (editing.id == null) await createComidaIdeal(payload);
      else await updateComidaIdeal(editing.id, payload);

      resetForm();
      await refresh();
    } catch (e2) {
      const msg = e2.response?.data?.detail || e2.response?.data?.message || "No se pudo guardar la comida ideal";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(c) {
    if (!window.confirm(`¿Eliminar tu comida ideal "${c.nombre}"?`)) return;
    setError("");
    try {
      await deleteComidaIdeal(c.id);
      if (editing?.id === c.id) resetForm();
      await refresh();
    } catch (e) {
      const m = e.response?.data?.detail || e.response?.data?.message || "No se pudo eliminar";
      setError(m);
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.left}>
            <button className={styles.backBtn} onClick={() => navigate("/comidas")}>
              ← Volver
            </button>
            <div className={styles.brand}>
              <div className={styles.brandLogo}>
                <img src={logo} alt="NutriFit" />
              </div>
              <h1 className={styles.brandName}>NutriFit</h1>
            </div>
          </div>

          <div className={styles.userSection}>
            <span className={styles.userEmail}>{user?.email}</span>
            <button onClick={logout} className={styles.logoutBtn}>
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <h2 className={styles.title}>Comidas ideales</h2>
        <p className={styles.subtitle}>
          Definí hasta cuatro comidas ideales (desayuno, almuerzo, merienda, cena). Solo vos las ves y podés editarlas cuando quieras.
        </p>

        <section className={styles.panel}>
          <div className={ui.grid}>
            {error && <div className={ui.error}>{error}</div>}

            {loading ? (
              <div className={ui.empty}>Cargando...</div>
            ) : (
              <ul className={ui.list}>
                {TIPOS.map(({ tipo, label }) => {
                  const c = itemPorTipo(tipo);
                  return (
                    <li key={tipo} className={ui.item}>
                      <p className={ui.itemTitle}>{label}</p>
                      {c ? (
                        <>
                          <p className={ui.itemMeta}>{c.nombre}</p>
                          {c.descripcion ? <p className={ui.itemMeta}>{c.descripcion}</p> : null}
                          {Array.isArray(c.alimentos) && c.alimentos.length > 0 && (
                            <p className={ui.itemMeta}>
                              Alimentos:{" "}
                              {c.alimentos.map((x) => `${x.nombre} (${Number(x.cantidadG ?? 0).toFixed(0)}g)`).join(", ")}
                            </p>
                          )}
                          {c.macrosTotales && (
                            <p className={ui.itemMeta}>
                              Totales: {Number(c.macrosTotales.calorias ?? 0).toFixed(0)} kcal · P{" "}
                              {Number(c.macrosTotales.proteinas ?? 0).toFixed(1)} · C{" "}
                              {Number(c.macrosTotales.carbohidratos ?? 0).toFixed(1)} · G{" "}
                              {Number(c.macrosTotales.grasas ?? 0).toFixed(1)}
                            </p>
                          )}
                          <div className={ui.itemActions}>
                            <button className={ui.secondary} type="button" onClick={() => startEditExisting(c)}>
                              Editar
                            </button>
                            <button className={ui.danger} type="button" onClick={() => onDelete(c)}>
                              Eliminar
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <p className={ui.itemMeta}>Sin plantilla para este momento.</p>
                          <div className={ui.itemActions}>
                            <button className={ui.button} type="button" onClick={() => startCreateForTipo(tipo)}>
                              Crear ideal
                            </button>
                          </div>
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            {editing && (
              <form className={ui.form} onSubmit={onSubmit}>
                <p className={ui.itemMeta}>
                  Editando: <strong>{TIPOS.find((t) => t.tipo === editing.tipoComida)?.label}</strong>
                  {editing.id == null ? " (nueva)" : null}
                </p>

                <label className={ui.label}>
                  Nombre
                  <input
                    className={ui.input}
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    maxLength={120}
                    required
                  />
                </label>

                <label className={ui.label}>
                  Descripción (opcional)
                  <textarea
                    className={ui.textarea}
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    maxLength={2000}
                  />
                </label>

                <div className={ui.divider} />

                <div className={ui.label}>
                  Alimentos
                  {alimentos.length === 0 ? (
                    <div className={ui.empty}>No hay alimentos en tu lista. Agregalos desde “Comidas”.</div>
                  ) : (
                    <div className={ui.selectList}>
                      {alimentos.map((a) => (
                        <div key={a.id} className={ui.item} style={{ border: "none", padding: "8px 0" }}>
                          <label className={ui.check}>
                            <input
                              type="checkbox"
                              checked={selectedAlimentoIds.has(a.id)}
                              onChange={() => toggleAlimento(a.id)}
                            />
                            <div style={{ flex: 1 }}>
                              <div className={ui.checkTitle}>
                                {a.nombre}
                                {a.esGlobal ? <span className={ui.checkDesc}> · Global</span> : null}
                              </div>
                              <p className={ui.checkDesc}>
                                {a.caloriasPor100g} kcal/100g · P {a.proteinasPor100g} · C {a.carbohidratosPor100g} · G{" "}
                                {a.grasasPor100g}
                              </p>
                              {selectedAlimentoIds.has(a.id) && (
                                <div style={{ marginTop: 8, display: "flex", gap: 10, alignItems: "center" }}>
                                  <span className={ui.checkDesc}>Cantidad (g)</span>
                                  <input
                                    className={ui.input}
                                    style={{ maxWidth: 140 }}
                                    inputMode="decimal"
                                    value={cantidadesPorId[a.id] ?? 100}
                                    onChange={(e) => setCantidad(a.id, e.target.value)}
                                  />
                                </div>
                              )}
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className={ui.actions}>
                  <button className={ui.secondary} type="button" onClick={resetForm} disabled={saving}>
                    Cancelar
                  </button>
                  <button className={ui.button} type="submit" disabled={saving}>
                    {saving ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
