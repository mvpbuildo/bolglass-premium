# Instrukcja Wdrożenia Bolglass (Docker + Traefik)

Twoja infrastruktura na Hostingerze jest już przygotowana do obsługi kontenerów z Traefik. Poniżej kroki specyficzne dla projektu Bolglass.

## 1. Mapowanie Domen (DNS)

W panelu Hostinger lub u dostawcy domeny Skonfiguruj rekordy **A**:

- `test.bolann.cloud` -> IP Twojego VPS
- (Później) `bolglass.pl` -> IP Twojego VPS

## 2. Przygotowanie na serwerze

1. Połącz się przez SSH.
2. Sklonuj repozytorium:

   ```bash
   git clone <url-repozytorium-bolglass> bolglass
   cd bolglass
   ```

## 3. Konfiguracja Środowiska

Stwórz plik `.env` w głównym folderze (jeśli aplikacja wymaga zmiennych build-time, najlepiej dodać je do Dockerfile lub przekazać przez `args` w compose, ale dla runtime wystarczy tutaj):

```bash
touch .env
# Dodaj niezbędne klucze, np. API_KEY=xyz
```

## 4. Uruchomienie kontenera

Użyj komendy:

```bash
docker compose up -d --build
```

Traefik automatycznie wykryje nowy kontener dzięki labelkom w `docker-compose.yaml` i wystawi certyfikat SSL dla `test.bolann.cloud` przy użyciu Twojego resolvera `le` (DNS Challenge przez Hostinger).

## 6. Ważne: Sprawdzenie Sieci

Aby Bolglass "widział się" z Traefikiem, muszą być w tej samej sieci Dockerowej. Na nowym serwerze sprawdź nazwę istniejącej sieci:

```bash
docker network ls
```

Jeśli na liście widzisz inną nazwę niż `root_default` (np. `traefik_proxy` lub `bridge`), zaktualizuj ostatnie linie w pliku `docker-compose.yaml`:

```yaml
networks:
  traefik-net:
    external: true
    name: TWOJA_NAZWA_SIECI  # Tutaj wpisz nazwę z docker network ls
```

---

*Wszystko gotowe! Twój serwer jest teraz w pełni przygotowany na przyjęcie projektu Bolglass.*

## 5. Aktualizacja (Update)

Gdy wypchniesz zmiany do Git:

```bash
git pull
docker compose up -d --build
```

## Dlaczego takie podejście?

1. **Konteneryzacja**: Izolacja zależności (Node.js 20, biblioteki systemowe) od systemu operacyjnego VPS.
2. **Traefik**: Masz go już uruchomionego. Pozwala na bezobsługowy SSL i łatwe przełączanie domen w przyszłości.
3. **Subdomeny**: Możesz uruchomić wiele wersji projektu (np. `dev.bolann.cloud`, `staging...`) na jednym serwerze, zmieniając tylko labelki w osobnych folderach/plikach compose.
4. **Skalowalność**: Przejście na `bolglass.pl` sprowadzi się do zmiany jednej linijki w `docker-compose.yaml`.
