import { useMemo, useState } from 'react';
import rutinas from '../data/rutinas.json';
import ejercicios from '../data/ejercicios.json';

// Por ahora el catálogo se lee del JSON. Cuando exista GET /api/rutinas,
// solo hay que reemplazar este import por un fetch.

const NIVELES = [
  { id: 'principiante', label: 'Principiante', carga: 1 },
  { id: 'intermedio', label: 'Intermedio', carga: 2 },
  { id: 'avanzado', label: 'Avanzado', carga: 3 },
];

const CATEGORIAS = {
  fuerza: 'Fuerza',
  fuerza_empuje_tiron: 'Empuje / tirón',
  fuerza_explosividad: 'Fuerza y explosividad',
  explosividad: 'Explosividad',
  hipertrofia: 'Hipertrofia',
  grupos_musculares: 'Grupo muscular',
};

// Si el nombre tiene alguna de estas palabras, la rutina va a "Cuerpo completo"
// y a ningún otro grupo (son rutinas que trabajan varias zonas a la vez).
const CUERPO_COMPLETO = ['general', 'total', 'corporal', 'superior', 'empuje', 'tiron', 'explosividad'];

const GRUPOS = [
  { id: 'pecho', label: 'Pecho', icon: '🛡️', claves: ['pecho', 'pectoral'] },
  { id: 'espalda', label: 'Espalda', icon: '🧗', claves: ['espalda'] },
  { id: 'hombros', label: 'Hombros', icon: '🧍', claves: ['hombro'] },
  { id: 'brazos', label: 'Brazos', icon: '💪', claves: ['brazo', 'biceps', 'triceps'] },
  { id: 'piernas', label: 'Piernas', icon: '🦵', claves: ['cuadriceps', 'femoral', 'tren inferior', 'pierna'] },
  { id: 'gluteos', label: 'Glúteos', icon: '🍑', claves: ['gluteo'] },
  { id: 'core', label: 'Core', icon: '🔥', claves: ['core'] },
  { id: 'completo', label: 'Cuerpo completo', icon: '🏋️', claves: [] },
];

// Ficha de cada ejercicio base (tips, error común y animación), por id.
const FICHAS = Object.fromEntries(ejercicios.map((e) => [e.id, e]));

const sinAcentos = (texto) => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function gruposDeRutina(rutina) {
  const nombre = sinAcentos(rutina.nombre);
  if (CUERPO_COMPLETO.some((clave) => nombre.includes(clave))) return ['completo'];
  const encontrados = GRUPOS.filter((g) => g.claves.some((clave) => nombre.includes(clave))).map((g) => g.id);
  return encontrados.length ? encontrados : ['completo'];
}

// Si en un mismo nivel hay dos rutinas con el mismo nombre, las numeramos
// ("Pecho · opción 2") para que se puedan distinguir.
function conVariantes(lista) {
  const vistos = {};
  return lista.map((rutina) => {
    vistos[rutina.nombre] = (vistos[rutina.nombre] || 0) + 1;
    const repetido = lista.filter((r) => r.nombre === rutina.nombre).length > 1;
    return repetido ? { ...rutina, nombre: `${rutina.nombre} · opción ${vistos[rutina.nombre]}` } : rutina;
  });
}

// "40 seg" -> 40, "1 min" -> 60, "10 min" -> 600. Si no se entiende, devuelve null.
function aSegundos(texto) {
  const m = /^(\d+(?:[.,]\d+)?)\s*(seg|min)/.exec(texto ?? '');
  if (!m) return null;
  const n = Number(m[1].replace(',', '.'));
  return m[2] === 'min' ? n * 60 : n;
}

// Números que muestran cuánto "pesa" una rutina: series, duración aproximada y descanso promedio.
const SEGUNDOS_POR_SERIE = 45; // tiempo de trabajo estimado de una serie

function intensidad(rutina) {
  const ejercicios = rutina.dias[0]?.ejercicios ?? []; // una sesión = el primer día
  let series = 0;
  let segundos = 0;
  const descansos = [];
  ejercicios.forEach((ej) => {
    const descanso = aSegundos(ej.descanso);
    if (descanso !== null) descansos.push(descanso);
    if (typeof ej.series === 'number') {
      series += ej.series;
      segundos += ej.series * (SEGUNDOS_POR_SERIE + (descanso ?? 60));
    } else {
      segundos += aSegundos(ej.repeticiones) ?? 0; // ej: "10 min" de estiramientos
    }
  });
  [...rutina.calentamiento, ...rutina.enfriamiento].forEach((c) => {
    segundos += aSegundos(c.duracion) ?? 0;
  });
  const minutos = Math.max(5, Math.round(segundos / 60 / 5) * 5);
  const descansoProm = descansos.length
    ? Math.round(descansos.reduce((a, b) => a + b, 0) / descansos.length / 5) * 5 // redondeado a 5 seg
    : null;
  return { series, minutos, descansoProm };
}

