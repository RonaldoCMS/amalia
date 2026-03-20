# packages/shared

Il package `@amalia/shared` contiene i tipi TypeScript condivisi tra frontend e backend.

## Il problema che risolve

In un'architettura con frontend e backend separati, entrambi parlano la stessa lingua — si scambiano dati JSON via HTTP. Il rischio è che i due lati si desincronizzino: il backend cambia un campo, il frontend non lo sa, e il bug emerge solo a runtime.

Senza shared:

```
frontend                        backend
--------                        -------
interface GenerateRequest {     interface GenerateRequest {
  type: string                    type: string
  level: string         ≠         level: string
  lang: string                    language: string  ← rinominato
}                               }
```

TypeScript non può avvertirti perché i due tipi vivono in posti diversi e non si parlano.

Con shared:

```
@amalia/shared
--------------
GenerateChallengeRequest   ← definito una volta sola

frontend                   backend
--------                   -------
import { GenerateChallenge import { GenerateChallengeR
Request } from              equest } from
'@amalia/shared'            '@amalia/shared'
```

Se cambi un campo nello shared, TypeScript ti segnala immediatamente tutti i posti rotti — sia nel frontend che nel backend.

## Cosa contiene

### Enum

Gli enum sono valori reali a runtime, non solo tipi. Questo significa che puoi usarli nei `switch`, nei decorator di NestJS, nelle validazioni con `class-validator` e come valori nel database con TypeORM.

Abbiamo scelto gli **string enum** invece dei numeric enum perché i valori nel database restano leggibili (`'fill'` invece di `0`), il debug è più semplice e la serializzazione JSON è immediata.

```typescript
export enum ChallengeType {
  Fill = 'fill',
  Quiz = 'quiz',
  Bug = 'bug',
  Write = 'write',
}
```

### Interfacce — naming convention

Seguiamo una convenzione esplicita basata sul flusso dei dati:

| Suffisso | Direzione | Esempio |
|---|---|---|
| `Request` | frontend → backend | `GenerateChallengeRequest` |
| `Response` | backend → frontend | `ChallengeResponse` |
| `Dto` | db/servizio esterno → service | solo dentro NestJS, non qui |

I `Dto` non vivono nello shared perché sono un dettaglio implementativo del backend — il frontend non ha bisogno di sapere come NestJS riceve i dati da Claude o da PostgreSQL.

## Come funziona nel monorepo

`@amalia/shared` è un npm workspace. npm lo collega automaticamente agli altri package del monorepo senza bisogno di pubblicarlo su npm registry.

Nel `package.json` del backend:

```json
"dependencies": {
  "@amalia/shared": "*"
}
```

Il `*` significa: usa la versione locale. Quando fai `npm install` dalla root, npm crea un symlink da `node_modules/@amalia/shared` alla cartella `packages/shared`.

## Cosa NON mettere qui

- Logica di business — solo tipi e interfacce
- Classi NestJS (DTO con decorator, entity TypeORM) — quelle vivono nel backend
- Componenti React — quelli vivono nel frontend
- Costanti o configurazioni — solo se usate da entrambi i lati