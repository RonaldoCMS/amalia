# Docker in Amelia

In Amelia usiamo Docker esclusivamente in locale, durante lo sviluppo.
Non dockerizziamo NestJS né Next.js — quelli girano direttamente con `npm run dev`.
Docker serve solo per i **servizi infrastrutturali** che l'app richiede per funzionare: il database e la cache.

## Cosa gira dentro Docker

```
Docker
├── postgres   ← PostgreSQL 16, dove salviamo utenti e progressi
└── redis      ← Redis 7, per la cache e le code asincrone (BullMQ)
```

## Perché non installarli direttamente su Windows

PostgreSQL e Redis si possono installare come programmi normali su Windows, ma crea problemi:

- la versione installata è globale — se un altro progetto richiede una versione diversa, sono conflitti
- la configurazione è globale — le credenziali, le porte, i database si mescolano tra progetti
- su Windows il setup manuale di Postgres è lungo e fragile
- disinstallare e ripulire tutto è una seccatura

Con Docker invece ogni progetto dichiara nel `docker-compose.yml` esattamente quale versione vuole, con quale configurazione, su quale porta. I container sono isolati e si accendono e spengono in un comando.

## Perché Alpine

Le immagini `postgres:16-alpine` e `redis:7-alpine` usano Alpine Linux come base — una distribuzione Linux minimale da circa 5MB. Pesano circa 10 volte meno delle immagini standard, si scaricano più velocemente e consumano meno risorse sulla tua macchina.

## Perché i volumi

I container Docker sono effimeri — se li fermi e li riavvii, perdono tutto quello che c'era dentro. I **named volumes** (`postgres_data`, `redis_data`) mappano i dati su disco fisso, fuori dal container. Così i dati sopravvivono ai riavvii.

Se vuoi invece ripartire da zero (es. hai rotto lo schema del database):

```bash
docker compose down -v   # elimina anche i volumi
docker compose up -d     # ricrea tutto pulito
```

## Comandi che userai ogni giorno

```bash
# avvia i container in background
docker compose up -d

# verifica che siano su
docker compose ps

# leggi i log di postgres (utile se crasha)
docker compose logs postgres

# ferma i container senza perdere i dati
docker compose down

# accedi al database direttamente
docker exec -it postgres psql -U amelia -d amelia_db
```