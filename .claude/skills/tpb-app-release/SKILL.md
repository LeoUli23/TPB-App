---
name: "tpb-app-release"
description: "Ablauf für ein Release der TPB-Ensemble-App (TPB-App, Bühnenplaner, Schlagwerk-Disposition): nach Leos Go bauen, prüfen, als Pull Request ausliefern, Log aktualisieren."
---

# TPB-App-Release

Gilt für die Repositorys LeoUli23/TPB-App, TPB-B-hnenplan, TPB-Schlagwerk-Disposition und die Quellen in LeoUli23/TPB-Backup (app-werkzeug, schema, supabase/functions). Sprache intern Deutsch.

## 0. Voraussetzung

- Gebaut wird nur nach Leos ausdrücklichem Go („Go Release“, „Go F-0xx“). Ohne Go: Plan mit Umfang, betroffenen Dateien und Risiken vorlegen und stoppen.
- Vorher lesen: CLAUDE.md des jeweiligen Repositorys, claude/TPB-App-Feedback.md (offene F-Punkte, letzter Release, Version in sw.js) und die Zeilen an den App-Chat in „TPB Übergaben“.
- Geheimwerte, Datenbank-Passwort und Dienstschlüssel nie in Code, Commit oder Chat.

## 1. Bauen

1. Neuen Branch anlegen: `release/<version>` (z. B. `release/v12`).
2. Änderungen in der Quelle (TPB-Backup/app-werkzeug/quelle), danach `python3 app-werkzeug/baue_app.py` – nie die gebaute index.html von Hand ändern.
3. `VERSION` in sw.js hochzählen (Cache-Name `tpb-ensemble-vNN`), Versionsangabe im Infos-Screen anpassen.
4. Datenbank-Änderungen als neue Migration in `schema/` (fortlaufende Nummer). Enthält sie DELETE oder DROP: nicht selbst ausführen, sondern das SQL für Leo bereitstellen (Supabase SQL Editor).
5. Neue Bibliotheken oder Schriften nur in den eigenen Ordnern (TPB-App/assets, TPB-B-hnenplan/bibliothek), mit Lizenzdatei. Kein Abruf bei fremden Servern außer Supabase und GitHub.

## 2. Prüfen (alle Pflicht, sonst kein Release)

- App-Prüfung: Bedienung und Rechte (derzeit 61 Prüfungen, festes Prüfdatum 30.10.2026), mindestens zwei Läufe fehlerfrei.
- Flugmodus: `pruefung/offline-test.js` (derzeit 14 Prüfungen).
- Bühnenplaner, falls betroffen: 23 Prüfungen.
- Breiten 360 und 375 px in allen Schriftstufen (Normal, Größer, Groß) ohne seitliches Scrollen.
- Kontrast jeder sichtbaren Schrift mindestens 4,5:1 (bisher kleinster Wert 5,12:1); Mindestschrift 12 px.
- Kein Abruf bei fremden Servern (gilt als Fehler).
- Bei Datenbank-Änderungen zusätzlich: schema/test_rechte.sql, test_buehnenplaene.sql, test_leseaufforderungen.sql, test_loeschregel.sql.
- Bei Edge Functions: Probe, dass Anfragen ohne und mit gefälschter Anmeldung abgewiesen werden (401).

Schlägt eine Prüfung fehl: Ursache beheben und alles neu prüfen. Nicht reproduzierbare Ausreißer im Bericht nennen.

## 3. Ausliefern

1. Commit(s) im Branch, Pull Request nach main. Titel: „Version NN: F-0xx, F-0yy“. Beschreibung: was sich für die Musiker ändert (in einfachen Worten), Prüfergebnisse mit Zahlen, Migrationen, ggf. SQL für Leo, „Fixes #…“ für die zugehörigen Issues.
2. Nicht selbst mergen. Leo prüft und mergt; erst danach ist es live.
3. Gehört zum Release eine Änderung in TPB-Backup oder im Bühnenplaner: dort ebenfalls ein Pull Request, im Text auf die anderen verweisen.

## 4. Nachbereiten (nach Leos Merge)

- Status der F-Punkte auf „erledigt in Version NN“ (Issue schließen bzw. Log), Release-Zeile im Projektdokument mit Commit-Kennung und Prüfergebnissen; ältere Releases ins Archiv TPB-Backup/archiv/TPB-App-Log.md.
- Dokument direkt vor dem Schreiben neu lesen (Regel 2), nur eigene Dokumente schreiben.
- Was andere Chats betrifft (z. B. neue Fakten, Website), als Zeile in „TPB Übergaben“.
- Leo kurz berichten: was neu ist, was die Musiker tun müssen (z. B. einmal neu öffnen), was offen bleibt.

## Automatisierbar

Prüfungen laufen per Skript und per GitHub Actions bei jedem Pull Request („Release Prüfung“, Gitleaks); Merge und Datenbank-Löschbefehle bleiben bei Leo.