#!/usr/bin/env python3
"""medir.py — Anota en metadata.json las métricas reales de un carrusel ya publicado, para que el
histórico aprenda de lo que funcionó. Dos caminos:

  1) Windsor.ai (Instagram Graph API): exporta WINDSOR_API_KEY e IG_ACCOUNT_ID y corre
       python3 scripts/medir.py <carpeta> --permalink https://www.instagram.com/p/XXXX/
     Trae reach, views, saves, shares, likes, comments y calcula save_rate y share_rate.
  2) A mano (desde Insights de la app):
       python3 scripts/medir.py <carpeta> --manual reach=12055 saves=921 shares=262 likes=440 comments=154

Guarda una entrada con fecha en metadata.json → "mediciones" y actualiza historico.json en la carpeta
padre (un renglón por carrusel) para que la skill rote looks y aprenda de hooks ganadores.
"""
from __future__ import annotations
import argparse, datetime as dt, json, os, sys, urllib.parse, urllib.request
from pathlib import Path

CAMPOS = ["media_id", "timestamp", "media_permalink", "media_product_type", "media_reach", "media_views", "media_saved",
          "media_shares", "media_like_count", "media_comments_count", "media_follows", "media_profile_visits"]


def windsor(permalink: str, dias: int) -> dict | None:
    key, cuenta = os.environ.get("WINDSOR_API_KEY"), os.environ.get("IG_ACCOUNT_ID")
    if not key or not cuenta:
        print("Faltan WINDSOR_API_KEY o IG_ACCOUNT_ID en el entorno.", file=sys.stderr)
        return None
    hoy = dt.date.today()
    q = {"api_key": key, "fields": ",".join(CAMPOS), "select_accounts": cuenta,
         "date_from": (hoy - dt.timedelta(days=dias)).isoformat(), "date_to": hoy.isoformat()}
    url = "https://connectors.windsor.ai/instagram?" + urllib.parse.urlencode(q)
    with urllib.request.urlopen(url, timeout=240) as r:
        body = json.load(r)
    filas = body.get("data", body) if isinstance(body, dict) else body
    code = permalink.rstrip("/").split("/")[-1]
    for f in filas:
        if code and code in str(f.get("media_permalink", "")):
            return {"reach": f.get("media_reach"), "views": f.get("media_views"), "saves": f.get("media_saved"),
                    "shares": f.get("media_shares"), "likes": f.get("media_like_count"), "comments": f.get("media_comments_count"),
                    "follows": f.get("media_follows"), "profile_visits": f.get("media_profile_visits"), "fuente": "windsor"}
    print("No encontré ese permalink en la ventana consultada (sube --dias).", file=sys.stderr)
    return None


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("carpeta")
    ap.add_argument("--permalink")
    ap.add_argument("--manual", nargs="*", help="reach=.. saves=.. shares=.. likes=.. comments=.. follows=..")
    ap.add_argument("--dias", type=int, default=60)
    a = ap.parse_args()
    carpeta = Path(a.carpeta).resolve()
    meta_path = carpeta / "metadata.json"
    meta = json.loads(meta_path.read_text()) if meta_path.exists() else {}
    if a.manual:
        m = {"fuente": "manual"}
        for par in a.manual:
            k, _, v = par.partition("=")
            m[k] = int(v) if v.isdigit() else v
    elif a.permalink:
        m = windsor(a.permalink, a.dias)
        if not m:
            return 2
        meta["permalink"] = a.permalink
    else:
        print("Dame --permalink o --manual", file=sys.stderr)
        return 2
    reach = m.get("reach") or 0
    if reach:
        m["save_rate"] = round(100 * (m.get("saves") or 0) / reach, 2)
        m["share_rate"] = round(100 * (m.get("shares") or 0) / reach, 2)
        m["like_rate"] = round(100 * (m.get("likes") or 0) / reach, 2)
    m["medido_en"] = dt.datetime.now().isoformat(timespec="minutes")
    nuevo = dict(meta)
    nuevo["mediciones"] = list(meta.get("mediciones", [])) + [m]
    meta_path.write_text(json.dumps(nuevo, ensure_ascii=False, indent=2), encoding="utf8")
    # histórico en la carpeta padre
    hist_path = carpeta.parent / "historico.json"
    hist = json.loads(hist_path.read_text()) if hist_path.exists() else []
    fila = {"slug": nuevo.get("slug", carpeta.name), "fecha": nuevo.get("fecha"), "look": nuevo.get("look"), "tipo": nuevo.get("tipo"),
            "hook": nuevo.get("hook"), "palabra_clave": nuevo.get("palabra_clave"), **{k: m.get(k) for k in ("reach", "saves", "shares", "comments", "follows", "save_rate", "share_rate")}, "medido_en": m["medido_en"]}
    hist = [h for h in hist if h.get("slug") != fila["slug"]] + [fila]
    hist_path.write_text(json.dumps(hist, ensure_ascii=False, indent=2), encoding="utf8")
    print(f"metadata.json actualizado · histórico: {hist_path} ({len(hist)} carruseles)")
    print(json.dumps(m, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