const formatoDescanso = (seg) => (seg >= 60 && seg % 60 === 0 ? `${seg / 60} min` : `${seg} seg`);

// Medidor de nivel: una barra con 1, 2 o 3 discos por lado, como en el gym.
function BarraDiscos({ carga, size = 'md' }) {
  // El disco más grande va pegado al centro; los siguientes, más chicos, hacia afuera.
  const discos = [
    { x: 4.5, alto: 18 },
    { x: 10, alto: 14 },
    { x: 15.5, alto: 10 },
  ];
  return (
    <svg className={`barra-discos barra-${size}`} viewBox="0 0 64 24" role="img" aria-label={`Carga ${carga} de 3`}>
      <rect className="barra-eje" x="1" y="10.75" width="62" height="2.5" rx="1.25" />
      <rect className="barra-eje" x="27" y="9" width="10" height="6" rx="1.5" />
      {discos.map((disco, i) => {
        const y = (24 - disco.alto) / 2;
        return (
          <g key={i} className={i < carga ? 'disco activo' : 'disco'}>
            <rect x={27 - disco.x} y={y} width="4.5" height={disco.alto} rx="1.2" />
            <rect x={32.5 + disco.x} y={y} width="4.5" height={disco.alto} rx="1.2" />
          </g>
        );
      })}
    </svg>
  );
}

function ResumenNiveles({ porNivel, total }) {
  return (
    <span className="nivel-mix" aria-hidden="true">
      {NIVELES.map((nivel) => (porNivel[nivel.id].length ? (
        <span
          key={nivel.id}
          className={`nivel-mix-tramo nivel-${nivel.id}`}
          style={{ flexGrow: porNivel[nivel.id].length / total }}
        />
      ) : null))}
    </span>
  );
}

// Animación + tips de técnica de un ejercicio.
function FichaEjercicio({ ficha }) {
  const [sinVideo, setSinVideo] = useState(!ficha.video);
  return (
    <div className="ej-ficha">
      {sinVideo ? (
        <div className="ej-video ej-video-vacio">Animación próximamente</div>
      ) : (
        <video
          className="ej-video"
          src={ficha.video}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          aria-label={`Animación del ejercicio ${ficha.nombre}`}
          onError={() => setSinVideo(true)}
        />
      )}
      <div className="ej-tips">
        <span className="ej-musculo">{ficha.musculo}</span>
        <ul>
          {ficha.tips.map((tip) => <li key={tip}>{tip}</li>)}
        </ul>
        <p className="ej-error"><strong>Evitá:</strong> {ficha.errorComun}</p>
      </div>
    </div>
  );
}

