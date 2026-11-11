# CLAUDE.md – TPB-App (öffentlich, GitHub Pages)

Ausgelieferte Fassung der TPB-Ensemble-App unter https://leouli23.github.io/TPB-App/ (Login per E-Mail-Code, Supabase). Sicherheitsregeln: `SICHERHEIT.md` – vor jeder Änderung lesen.

## Wichtig: Quelle liegt woanders

`index.html`, `beta/index.html` und `datenschutz/index.html` sind **gebaut**, nicht von Hand zu ändern. Die Quelle liegt im privaten Repository **TPB-Backup**, Ordner `app-werkzeug` (`quelle/app.js`, `quelle/extra.css`, `quelle/prototyp.html`, `quelle/datenschutz.html`). Bauen:

```
python3 app-werkzeug/baue_app.py      # in TPB-Backup; TPB_APP_DIR = Pfad zu diesem Repository
```

Von Hand gepflegt und hier direkt änderbar: `sw.js` (bei jedem Release `VERSION` hochzählen), `manifest.webmanifest`, Icons, `assets/` (Schriften, supabase-js, mit Lizenzdateien).

## Prüfungen (Skripte in TPB-Backup/app-werkzeug/pruefung, laufen bei jedem Pull Request als „Release Prüfung“)

- `beta-test.js` – 66 Prüfungen (Bedienung, Rechte, Aufruf-Zähler Supabase), `offline-test.js` – 14 (Flugmodus), `release-pruefung.js` – 360 und 375 px, alle drei Schriftstufen, kein seitliches Scrollen, Kontrast jeder sichtbaren Schrift mindestens 4,5 : 1, Schriften und Bilder, Datenschutzseite DE/EN.
- Kein Abruf bei fremden Servern außer Supabase und GitHub (wird erzwungen).
- Gitleaks läuft mit; Konfiguration `.gitleaks.toml` (nur der öffentliche Publishable Key ist erlaubt).
- Lokal: `ERWARTET_APP` auf die Versionsangabe der App setzen, `TPB_APP_DIR` auf dieses Repository.

## Regeln

- Release nur nach Leos Go, als Pull Request auf einem Branch `release/<name>`; Leo mergt, Claude mergt nie.
- Keine Geheimwerte, keine Mitglieder-Kontaktdaten, keine internen Dokumente in dieses öffentliche Repository (SICHERHEIT.md).
- Datenbank-Änderungen (Migrationen, Edge Functions, Löschbefehle DELETE/DROP) laufen nicht über dieses Repository; DELETE/DROP führt Leo im SQL Editor aus.
- Gedächtnis-Dokumente (Projektdokumente, „TPB Übergaben“) schreibt nur der App-Chat. Claude Code liefert Pull Request und eine kurze Zusammenfassung; Release-Zeile und F-Status trägt der App-Chat nach.
