import { useEffect, useState } from "react";
import ui from "../pages/ListForm.module.css";
import { createRutinaWithEjercicios, deleteRutina, listRutinas, updateRutina } from "../api/rutinas";
import { createEjercicio, deleteEjercicio, listEjercicios, updateEjercicio } from "../api/ejercicios";

export default function RutinasCrud({ mode = "full", onDone, initialEditingRutinaId = null }) {
  const [rutinas, setRutinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [ejercicios, setEjercicios] = useState([]);
  const [selectedEjercicioIds, setSelectedEjercicioIds] = useState(() => new Set());

  const [editingId, setEditingId] = useState(null);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [saving, setSaving] = useState(false);

  const [showAddEjercicio, setShowAddEjercicio] = useState(false);
  const [newEjNombre, setNewEjNombre] = useState("");
  const [newEjDescripcion, setNewEjDescripcion] = useState("");
  const [savingEjercicio, setSavingEjercicio] = useState(false);
  const [editingEjercicioId, setEditingEjercicioId] = useState(null);

  async function refresh() {
    setError("");
    setLoading(true);
    try {
      const [data, ej] = await Promise.all([listRutinas(), listEjercicios()]);
      setRutinas(Array.isArray(data) ? data : []);
      setEjercicios(Array.isArray(ej) ? ej : []);
    } catch (e) {
      const msg =
        e.response?.data?.detail ||
        e.response?.data?.message ||
        "No se pudieron cargar las rutinas";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    const id = Number(initialEditingRutinaId);
    if (!id || rutinas.length === 0) return;
    if (editingId != null) return;
    const r = rutinas.find((x) => Number(x?.id) === id);
    if (!r) return;
    startEdit(r);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialEditingRutinaId, rutinas]);

  async function onSubmitRutina(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        nombre,
        descripcion,
        ejercicioIds: Array.from(selectedEjercicioIds),
      };
      if (editingId == null) {
        await createRutinaWithEjercicios(payload);
        if (typeof onDone === "function") onDone();
      } else {
        await updateRutina(editingId, payload);
        if (mode !== "full" && typeof onDone === "function") onDone();
      }
      setNombre("");
      setDescripcion("");
      setSelectedEjercicioIds(new Set());
      setEditingId(null);
      await refresh();
    } catch (e2) {
      const msg =
        e2.response?.data?.detail ||
        e2.response?.data?.message ||
        "No se pudo crear la rutina";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  function startEdit(r) {
    setEditingId(r.id);
    setNombre(r.nombre ?? "");
    setDescripcion(r.descripcion ?? "");
    const ids = Array.isArray(r.ejercicios) ? r.ejercicios.map((x) => x.id) : [];
    setSelectedEjercicioIds(new Set(ids));
    setShowAddEjercicio(false);
  }

  function cancelEdit() {
    setEditingId(null);
    setNombre("");
    setDescripcion("");
    setSelectedEjercicioIds(new Set());
    setShowAddEjercicio(false);
  }

  async function onDelete(r) {
    const ok = window.confirm(`¿Eliminar la rutina "${r.nombre}"?`);
    if (!ok) return;
    setError("");
    try {
      await deleteRutina(r.id);
      await refresh();
    } catch (e) {
      const msg = e.response?.data?.detail || e.response?.data?.message || "No se pudo eliminar la rutina";
      setError(msg);
    }
  }

  function toggleEjercicio(id) {
    setSelectedEjercicioIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function openNewEjercicio() {
    setShowAddEjercicio(true);
    setEditingEjercicioId(null);
    setNewEjNombre("");
    setNewEjDescripcion("");
  }

  function openEditEjercicio(ej) {
    setShowAddEjercicio(true);
    setEditingEjercicioId(ej.id);
    setNewEjNombre(ej.nombre ?? "");
    setNewEjDescripcion(ej.descripcion ?? "");
  }

  async function onSaveEjercicio() {
    setError("");
    setSavingEjercicio(true);
    try {
      if (editingEjercicioId == null) {
        const created = await createEjercicio({
          nombre: newEjNombre,
          descripcion: newEjDescripcion,
        });
        setEjercicios((prev) => [...prev, created].sort((a, b) => a.nombre.localeCompare(b.nombre)));
        setSelectedEjercicioIds((prev) => new Set(prev).add(created.id));
      } else {
        const updated = await updateEjercicio(editingEjercicioId, {
          nombre: newEjNombre,
          descripcion: newEjDescripcion,
        });
        setEjercicios((prev) =>
          prev
            .map((x) => (x.id === updated.id ? updated : x))
            .sort((a, b) => (a.nombre ?? "").localeCompare(b.nombre ?? ""))
        );
        setSelectedEjercicioIds((prev) => {
          const next = new Set(prev);
          // Si editamos un global, el backend devuelve una copia nueva con otro id.
          if (updated.id !== editingEjercicioId && next.has(editingEjercicioId)) {
            next.delete(editingEjercicioId);
            next.add(updated.id);
          }
          return next;
        });
      }
      setNewEjNombre("");
      setNewEjDescripcion("");
      setEditingEjercicioId(null);
      setShowAddEjercicio(false);
    } catch (e3) {
      const msg =
        e3.response?.data?.detail ||
        e3.response?.data?.message ||
        "No se pudo crear el ejercicio";
      setError(msg);
    } finally {
      setSavingEjercicio(false);
    }
  }

  async function onDeleteEjercicio(ej) {
    const ok = window.confirm(`¿Eliminar el ejercicio "${ej.nombre}"?`);
    if (!ok) return;
    setError("");
    try {
      await deleteEjercicio(ej.id);
      setEjercicios((prev) => prev.filter((x) => x.id !== ej.id));
      setSelectedEjercicioIds((prev) => {
        const next = new Set(prev);
        next.delete(ej.id);
        return next;
      });
    } catch (e4) {
      const msg =
        e4.response?.data?.detail ||
        e4.response?.data?.message ||
        "No se pudo eliminar el ejercicio";
      setError(msg);
    }
  }

  useEffect(() => {
    if (!showAddEjercicio) return;
    function onKeyDown(e) {
      if (e.key === "Escape") setShowAddEjercicio(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showAddEjercicio]);

  return (
    <div className={ui.grid}>
      {error && <div className={ui.error}>{error}</div>}

      {mode === "full" ? (
        loading ? (
          <div className={ui.empty}>Cargando...</div>
        ) : rutinas.length === 0 ? (
          <div className={ui.empty}>Todavía no tenés rutinas registradas.</div>
        ) : (
          <ul className={ui.list}>
            {rutinas.map((r) => (
              <li key={r.id} className={ui.item}>
                <p className={ui.itemTitle}>{r.nombre}</p>
                {r.descripcion && <p className={ui.itemMeta}>{r.descripcion}</p>}
                {Array.isArray(r.ejercicios) && r.ejercicios.length > 0 && (
                  <p className={ui.itemMeta}>Ejercicios: {r.ejercicios.map((x) => x.nombre).join(", ")}</p>
                )}
                <div className={ui.itemActions}>
                  <button className={ui.secondary} type="button" onClick={() => startEdit(r)}>
                    Editar
                  </button>
                  <button className={ui.danger} type="button" onClick={() => onDelete(r)}>
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )
      ) : null}

      <form className={ui.form} onSubmit={onSubmitRutina}>
        <label className={ui.label}>
          {editingId == null ? "Nombre" : "Nombre (editando)"}
          <input
            className={ui.input}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Piernas + core"
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
            placeholder="Ej: sentadillas, peso muerto, abdominales..."
            maxLength={2000}
          />
        </label>

        <div className={ui.divider} />

        <div className={ui.label}>
          Ejercicios (seleccioná uno o más)
          {ejercicios.length === 0 ? (
            <div className={ui.empty}>No hay ejercicios cargados todavía.</div>
          ) : (
            <div className={ui.exercisePicker}>
              <div className={ui.exercisePickerMeta}>
                <span>
                  Seleccionados: <b>{selectedEjercicioIds.size}</b>
                </span>
                <div className={ui.exercisePickerRight}>
                  <span className={ui.exercisePickerHint}>Tip: hacé click en la tarjeta</span>
                  <button className={ui.secondary} type="button" onClick={openNewEjercicio}>
                    Nuevo ejercicio
                  </button>
                </div>
              </div>

              <div className={ui.exerciseGrid}>
                {ejercicios.map((ej) => {
                  const selected = selectedEjercicioIds.has(ej.id);
                  return (
                    <label
                      key={ej.id}
                      className={`${ui.exerciseCard} ${selected ? ui.exerciseCardSelected : ""}`}
                      role="checkbox"
                      aria-checked={selected}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          toggleEjercicio(ej.id);
                        }
                      }}
                    >
                      <input
                        className={ui.exerciseInput}
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleEjercicio(ej.id)}
                      />

                      <div className={ui.exerciseCardTop}>
                        <div className={ui.exerciseCardTitle}>{ej.nombre}</div>
                        <div className={ui.exerciseCardTopRight}>
                          <button
                            className={ui.iconBtn}
                            type="button"
                            title="Editar ejercicio"
                            aria-label="Editar ejercicio"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              openEditEjercicio(ej);
                            }}
                          >
                            ✎
                          </button>
                          <button
                            className={`${ui.iconBtn} ${ui.iconDanger}`}
                            type="button"
                            title="Eliminar ejercicio"
                            aria-label="Eliminar ejercicio"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              onDeleteEjercicio(ej);
                            }}
                          >
                            🗑
                          </button>
                          <div className={ui.exerciseCardMark} aria-hidden="true">
                            {selected ? "✓" : "+"}
                          </div>
                        </div>
                      </div>

                      {ej.descripcion && <p className={ui.exerciseCardDesc}>{ej.descripcion}</p>}
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className={ui.divider} />

        {showAddEjercicio ? (
          <div
            className={ui.modalOverlay}
            role="dialog"
            aria-modal="true"
            aria-label={editingEjercicioId == null ? "Nuevo ejercicio" : "Editar ejercicio"}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setShowAddEjercicio(false);
            }}
          >
            <div className={ui.modal} onMouseDown={(e) => e.stopPropagation()}>
              <div className={ui.modalHeader}>
                <p className={ui.modalTitle}>{editingEjercicioId == null ? "Nuevo ejercicio" : "Editar ejercicio"}</p>
                <button className={ui.modalClose} type="button" onClick={() => setShowAddEjercicio(false)}>
                  ✕
                </button>
              </div>
              <div className={ui.modalBody}>
                <div className={ui.form}>
                  <label className={ui.label}>
                    Nombre del ejercicio
                    <input
                      className={ui.input}
                      value={newEjNombre}
                      onChange={(e) => setNewEjNombre(e.target.value)}
                      placeholder="Ej: Sentadilla"
                      maxLength={120}
                      required
                      autoFocus
                    />
                  </label>
                  <label className={ui.label}>
                    Descripción (opcional)
                    <textarea
                      className={ui.textarea}
                      value={newEjDescripcion}
                      onChange={(e) => setNewEjDescripcion(e.target.value)}
                      placeholder="Ej: con barra, 4x8"
                      maxLength={2000}
                    />
                  </label>
                  <div className={ui.actions}>
                    <button className={ui.secondary} type="button" onClick={() => setShowAddEjercicio(false)}>
                      Cancelar
                    </button>
                    <button
                      className={ui.button}
                      type="button"
                      onClick={onSaveEjercicio}
                      disabled={savingEjercicio || !newEjNombre.trim()}
                    >
                      {savingEjercicio ? "Guardando..." : "Guardar"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className={ui.actions}>
          {editingId != null && (
            <button className={ui.secondary} type="button" onClick={cancelEdit} disabled={saving}>
              Cancelar edición
            </button>
          )}
          <button className={ui.button} type="submit" disabled={saving}>
            {saving ? "Guardando..." : editingId == null ? "Agregar rutina" : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}

