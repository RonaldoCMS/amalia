# Amelia — Setup del monorepo

## Cos'è un monorepo e perché lo usiamo

Un **monorepo** è un singolo repository Git che contiene più progetti distinti. Nel nostro caso: il frontend (Next.js) e il backend (NestJS) vivono nella stessa cartella root, sotto `apps/`.

L'alternativa sarebbe avere due repository separati — uno per il frontend, uno per il backend. Ma per un progetto come Amelia, il monorepo ha vantaggi concreti:

- **Tipi condivisi**: il tipo `Challenge` definito in `packages/shared` viene usato sia dal backend che dal frontend, senza duplicare codice o rischiare disallineamenti.
- **Un solo clone**: chi contribuisce al progetto clona una cosa sola e ha tutto.
- **Script coordinati**: con `npm run dev` si avviano backend e frontend insieme, in un solo terminale.
- **Refactoring semplice**: se rinomini un campo in un DTO NestJS, TypeScript ti segnala subito dove si rompe il frontend.

---

## Strumento di gestione: npm workspaces

Abbiamo usato **npm workspaces**, la soluzione nativa di npm per i monorepo (disponibile da npm 7+). Non abbiamo usato Turborepo o Nx perché per ora sono strumenti over-engineered rispetto alla complessità di Amelia. Se il progetto cresce, si aggiungono dopo.

La configurazione è nel `package.json` root:

```json
"workspaces": [
  "apps/*",
  "packages/*"
]
```

Questo dice a npm: *"tutto ciò che sta dentro `apps/` e `packages/` è un workspace — trattalo come un pacchetto indipendente ma collegato"*.

---

## Struttura delle cartelle

```
amelia/
├── apps/
│   ├── backend/      ← NestJS (API REST)
│   └── frontend/     ← Next.js 14 (App Router)
├── packages/
│   └── shared/       ← tipi TypeScript condivisi
├── package.json      ← root: workspaces + script globali
└── node_modules/     ← dipendenze condivise tra workspace
```

### `apps/backend` — NestJS

È il cuore logico di Amelia. Gestisce:
- la generazione delle sfide (chiama Claude API)
- la valutazione delle risposte
- in futuro: autenticazione, salvataggio progressi, statistiche utente

Abbiamo scelto NestJS perché:
- ha un'architettura modulare (moduli, controller, service, DTO) che scala bene
- è TypeScript first, quindi si integra perfettamente con i tipi condivisi
- Fabio lo conosce già in profondità — non c'è curva di apprendimento da pagare

### `apps/frontend` — Next.js 14 con App Router

È l'interfaccia con cui l'utente interagisce. Abbiamo scelto Next.js perché:
- il deploy su Vercel è gratuito e immediato
- l'App Router di Next.js 14 è il modo moderno di strutturare le pagine
- supporta Server Components, utili in futuro per ottimizzare le chiamate al backend

Abbiamo abilitato **Tailwind CSS** perché è lo standard de facto per lo styling in progetti Next.js moderni — utility-first, veloce da usare, nessuna dipendenza esterna pesante.

### `packages/shared` — tipi condivisi

Qui vivrà un file `types.ts` con le interfacce TypeScript usate da entrambe le app. Per esempio:

```typescript
export interface ChallengeDTO {
  type: 'fill' | 'quiz' | 'bug' | 'write';
  level: 'beginner' | 'intermediate' | 'hard';
  language: string;
}

export interface ChallengeResponse {
  title: string;
  description: string;
  code: string;
  options?: string[];
}

export interface EvaluationResult {
  correct: boolean;
  feedback: string;
}
```

Il vantaggio è immediato: se cambi `ChallengeDTO` nel shared, TypeScript ti avvisa ovunque venga usato — sia nel backend che nel frontend.

---

## Script globali

Nel `package.json` root abbiamo definito tre script:

```json
"dev:backend": "npm run start:dev --workspace=apps/backend",
"dev:frontend": "npm run dev --workspace=apps/frontend",
"dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\""
```

- `dev:backend` e `dev:frontend` avviano i singoli progetti in modalità watch.
- `dev` li avvia **entrambi insieme** grazie a `concurrently`, una libreria che esegue più comandi in parallelo nello stesso terminale, con output colorato per distinguerli.

---

## Perché non abbiamo usato React standalone (Vite/CRA)

Un'alternativa comune sarebbe stata React puro con Vite come bundler. Lo scarichiamo per due motivi:

1. **Next.js fa tutto quello che fa Vite, e in più**: routing file-based, SSR, ottimizzazione immagini, deploy su Vercel con zero config.
2. **Il deploy separato non vale il costo**: con React + Vite bisogna hostare gli asset statici su un CDN (es. Netlify), configurare il routing manualmente, e gestire il CORS in modo più esplicito. Next.js su Vercel risolve tutto questo automaticamente.

---

## Prossimi step

Con il monorepo pronto, il percorso è:

1. Creare `packages/shared/types.ts` con le interfacce base
2. Costruire il modulo `challenges` in NestJS (controller → service → integrazione Claude API)
3. Costruire la UI in Next.js che consuma le API
4. Configurare le variabili d'ambiente (`.env`) per la Claude API key
5. Deploy: Vercel per il frontend, Railway per il backend

