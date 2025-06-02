# Holiday Home Guardian

Applicazione web per la gestione delle manutenzioni delle case vacanza.

## Tecnologie Utilizzate

- React + TypeScript
- Vite
- Tailwind CSS
- Shadcn/ui
- Supabase (Database e Autenticazione)
- Vercel (Deploy)

## Funzionalità

- Gestione task di manutenzione
- Assegnazione operatori
- Caricamento immagini
- Filtri per casa e priorità
- Dashboard con statistiche
- Gestione task completate

## Setup Locale

1. Clona il repository
```bash
git clone https://github.com/Channel-Debug/holiday-home-guardian.git
cd holiday-home-guardian
```

2. Installa le dipendenze
```bash
npm install
```

3. Crea un file `.env` con le variabili d'ambiente
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Avvia il server di sviluppo
```bash
npm run dev
```

## Deploy

Il progetto è configurato per il deploy automatico su Vercel. Ogni push sul branch `main` triggera un nuovo deploy.

## Struttura del Database

### Tabelle Principali
- `task`: Gestione delle task di manutenzione
- `casa`: Informazioni sulle case
- `task_images`: Immagini associate alle task
- `task_logs`: Log delle azioni sulle task
- `profiles`: Profili degli utenti

## Contribuire

1. Fork del repository
2. Crea un branch per la tua feature (`git checkout -b feature/AmazingFeature`)
3. Commit delle modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request