function TarjetaRutina({ rutina, abierta, onToggle }) {
  const [ejAbierto, setEjAbierto] = useState(null);
  const totalEjercicios = rutina.dias.reduce((t, dia) => t + dia.ejercicios.length, 0);
  const nivel = NIVELES.find((n) => n.id === rutina.nivel);
  const { series, minutos, descansoProm } = intensidad(rutina);
  return (
    <article className={`rutina-card nivel-${rutina.nivel}${abierta ? ' abierta' : ''}`}>
      <button type="button" className="rutina-card-head" onClick={onToggle} aria-expanded={abierta}>
        <span className="rutina-card-copy">
          <span className="rutina-nivel">
            <BarraDiscos carga={nivel.carga} size="sm" />
            <span className="nivel-chip">N{nivel.carga} · {nivel.label}</span>
          </span>
          <strong>{rutina.nombre}</strong>
          <small>
            {CATEGORIAS[rutina.categoria]} · {totalEjercicios} ejercicios
            {rutina.dias.length > 1 && ` · ${rutina.dias.length} días`}
          </small>
          <span className="rutina-stats" aria-label="Intensidad de la sesión">
            {series > 0 && <span>{series} series</span>}
            <span>~{minutos} min</span>
            {descansoProm !== null && <span>{formatoDescanso(descansoProm)} desc.</span>}
          </span>
        </span>
        <span className="rutina-card-arrow" aria-hidden="true">{abierta ? '−' : '+'}</span>
      </button>
      {abierta && (
        <div className="rutina-detalle">
          {rutina.calentamiento.length > 0 && (
            <p className="rutina-extra">
              <span>Calentamiento</span>
              {rutina.calentamiento.map((c) => `${c.nombre}${c.duracion ? ` (${c.duracion})` : ''}`).join(', ')}
            </p>
          )}
          {rutina.dias.map((dia, iDia) => (
            <div key={dia.nombre} className="rutina-dia">
              {rutina.dias.length > 1 && <h5>{dia.nombre}</h5>}
              {iDia === 0 && <p className="ej-ayuda">Tocá un ejercicio para ver la animación y los tips.</p>}
              <ol>
                {dia.ejercicios.map((ej) => {
                  const clave = `${iDia}-${ej.orden}`;
                  const ficha = FICHAS[ej.ejercicioId];
                  const abiertoEj = ejAbierto === clave;
                  return (
                    <li key={clave} className={ej.revisar ? 'revisar' : ''}>
                      <button
                        type="button"
                        className="ej-fila"
                        onClick={() => setEjAbierto(abiertoEj ? null : clave)}
                        aria-expanded={abiertoEj}
                        disabled={!ficha}
                      >
                        <span className="ej-nombre">
                          {ficha && <span className="ej-play" aria-hidden="true">{abiertoEj ? '▾' : '▸'}</span>}
                          {ej.nombre}
                          {ej.revisar && <em title="Dato incompleto en el Excel"> revisar</em>}
                        </span>
                        <span className="ej-datos">
                          {ej.series ? `${ej.series} × ${ej.repeticiones}` : ej.repeticiones}
                          {ej.descanso && <span> · {ej.descanso}</span>}
                        </span>
                      </button>
                      {abiertoEj && ficha && <FichaEjercicio ficha={ficha} />}
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
          {rutina.enfriamiento.length > 0 && (
            <p className="rutina-extra">
              <span>Enfriamiento</span>
              {rutina.enfriamiento.map((c) => `${c.nombre}${c.duracion ? ` (${c.duracion})` : ''}`).join(', ')}
            </p>
          )}
        </div>
      )}
    </article>
  );
}

function GruposMusculares() {
  const [grupoActivo, setGrupoActivo] = useState(null);
  const [rutinaAbierta, setRutinaAbierta] = useState(null);

  // Agrupa una sola vez: { pecho: { principiante: [...], intermedio: [...], avanzado: [...] }, ... }
  const catalogo = useMemo(() => {
    const base = Object.fromEntries(
      GRUPOS.map((g) => [g.id, Object.fromEntries(NIVELES.map((n) => [n.id, []]))]),
    );
    rutinas.forEach((rutina) => {
      gruposDeRutina(rutina).forEach((grupo) => base[grupo][rutina.nivel].push(rutina));
    });
    return base;
  }, []);

  const grupo = GRUPOS.find((g) => g.id === grupoActivo);

  function elegirGrupo(id) {
    setGrupoActivo((actual) => (actual === id ? null : id));
    setRutinaAbierta(null);
  }

  return (
    <section className="grupos-section" id="grupos" aria-labelledby="grupos-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">EXPLORÁ EL CATÁLOGO</p>
          <h2 id="grupos-title">Grupos musculares</h2>
        </div>
        <ul className="nivel-leyenda" aria-label="Referencia de niveles">
          {NIVELES.map((n) => (
            <li key={n.id} className={`nivel-${n.id}`}>
              <BarraDiscos carga={n.carga} size="sm" />
              {n.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="grupos-grid">
        {GRUPOS.map((g) => {
          const porNivel = catalogo[g.id];
          const total = NIVELES.reduce((t, n) => t + porNivel[n.id].length, 0);
          if (!total) return null;
          const activo = grupoActivo === g.id;
          return (
            <button
              key={g.id}
              type="button"
              className={`grupo-card${activo ? ' activo' : ''}`}
              onClick={() => elegirGrupo(g.id)}
              aria-expanded={activo}
              aria-controls="grupo-panel"
            >
              <span className="grupo-icon" aria-hidden="true">{g.icon}</span>
              <span className="grupo-copy">
                <strong>{g.label}</strong>
                <small>{total} {total === 1 ? 'rutina' : 'rutinas'}</small>
              </span>
              <ResumenNiveles porNivel={porNivel} total={total} />
            </button>
          );
        })}
      </div>

      {grupo && (
        <div className="grupo-panel" id="grupo-panel">
          <div className="grupo-panel-head">
            <span className="grupo-icon" aria-hidden="true">{grupo.icon}</span>
            <h3>{grupo.label}</h3>
            <button type="button" className="grupo-cerrar" onClick={() => elegirGrupo(grupo.id)}>Cerrar</button>
          </div>
          <div className="niveles-columnas">
            {NIVELES.map((nivel) => {
              const lista = catalogo[grupo.id][nivel.id];
              return (
                <div key={nivel.id} className={`nivel-columna nivel-${nivel.id}`}>
                  <div className="nivel-columna-head">
                    <BarraDiscos carga={nivel.carga} />
                    <div>
                      <strong>{nivel.label}</strong>
                      <small>{lista.length} {lista.length === 1 ? 'rutina' : 'rutinas'}</small>
                    </div>
                  </div>
                  {lista.length ? (
                    conVariantes(lista).map((rutina) => (
                      <TarjetaRutina
                        key={rutina.id}
                        rutina={rutina}
                        abierta={rutinaAbierta === rutina.id}
                        onToggle={() => setRutinaAbierta((a) => (a === rutina.id ? null : rutina.id))}
                      />
                    ))
                  ) : (
                    <p className="nivel-vacio">Todavía no hay rutinas de este nivel.</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

export default GruposMusculares;
