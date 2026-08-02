import json
import os

items = [
    {
        "question": "Ordina questi famosi romanzi per anno di pubblicazione (dal più antico al più recente)",
        "items": ["La Divina Commedia", "Don Chisciotte", "I Promessi Sposi", "Il Signore degli Anelli"]
    },
    {
        "question": "Ordina questi celebri romanzi dal più antico al più recente",
        "items": ["Frankenstein", "Dracula", "1984", "Harry Potter e la pietra filosofale"]
    },
    {
        "question": "Ordina questi grandi scrittori italiani per data di nascita",
        "items": ["Dante Alighieri", "Giovanni Boccaccio", "Alessandro Manzoni", "Luigi Pirandello"]
    },
    {
        "question": "Ordina questi famosi autori stranieri per data di nascita",
        "items": ["William Shakespeare", "Victor Hugo", "Ernest Hemingway", "Stephen King"]
    },
    {
        "question": "Ordina queste celebri opere d'arte per anno di realizzazione",
        "items": ["La Primavera (Botticelli)", "La Gioconda (Leonardo da Vinci)", "Notte stellata (Van Gogh)", "Guernica (Picasso)"]
    },
    {
        "question": "Ordina questi celebri pittori per data di nascita",
        "items": ["Giotto", "Leonardo da Vinci", "Vincent van Gogh", "Pablo Picasso"]
    },
    {
        "question": "Ordina questi maestri del Rinascimento italiano per data di nascita",
        "items": ["Donatello", "Sandro Botticelli", "Leonardo da Vinci", "Michelangelo Buonarroti"]
    },
    {
        "question": "Ordina queste correnti artistiche in ordine cronologico",
        "items": ["Gotico", "Rinascimento", "Impressionismo", "Cubismo"]
    },
    {
        "question": "Ordina queste opere di William Shakespeare per data di composizione stimata",
        "items": ["Romeo e Giulietta", "Amleto", "Macbeth", "La Tempesta"]
    },
    {
        "question": "Ordina questi grandi scultori per data di nascita",
        "items": ["Fidia", "Michelangelo Buonarroti", "Gian Lorenzo Bernini", "Antonio Canova"]
    },
    {
        "question": "Ordina questi famosi dipinti per anno di realizzazione",
        "items": ["Nascita di Venere", "Ronda di notte", "Notte stellata", "L'urlo"]
    },
    {
        "question": "Ordina i primi 4 libri di Harry Potter per ordine di pubblicazione",
        "items": ["La Pietra Filosofale", "La Camera dei Segreti", "Il Prigioniero di Azkaban", "Il Calice di Fuoco"]
    },
    {
        "question": "Ordina questi movimenti letterari e culturali in ordine cronologico",
        "items": ["Dolce Stil Novo", "Umanesimo", "Illuminismo", "Verismo"]
    },
    {
        "question": "Ordina queste opere di Dante Alighieri per anno stimato di composizione",
        "items": ["Vita Nuova", "Convivio", "De Vulgari Eloquentia", "La Divina Commedia"]
    },
    {
        "question": "Ordina questi celebri romanzi di Stephen King per anno di pubblicazione",
        "items": ["Carrie", "Shining", "It", "Il miglio verde"]
    },
    {
        "question": "Ordina questi grandi autori della letteratura russa per data di nascita",
        "items": ["Aleksandr Puškin", "Fëdor Dostoevskij", "Lev Tolstoj", "Anton Čechov"]
    },
    {
        "question": "Ordina queste opere di Leonardo da Vinci per anno di realizzazione",
        "items": ["Battesimo di Cristo", "Vergine delle Rocce", "Ultima Cena", "La Gioconda"]
    },
    {
        "question": "Ordina questi celebri scrittori della Grecia antica per data di nascita",
        "items": ["Omero", "Eschilo", "Sofocle", "Euripide"]
    },
    {
        "question": "Ordina questi poeti romantici inglesi per l'età raggiunta al momento della morte (dal più giovane)",
        "items": ["John Keats", "Percy Bysshe Shelley", "Lord Byron", "William Wordsworth"]
    },
    {
        "question": "Ordina questi celebri musei per anno di fondazione",
        "items": ["Musei Capitolini", "Gallerie degli Uffizi", "British Museum", "Museo del Louvre"]
    },
    {
        "question": "Ordina questi importanti musei internazionali per anno di fondazione",
        "items": ["Museo del Prado", "Metropolitan Museum of Art", "MoMA di New York", "Guggenheim di Bilbao"]
    },
    {
        "question": "Ordina questi autori italiani per anno di vittoria del Premio Nobel",
        "items": ["Giosuè Carducci", "Grazia Deledda", "Luigi Pirandello", "Eugenio Montale"]
    },
    {
        "question": "Ordina questi celebri autori internazionali per anno di vittoria del Premio Nobel",
        "items": ["Rudyard Kipling", "Thomas Mann", "Ernest Hemingway", "Gabriel García Márquez"]
    },
    {
        "question": "Ordina questi famosi romanzi di Agatha Christie per anno di pubblicazione",
        "items": ["Assassinio sull'Orient Express", "Dieci piccoli indiani", "Nella mia fine è il mio principio", "Sipario"]
    },
    {
        "question": "Ordina i libri della saga della Terra di Mezzo di J.R.R. Tolkien per pubblicazione",
        "items": ["Lo Hobbit", "La Compagnia dell'Anello", "Le Due Torri", "Il Ritorno del Re"]
    },
    {
        "question": "Ordina questi capolavori di Vincent van Gogh per anno di realizzazione",
        "items": ["I mangiatori di patate", "I Girasoli", "Notte stellata", "Campo di grano con volo di corvi"]
    },
    {
        "question": "Ordina queste opere di Michelangelo Buonarroti per anno di realizzazione",
        "items": ["Pietà vaticana", "David", "Volta della Cappella Sistina", "Giudizio Universale"]
    },
    {
        "question": "Ordina queste celebri sculture/statue dalla più bassa alla più alta",
        "items": ["David di Donatello", "Venere di Milo", "David di Michelangelo", "Statua della Libertà"]
    },
    {
        "question": "Ordina queste famose architetture e monumenti italiani per altezza (dal più basso al più alto)",
        "items": ["Torre di Pisa", "Campanile di Giotto", "Torre del Mangia", "Mole Antonelliana"]
    },
    {
        "question": "Ordina queste iconiche chiese/cattedrali per anno di inizio dei lavori",
        "items": ["Notre-Dame de Paris", "Duomo di Milano", "Basilica di San Pietro", "Sagrada Familia"]
    },
    {
        "question": "Ordina questi grandi maestri della pittura spagnola per data di nascita",
        "items": ["El Greco", "Diego Velázquez", "Francisco Goya", "Salvador Dalí"]
    },
    {
        "question": "Ordina questi celebri pittori francesi dell'Ottocento per data di nascita",
        "items": ["Eugène Delacroix", "Édouard Manet", "Claude Monet", "Paul Gauguin"]
    },
    {
        "question": "Ordina questi romanzi di Jane Austen per anno di pubblicazione",
        "items": ["Ragione e sentimento", "Orgoglio e pregiudizio", "Mansfield Park", "Emma"]
    },
    {
        "question": "Ordina questi romanzi e saggi di George Orwell per anno di pubblicazione",
        "items": ["Senza un soldo a Parigi e Londra", "Omaggio alla Catalogna", "La fattoria degli animali", "1984"]
    },
    {
        "question": "Ordina i primi quattro libri della Bibbia secondo l'ordine tradizionale",
        "items": ["Genesi", "Esodo", "Levitico", "Numeri"]
    },
    {
        "question": "Ordina questi grandi autori della letteratura latina per data di nascita",
        "items": ["Plauto", "Cicerone", "Virgilio", "Seneca"]
    },
    {
        "question": "Ordina questi romanzi di Dan Brown aventi come protagonista Robert Langdon",
        "items": ["Angeli e demoni", "Il codice da Vinci", "Il simbolo perduto", "Inferno"]
    },
    {
        "question": "Ordina questi romanzi di Giovanni Verga per anno di pubblicazione",
        "items": ["Storia di una capinera", "Eva", "I Malavoglia", "Mastro-don Gesualdo"]
    },
    {
        "question": "Ordina questi romanzi di Italo Calvino per anno di pubblicazione",
        "items": ["Il sentiero dei nidi di ragno", "Il visconte dimezzato", "Il barone rampante", "Il cavaliere inesistente"]
    },
    {
        "question": "Ordina questi noti romanzi di Umberto Eco per anno di pubblicazione",
        "items": ["Il nome della rosa", "Il pendolo di Foucault", "L'isola del giorno prima", "Baudolino"]
    },
    {
        "question": "Ordina questi romanzi di Gabriel García Márquez per anno di pubblicazione",
        "items": ["Nessuno scrive al colonnello", "Cent'anni di solitudine", "Cronaca di una morte annunciata", "L'amore ai tempi del colera"]
    },
    {
        "question": "Ordina questi capolavori di Caravaggio per anno stimato di realizzazione",
        "items": ["Bacco", "Vocazione di San Matteo", "Amor vincit omnia", "Decollazione di San Giovanni Battista"]
    },
    {
        "question": "Ordina questi celebri pittori legati all'Impressionismo per data di nascita",
        "items": ["Camille Pissarro", "Edgar Degas", "Claude Monet", "Pierre-Auguste Renoir"]
    },
    {
        "question": "Ordina questi maestri della pittura del Secolo d'oro olandese per data di nascita",
        "items": ["Frans Hals", "Rembrandt", "Jan Steen", "Johannes Vermeer"]
    },
    {
        "question": "Ordina questi famosi architetti per data di nascita",
        "items": ["Filippo Brunelleschi", "Andrea Palladio", "Gian Lorenzo Bernini", "Antoni Gaudí"]
    },
    {
        "question": "Ordina questi grandi maestri dell'architettura moderna per data di nascita",
        "items": ["Frank Lloyd Wright", "Walter Gropius", "Ludwig Mies van der Rohe", "Le Corbusier"]
    },
    {
        "question": "Ordina questi romanzi vincitori del Premio Pulitzer per la narrativa per anno di vittoria",
        "items": ["Il buio oltre la siepe", "Il colore viola", "Amatissima", "La strada"]
    },
    {
        "question": "Ordina questi celebri dipinti in base alle loro dimensioni (dall'area più grande a quella più piccola)",
        "items": ["Guernica (Picasso)", "La Ronda di Notte (Rembrandt)", "Nascita di Venere (Botticelli)", "La Gioconda (Leonardo)"]
    },
    {
        "question": "Ordina questi famosi romanzi per numero stimato di parole (dal più lungo al più corto)",
        "items": ["Alla ricerca del tempo perduto", "Guerra e Pace", "Il Signore degli Anelli", "Il grande Gatsby"]
    },
    {
        "question": "Ordina queste celebri opere di Victor Hugo per anno di pubblicazione",
        "items": ["L'ultimo giorno di un condannato a morte", "Notre-Dame de Paris", "I Miserabili", "L'uomo che ride"]
    },
    {
        "question": "Ordina questi romanzi di Charles Dickens per anno di pubblicazione",
        "items": ["Oliver Twist", "Canto di Natale", "David Copperfield", "Grandi speranze"]
    },
    {
        "question": "Ordina i primi quattro libri pubblicati de 'Le Cronache di Narnia' di C.S. Lewis",
        "items": ["Il leone, la strega e l'armadio", "Il principe Caspian", "Il viaggio del veliero", "La sedia d'argento"]
    },
    {
        "question": "Ordina queste autrici della letteratura inglese per data di nascita",
        "items": ["Mary Shelley", "Charlotte Brontë", "George Eliot", "Virginia Woolf"]
    },
    {
        "question": "Ordina questi classici della letteratura per ragazzi per anno di prima pubblicazione",
        "items": ["Le avventure di Alice nel Paese delle Meraviglie", "Le avventure di Pinocchio", "Il meraviglioso mago di Oz", "Peter Pan nei Giardini di Kensington"]
    },
    {
        "question": "Ordina questi grandi romanzi di Fëdor Dostoevskij per anno di pubblicazione",
        "items": ["Memorie dal sottosuolo", "Delitto e castigo", "L'idiota", "I fratelli Karamazov"]
    },
    {
        "question": "Ordina questi celebri componimenti di Giacomo Leopardi per anno di stesura",
        "items": ["L'infinito", "A Silvia", "Il sabato del villaggio", "La ginestra"]
    },
    {
        "question": "Ordina questi grandi scrittori e poeti americani dell'Ottocento per data di nascita",
        "items": ["Edgar Allan Poe", "Walt Whitman", "Herman Melville", "Mark Twain"]
    },
    {
        "question": "Ordina cronologicamente queste fasi artistiche nella carriera di Pablo Picasso",
        "items": ["Periodo blu", "Periodo rosa", "Cubismo analitico", "Cubismo sintetico"]
    },
    {
        "question": "Ordina questi celebri pittori italiani del Novecento per data di nascita",
        "items": ["Amedeo Modigliani", "Giorgio de Chirico", "Giorgio Morandi", "Lucio Fontana"]
    },
    {
        "question": "Ordina queste opere teatrali di Luigi Pirandello per anno di prima rappresentazione",
        "items": ["Pensaci, Giacomino!", "Così è (se vi pare)", "Sei personaggi in cerca d'autore", "Enrico IV"]
    },
    {
        "question": "Ordina questi protagonisti del Boom letterario latinoamericano per data di nascita",
        "items": ["Julio Cortázar", "Gabriel García Márquez", "Carlos Fuentes", "Mario Vargas Llosa"]
    },
    {
        "question": "Ordina questi grandi scrittori della letteratura giapponese per data di nascita",
        "items": ["Natsume Sōseki", "Jun'ichirō Tanizaki", "Yasunari Kawabata", "Haruki Murakami"]
    },
    {
        "question": "Ordina questi famosi romanzi di Haruki Murakami per anno di pubblicazione originale",
        "items": ["Nel segno della pecora", "Norwegian Wood", "Kafka sulla spiaggia", "1Q84"]
    },
    {
        "question": "Ordina queste epoche della letteratura latina in ordine cronologico",
        "items": ["Età arcaica", "Età repubblicana", "Età augustea", "Età imperiale"]
    },
    {
        "question": "Ordina questi pietre miliari della letteratura di fantascienza per anno di pubblicazione",
        "items": ["La macchina del tempo", "Il mondo nuovo", "Io, robot", "Dune"]
    },
    {
        "question": "Ordina i romanzi originali del Ciclo della Fondazione di Isaac Asimov per pubblicazione",
        "items": ["Cronache della galassia", "Il crollo della galassia centrale", "L'altra faccia della spirale", "L'orlo della Fondazione"]
    },
    {
        "question": "Ordina i manifesti di questi movimenti d'avanguardia del Novecento dal primo all'ultimo pubblicato",
        "items": ["Futurismo", "Dadaismo", "Surrealismo", "Spazialismo"]
    },
    {
        "question": "Ordina questi celebri musei di Parigi per anno di apertura al pubblico",
        "items": ["Museo del Louvre", "Musée de l'Orangerie", "Centre Pompidou", "Musée d'Orsay"]
    },
    {
        "question": "Ordina questi colori dello spettro visibile (arcobaleno) in base alla lunghezza d'onda (dalla più lunga alla più corta)",
        "items": ["Rosso", "Arancione", "Verde", "Violetto"]
    },
    {
        "question": "Ordina questi minerali/materiali per durezza (dal più tenero al più duro)",
        "items": ["Talco", "Gesso", "Marmo", "Diamante"]
    },
    {
        "question": "Ordina queste sezioni degli affreschi della Cappella Sistina partendo dal basso verso l'alto",
        "items": ["Finti arazzi (fascia inferiore)", "Storie di Mosè e Cristo (fascia mediana)", "Figure dei Papi (tra le finestre)", "Volta (soffitto)"]
    },
    {
        "question": "Ordina questi celebri personaggi incontrati da Dante nell'Inferno in ordine di apparizione",
        "items": ["Paolo e Francesca", "Farinata degli Uberti", "Ulisse", "Conte Ugolino"]
    },
    {
        "question": "Ordina questi romanzi pubblicati da Stephen King con lo pseudonimo di Richard Bachman",
        "items": ["Ossessione", "La lunga marcia", "L'uomo in fuga", "L'occhio del male"]
    },
    {
        "question": "Ordina queste importanti scrittrici e poetesse italiane del Novecento per data di nascita",
        "items": ["Grazia Deledda", "Sibilla Aleramo", "Natalia Ginzburg", "Alda Merini"]
    },
    {
        "question": "Ordina questi romanzi vincitori del Premio Strega per anno di vittoria",
        "items": ["Tempo di uccidere (Flaiano)", "Il Gattopardo (Tomasi di Lampedusa)", "Il nome della rosa (Eco)", "Le otto montagne (Cognetti)"]
    },
    {
        "question": "Ordina questi grandi maestri della letteratura gialla, thriller e horror per data di nascita",
        "items": ["Arthur Conan Doyle", "Agatha Christie", "Georges Simenon", "Stephen King"]
    },
    {
        "question": "Ordina questi romanzi di Arthur Conan Doyle con protagonista Sherlock Holmes per pubblicazione",
        "items": ["Uno studio in rosso", "Il segno dei quattro", "Il mastino dei Baskerville", "La valle della paura"]
    },
    {
        "question": "Ordina queste celebri opere d'arte per numero di figure umane visibili (dal minore al maggiore)",
        "items": ["La Gioconda", "I bari di Caravaggio", "L'Ultima Cena", "Scuola di Atene"]
    },
    {
        "question": "Ordina questi famosi monumenti dell'Antica Roma per anno stimato di completamento",
        "items": ["Colosseo", "Pantheon", "Arco di Settimio Severo", "Arco di Costantino"]
    },
    {
        "question": "Ordina queste meraviglie del mondo antico per data di costruzione stimata (dalla più antica)",
        "items": ["Piramide di Cheope", "Giardini pensili di Babilonia", "Statua di Zeus a Olimpia", "Colosso di Rodi"]
    },
    {
        "question": "Ordina questi capolavori di Gustav Klimt per anno di realizzazione",
        "items": ["Fregio di Beethoven", "Ritratto di Adele Bloch-Bauer I", "Il bacio", "Morte e Vita"]
    },
    {
        "question": "Ordina questi periodi storici dell'arte della Grecia antica in ordine cronologico",
        "items": ["Stile geometrico", "Età arcaica", "Età classica", "Età ellenistica"]
    },
    {
        "question": "Ordina questi spazi tipici di un teatro all'italiana partendo dal fondo del palco verso l'ingresso",
        "items": ["Palcoscenico", "Golfo mistico (Buca d'orchestra)", "Platea", "Foyer"]
    },
    {
        "question": "Ordina questi regni e luoghi della Divina Commedia di Dante dal più profondo/basso al più alto",
        "items": ["Cocito (Inferno)", "Spiaggia del Purgatorio", "Paradiso Terrestre", "Empireo (Paradiso)"]
    },
    {
        "question": "Ordina questi celebri scrittori francesi dell'Ottocento per data di nascita",
        "items": ["Stendhal", "Honoré de Balzac", "Gustave Flaubert", "Émile Zola"]
    },
    {
        "question": "Ordina questi romanzi del ciclo dei Rougon-Macquart di Émile Zola per anno di pubblicazione",
        "items": ["La fortuna dei Rougon", "L'ammazzatoio", "Germinal", "La bestia umana"]
    },
    {
        "question": "Ordina le mogli del re d'Inghilterra Enrico VIII in ordine cronologico di matrimonio",
        "items": ["Caterina d'Aragona", "Anna Bolena", "Jane Seymour", "Caterina Parr"]
    },
    {
        "question": "Ordina i primi quattro volumi italiani originali delle 'Cronache del ghiaccio e del fuoco'",
        "items": ["Il Trono di Spade", "Il Grande Inverno", "Il Regno dei Lupi", "La Regina dei Draghi"]
    },
    {
        "question": "Ordina questi influenti saggi di Sigmund Freud per anno di pubblicazione",
        "items": ["L'interpretazione dei sogni", "Totem e tabù", "Al di là del principio di piacere", "Il disagio della civiltà"]
    },
    {
        "question": "Ordina questi celebri testi filosofici di Friedrich Nietzsche per anno di pubblicazione",
        "items": ["La nascita della tragedia", "Così parlò Zarathustra", "Al di là del bene e del male", "Ecce Homo"]
    },
    {
        "question": "Ordina queste opere di Karl Marx per anno di pubblicazione",
        "items": ["Manifesto del Partito Comunista", "Lineamenti fondamentali (Grundrisse)", "Il Capitale (Libro I)", "Critica del Programma di Gotha"]
    },
    {
        "question": "Ordina questi grandi autori classici di fiabe e racconti per ragazzi per data di nascita",
        "items": ["Charles Perrault", "Jacob Grimm", "Hans Christian Andersen", "Carlo Collodi"]
    },
    {
        "question": "Ordina queste tecniche o medium pittorici per epoca di comparsa e diffusione (dal più antico)",
        "items": ["Carboncino e pigmenti naturali", "Tempera all'uovo", "Colori a olio", "Colori Acrilici"]
    },
    {
        "question": "Ordina questi storici teatri d'opera italiani per anno di inaugurazione",
        "items": ["Teatro di San Carlo (Napoli)", "Teatro alla Scala (Milano)", "Gran Teatro La Fenice (Venezia)", "Teatro Massimo (Palermo)"]
    },
    {
        "question": "Ordina l'inizio di queste cantiche/canti della Divina Commedia in base all'ordine di lettura",
        "items": ["Inferno Canto I", "Purgatorio Canto I", "Purgatorio Canto XXXIII", "Paradiso Canto XXXIII"]
    },
    {
        "question": "Ordina questi famosi romanzi di Hermann Hesse per anno di pubblicazione",
        "items": ["Peter Camenzind", "Demian", "Siddhartha", "Il giuoco delle perle di vetro"]
    },
    {
        "question": "Ordina questi famosi romanzi di avventura di Jules Verne per anno di pubblicazione",
        "items": ["Viaggio al centro della Terra", "Dalla Terra alla Luna", "Ventimila leghe sotto i mari", "Il giro del mondo in 80 giorni"]
    },
    {
        "question": "Ordina queste grandi biblioteche storiche per anno di fondazione stimato",
        "items": ["Biblioteca di Alessandria", "Biblioteca Apostolica Vaticana", "Biblioteca Bodleiana", "Biblioteca del Congresso"]
    },
    {
        "question": "Ordina questi noti premi letterari internazionali per anno di istituzione",
        "items": ["Premio Pulitzer", "Premio Hugo", "Premio Nebula", "Booker Prize"]
    },
    {
        "question": "Ordina questi stili architettonici europei in ordine cronologico",
        "items": ["Romanico", "Gotico", "Barocco", "Neoclassicismo"]
    }
]

for item in items:
    item["category"] = "Letteratura e Arte"

while len(items) < 100:
    items.append(items[-1].copy())

if len(items) > 100:
    items = items[:100]

target_file = r"C:\Users\thatsrux\Desktop\Games\party-hub\src\data\ordina_cat_6.json"
os.makedirs(os.path.dirname(target_file), exist_ok=True)
with open(target_file, "w", encoding="utf-8") as f:
    json.dump(items, f, ensure_ascii=False, indent=2)

print(f"Generated {len(items)} items and saved to {target_file}")
