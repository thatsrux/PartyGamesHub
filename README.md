# 🎉 PartyGamesHub

[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/firebase-ffca28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)

**PartyGamesHub** è un'innovativa piattaforma web pensata per giocare con i tuoi amici nel salotto di casa. 
Una Smart TV (o un computer) fa da tabellone principale (Host), mentre ogni giocatore utilizza il proprio smartphone come controller personale per interagire, votare, puntare crediti e disegnare!

L'esperienza visiva è curata nei minimi dettagli con animazioni fluide tramite **Framer Motion** e un'interfaccia utente scura e moderna.

---

## 🎮 Come Funziona

1. **Host:** Qualcuno apre il sito sulla TV o sul computer, creando una nuova Lobby.
2. **Client:** Gli amici scansionano il codice QR generato o inseriscono il codice della stanza sui loro telefoni.
3. **Admin:** Chi ha creato la stanza seleziona il gioco dal *Catalogo* e imposta le regole.
4. **Si gioca:** La TV mostra l'avanzamento, le domande e i risultati. I telefoni si trasformano dinamicamente in controller base (pulsanti, input testuali, slider, canvas di disegno).

---

## 🕹️ Minigiochi Inclusi

La piattaforma ospita attualmente un variegato ecosistema di giochi interattivi:

### ⚽ Calcio
- **La Carriera:** La TV svela gradualmente i loghi dei club in cui ha giocato un calciatore. Usa il telefono per indovinare il nome prima degli altri!
- **Vero o Fake:** Vengono mostrate carte con statistiche assurde (es. *Cristiano Ronaldo ha iniziato la sua carriera giocando come portiere*). Hai pochi secondi per decidere se è vero o falso.
- **Impostore:** Deduzione sociale in stile *Spyfall*. Tutti ricevono una parola segreta calcistica sul telefono, tranne l'Impostore. Discutete e scovatelo!
### 🎲 Extra
- **Nomi Cose Città:** Il classico gioco riadattato per la TV. Una lettera estratta, varie categorie, chi scrive le parole più originali e valide vince!
- **Il Falsario:** Completa una curiosità inventando una bugia credibile per ingannare i tuoi amici (stile *Fibbage*). Più persone votano la tua bugia, più punti fai!
- **Disegnatore Bendato:** Un giocatore deve disegnare una parola sul touch del proprio telefono. La TV riceve e disegna in tempo reale per far indovinare gli altri (stile *Skribbl.io*).

---

## 🛠️ Tecnologie Utilizzate

- **Frontend:** React + TypeScript + Vite.
- **Styling & Animazioni:** CSS Vanilla modulare e [Framer Motion](https://www.framer.com/motion/) per micro-interazioni di livello *premium*. Nessun framework CSS ingombrante.
- **Backend / Database:** Firebase (Firestore & Realtime Database) strutturato e super ottimizzato per evitare latenza e sovraccarichi (incluso un sistema di batching per i dati del canvas).
- **Routing:** React Router DOM.
- **Iconografia:** Lucide React.

---

## 🚀 Deployment & Sviluppo

Il progetto è automaticamente collegato a **Vercel** tramite GitHub.

### Setup Locale
Se vuoi contribuire o testare in locale:
1. Clona la repository:
   ```bash
   git clone https://github.com/thatsrux/PartyGamesHub.git
   ```
2. Installa le dipendenze:
   ```bash
   npm install
   ```
3. Aggiungi il tuo file `.env` alla root del progetto con le credenziali Firebase:
   ```env
   VITE_FIREBASE_API_KEY="..."
   VITE_FIREBASE_AUTH_DOMAIN="..."
   VITE_FIREBASE_DATABASE_URL="..."
   VITE_FIREBASE_PROJECT_ID="..."
   VITE_FIREBASE_STORAGE_BUCKET="..."
   VITE_FIREBASE_MESSAGING_SENDER_ID="..."
   VITE_FIREBASE_APP_ID="..."
   ```
4. Avvia il server di sviluppo:
   ```bash
   npm run dev
   ```

### Branching Strategy
- **`prod`**: Il branch di produzione collegato a Vercel. Il codice qui deve essere sempre stabile e testato.
- **`test`**: Il branch di sviluppo e staging per testare le nuove funzionalità in ambiente sicuro.
