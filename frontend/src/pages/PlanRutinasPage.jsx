import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { listRutinas } from "../api/rutinas";
import { addRutinaToDia, listRutinaPlan, removeRutinaPlanItem } from "../api/rutinaPlan";
import styles from "./PlanRutinasPage.module.css";
import logo from "../assets/Logo.png";

const DIAS = [
  { n: 1, label: "Lunes" },
  { n: 2, label: "Martes" },
  { n: 3, label: "Miércoles" },
  { n: 4, label: "Jueves" },
  { n: 5, label: "Viernes" },
  { n: 6, label: "Sábado" },
  { n: 7, label: "Domingo" },
];

export default function PlanRutinasPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [rutinas, setRutinas] = useState([]);
  const [plan, setPlan] = useState([]); // items: {id, diaSemana, rutina: {id,nombre,descripcion}}
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingDia, setAddingDia] = useState(() => new Map()); // diaSemana -> rutinaId (string)
  const [savingDia, setSavingDia] = useState(() => new Set()); // diaSemana currently saving

  const planPorDia = useMemo(() => {
    const map = new Map();
    for (const d of DIAS) map.set(d.n, []);
    for (const item of plan) {
      if (!map.has(item.diaSemana)) map.set(item.diaSemana, []);
      map.get(item.diaSemana).push(item);
    }
    return map;
  }, [plan]);

  async function refresh() {
    setError("");
    setLoading(true);
    const results = await Promise.allSettled([listRutinas(), listRutinaPlan()]);

    const [rutinasRes, planRes] = results;

    if (rutinasRes.status === "fulfilled") {
      setRutinas(Array.isArray(rutinasRes.value) ? rutinasRes.value : []);
    } else {
      setRutinas([]);
      const e = rutinasRes.reason;
      setError(
        e?.response?.data?.detail ||
          e?.response?.data?.message ||
          `No se pudieron cargar tus rutinas${e?.response?.status ? ` (HTTP ${e.response.status})` : ""}`
      );
    }

    if (planRes.status === "fulfilled") {
      setPlan(Array.isArray(planRes.value) ? planRes.value : []);
    } else {
      setPlan([]);
      const e = planRes.reason;
      setError((prev) => {
        const msg =
          e?.response?.data?.detail ||
          e?.response?.data?.message ||
          `No se pudo cargar tu plan semanal${e?.response?.status ? ` (HTTP ${e.response.status})` : ""}`;
        return prev ? `${prev}\n${msg}` : msg;
      });
    }

    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function onAdd(diaSemana, rutinaIdArg) {
    const rutinaIdRaw = rutinaIdArg ?? addingDia.get(diaSemana);
    const rutinaId = Number(rutinaIdRaw);
    if (!rutinaId) return;

    const items = planPorDia.get(diaSemana) ?? [];
    // Si ya está asignada esa misma rutina, no hacemos nada.
    if (items.some((x) => Number(x?.rutina?.id) === rutinaId)) {
      setAddingDia((prev) => {
        const next = new Map(prev);
        next.set(diaSemana, "");
        return next;
      });
      return;
    }

    setError("");
    try {
      setSavingDia((prev) => {
        const next = new Set(prev);
        next.add(diaSemana);
        return next;
      });

      // Regla: 1 rutina por día. Si ya hay una, la reemplazamos.
      if (items.length > 0) {
        await Promise.all(items.map((it) => removeRutinaPlanItem(it.id)));
        setPlan((prev) => prev.filter((x) => x.diaSemana !== diaSemana));
      }

      const created = await addRutinaToDia({ diaSemana, rutinaId });
      setPlan((prev) => [...prev, created]);
      setAddingDia((prev) => {
        const next = new Map(prev);
        next.set(diaSemana, "");
        return next;
      });
    } catch (e) {
      const msg =
        e.response?.data?.message ||
        e.response?.data?.detail ||
        "No se pudo guardar la rutina de ese día";
      setError(msg);
    } finally {
      setSavingDia((prev) => {
        const next = new Set(prev);
        next.delete(diaSemana);
        return next;
      });
    }
  }

  async function onRemove(itemId) {
    setError("");
    try {
      await removeRutinaPlanItem(itemId);
      setPlan((prev) => prev.filter((x) => x.id !== itemId));
    } catch (e) {
      const msg =
        e.response?.data?.message ||
        e.response?.data?.detail ||
        "No se pudo quitar la rutina de ese día";
      setError(msg);
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
        <h2 className={styles.title}>Plan semanal</h2>
        <p className={styles.subtitle}>
          Elegí un día y agregá una de tus rutinas. Podés repetir rutinas en distintos días.
        </p>

        <section className={styles.panel}>
          {error && <div className={styles.error}>{error}</div>}

          {loading ? <p className={styles.empty}>Cargando...</p> : null}

          <div className={styles.weekGrid} aria-busy={loading ? "true" : "false"}>
            {DIAS.map((d) => {
              const items = planPorDia.get(d.n) ?? [];
              const selected = addingDia.get(d.n) ?? "";
              const isSaving = savingDia.has(d.n);
              const canAdd = !loading && rutinas.length > 0 && !isSaving;
              return (
                <div key={d.n} className={styles.dayCol}>
                  <div className={styles.dayHeader}>
                    <h3 className={styles.dayTitle}>{d.label}</h3>
                    <span className={styles.dayCount}>{items.length}</span>
                  </div>

                  <div className={styles.addRow}>
                    <select
                      className={styles.select}
                      value={selected}
                      disabled={!canAdd}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAddingDia((prev) => {
                          const next = new Map(prev);
                          next.set(d.n, val);
                          return next;
                        });
                        if (val) onAdd(d.n, val);
                      }}
                    >
                      <option value="">
                        {rutinas.length === 0 ? "Creá una rutina abajo…" : "Elegí una rutina…"}
                      </option>
                      {rutinas.map((r) => (
                        <option key={r.id} value={String(r.id)}>
                          {r.nombre}
                        </option>
                      ))}
                    </select>
                    {isSaving ? <span className={styles.saving}>Guardando…</span> : null}
                  </div>

                  {items.length === 0 ? (
                    <p className={styles.empty}>Descanso</p>
                  ) : (
                    <ul className={styles.list}>
                      {items.map((it) => (
                        <li key={it.id} className={styles.item}>
                          <div className={styles.itemTop}>
                            <p className={styles.itemName}>{it.rutina?.nombre ?? "Rutina"}</p>
                            <button className={styles.removeBtn} type="button" onClick={() => onRemove(it.id)}>
                              Quitar
                            </button>
                          </div>
                          {it.rutina?.descripcion && <p className={styles.itemDesc}>{it.rutina.descripcion}</p>}
                          {Array.isArray(it.rutina?.ejercicios) && it.rutina.ejercicios.length > 0 ? (
                            <ul className={styles.exerciseList}>
                              {it.rutina.ejercicios.map((ej) => (
                                <li key={ej.id} className={styles.exerciseItem}>
                                  <span className={styles.exerciseName}>{ej.nombre}</span>
                                  {ej.descripcion ? (
                                    <span className={styles.exerciseDesc}> — {ej.descripcion}</span>
                                  ) : null}
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className={styles.panel} style={{ marginTop: 16 }}>
          <div className={styles.ctaRow}>
            <div>
              <h2 className={styles.ctaTitle}>¿Querés crear una rutina nueva?</h2>
              <p className={styles.ctaSubtitle}>
                Agregala en una pantalla aparte y después asignala al día que quieras.
              </p>
            </div>
            <button className={styles.ctaBtn} type="button" onClick={() => navigate("/rutinas/nueva")}>
              Agregar rutina
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

