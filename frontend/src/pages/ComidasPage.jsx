import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import styles from "./SectionPage.module.css";
import ui from "./ListForm.module.css";
import { createComidaWithAlimentos, deleteComida, listComidas, updateComida } from "../api/comidas";
import { createAlimento, listAlimentos } from "../api/alimentos";
import logo from "../assets/Logo.png"

export default function ComidasPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [comidas, setComidas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [alimentos, setAlimentos] = useState([]);
  const [selectedAlimentoIds, setSelectedAlimentoIds] = useState(() => new Set());

  const [editingId, setEditingId] = useState(null);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState("");
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
      const payload = {
        nombre,
        descripcion,
        fecha: fecha ? fecha : null,
        alimentoIds: Array.from(selectedAlimentoIds),
      };
      if (editingId == null) {
        await createComidaWithAlimentos(payload);
      } else {
        await updateComida(editingId, payload);
      }
      setNombre("");
      setDescripcion("");
      setFecha("");
      setSelectedAlimentoIds(new Set());
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
    const ids = Array.isArray(c.alimentos) ? c.alimentos.map((x) => x.id) : [];
    setSelectedAlimentoIds(new Set(ids));
    setShowAddAlimento(false);
  }

  function cancelEdit() {
    setEditingId(null);
    setNombre("");
    setDescripcion("");
    setFecha("");
    setSelectedAlimentoIds(new Set());
    setShowAddAlimento(false);
  }

  async function onDelete(c) {
    const ok = window.confirm(`¿Eliminar la comida "${c.nombre}"?`);
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
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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
          Registrá tus comidas y revisá el historial. Cada registro queda asociado a tu usuario.
        </p>

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
                    <p className={ui.itemTitle}>{c.nombre}</p>
                    <p className={ui.itemMeta}>
                      {c.fecha ? `Fecha: ${c.fecha}` : null}
                      {c.fecha && c.descripcion ? " · " : null}
                      {c.descripcion ? c.descripcion : null}
                    </p>
                    {Array.isArray(c.alimentos) && c.alimentos.length > 0 && (
                      <p className={ui.itemMeta}>
                        Alimentos: {c.alimentos.map((x) => x.nombre).join(", ")}
                      </p>
                    )}
                    <div className={ui.itemActions}>
                      <button className={ui.secondary} type="button" onClick={() => startEdit(c)}>
                        Editar
                      </button>
                      <button className={ui.danger} type="button" onClick={() => onDelete(c)}>
                        Eliminar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <form className={ui.form} onSubmit={onSubmitComida}>
              <div className={ui.row}>
                <label className={ui.label}>
                  {editingId == null ? "Nombre" : "Nombre (editando)"}
                  <input
                    className={ui.input}
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej: Almuerzo"
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
                      <label key={a.id} className={ui.check}>
                        <input
                          type="checkbox"
                          checked={selectedAlimentoIds.has(a.id)}
                          onChange={() => toggleAlimento(a.id)}
                        />
                        <div>
                          <div className={ui.checkTitle}>{a.nombre}</div>
                          <p className={ui.checkDesc}>
                            {a.caloriasPor100g} kcal/100g · P {a.proteinasPor100g} · C {a.carbohidratosPor100g} · G{" "}
                            {a.grasasPor100g}
                          </p>
                        </div>
                      </label>
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

