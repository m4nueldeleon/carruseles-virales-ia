// pipeline.mjs: qué pasa con un pedido (y con una corrección) de principio a fin: referencia, una versión por
// formato con escribir.mjs, zip, subida a Vercel Blob, fila en carrusel_version y estado final del pedido.
// Aquí no hay consultas SQL ni llamadas HTTP directas: eso vive en lib/ y entra por `repo` y `almacen`.
//
// El gasto: cada llamada a la API deja su consumo en el stderr del escritor. Aquí se lee al vuelo
// (lib/costos.mjs), se guarda con la versión, se suma al pedido y se apunta en el libro del día
// (lib/gasto.mjs). Si un pedido se pasa del tope, la versión en curso se corta en seco y el pedido
// se cierra con un texto que dice cuánto llevaba y cuál era el tope.
import fs from 'node:fs';
import path from 'node:path';
import { log, aviso, fallo, ahoraIso } from './lib/log.mjs';
import { diagnosticar, EJEMPLO_SIMULACION } from './lib/config.mjs';
import { ejecutar, motivoDeSalida } from './lib/procesos.mjs';
import { construirReferencia, decidirFormatos, detectarLogos } from './lib/entrada.mjs';
import { crearZip, extraerCaption, humanizarMotivo, leerJsonSiExiste, leerResumenEscribir, listarSlides, tituloPortada } from './lib/salida.mjs';
import { subirVersion } from './lib/blob.mjs';
import { crearContador, dolares, redondear } from './lib/costos.mjs';

const ARCHIVOS_EJEMPLO = ['carrusel.json', 'caption.txt', 'preview.jpg', 'portada-270.jpg', 'qa.json', 'metadata.json'];
const TOPE_MOTIVO = 240;

// Libro del día de mentira, para cuando el pipeline se usa sin uno (pruebas, modo simulación).
const LIBRO_NULO = Object.freeze({ anotar: () => 0, total: () => 0, alcanzoElTope: () => false });

