export interface JeopardyQuestion {
  question: string;
  answer: string;
}

export interface JeopardyCategory {
  name: string;
  questions: {
    100: JeopardyQuestion[];
    200: JeopardyQuestion[];
    300: JeopardyQuestion[];
    400: JeopardyQuestion[];
    500: JeopardyQuestion[];
  };
}

export const jeopardyCategories: JeopardyCategory[] = [
  {
    name: "Cinema e Serie TV",
    questions: {
      100: [
        { question: "Qual è il colore della pillola che Neo prende in Matrix?", answer: "Rossa" },
        { question: "Chi interpreta Jack Dawson in Titanic?", answer: "Leonardo DiCaprio" },
        { question: "Come si chiama il mago con la cicatrice a forma di saetta?", answer: "Harry Potter" },
        { question: "In quale serie TV troviamo la famiglia Stark?", answer: "Il Trono di Spade (Game of Thrones)" },
        { question: "Chi è l'orco verde protagonista dell'omonimo film d'animazione Dreamworks?", answer: "Shrek" }
      ],
      200: [
        { question: "Quale attore interpreta Iron Man nel Marvel Cinematic Universe?", answer: "Robert Downey Jr." },
        { question: "Come si chiama il locale dove lavora Penny in The Big Bang Theory?", answer: "The Cheesecake Factory" },
        { question: "Chi ha diretto il film Avatar del 2009?", answer: "James Cameron" },
        { question: "Quale serie Netflix è ambientata nella fittizia Hawkins, Indiana?", answer: "Stranger Things" },
        { question: "Come si chiama il mafioso protagonista della serie I Soprano?", answer: "Tony Soprano" }
      ],
      300: [
        { question: "Per quale film Leonardo DiCaprio ha vinto il suo primo premio Oscar come miglior attore?", answer: "Revenant - Redivivo" },
        { question: "Chi ha scritto e diretto il film Pulp Fiction?", answer: "Quentin Tarantino" },
        { question: "Quale serie TV ha come protagonista il professore di chimica Walter White?", answer: "Breaking Bad" },
        { question: "In che anno è uscito il primo film della saga di Star Wars?", answer: "1977" },
        { question: "Come si chiama l'attore che interpreta il Joker ne 'Il cavaliere oscuro'?", answer: "Heath Ledger" }
      ],
      400: [
        { question: "Quale film ha vinto il maggior numero di premi Oscar nella storia (11), insieme a Titanic e Il Signore degli Anelli?", answer: "Ben-Hur" },
        { question: "Come si chiama il creatore della serie televisiva Mad Men?", answer: "Matthew Weiner" },
        { question: "Chi è il regista del film muto Metropolis del 1927?", answer: "Fritz Lang" },
        { question: "In quale film di Stanley Kubrick il computer HAL 9000 impazzisce?", answer: "2001: Odissea nello spazio" },
        { question: "Quale attrice detiene il record per il maggior numero di candidature ai premi Oscar?", answer: "Meryl Streep" }
      ],
      500: [
        { question: "Come si chiamava l'attore protagonista della serie originale di Doctor Who nel 1963?", answer: "William Hartnell" },
        { question: "Quale film giapponese del 1954 di Akira Kurosawa ha ispirato I magnifici sette?", answer: "I sette samurai" },
        { question: "Chi ha vinto la Palma d'Oro al Festival di Cannes con il film 'Taxi Driver'?", answer: "Martin Scorsese" },
        { question: "Qual è il titolo del primo lungometraggio animato interamente in CGI della Pixar?", answer: "Toy Story" },
        { question: "Chi ha composto la colonna sonora del film Il buono, il brutto, il cattivo?", answer: "Ennio Morricone" }
      ]
    }
  },
  {
    name: "Storia e Mitologia",
    questions: {
      100: [
        { question: "Chi è il re degli dei nella mitologia greca?", answer: "Zeus" },
        { question: "In che anno fu scoperta l'America da Cristoforo Colombo?", answer: "1492" },
        { question: "Chi fu il primo imperatore romano?", answer: "Augusto (Ottaviano)" },
        { question: "Come si chiamava l'eroe greco il cui unico punto debole era il tallone?", answer: "Achille" },
        { question: "Quale civiltà ha costruito le piramidi di Giza?", answer: "Gli Egizi" }
      ],
      200: [
        { question: "Chi era il dio romano della guerra?", answer: "Marte" },
        { question: "In che anno è caduto il Muro di Berlino?", answer: "1989" },
        { question: "Chi dipinse il soffitto della Cappella Sistina?", answer: "Michelangelo Buonarroti" },
        { question: "Quale eroe mitologico compì le dodici fatiche?", answer: "Ercole (Eracle)" },
        { question: "Chi era la regina dell'antico Egitto famosa per le sue relazioni con Giulio Cesare e Marco Antonio?", answer: "Cleopatra" }
      ],
      300: [
        { question: "Quale condottiero cartaginese attraversò le Alpi con gli elefanti?", answer: "Annibale" },
        { question: "Chi era il dio egizio dell'oltretomba, spesso raffigurato con la pelle verde?", answer: "Osiride" },
        { question: "In che anno è iniziata la Prima Guerra Mondiale?", answer: "1914" },
        { question: "Chi era il re di Camelot, leggendario sovrano dei cavalieri della Tavola Rotonda?", answer: "Re Artù" },
        { question: "Come si chiamava la fazione politica opposta ai Ghibellini nell'Italia medievale?", answer: "Guelfi" }
      ],
      400: [
        { question: "Quale re babilonese ha promulgato uno dei primi codici di leggi scritti della storia?", answer: "Hammurabi" },
        { question: "Nella mitologia norrena, chi è il dio del tuono?", answer: "Thor" },
        { question: "Quale zarina russa prese il potere rovesciando il marito Pietro III?", answer: "Caterina II (Caterina la Grande)" },
        { question: "Come si chiamava il mostro mitologico con il corpo di uomo e la testa di toro?", answer: "Il Minotauro" },
        { question: "Chi fu il leader della rivoluzione russa del 1917?", answer: "Lenin" }
      ],
      500: [
        { question: "Come si chiamava il patto firmato nel 1939 tra la Germania nazista e l'Unione Sovietica?", answer: "Patto Molotov-Ribbentrop" },
        { question: "Qual è il nome del serpente gigante che avvolge il mondo nella mitologia norrena?", answer: "Jörmungandr" },
        { question: "Chi era l'imperatore romano durante l'eruzione del Vesuvio nel 79 d.C.?", answer: "Tito" },
        { question: "Quale divinità sumera è al centro della discesa negli inferi nell'epopea di Gilgamesh?", answer: "Inanna (o Ishtar)" },
        { question: "In che anno fu combattuta la battaglia di Waterloo?", answer: "1815" }
      ]
    }
  },
  {
    name: "Musica",
    questions: {
      100: [
        { question: "Chi canta 'Rolling in the Deep'?", answer: "Adele" },
        { question: "Quante corde ha una chitarra classica?", answer: "Sei" },
        { question: "Come si chiama il leader e cantante dei Queen?", answer: "Freddie Mercury" },
        { question: "Chi è l'autore della celebre 'Nona Sinfonia' (Inno alla Gioia)?", answer: "Ludwig van Beethoven" },
        { question: "Qual è lo strumento musicale a fiato associato alla Scozia?", answer: "La cornamusa" }
      ],
      200: [
        { question: "Quale gruppo rock britannico ha pubblicato l'album 'The Dark Side of the Moon'?", answer: "Pink Floyd" },
        { question: "Chi è conosciuto come 'Il Re del Pop'?", answer: "Michael Jackson" },
        { question: "In quale città si svolge il celebre Festival della canzone italiana?", answer: "Sanremo" },
        { question: "Come si chiamavano i quattro membri dei Beatles?", answer: "John, Paul, George, Ringo" },
        { question: "Chi ha composto le 'Quattro stagioni'?", answer: "Antonio Vivaldi" }
      ],
      300: [
        { question: "Quale famosa cantante pop ha pubblicato un album intitolato '1989'?", answer: "Taylor Swift" },
        { question: "Da quale paese proviene il genere musicale del Reggae?", answer: "Giamaica" },
        { question: "Chi era il chitarrista principale dei The Jimi Hendrix Experience?", answer: "Jimi Hendrix" },
        { question: "Quale band grunge ha pubblicato l'album 'Nevermind' nel 1991?", answer: "Nirvana" },
        { question: "Come si chiama il rapper bianco protagonista del film '8 Mile'?", answer: "Eminem" }
      ],
      400: [
        { question: "Chi ha scritto e composto l'opera lirica 'La traviata'?", answer: "Giuseppe Verdi" },
        { question: "Quale icona della musica pop ha interpretato il ruolo da protagonista nel film 'Evita' del 1996?", answer: "Madonna" },
        { question: "Chi è il compositore della celebre 'Cavalcata delle Valchirie'?", answer: "Richard Wagner" },
        { question: "Qual è il nome di battesimo del celebre trombettista jazz Miles Davis?", answer: "Miles" },
        { question: "In quale decennio si è tenuto il leggendario festival di Woodstock?", answer: "Anni '60 (1969)" }
      ],
      500: [
        { question: "Come si chiamava il cantante dei Joy Division, morto nel 1980?", answer: "Ian Curtis" },
        { question: "Qual è il compositore barocco tedesco celebre per aver composto i 'Concerti brandeburghesi'?", answer: "Johann Sebastian Bach" },
        { question: "Quale famoso produttore musicale ha inventato il 'Wall of Sound'?", answer: "Phil Spector" },
        { question: "Chi suonava il basso nei Led Zeppelin?", answer: "John Paul Jones" },
        { question: "Quale compositore russo ha scritto il balletto 'La sagra della primavera', che ha causato uno scandalo alla sua prima parigina?", answer: "Igor Stravinskij" }
      ]
    }
  },
  {
    name: "Scienza e Natura",
    questions: {
      100: [
        { question: "Qual è il pianeta più vicino al Sole?", answer: "Mercurio" },
        { question: "Quante zampe ha un ragno?", answer: "Otto" },
        { question: "Qual è il simbolo chimico dell'acqua?", answer: "H2O" },
        { question: "Come si chiama il satellite naturale della Terra?", answer: "La Luna" },
        { question: "Quale animale è famoso per il suo collo lunghissimo?", answer: "La giraffa" }
      ],
      200: [
        { question: "Chi ha sviluppato la teoria della relatività?", answer: "Albert Einstein" },
        { question: "Qual è l'organo del corpo umano che pompa il sangue?", answer: "Il cuore" },
        { question: "Come si chiama il processo con cui le piante producono il loro nutrimento dal sole?", answer: "Fotosintesi clorofilliana" },
        { question: "Qual è il metallo liquido a temperatura ambiente?", answer: "Il mercurio" },
        { question: "Quanti sono i pianeti del nostro sistema solare?", answer: "Otto" }
      ],
      300: [
        { question: "Quale gas respiriamo per vivere?", answer: "Ossigeno" },
        { question: "Quale animale è il mammifero più grande del mondo?", answer: "La balenottera azzurra" },
        { question: "Chi ha scoperto la penicillina?", answer: "Alexander Fleming" },
        { question: "Qual è il minerale più duro presente in natura?", answer: "Il diamante" },
        { question: "Come si chiama l'unità di misura della forza nel Sistema Internazionale?", answer: "Newton" }
      ],
      400: [
        { question: "Qual è la formula chimica dell'acido solforico?", answer: "H2SO4" },
        { question: "Come si chiama la particella subatomica con carica neutra?", answer: "Neutrone" },
        { question: "Chi propose la teoria dell'evoluzione per selezione naturale?", answer: "Charles Darwin" },
        { question: "Quale strato dell'atmosfera terrestre ci protegge dai raggi ultravioletti del sole?", answer: "Ozono (o Ozonosfera)" },
        { question: "Che tipo di roccia è il marmo?", answer: "Metamorfica" }
      ],
      500: [
        { question: "Qual è il nome della prima donna a vincere il Premio Nobel e l'unica a vincerlo in due campi scientifici diversi?", answer: "Marie Curie" },
        { question: "Come si chiama la costante cosmologica indicata con la lettera Lambda nella teoria della relatività generale?", answer: "Energia oscura (o Costante cosmologica)" },
        { question: "Quale teoria fisica cerca di unificare la meccanica quantistica e la relatività generale ipotizzando oggetti unidimensionali?", answer: "Teoria delle stringhe" },
        { question: "Come si chiama il processo di divisione cellulare che produce le cellule sessuali (gameti)?", answer: "Meiosi" },
        { question: "Chi ha formulato le tre leggi sul moto dei pianeti?", answer: "Giovanni Keplero" }
      ]
    }
  },
  {
    name: "Tecnologia e Videogiochi",
    questions: {
      100: [
        { question: "Chi è l'idraulico baffuto protagonista dei videogiochi Nintendo?", answer: "Super Mario" },
        { question: "Come si chiama l'azienda fondata da Steve Jobs, creatrice dell'iPhone?", answer: "Apple" },
        { question: "Qual è la forma dei blocchi in Minecraft?", answer: "Cubo" },
        { question: "Come si chiama il popolare social network fondato da Mark Zuckerberg?", answer: "Facebook" },
        { question: "Qual è la consonante centrale nell'acronimo 'PC'?", answer: "C (Personal Computer)" }
      ],
      200: [
        { question: "Qual è la principessa che Link deve salvare in un'omonima serie di giochi?", answer: "Zelda" },
        { question: "Come si chiama l'assistente vocale di Amazon?", answer: "Alexa" },
        { question: "Quale console Sony ha succeduto la PlayStation 4?", answer: "PlayStation 5" },
        { question: "Qual è il linguaggio di programmazione più usato per lo sviluppo web client-side?", answer: "JavaScript" },
        { question: "In Pac-Man, quanti sono i fantasmi nemici originali?", answer: "Quattro" }
      ],
      300: [
        { question: "Chi è l'eroe protagonista della saga di Halo?", answer: "Master Chief" },
        { question: "Cosa significa la sigla 'USB'?", answer: "Universal Serial Bus" },
        { question: "Quale famosissimo gioco rompicapo è stato creato dal russo Aleksej Pažitnov nel 1984?", answer: "Tetris" },
        { question: "Qual è il sistema operativo per dispositivi mobili sviluppato da Google?", answer: "Android" },
        { question: "Come si chiama il mondo virtuale in cui si ambientano giochi di ruolo come World of Warcraft?", answer: "Azeroth" }
      ],
      400: [
        { question: "Quale azienda ha creato la prima scheda grafica GPU commerciale per PC, la GeForce 256?", answer: "Nvidia" },
        { question: "In quale gioco della serie Final Fantasy appare il personaggio di Cloud Strife?", answer: "Final Fantasy VII" },
        { question: "Chi è il programmatore che ha creato il kernel di Linux?", answer: "Linus Torvalds" },
        { question: "Qual è la valuta virtuale basata su blockchain creata da Satoshi Nakamoto?", answer: "Bitcoin" },
        { question: "Come si chiamava la prima console di casa Nintendo a usare i dischi ottici al posto delle cartucce?", answer: "Nintendo GameCube" }
      ],
      500: [
        { question: "Qual era il nome in codice durante lo sviluppo del primo Nintendo 64?", answer: "Project Reality" },
        { question: "Qual è l'azienda britannica che ha creato la serie di giochi Grand Theft Auto (GTA)?", answer: "Rockstar North (originariamente DMA Design)" },
        { question: "Come si chiamava il primo computer elettronico turing completo, sviluppato durante la Seconda Guerra Mondiale nel Regno Unito?", answer: "Colossus" },
        { question: "Qual è il titolo del gioco per PC del 1993 considerato uno dei pionieri del genere sparatutto in prima persona (FPS)?", answer: "Doom" },
        { question: "Quale legge stabilisce che la complessità dei microcircuiti raddoppia ogni 18 mesi?", answer: "Legge di Moore" }
      ]
    }
  },
  {
    name: "Letteratura e Arte",
    questions: {
      100: [
        { question: "Chi ha scritto 'La Divina Commedia'?", answer: "Dante Alighieri" },
        { question: "Chi ha dipinto la Gioconda (Monna Lisa)?", answer: "Leonardo da Vinci" },
        { question: "Come si chiama il celebre burattino di legno che voleva diventare un bambino vero?", answer: "Pinocchio" },
        { question: "In quale città si trova il dipinto de 'L'Ultima Cena' di Leonardo?", answer: "Milano" },
        { question: "Chi è l'autore di 'I Promessi Sposi'?", answer: "Alessandro Manzoni" }
      ],
      200: [
        { question: "Come si chiama il famoso detective creato da Arthur Conan Doyle?", answer: "Sherlock Holmes" },
        { question: "Chi ha dipinto 'La Notte Stellata'?", answer: "Vincent van Gogh" },
        { question: "Qual è il capolavoro letterario spagnolo scritto da Miguel de Cervantes?", answer: "Don Chisciotte" },
        { question: "Quale movimento artistico era guidato da pittori come Claude Monet e Pierre-Auguste Renoir?", answer: "Impressionismo" },
        { question: "Come si chiama la poetessa greca antica vissuta sull'isola di Lesbo?", answer: "Saffo" }
      ],
      300: [
        { question: "Chi ha scritto il romanzo '1984'?", answer: "George Orwell" },
        { question: "Qual è l'artista spagnolo che ha dipinto 'Guernica'?", answer: "Pablo Picasso" },
        { question: "Chi ha scritto la tragedia di Romeo e Giulietta?", answer: "William Shakespeare" },
        { question: "Chi è lo scultore della celebre statua del 'David' custodita a Firenze?", answer: "Michelangelo Buonarroti" },
        { question: "Quale poeta italiano ha scritto 'Il Canzoniere'?", answer: "Francesco Petrarca" }
      ],
      400: [
        { question: "Qual è l'autore della celebre opera 'Cent'anni di solitudine'?", answer: "Gabriel García Márquez" },
        { question: "A quale movimento artistico appartiene l'opera 'La persistenza della memoria' di Salvador Dalí?", answer: "Surrealismo" },
        { question: "Chi ha scritto l'epopea 'Odissea'?", answer: "Omero" },
        { question: "Quale pittore austriaco ha realizzato il celebre quadro 'Il Bacio'?", answer: "Gustav Klimt" },
        { question: "Come si chiama il protagonista del romanzo 'Il fu Mattia Pascal' di Pirandello?", answer: "Mattia Pascal" }
      ],
      500: [
        { question: "Qual è il nome dell'autore russo del massiccio romanzo 'Guerra e Pace'?", answer: "Lev Tolstoj" },
        { question: "Quale pittore fiammingo è noto per il trittico 'Il giardino delle delizie'?", answer: "Hieronymus Bosch" },
        { question: "In quale romanzo compare per la prima volta il personaggio di Dracula creato da Bram Stoker?", answer: "Dracula" },
        { question: "Chi è l'architetto che progettò la cupola di Santa Maria del Fiore a Firenze?", answer: "Filippo Brunelleschi" },
        { question: "Qual è il vero nome dell'autore britannico che scriveva sotto lo pseudonimo di George Eliot?", answer: "Mary Ann Evans" }
      ]
    }
  },
  {
    name: "Geografia",
    questions: {
      100: [
        { question: "Qual è la capitale dell'Italia?", answer: "Roma" },
        { question: "In quale continente si trova il deserto del Sahara?", answer: "Africa" },
        { question: "Quale fiume attraversa Parigi?", answer: "La Senna" },
        { question: "Qual è l'oceano più grande del mondo?", answer: "L'Oceano Pacifico" },
        { question: "Come si chiama lo stivale europeo?", answer: "Italia" }
      ],
      200: [
        { question: "Qual è la capitale della Francia?", answer: "Parigi" },
        { question: "Qual è la montagna più alta del mondo?", answer: "Monte Everest" },
        { question: "Quale nazione asiatica ha la più grande popolazione al mondo assieme all'India?", answer: "Cina" },
        { question: "In quale nazione si trova il Grand Canyon?", answer: "Stati Uniti" },
        { question: "Qual è il continente più freddo e meridionale del mondo?", answer: "Antartide" }
      ],
      300: [
        { question: "Qual è il fiume più lungo del mondo?", answer: "Il Nilo (o il Rio delle Amazzoni)" },
        { question: "Qual è la capitale del Giappone?", answer: "Tokyo" },
        { question: "Come si chiama lo stretto che separa l'Asia dall'America del Nord?", answer: "Stretto di Bering" },
        { question: "In quale paese si trova l'antica città inca di Machu Picchu?", answer: "Perù" },
        { question: "Qual è la capitale della Spagna?", answer: "Madrid" }
      ],
      400: [
        { question: "Qual è il lago d'acqua dolce più grande del mondo per estensione?", answer: "Lago Superiore" },
        { question: "Qual è la nazione più piccola del mondo?", answer: "Città del Vaticano" },
        { question: "Come si chiama la catena montuosa che separa l'Europa dall'Asia in Russia?", answer: "Monti Urali" },
        { question: "Qual è la capitale dell'Australia?", answer: "Canberra" },
        { question: "In quale nazione si trova il deserto di Atacama, considerato il luogo più arido del mondo?", answer: "Cile" }
      ],
      500: [
        { question: "Qual è la capitale della Nuova Zelanda?", answer: "Wellington" },
        { question: "Quale paese sudamericano ha per capitale Paramaribo?", answer: "Suriname" },
        { question: "Come si chiama la vasta regione semiarida situata a sud del deserto del Sahara?", answer: "Sahel" },
        { question: "Qual è il paese africano con il maggior numero di abitanti?", answer: "Nigeria" },
        { question: "In quale nazione si trova il punto più basso della terraferma, la depressione del Mar Morto?", answer: "Tra Israele, Giordania e Cisgiordania" }
      ]
    }
  },
  {
    name: "Cucina e Tradizioni",
    questions: {
      100: [
        { question: "Di quale nazione è tipica la pizza?", answer: "Italia" },
        { question: "Quale bevanda si ottiene dall'infusione di foglie e germogli della pianta Camellia sinensis?", answer: "Il tè" },
        { question: "Come si chiama il dolce freddo italiano a base di savoiardi, caffè e mascarpone?", answer: "Tiramisù" },
        { question: "Quale festa americana si festeggia il quarto giovedì di novembre mangiando il tacchino?", answer: "Il Giorno del Ringraziamento (Thanksgiving)" },
        { question: "Di che colore è tipicamente il vino fatto con l'uva Chardonnay?", answer: "Bianco" }
      ],
      200: [
        { question: "Da quale paese proviene il Sushi?", answer: "Giappone" },
        { question: "Come si chiama il famoso piatto messicano formato da una tortilla di mais piegata e ripiena?", answer: "Taco" },
        { question: "Quale dolce tipico napoletano a forma di fungo è inzuppato nel rum?", answer: "Babà" },
        { question: "Che cosa si festeggia in Irlanda e nel mondo il 17 marzo con parate e birra verde?", answer: "San Patrizio (St. Patrick's Day)" },
        { question: "Qual è l'ingrediente base del Guacamole?", answer: "L'avocado" }
      ],
      300: [
        { question: "Quale formaggio italiano è essenziale nella ricetta tradizionale del Pesto alla Genovese (insieme al Parmigiano)?", answer: "Fiore Sardo (o Pecorino)" },
        { question: "Come si chiama la zuppa di pesce tradizionale originaria di Marsiglia, in Francia?", answer: "Bouillabaisse" },
        { question: "Quale festività messicana celebra i defunti con altari e teschi di zucchero?", answer: "Día de los Muertos (Giorno dei Morti)" },
        { question: "In quale nazione asiatica è nato il piatto speziato conosciuto come Curry?", answer: "India" },
        { question: "Quale dolce tedesco è preparato con strati di pan di spagna al cioccolato, panna montata, ciliegie e Kirsch?", answer: "Torta della Foresta Nera" }
      ],
      400: [
        { question: "Come si chiama il piatto tipico greco simile alle lasagne, fatto con melanzane, patate e carne macinata?", answer: "Moussaka" },
        { question: "Qual è il nome del festival dei colori che si tiene in primavera in India?", answer: "Holi" },
        { question: "Da quale radice piccante si ottiene la pasta verde servita con il sushi?", answer: "Wasabi" },
        { question: "In quale paese europeo è nata la tradizione dei mercatini di Natale (Christkindlmarkt)?", answer: "Germania (o Paesi di lingua tedesca)" },
        { question: "Qual è il fungo sotterraneo, molto pregiato, cercato con l'aiuto di cani in Piemonte e in Umbria?", answer: "Il tartufo" }
      ],
      500: [
        { question: "Quale piatto coreano è formato da verdure fermentate, principalmente cavolo napa e ravanello coreano, molto piccanti?", answer: "Kimchi" },
        { question: "Qual è il nome dell'antichissima bevanda fermentata a base di miele e acqua, conosciuta anche dai Vichinghi?", answer: "Idromele" },
        { question: "Durante quale festa ebraica è proibito mangiare cibi lievitati, consumando invece la matzah?", answer: "Pesach (Pasqua ebraica)" },
        { question: "Come si chiama la tecnica di cottura francese in cui gli alimenti vengono sigillati in sacchetti sottovuoto e cotti a bassa temperatura in acqua?", answer: "Sous-vide" },
        { question: "In quale regione spagnola è originaria la vera Paella tradizionale?", answer: "Valencia" }
      ]
    }
  },
  {
    name: "Cultura Pop e Gossip",
    questions: {
      100: [
        { question: "Quale celebre bambola della Mattel è stata creata nel 1959 e ha avuto un film di successo nel 2023?", answer: "Barbie" },
        { question: "Chi è la moglie del principe William d'Inghilterra?", answer: "Kate Middleton" },
        { question: "Quale famosa famiglia americana è diventata celebre grazie al reality 'Al passo con i...'", answer: "Kardashian" },
        { question: "In che mese cade tradizionalmente la festa di Halloween?", answer: "Ottobre" },
        { question: "Come si chiama il cane dei Simpson?", answer: "Piccolo Aiutante di Babbo Natale" }
      ],
      200: [
        { question: "Quale miliardario ha acquisito Twitter e l'ha rinominato in X?", answer: "Elon Musk" },
        { question: "Chi è stato il marito di Angelina Jolie dal 2014 al 2019?", answer: "Brad Pitt" },
        { question: "Qual è il nome della tournée mondiale da record di Taylor Swift iniziata nel 2023?", answer: "The Eras Tour" },
        { question: "Chi era l'interprete principale del film per adolescenti High School Musical?", answer: "Zac Efron" },
        { question: "Quale famoso premio viene assegnato per il peggior film dell'anno prima degli Oscar?", answer: "I Razzie Awards" }
      ],
      300: [
        { question: "Come si chiama il celebre festival musicale che si tiene ogni anno nel deserto del Colorado in California?", answer: "Coachella" },
        { question: "Chi ha vinto l'Oscar per lo schiaffo dato a Chris Rock durante la cerimonia degli Academy Awards 2022?", answer: "Will Smith" },
        { question: "Qual è il nome del figlio primogenito del principe Harry e Meghan Markle?", answer: "Archie" },
        { question: "In quale franchise cinematografico troviamo il personaggio di Katniss Everdeen?", answer: "Hunger Games" },
        { question: "Chi è la popstar che ha come fan i 'Little Monsters'?", answer: "Lady Gaga" }
      ],
      400: [
        { question: "Come si chiama la rivista di moda il cui direttore storico è Anna Wintour?", answer: "Vogue" },
        { question: "Quale famoso evento mondano di beneficenza si tiene ogni anno a maggio al Metropolitan Museum of Art di New York?", answer: "Il Met Gala" },
        { question: "Quale serie televisiva sudcoreana ha infranto tutti i record di visualizzazione su Netflix nel 2021?", answer: "Squid Game" },
        { question: "Chi è l'ex marito di Kim Kardashian che ha legalmente cambiato il suo nome in 'Ye'?", answer: "Kanye West" },
        { question: "Quale popstar ha tenuto una residenza a Las Vegas intitolata 'Piece of Me' dal 2013 al 2017?", answer: "Britney Spears" }
      ],
      500: [
        { question: "Quale famoso attore di Hollywood è noto per l'abitudine (o il meme) di non frequentare mai donne sopra i 25 anni?", answer: "Leonardo DiCaprio" },
        { question: "In quale anno si è tenuto il famigerato Fyre Festival, rivelatosi un disastro clamoroso?", answer: "2017" },
        { question: "Come si chiamava la popolare e scandalosa blogger di gossip interpretata da Kristen Bell in TV?", answer: "Gossip Girl" },
        { question: "Qual è il nome del tribunale dove si è svolto il celebre processo per diffamazione tra Johnny Depp e Amber Heard?", answer: "Tribunale di Fairfax (Virginia)" },
        { question: "Quale icona della moda ha creato il celebre 'tubino nero' indossato da Audrey Hepburn in Colazione da Tiffany?", answer: "Hubert de Givenchy" }
      ]
    }
  },
  {
    name: "Sport",
    questions: {
      100: [
        { question: "Quanti giocatori ci sono in una squadra di calcio in campo?", answer: "Undici" },
        { question: "In quale sport si usa una racchetta e una pallina gialla?", answer: "Tennis" },
        { question: "Quale colore è associato alla maglia del leader del Giro d'Italia?", answer: "Rosa" },
        { question: "In che sport spicca il campione LeBron James?", answer: "Pallacanestro (Basket)" },
        { question: "Ogni quanti anni si tengono i Giochi Olimpici estivi?", answer: "Quattro" }
      ],
      200: [
        { question: "In quale sport i giocatori fanno 'meta'?", answer: "Rugby" },
        { question: "Quale pilota ha vinto sette titoli mondiali in Formula 1 insieme a Lewis Hamilton?", answer: "Michael Schumacher" },
        { question: "Dove sono state ospitate le Olimpiadi del 2020 (svolte nel 2021 a causa del Covid)?", answer: "Tokyo" },
        { question: "Quanti round ha di solito un incontro professionistico di pugilato per il titolo?", answer: "Dodici" },
        { question: "Quale nazione ha vinto più Coppe del Mondo di calcio maschile?", answer: "Brasile" }
      ],
      300: [
        { question: "In quale sport si usa il termine 'Fuoricampo' (Home Run)?", answer: "Baseball" },
        { question: "Come si chiama la pista su cui gareggiano i ciclisti su pista?", answer: "Velodromo" },
        { question: "Chi è il tennista spagnolo conosciuto come il 'Re della terra rossa'?", answer: "Rafael Nadal" },
        { question: "In quale sport su ghiaccio si usa un disco nero chiamato 'puck'?", answer: "Hockey su ghiaccio" },
        { question: "Qual è il punteggio perfetto in una partita di bowling?", answer: "300" }
      ],
      400: [
        { question: "Quale nuotatore americano detiene il record per il maggior numero di medaglie d'oro olimpiche vinte in carriera (23)?", answer: "Michael Phelps" },
        { question: "Come si chiama il premio assegnato al miglior giocatore della NFL durante il Super Bowl?", answer: "MVP del Super Bowl" },
        { question: "Qual è la distanza ufficiale di una maratona in chilometri?", answer: "42,195 km" },
        { question: "In quale specialità dell'atletica leggera l'atleta usa un'asta per superare un'asticella?", answer: "Salto con l'asta" },
        { question: "Chi detiene il record del mondo nei 100 metri piani maschili (9.58)?", answer: "Usain Bolt" }
      ],
      500: [
        { question: "Come si chiama l'attuale sistema di punteggio del decathlon, introdotto nel 1984 e in vigore ancora oggi?", answer: "Tabelle di punteggio IAAF" },
        { question: "Quale nazione ha ospitato la prima edizione della Coppa del Mondo di calcio nel 1930 (vincendola)?", answer: "Uruguay" },
        { question: "Chi è stato il primo pugile a sconfiggere Muhammad Ali da professionista?", answer: "Joe Frazier" },
        { question: "Nel golf, come viene chiamato il punteggio di tre colpi sotto il par in una singola buca?", answer: "Albatross (o Doppio Eagle)" },
        { question: "Quale squadra di basket NBA ha stabilito il record di 73 vittorie nella stagione regolare nel 2015-2016?", answer: "Golden State Warriors" }
      ]
    }
  }
];
