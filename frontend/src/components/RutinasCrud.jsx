import { useEffect, useState } from "react";
import ui from "../pages/ListForm.module.css";
import { createRutinaWithEjercicios, deleteRutina, listRutinas, updateRutina } from "../api/rutinas";
import { createEjercicio, listEjercicios } from "../api/ejercicios";

export default function RutinasCrud() {
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
      } else {
        await updateRutina(editingId, payload);
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

  async function onCreateEjercicio() {
    setError("");
    setSavingEjercicio(true);
    try {
      const created = await createEjercicio({
        nombre: newEjNombre,
        descripcion: newEjDescripcion,
      });
      setNewEjNombre("");
      setNewEjDescripcion("");
      setEjercicios((prev) => [...prev, created].sort((a, b) => a.nombre.localeCompare(b.nombre)));
      setSelectedEjercicioIds((prev) => new Set(prev).add(created.id));
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

  return (
    <div className={ui.grid}>
      {error && <div className={ui.error}>{error}</div>}

      {loading ? (
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
      )}

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
            <div className={ui.selectList}>
              {ejercicios.map((ej) => (
                <label key={ej.id} className={ui.check}>
                  <input
                    type="checkbox"
                    checked={selectedEjercicioIds.has(ej.id)}
                    onChange={() => toggleEjercicio(ej.id)}
                  />
                  <div>
                    <div className={ui.checkTitle}>{ej.nombre}</div>
                    {ej.descripcion && <p className={ui.checkDesc}>{ej.descripcion}</p>}
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className={ui.divider} />

        <div className={ui.actions}>
          <button className={ui.secondary} type="button" onClick={() => setShowAddEjercicio((v) => !v)}>
            {showAddEjercicio ? "Cancelar agregar ejercicio" : "No encuentro mi ejercicio"}
          </button>
        </div>

        {showAddEjercicio && (
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
              <button
                className={ui.secondary}
                type="button"
                onClick={onCreateEjercicio}
                disabled={savingEjercicio || !newEjNombre.trim()}
              >
                {savingEjercicio ? "Agregando..." : "Agregar ejercicio"}
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
            {saving ? "Guardando..." : editingId == null ? "Agregar rutina" : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}

