// procesos.mjs: corre un comando hijo con tiempo límite, guarda su salida y reenvía el progreso (stderr) al log.
// Nunca rechaza la promesa: devuelve { codigo, stdout, stderr, expiro } y quien llama decide.
import { spawn } from 'node:child_process';

const TOPE_TEXTO = 40_000; // se guarda solo la cola de cada flujo; lo demás ya salió por el log
const recortar = (texto) => (texto.length > TOPE_TEXTO ? texto.slice(-TOPE_TEXTO) : texto);
const GRACIA_MS = 10_000;

export function ejecutar(comando, args, { cwd, env = process.env, timeoutMs = 600_000, alStderr } = {}) {
  return new Promise((resolver) => {
    const acumulado = { stdout: '', stderr: '', resto: '', expiro: false, cerrado: false };
    const terminar = (codigo, extra = '') => {
      if (acumulado.cerrado) return;
      acumulado.cerrado = true;
      clearTimeout(temporizador);
      if (acumulado.resto.trim() && alStderr) alStderr(acumulado.resto.trim());
      resolver({ codigo, stdout: acumulado.stdout, stderr: (acumulado.stderr + extra).trim(), expiro: acumulado.expiro });
    };
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

// Última línea con contenido, sin códigos de color de terminal.
export function ultimaLinea(texto) {
  return String(texto || '').split('\n')
    .map((l) => l.replace(/\x1b\[[0-9;]*m/g, '').trim())
    .filter(Boolean).pop() || '';
}

export const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
