# Instrukcja Krok po Kroku: Serwer Poczty Mailu.io

Postępuj zgodnie z tą listą, aby poprawnie skonfigurować pocztę dla `bolann.cloud` oraz kolejnych domen.

## Krok 1: Przygotowanie DNS

Zanim uruchomisz serwer, Twoja domena `bolann.cloud` musi wiedzieć, gdzie wysyłać pocztę. Dodaj te rekordy w swoim panelu DNS (np. Cloudflare):

1. **Rekord A**: `mail.bolann.cloud` -> Adres IP Twojego VPS.
2. **Rekord MX**: `@` (główna domena) -> `10 mail.bolann.cloud`.
3. **Rekord SPF**: `@` -> `v=spf1 mx a ip4:<TWOJ_IP_VPS> ~all` (dzięki temu serwery takie jak Gmail będą wiedzieć, że Twój serwer ma prawo wysyłać pocztę).
4. **Subdomeny dla WebUI**: Skieruj `admin.bolann.cloud` oraz `webmail.bolann.cloud` na IP Twojego VPS (Traefik zajmie się resztą).

---

## Krok 2: Przygotowanie plików na VPS

Pliki, które przygotowałem lokalnie, musisz wgrać na serwer. Najlepiej utwórz dedykowany katalog:

```bash
mkdir -p /home/mail
# Wgraj tam pliki docker-compose.yaml oraz mailu.env z folderu mail-setup
```

**Generowanie Klucza Sekretnego:**
Otwórz plik `mailu.env` i w polu `SECRET_KEY` wpisz losowy ciąg 32 znaków. Możesz go wygenerować komendą:

```bash
cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1
```

---

## Krok 3: Uruchomienie Serwera

Wejdź do katalogu `/home/mail` i uruchom kontenery:

```bash
docker compose up -d
```

Poczekaj chwilę, aż wszystkie usługi (smtp, imap, antispam) wystartują.

---

## Krok 4: Utworzenie pierwszego administratora

Mailu domyślnie nie ma konta admina. Musisz je utworzyć ręcznie przez terminal na VPS:

```bash
docker compose exec admin flask mailu admin admin bolann.cloud <TWOJE_HASLO>
```

*Zastąp `<TWOJE_HASLO>` swoim bezpiecznym hasłem.*

---

## Krok 5: Panel Admina i DKIM (Synchronizacja)

1. Wejdź na `https://admin.bolann.cloud`.
2. Zaloguj się jako `admin@bolann.cloud`.
3. Przejdź do zakładki **Domeny** i kliknij ikonę "szczegóły" (lupa/kartka) przy `bolann.cloud`.
4. Znajdź sekcję **DKIM public key**. System wygenerował dla Ciebie unikalny klucz.
5. **Synchronizacja z DNS**: Musisz dodać ten klucz jako rekord TXT w swoim DNS pod nazwą `dkim._domainkey`. To kluczowy krok, aby Twoje maile nie trafiały do spamu.

---

## Krok 6: Podłączanie Programów Poczty (Outlook, Telefon)

Aby odbierać i wysyłać pocztę, używaj tych ustawień:

- **Serwer IMAP**: `mail.bolann.cloud` (Port 993, SSL/TLS)
- **Serwer SMTP**: `mail.bolann.cloud` (Port 465, SSL/TLS lub 587 STARTTLS)
- **Użytkownik**: Twój pełny adres e-mail (np. `kontakt@bolann.cloud`).

---

## Jak dodać kolejną domenę?

Po prostu zaloguj się do `https://admin.bolann.cloud`, kliknij "Dodaj domenę", a następnie powtórz dla niej **Krok 1 (DNS)** oraz **Krok 5 (DKIM)**.
