import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import styles from "./SectionPage.module.css";
import ui from "./ListForm.module.css";
import { createComidaWithAlimentos, deleteComida, listComidas, updateComida } from "../api/comidas";
import { createAlimento, deleteAlimento, listAlimentos } from "../api/alimentos";
import logo from "../assets/Logo.png";

const TIPO_COMIDA_LABEL = {
  1: "Desayuno",
  2: "Almuerzo",
  3: "Merienda",
  4: "Cena",
};

export default function ComidasPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [comidas, setComidas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [alimentos, setAlimentos] = useState([]);
  const [selectedAlimentoIds, setSelectedAlimentoIds] = useState(() => new Set());
  const [cantidadesPorId, setCantidadesPorId] = useState(() => ({})); // { [id]: number }

  const [editingId, setEditingId] = useState(null);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState("");
  const [tipoComida, setTipoComida] = useState(1);
  const [saving, setSaving] = useState(false);

  const [showAddAlimento, setShowAddAlimento] = useState(false);
  const [newAlNombre, setNewAlNombre] = useState("");
  const [newAlCal, setNewAlCal] = useState("");
  const [newAlProt, setNewAlProt] = useState("");
  const [newAlCarb, setNewAlCarb] = useState("");
  const [newAlGras, setNewAlGras] = useState("");
  const [newAlFibra, setNewAlFibra] = useState("");
  const [newAlPorcionG, setNewAlPorcionG] = useState("");
  const [newAlUnidad, setNewAlUnidad] = useState("");
  const [savingAlimento, setSavingAlimento] = useState(false);

  async function refresh() {
    setError("");
    setLoading(true);
    try {
      const [data, al] = await Promise.all([listComidas(), listAlimentos()]);
      setComidas(Array.isArray(data) ? data : []);
      setAlimentos(Array.isArray(al) ? al : []);
    } catch (e) {
      const msg =
        e.response?.data?.detail ||
        e.response?.data?.message ||
        "No se pudieron cargar las comidas";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function onSubmitComida(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const alimentosPayload = Array.from(selectedAlimentoIds).map((id) => ({
        alimentoId: id,
        cantidadG: Number(cantidadesPorId[id] ?? 100),
      }));
      const payload = {
        tipoComida: Number(tipoComida),
        nombre,
        descripcion,
        fecha: fecha ? fecha : null,
        alimentos: alimentosPayload,
      };
      if (editingId == null) {
        await createComidaWithAlimentos(payload);
      } else {
        await updateComida(editingId, payload);
      }
      setNombre("");
      setDescripcion("");
      setFecha("");
      setTipoComida(1);
      setSelectedAlimentoIds(new Set());
      setCantidadesPorId({});
      setEditingId(null);
      await refresh();
    } catch (e2) {
      const msg =
        e2.response?.data?.detail ||
        e2.response?.data?.message ||
        "No se pudo crear la comida";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  function startEdit(c) {
    setEditingId(c.id);
    setNombre(c.nombre ?? "");
    setDescripcion(c.descripcion ?? "");
    setFecha(c.fecha ?? "");
    setTipoComida(c.tipoComida != null ? Number(c.tipoComida) : 1);
    const ids = Array.isArray(c.alimentos) ? c.alimentos.map((x) => x.id) : [];
    setSelectedAlimentoIds(new Set(ids));
    const nextCant = {};
    if (Array.isArray(c.alimentos)) {
      c.alimentos.forEach((x) => {
        nextCant[x.id] = x.cantidadG ?? 100;
      });
    }
    setCantidadesPorId(nextCant);
    setShowAddAlimento(false);
  }

  function cancelEdit() {
    setEditingId(null);
    setNombre("");
    setDescripcion("");
    setFecha("");
    setTipoComida(1);
    setSelectedAlimentoIds(new Set());
    setCantidadesPorId({});
    setShowAddAlimento(false);
  }

  async function onDelete(c) {
    const msg = c.esPlantillaGlobal
      ? `¿Ocultar la comida base "${c.nombre}"? Seguirá existiendo para otros usuarios.`
      : `¿Eliminar tu comida "${c.nombre}"?`;
    const ok = window.confirm(msg);
    if (!ok) return;
    setError("");
    try {
      await deleteComida(c.id);
      await refresh();
    } catch (e) {
      const msg = e.response?.data?.detail || e.response?.data?.message || "No se pudo eliminar la comida";
      setError(msg);
    }
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

  async function onRemoveAlimentoDelCatalogo(a) {
    const msg = a.esGlobal
      ? `¿Ocultar "${a.nombre}" de tu lista? (sigue existiendo para otros usuarios)`
      : `¿Eliminar tu alimento "${a.nombre}"?`;
    if (!window.confirm(msg)) return;
    setError("");
    try {
      await deleteAlimento(a.id);
      setSelectedAlimentoIds((prev) => {
        const next = new Set(prev);
        next.delete(a.id);
        return next;
      });
      setCantidadesPorId((prev) => {
        const next = { ...prev };
        delete next[a.id];
        return next;
      });
      await refresh();
    } catch (e) {
      const m = e.response?.data?.detail || e.response?.data?.message || "No se pudo quitar el alimento";
      setError(m);
    }
  }

  async function onCreateAlimento() {
    setError("");
    setSavingAlimento(true);
    try {
      const payload = {
        nombre: newAlNombre,
        caloriasPor100g: Number(newAlCal),
        proteinasPor100g: Number(newAlProt),
        carbohidratosPor100g: Number(newAlCarb),
        grasasPor100g: Number(newAlGras),
        fibraPor100g: newAlFibra === "" ? null : Number(newAlFibra),
        tamanoPorcionG: newAlPorcionG === "" ? null : Number(newAlPorcionG),
        unidadPorcion: newAlUnidad === "" ? null : newAlUnidad,
      };
      const created = await createAlimento(payload);
      setNewAlNombre("");
      setNewAlCal("");
      setNewAlProt("");
      setNewAlCarb("");
      setNewAlGras("");
      setNewAlFibra("");
      setNewAlPorcionG("");
      setNewAlUnidad("");
      setAlimentos((prev) => [...prev, created].sort((a, b) => a.nombre.localeCompare(b.nombre)));
      setSelectedAlimentoIds((prev) => new Set(prev).add(created.id));
      setCantidadesPorId((prev) => ({ ...prev, [created.id]: 100 }));
    } catch (e3) {
      const msg =
        e3.response?.data?.detail ||
        e3.response?.data?.message ||
        "No se pudo crear el alimento";
      setError(msg);
    } finally {
      setSavingAlimento(false);
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.left}>
            <button className={styles.backBtn} onClick={() => navigate("/")}>
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
        <h2 className={styles.title}>Comidas</h2>
        <p className={styles.subtitle}>
          Incluye cuatro comidas base (globales) y las que agregues vos. Las globales podés ocultarlas o editarlas (se crea una copia tuya, como en rutinas).
        </p>
        <div className={ui.actions} style={{ marginBottom: 12 }}>
          <button className={ui.secondary} type="button" onClick={() => navigate("/comidas/ideales")}>
            Ver mis comidas ideales
          </button>
        </div>

        <section className={styles.panel}>
          <div className={ui.grid}>
            {error && <div className={ui.error}>{error}</div>}

            {loading ? (
              <div className={ui.empty}>Cargando...</div>
            ) : comidas.length === 0 ? (
              <div className={ui.empty}>Todavía no tenés comidas registradas.</div>
            ) : (
              <ul className={ui.list}>
                {comidas.map((c) => (
                  <li key={c.id} className={ui.item}>
                    <p className={ui.itemTitle}>
                      {c.nombre}
                      {c.esPlantillaGlobal ? <span className={ui.itemMeta}> · Base global</span> : null}
                    </p>
                    <p className={ui.itemMeta}>
                      {TIPO_COMIDA_LABEL[c.tipoComida] ? `${TIPO_COMIDA_LABEL[c.tipoComida]} · ` : null}
                      {c.fecha ? `Fecha: ${c.fecha}` : null}
                      {c.fecha && c.descripcion ? " · " : null}
                      {c.descripcion ? c.descripcion : null}
                    </p>
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
                      <button className={ui.secondary} type="button" onClick={() => startEdit(c)}>
                        Editar
                      </button>
                      <button className={ui.danger} type="button" onClick={() => onDelete(c)}>
                        {c.esPlantillaGlobal ? "Ocultar" : "Eliminar"}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <form className={ui.form} onSubmit={onSubmitComida}>
              <div className={ui.row}>
                <label className={ui.label}>
                  Momento del día
                  <select
                    className={ui.input}
                    value={tipoComida}
                    onChange={(e) => setTipoComida(Number(e.target.value))}
                    required
                  >
                    <option value={1}>Desayuno</option>
                    <option value={2}>Almuerzo</option>
                    <option value={3}>Merienda</option>
                    <option value={4}>Cena</option>
                  </select>
                </label>

                <label className={ui.label}>
                  {editingId == null ? "Nombre" : "Nombre (editando)"}
                  <input
                    className={ui.input}
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej: Almuerzo liviano"
                    maxLength={120}
                    required
                  />
                </label>

                <label className={ui.label}>
                  Fecha (opcional)
                  <input
                    className={ui.input}
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                  />
                </label>
              </div>

              <label className={ui.label}>
                Descripción (opcional)
                <textarea
                  className={ui.textarea}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Ej: pollo con ensalada"
                  maxLength={2000}
                />
              </label>

              <div className={ui.divider} />

              <div className={ui.label}>
                Alimentos (seleccioná uno o más)
                {alimentos.length === 0 ? (
                  <div className={ui.empty}>No hay alimentos cargados todavía.</div>
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
                        <div className={ui.itemActions} style={{ marginTop: 6 }}>
                          <button
                            type="button"
                            className={ui.danger}
                            onClick={() => onRemoveAlimentoDelCatalogo(a)}
                          >
                            {a.esGlobal ? "Ocultar" : "Eliminar"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={ui.divider} />

              <div className={ui.actions}>
                <button
                  className={ui.secondary}
                  type="button"
                  onClick={() => setShowAddAlimento((v) => !v)}
                >
                  {showAddAlimento ? "Cancelar agregar alimento" : "No encuentro mi alimento"}
                </button>
              </div>

              {showAddAlimento && (
                <div className={ui.form}>
                  <label className={ui.label}>
                    Nombre
                    <input
                      className={ui.input}
                      value={newAlNombre}
                      onChange={(e) => setNewAlNombre(e.target.value)}
                      placeholder="Ej: Arroz"
                      maxLength={100}
                    />
                  </label>

                  <div className={ui.row}>
                    <label className={ui.label}>
                      kcal / 100g
                      <input
                        className={ui.input}
                        inputMode="decimal"
                        value={newAlCal}
                        onChange={(e) => setNewAlCal(e.target.value)}
                        placeholder="130"
                      />
                    </label>
                    <label className={ui.label}>
                      Proteínas / 100g
                      <input
                        className={ui.input}
                        inputMode="decimal"
                        value={newAlProt}
                        onChange={(e) => setNewAlProt(e.target.value)}
                        placeholder="2.7"
                      />
                    </label>
                  </div>

                  <div className={ui.row}>
                    <label className={ui.label}>
                      Carbohidratos / 100g
                      <input
                        className={ui.input}
                        inputMode="decimal"
                        value={newAlCarb}
                        onChange={(e) => setNewAlCarb(e.target.value)}
                        placeholder="28"
                      />
                    </label>
                    <label className={ui.label}>
                      Grasas / 100g
                      <input
                        className={ui.input}
                        inputMode="decimal"
                        value={newAlGras}
                        onChange={(e) => setNewAlGras(e.target.value)}
                        placeholder="0.3"
                      />
                    </label>
                  </div>

                  <div className={ui.row}>
                    <label className={ui.label}>
                      Fibra / 100g (opcional)
                      <input
                        className={ui.input}
                        inputMode="decimal"
                        value={newAlFibra}
                        onChange={(e) => setNewAlFibra(e.target.value)}
                        placeholder="0"
                      />
                    </label>
                    <label className={ui.label}>
                      Tamaño porción g (opcional)
                      <input
                        className={ui.input}
                        inputMode="decimal"
                        value={newAlPorcionG}
                        onChange={(e) => setNewAlPorcionG(e.target.value)}
                        placeholder="50"
                      />
                    </label>
                  </div>

                  <label className={ui.label}>
                    Unidad porción (opcional)
                    <input
                      className={ui.input}
                      value={newAlUnidad}
                      onChange={(e) => setNewAlUnidad(e.target.value)}
                      placeholder="Ej: taza"
                      maxLength={30}
                    />
                  </label>

                  <div className={ui.actions}>
                    <button
                      className={ui.secondary}
                      type="button"
                      onClick={onCreateAlimento}
                      disabled={
                        savingAlimento ||
                        !newAlNombre.trim() ||
                        newAlCal === "" ||
                        newAlProt === "" ||
                        newAlCarb === "" ||
                        newAlGras === ""
                      }
                    >
                      {savingAlimento ? "Agregando..." : "Agregar alimento"}
                    </button>
                  </div>
                </div>
              )}

              <div className={ui.actions}>
                {editingId != null && (
                  <button className={ui.secondary} type="button" onClick={cancelEdit} disabled={saving}>
                    Cancelar edición
                  </button>
                )}
                <button className={ui.button} type="submit" disabled={saving}>
                  {saving ? "Guardando..." : editingId == null ? "Agregar comida" : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}

