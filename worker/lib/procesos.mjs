// procesos.mjs: corre un comando hijo con tiempo límite, guarda su salida y reenvía el progreso (stderr) al log.
// Nunca rechaza la promesa: devuelve { codigo, stdout, stderr, expiro, abortado } y quien llama decide.
//
// `senal` (un AbortSignal) permite cortar el hijo antes de tiempo desde fuera. La usa el tope de gasto:
// en cuanto una versión se pasa del presupuesto, se aborta ahí mismo en vez de esperar a que termine.
import { spawn } from 'node:child_process';

const TOPE_TEXTO = 40_000; // se guarda solo la cola de cada flujo; lo demás ya salió por el log
const recortar = (texto) => (texto.length > TOPE_TEXTO ? texto.slice(-TOPE_TEXTO) : texto);
const GRACIA_MS = 10_000;

export function ejecutar(comando, args, { cwd, env = process.env, timeoutMs = 600_000, alStderr, senal } = {}) {
  return new Promise((resolver) => {
    const acumulado = { stdout: '', stderr: '', resto: '', expiro: false, abortado: false, cerrado: false };
    const terminar = (codigo, extra = '') => {
      if (acumulado.cerrado) return;
      acumulado.cerrado = true;
      clearTimeout(temporizador);
      if (senal) senal.removeEventListener('abort', alAbortar);
      if (acumulado.resto.trim() && alStderr) alStderr(acumulado.resto.trim());
      resolver({
        codigo, stdout: acumulado.stdout, stderr: (acumulado.stderr + extra).trim(),
        expiro: acumulado.expiro, abortado: acumulado.abortado,
      });
    };
    // Se corta igual que con el tiempo límite: SIGTERM y, si no se muere, SIGKILL tras la gracia.
    const alAbortar = () => {
      if (acumulado.cerrado || !hijo) return;
      acumulado.abortado = true;
      hijo.kill('SIGTERM');
      setTimeout(() => hijo.kill('SIGKILL'), GRACIA_MS).unref();
    };
    if (senal?.aborted) return resolver({ codigo: null, stdout: '', stderr: '', expiro: false, abortado: true });
    let hijo;
    try {
      hijo = spawn(comando, args, { cwd, env, stdio: ['ignore', 'pipe', 'pipe'] });
    } catch (e) {
      return resolver({ codigo: null, stdout: '', stderr: e.message, expiro: false });
    }
    const temporizador = setTimeout(() => {
      acumulado.expiro = true;
      hijo.kill('SIGTERM');
      setTimeout(() => hijo.kill('SIGKILL'), GRACIA_MS).unref();
    }, timeoutMs);
    if (senal) senal.addEventListener('abort', alAbortar, { once: true });
    hijo.stdout.on('data', (d) => { acumulado.stdout = recortar(acumulado.stdout + d); });
    hijo.stderr.on('data', (d) => {
      acumulado.stderr = recortar(acumulado.stderr + d);
      if (!alStderr) return;
      const lineas = (acumulado.resto + d).split('\n');
      acumulado.resto = lineas.pop();
      lineas.map((l) => l.trim()).filter(Boolean).forEach((l) => alStderr(l));
    });
    hijo.on('error', (e) => terminar(null, `\n${e.message}`));
    hijo.on('close', (codigo) => terminar(codigo));
  });
}

const lineasLimpias = (texto) => String(texto || '').split('\n')
  .map((l) => l.replace(/\x1b\[[0-9;]*m/g, '').trim())
  .filter(Boolean);

// Última línea con contenido, sin códigos de color: sirve para leer un resultado (un SHA, un resumen),
// nunca para explicar un fallo — para eso está motivoDeSalida.
export function ultimaLinea(texto) {
  return lineasLimpias(texto).pop() || '';
}

// Lo que Node imprime alrededor del error y que no le dice nada a quien pidió el carrusel.
const RUIDO = [
  /^at\s/,                 // marcos del rastro de pila
  /^Node\.js\s+v?\d/i,     // el pie que Node imprime al morirse
  /^\^+$/,                 // el cursor que señala la línea del código
  /^[{}[\]();,^]+$/,       // llaves, paréntesis y comas sueltos
  /^\.{3}\s*\d*\s*more/i,  // «... 3 more» del rastro
  /^(throw|return|await)\b/, // el eco de la línea de código que reventó
  /^\/.*:\d+$/,            // la ruta del archivo con su número de línea
  /^node:internal\//,      // rutas internas de Node
  /^[·•]/,                 // avisos de progreso del escritor («· render 3/8»), no son el fallo
];

// El motivo útil de una salida: la línea con «Error:» y, si no la hay, la última línea con sentido.
// Devuelve '' cuando no hay nada que contar; quien llama pone el texto por omisión.
export function motivoDeSalida(texto) {
  const utiles = lineasLimpias(texto).filter((l) => !RUIDO.some((re) => re.test(l)));
  const conError = utiles.filter((l) => /(^|\s)\w*Error\b\s*:/.test(l));
  return (conError.at(-1) || utiles.at(-1) || '')
    .replace(/^[✗x]\s*/, '')
    .replace(/^(?:Uncaught\s+)?Error\s*:\s*/, '')
    .trim();
}

export const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
