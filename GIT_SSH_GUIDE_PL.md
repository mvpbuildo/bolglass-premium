# Instrukcja Git & SSH: Wdrożenie na Hostinger VPS

Aby sprawnie przesyłać aktualizacje Bolglass na serwer, najbezpieczniejszą i najszybszą metodą jest połączenie **Git + SSH**.

## 1. Konfiguracja Lokalnego Repozytorium

Twoje pliki są obecnie "nieśledzone" (untracked) lub widoczne jako usunięte. Musimy to uporządkować:

1. **Zatwierdź zmiany lokalnie**:

   ```bash
   git add .
   git commit -m "Initial commit for Bolglass monorepo"
   ```

2. **Stwórz repozytorium na GitHub/GitLab** (np. prywatne `bolglass`).
3. **Podepnij zdalne repozytorium**:

   ```bash
   git remote add origin <URL-TWOJEGO-REPO>
   git branch -M main
   git push -u origin main
   ```

## 2. Konfiguracja SSH (Klucze)

Zamiast wpisywać hasło za każdym razem, użyj kluczy SSH.

1. **Wygeneruj klucz na swoim komputerze** (jeśli nie masz):

   ```bash
   ssh-keygen -t ed25519 -C "twoj@email.com"
   ```

2. **Dodaj klucz do Hostinger VPS**:
   Sklonuj swój klucz publiczny (`~/.ssh/id_ed25519.pub`) do pliku `~/.ssh/authorized_keys` na serwerze.
3. **Dodaj klucz do GitHub**:
   Skopiuj ten sam klucz publiczny do ustawień SSH na GitHubie, aby serwer mógł pobierać kod bez hasła.

## 3. Pierwsze wdrożenie na serwerze

Zaloguj się na VPS przez SSH i wykonaj:

```bash
# Przejdź do folderu z projektami
cd /home/twoja_nazwa_uzytkownika/

# Sklonuj projekt
git clone git@github.com:TWOJ_USER/bolglass.git
cd bolglass

# Uruchom wszystko (zgodnie z DEPLOYMENT_GUIDE_PL.md)
docker compose up -d --build
```

## 4. Przepis na szybką aktualizację

Kiedy zmienisz coś w kodzie lokalnie:

1. **Na komputerze**:

   ```bash
   git add .
   git commit -m "Opis zmian"
   git push
   ```

2. **Na serwerze** (możesz to zrobić jednym ciągiem):

   ```bash
   ssh root@twoje_ip "cd bolglass && git pull && docker compose up -d --build"
   ```

---
> [!TIP]
> Możesz stworzyć prosty plik `deploy.sh` w głównym folderze projektu, który będzie wykonywał te kroki za Ciebie automatycznie jednym kliknięciem.