export function crearPipeline({ config, repo, almacen, libro = LIBRO_NULO }) {
  const rutaScript = (nombre) => path.join(config.skillDir, 'scripts', nombre);
  const dirPedido = (id) => path.join(config.trabajoDir, String(id));

  // ---------- utilidades ----------

  // Cualquier ruta absoluta que quede en un mensaje: las carpetas conocidas del servidor y, por si el error
  // viene de otro lado (un ENOENT de Node trae «open '/usr/lib/…'»), cualquier otra ruta suelta. Las URL no
  // se tocan: su parte de ruta siempre va pegada al dominio, y ahí el patrón no entra.
  const RUTA_SUELTA = /(?<![\w:/])\/(?:[\w.@%+-]+\/)+[\w.@%+-]*/g;
  const sinRutas = (texto) => [config.trabajoDir, config.privadoDir, config.skillDir]
    .reduce((t, dir) => (dir ? t.split(dir).join('…') : t), String(texto || ''))
    .replace(RUTA_SUELTA, '…')
    .replace(/…(?:\s*…)+/g, '…');   // dos tapados seguidos se leen como uno

  // El último filtro antes de que un texto llegue a la pantalla de quien pidió el carrusel. Todo lo que
  // cierra un pedido o una corrección con error pasa por aquí, venga el mensaje de donde venga: se le
  // quitan las rutas del servidor y se le pone el tope de caracteres una sola vez y en un solo sitio.
  const paraElUsuario = (texto) => sinRutas(texto).replace(/\s+/g, ' ').trim().slice(0, TOPE_MOTIVO);

  // El motivo que acaba en la pantalla de quien pidió el carrusel: el mensaje útil del escritor
  // (nunca el rastro de pila ni el «Node.js v22»), traducido al español cuando viene de la API.
  // El detalle técnico en inglés que la API devuelve se queda en el log del servidor, no en la pantalla.
  function motivoLegible(resultado) {
    if (resultado.abortado) return 'La versión se cortó al llegar al tope de gasto del pedido';
    if (resultado.expiro) return `La versión tardó más de ${config.timeoutVersionMin} minutos y se canceló`;
    const crudo = motivoDeSalida(resultado.stderr) || motivoDeSalida(resultado.stdout);
    const alLog = (detalle) => aviso(`  detalle de la API (no se le enseña a quien pidió el carrusel): ${sinRutas(detalle)}`);
    return humanizarMotivo(crudo, { alLog }) || 'El escritor terminó sin explicar el motivo';
  }

  // TRABAJO_DIR/<pedido>/ con copia de la ficha y el histórico: qa.mjs los busca en la carpeta madre de la versión.
  function prepararCarpetaPedido(pedido) {
    const dir = dirPedido(pedido.id);
    fs.mkdirSync(path.join(dir, 'entrada'), { recursive: true });
    for (const archivo of ['MI-MARCA.md', 'historico.json']) {
      const origen = path.join(config.privadoDir, archivo);
      if (fs.existsSync(origen)) fs.copyFileSync(origen, path.join(dir, archivo));
    }
    return dir;
  }

  function limpiarSalida(salida) {
    if (fs.existsSync(salida)) fs.rmSync(salida, { recursive: true, force: true });
    fs.mkdirSync(salida, { recursive: true });
  }

  function flagsComunes({ salida, formato, referencia, tema, instrucciones, logos }) {
    const banco = path.join(config.bancoDir, 'catalogo.json');
    return [
      '--carpeta', config.privadoDir, '--salida', salida, '--formato-plan', formato,
      ...(tema ? ['--tema', tema] : []),
      ...(referencia && fs.existsSync(referencia) ? ['--referencia', referencia] : []),
      ...(instrucciones ? ['--instrucciones', instrucciones] : []),
      ...(fs.existsSync(banco) ? ['--banco', banco] : []),
      ...(logos ? ['--logos', logos] : []),
      '--modelo', config.modelo, '--rondas', String(config.rondas), '--json',
    ];
  }

  async function correrEscritor(args, salida, { alLinea, senal } = {}) {
    const escritor = rutaScript('escribir.mjs');
    const alStderr = (l) => {
      if (alLinea) alLinea(l);
      log('  escribir:', sinRutas(l));
    };
    if (config.simular) return simularEscritor(escritor, args, salida, alStderr);
    return ejecutar('node', [escritor, ...args], {
      cwd: config.skillDir, timeoutMs: config.timeoutVersionMin * 60_000, alStderr, senal,
    });
  }

  // Simulación: si escribir.mjs ya acepta --simular se usa; si todavía no, el worker copia el ejemplo de la skill.
  async function simularEscritor(escritor, args, salida, alStderr) {
    const ejemplo = path.join(config.skillDir, EJEMPLO_SIMULACION);
    if (fs.existsSync(escritor) && fs.readFileSync(escritor, 'utf8').includes('--simular')) {
      return ejecutar('node', [escritor, '--simular', ejemplo, ...args],
        { cwd: config.skillDir, timeoutMs: 10 * 60_000, alStderr });
    }
    aviso('escribir.mjs aún no acepta --simular: el worker copia el ejemplo de la skill en su lugar');
    const origen = path.dirname(ejemplo);
    for (const archivo of ARCHIVOS_EJEMPLO) {
      if (fs.existsSync(path.join(origen, archivo))) fs.copyFileSync(path.join(origen, archivo), path.join(salida, archivo));
    }
    fs.mkdirSync(path.join(salida, 'slides'), { recursive: true });
    for (const s of listarSlides(origen)) fs.copyFileSync(path.join(origen, 'slides', s), path.join(salida, 'slides', s));
    const carrusel = leerJsonSiExiste(path.join(salida, 'carrusel.json')) || {};
    const qa = leerJsonSiExiste(path.join(salida, 'qa.json')) || {};
    const formato = args[args.indexOf('--formato-plan') + 1];
    const resumen = {
      carpeta: salida, slug: carrusel.slug, formato_plan: formato, formato_elegido: formato === 'referencia' ? 'carrusel-8' : formato,
      look: carrusel.look, laminas: (carrusel.slides || []).length, indice_qa: qa.indice, veredicto_qa: qa.veredicto,
      palabra_clave: carrusel.palabra_clave, faltantes: [], confianza: 0.9,
    };
    return { codigo: 0, stdout: `${JSON.stringify(resumen)}\n`, stderr: '', expiro: false };
  }

  // Empaqueta, sube e inserta la fila de una versión que escribir.mjs ya dejó en `salida`.
  async function publicarVersion({ pedido, n, formato, salida, resumen, contador = null, origenCorreccionId = null }) {
    const carrusel = leerJsonSiExiste(path.join(salida, 'carrusel.json'));
    const slides = listarSlides(salida);
    if (!carrusel || !slides.length) throw new Error('El escritor terminó pero no dejó carrusel.json o las láminas');
    const qa = leerJsonSiExiste(path.join(salida, 'qa.json'));
    if (!(await crearZip(salida, slides))) aviso(`  v${n}: no se pudo crear carrusel.zip; la versión sale sin zip`);
    const urls = await subirVersion(almacen, salida, `ccm/carruseles/${pedido.id}/v${n}`, slides);
    const fila = {
      pedido_id: pedido.id, n, formato,
      look: resumen?.look || carrusel.look || null, tipo: carrusel.tipo || null,
      laminas: resumen?.laminas || slides.length, carrusel_json: carrusel,
      indice_qa: resumen?.indice_qa ?? qa?.indice ?? null, veredicto_qa: resumen?.veredicto_qa ?? qa?.veredicto ?? null, qa_json: qa,
      ...urls, caption: extraerCaption(path.join(salida, 'caption.txt')),
      estado: 'propuesta', origen_correccion_id: origenCorreccionId,
      ...(contador ? contador.columnas() : {}),
    };
    const insertada = await repo.insertarVersion(fila);
    log(`  v${n} ${formato}: ${fila.laminas} láminas, look ${fila.look}, QA ${fila.indice_qa ?? '?'} ${fila.veredicto_qa ?? ''}`.trimEnd());
    if (contador) log(`  v${n} costó ${dolares(contador.usd)} (${contador.llamadas} llamada(s) a ${contador.modelo || 'la API'})`);
    return { ...fila, id: insertada?.id || null };
  }

  // ---------- pedido ----------

  // Corre el escritor llevando la cuenta del gasto: cada línea de consumo que imprime se convierte a
  // dólares al vuelo y, si el pedido se pasa del tope, el proceso hijo se corta ahí mismo.
  // Devuelve siempre `usd`: una versión que falló también gastó, y ese gasto cuenta.
  async function correrConPresupuesto({ args, salida, gastoPrevio }) {
    const contador = crearContador({ tabla: config.precios });
    const corte = new AbortController();
    const tope = config.topePedidoUsd;
    const alLinea = (linea) => {
      if (!contador.sumar(linea) || !(tope > 0) || corte.signal.aborted) return;
      if (gastoPrevio + contador.usd < tope) return;
      aviso(`  el pedido llegó a ${dolares(gastoPrevio + contador.usd)} y el tope es ${dolares(tope)}: corto la versión aquí`);
      corte.abort();
    };
    const resultado = await correrEscritor(args, salida, { alLinea, senal: corte.signal });
    return { resultado, contador };
  }

  async function generarVersion({ pedido, n, formato, referencia, logos, instruccionesExtra, gastoPrevio = 0 }) {
    const salida = path.join(dirPedido(pedido.id), `v${n}`);
    limpiarSalida(salida);
    const instrucciones = [pedido.instrucciones, instruccionesExtra].filter(Boolean).join('\n');
    log(`Pedido ${pedido.id}: versión ${n} (${formato})`);
    const args = flagsComunes({ salida, formato, referencia: referencia.ruta, tema: referencia.tema, instrucciones, logos });
    const { resultado, contador } = await correrConPresupuesto({ args, salida, gastoPrevio });
    const usd = contador.usd;
    if (contador.sinPrecio.length) aviso(`  no hay precio en la tabla para ${contador.sinPrecio.join(', ')}: esa parte del gasto se cuenta como cero`);
    if (resultado.codigo !== 0) return { ok: false, n, formato, usd, motivo: motivoLegible(resultado) };
    try {
      const fila = await publicarVersion({ pedido, n, formato, salida, contador, resumen: leerResumenEscribir(resultado.stdout) });
      return { ok: true, n, formato, usd, fila };
    } catch (e) {
      return { ok: false, n, formato, usd, motivo: e.message };
    }
  }

  // Si un formato se repite dentro del pedido (4 versiones sin referencia), la segunda busca otro ángulo.
  const instruccionParaRepetido = (previas, formato) => (previas.length
    ? `Esta versión repite el formato ${formato}: usa un ángulo y un gancho distintos a «${tituloPortada(previas[0].fila.carrusel_json)}».`
    : null);

  async function cerrarConError(pedido, mensaje, costoUsd = null) {
    const texto = paraElUsuario(mensaje) || 'El pedido falló sin explicar el motivo';
    fallo(`Pedido ${pedido.id}: ${texto}`);
    await repo.actualizarPedido(pedido.id, {
      estado: 'error', error: texto, worker_fin: ahoraIso(),
      ...(costoUsd === null ? {} : { costo_usd: redondear(costoUsd) }),
    });
  }

  // Lo que lee en pantalla quien pidió el carrusel cuando el tope de gasto cortó el pedido.
  const avisoDeTope = (gastado, hechas, pedidas) => `El pedido se detuvo para no seguir gastando: llevaba `
    + `${dolares(gastado)} y el tope por pedido es ${dolares(config.topePedidoUsd)}. Se alcanzaron a generar `
    + `${hechas} de ${pedidas} versiones. Si necesitas más, pídeselo a quien lleva la plataforma.`;

  async function cerrarPedido(pedido, resultados, inicio, { costoUsd = 0, corte = null } = {}) {
    const buenas = resultados.filter((r) => r.ok);
    const malas = resultados.filter((r) => !r.ok);
    const minutos = ((Date.now() - inicio) / 60_000).toFixed(1);
    log(`Pedido ${pedido.id}: costó ${dolares(costoUsd)} en total`);
    if (corte) return cerrarConError(pedido, corte, costoUsd);
    if (!buenas.length) {
      return cerrarConError(pedido, `No se pudo generar ninguna versión. Último motivo: ${malas.at(-1)?.motivo || 'desconocido'}`, costoUsd);
    }
    const nota = malas.length
      ? paraElUsuario(`Se generaron ${buenas.length} de ${resultados.length} versiones. ${malas.map((m) => `La v${m.n} (${m.formato}) falló: ${m.motivo}`).join(' ')}`)
      : null;
    await repo.actualizarPedido(pedido.id, {
      estado: 'listo', titulo: tituloPortada(buenas[0].fila.carrusel_json), error: nota,
      worker_fin: ahoraIso(), costo_usd: redondear(costoUsd),
    });
    log(`Pedido ${pedido.id} listo: ${buenas.length}/${resultados.length} versiones en ${minutos} min`);
  }

  async function procesarPedido(pedido) {
    const inicio = Date.now();
    log(`Pedido ${pedido.id} reclamado: entrada ${pedido.entrada_tipo}, ${pedido.versiones || 1} versión(es)`);
    const problemas = diagnosticar(config);
    if (problemas.length) return cerrarConError(pedido, problemas[0]);
    const dir = prepararCarpetaPedido(pedido);
    const referencia = await construirReferencia({ pedido, dirEntrada: path.join(dir, 'entrada'), config });
    if (referencia.fallo) return cerrarConError(pedido, referencia.fallo);
    const formatos = decidirFormatos(pedido.versiones, referencia.hayReferencia);
    const logos = detectarLogos([pedido.entrada_texto, pedido.instrucciones], config.appsConocidas);
    log(`  formatos: ${formatos.join(', ')}${logos ? ` · logos: ${logos}` : ''}`);
    const resultados = [];
    // El gasto arranca en lo que el pedido ya llevara (una corrección anterior también costó dinero).
    const gasto = { usd: Number(pedido.costo_usd) || 0 };
    const seguir = { corte: null };
    for (const [i, formato] of formatos.entries()) {
      if (seguir.corte) break;
      const previas = resultados.filter((r) => r.ok && r.formato === formato);
      const resultado = await generarVersion({
        pedido, n: i + 1, formato, referencia, logos, gastoPrevio: gasto.usd,
        instruccionesExtra: instruccionParaRepetido(previas, formato),
      });
      gasto.usd += resultado.usd || 0;
      libro.anotar(resultado.usd || 0);
      if (!resultado.ok) aviso(`  v${i + 1} (${formato}) falló: ${resultado.motivo}`);
      resultados.push(resultado);
      if (config.topePedidoUsd > 0 && gasto.usd >= config.topePedidoUsd) {
        seguir.corte = avisoDeTope(gasto.usd, resultados.filter((r) => r.ok).length, formatos.length);
      }
    }
    await cerrarPedido(pedido, resultados, inicio, { costoUsd: gasto.usd, corte: seguir.corte });
  }

  // ---------- corrección ----------

  // La versión indicada; si no, la elegida; si no, la última que no se descartó; si no, la última.
  function elegirBase(versiones, versionId) {
    const porN = [...versiones].sort((a, b) => b.n - a.n);
    return versiones.find((v) => versionId && v.id === versionId)
      || versiones.find((v) => v.estado === 'elegida')
      || porN.find((v) => !['descartada', 'archivada'].includes(v.estado))
      || porN[0] || null;
  }

  // El carrusel.json base: el local (con sus assets al lado) si sigue en disco; si no, el de la base de datos.
  function prepararBase(dir, base, salida) {
    const local = path.join(dir, `v${base.n}`, 'carrusel.json');
    if (fs.existsSync(local)) {
      const assets = path.join(dir, `v${base.n}`, 'assets');
      if (fs.existsSync(assets)) fs.cpSync(assets, path.join(salida, 'assets'), { recursive: true });
      return local;
    }
    const ruta = path.join(dir, `base-v${base.n}.json`);
    fs.writeFileSync(ruta, `${JSON.stringify(base.carrusel_json, null, 2)}\n`);
    return ruta;
  }

  async function cerrarCorreccionConError(correccion, pedido, mensaje, costoUsd = null) {
    const texto = paraElUsuario(mensaje) || 'La corrección falló sin explicar el motivo';
    fallo(`Corrección ${correccion.id}: ${texto}`);
    await repo.actualizarCorreccion(correccion.id, { estado: 'error', error: texto });
    // El pedido vuelve al estado que tenía antes de la corrección (normalmente listo).
    if (pedido) {
      await repo.actualizarPedido(pedido.id, {
        estado: pedido.estado === 'procesando' ? 'listo' : pedido.estado, worker_fin: ahoraIso(),
        ...(costoUsd === null ? {} : { costo_usd: redondear(costoUsd) }),
      });
    }
  }

  async function procesarCorreccion(correccion) {
    log(`Corrección ${correccion.id} reclamada (pedido ${correccion.pedido_id})`);
    const pedido = await repo.pedidoPorId(correccion.pedido_id);
    if (!pedido) return cerrarCorreccionConError(correccion, null, 'El pedido de esta corrección ya no existe');
    const problemas = diagnosticar(config);
    if (problemas.length) return cerrarCorreccionConError(correccion, pedido, problemas[0]);
    const versiones = await repo.versionesDe(pedido.id);
    const base = elegirBase(versiones, correccion.version_id);
    if (!base) return cerrarCorreccionConError(correccion, pedido, 'El pedido no tiene ninguna versión que corregir');
    await repo.actualizarPedido(pedido.id, { estado: 'procesando', worker_inicio: ahoraIso(), worker_fin: null });
    const n = Math.max(...versiones.map((v) => v.n)) + 1;
    const dir = prepararCarpetaPedido(pedido);
    const salida = path.join(dir, `v${n}`);
    limpiarSalida(salida);
    const rutaBase = prepararBase(dir, base, salida);
    const logos = detectarLogos([pedido.entrada_texto, pedido.instrucciones, correccion.texto], config.appsConocidas);
    log(`  corrige v${base.n} (${base.formato}) → v${n}: «${String(correccion.texto).slice(0, 80)}»`);
    const args = [
      ...flagsComunes({ salida, formato: base.formato, referencia: path.join(dir, 'entrada', 'referencia.md'), tema: null, instrucciones: pedido.instrucciones, logos }),
      '--correccion', correccion.texto, '--base', rutaBase,
    ];
    // La corrección gasta contra el MISMO tope del pedido: lo que ya costó el pedido cuenta.
    const gastoPrevio = Number(pedido.costo_usd) || 0;
    const { resultado, contador } = await correrConPresupuesto({ args, salida, gastoPrevio });
    const total = gastoPrevio + contador.usd;
    libro.anotar(contador.usd);
    log(`  la corrección costó ${dolares(contador.usd)}; el pedido lleva ${dolares(total)}`);
    if (resultado.abortado) {
      return cerrarCorreccionConError(correccion, pedido, avisoDeTope(total, versiones.length, versiones.length), total);
    }
    if (resultado.codigo !== 0) return cerrarCorreccionConError(correccion, pedido, motivoLegible(resultado), total);
    try {
      const fila = await publicarVersion({ pedido, n, formato: base.formato, salida, contador, resumen: leerResumenEscribir(resultado.stdout), origenCorreccionId: correccion.id });
      await repo.actualizarCorreccion(correccion.id, { estado: 'aplicada', version_resultado_id: fila.id, aplicada_en: ahoraIso(), error: null });
      await repo.actualizarPedido(pedido.id, { estado: 'listo', worker_fin: ahoraIso(), costo_usd: redondear(total) });
      log(`Corrección ${correccion.id} aplicada: nueva versión v${n}`);
    } catch (e) {
      await cerrarCorreccionConError(correccion, pedido, e.message, total);
    }
  }

  return Object.freeze({ procesarPedido, procesarCorreccion });
}
