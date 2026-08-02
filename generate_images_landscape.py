import urllib.request
import urllib.parse
import json
import time

items = [
    "Leone", "Tigre", "Elefante", "Giraffa", "Zebra", "Cane", "Gatto", "Cavallo", "Mucca", "Maiale",
    "Pecora", "Capra", "Asino", "Topo", "Scoiattolo", "Coniglio", "Orso", "Lupo", "Volpe", "Cervo",
    "Scimmia", "Gorilla", "Koala", "Canguro", "Panda", "Delfino", "Balena", "Squalo", "Polpo", "Granchio",
    "Aragosta", "Stella marina", "Tartaruga", "Coccodrillo", "Serpente", "Rana", "Lucertola", "Camaleonte",
    "Iguana", "Aquila", "Falco", "Gufo", "Pappagallo", "Colomba", "Pettirosso", "Pinguino", "Struzzo",
    "Pavone", "Cigno", "Anatra", "Oca", "Fenicottero", "Formica", "Ape", "Vespa", "Mosca", "Zanzara",
    "Farfalla", "Ragno", "Scorpione", "Lumaca",
    "Sedia", "Tavolo", "Letto", "Divano", "Armadio", "Frigorifero", "Lavatrice", "Forno", "Microonde",
    "Tostapane", "Frullatore", "Pentola", "Padella", "Piatto", "Bicchiere", "Tazza", "Forchetta",
    "Coltello", "Cucchiaio", "Bottiglia", "Telefono", "Computer", "Televisore", "Radio", "Fotocamera",
    "Orologio", "Occhiali", "Ombrello", "Zaino", "Valigia", "Portafoglio", "Chiave", "Libro", "Quaderno",
    "Penna", "Matita", "Gomma per cancellare", "Forbici", "Colla", "Nastro adesivo", "Martello", "Cacciavite",
    "Pinza", "Chiodo", "Vite", "Sega", "Trapano", "Metro a nastro", "Pennello", "Secchio", "Scopa",
    "Aspirapolvere", "Asciugacapelli", "Spazzola", "Pettine", "Spazzolino da denti", "Dentifricio", "Sapone", "Shampoo",
    "Automobile", "Motocicletta", "Bicicletta", "Autobus", "Treno", "Tram", "Metropolitana", "Aeroplano",
    "Elicottero", "Barca", "Nave", "Sottomarino", "Traghetto", "Camion", "Furgone", "Trattore", "Ambulanza",
    "Taxi", "Pizza", "Pasta", "Hamburger", "Hot dog", "Sushi", "Tacos", "Burrito", "Kebab", "Bistecca",
    "Pesce", "Gamberi", "Ostrica", "Calamaro", "Insalata", "Zuppa", "Pane", "Formaggio", "Salame",
    "Prosciutto", "Uovo", "Latte", "Burro", "Yogurt", "Gelato", "Torta", "Biscotto", "Cioccolato",
    "Caramella", "Popcorn", "Mela", "Pera", "Banana", "Arancia", "Limone", "Fragola", "Ciliegia",
    "Uva", "Anguria", "Melone", "Pesca", "Albicocca", "Prugna", "Kiwi", "Ananas", "Mango", "Papaya",
    "Cocco", "Carota", "Patata", "Pomodoro", "Cipolla", "Aglio", "Zucchina", "Melanzana", "Peperone",
    "Broccolo", "Cavolfiore", "Lattuga", "Spinacio",
    "Leonardo da Vinci", "Albert Einstein", "Marilyn Monroe", "Elvis Presley", "Michael Jackson",
    "Madonna (cantante)", "Freddie Mercury", "David Bowie", "John Lennon", "Paul McCartney", "Bob Marley",
    "Jimi Hendrix", "Kurt Cobain", "Tupac Shakur", "Bruce Lee", "Muhammad Ali", "Pelé",
    "Diego Armando Maradona", "Lionel Messi", "Cristiano Ronaldo", "Michael Jordan", "Kobe Bryant",
    "LeBron James", "Serena Williams", "Roger Federer", "Rafael Nadal", "Novak Đoković", "Usain Bolt",
    "Michael Phelps", "Tom Cruise", "Brad Pitt", "Leonardo DiCaprio", "Johnny Depp", "Will Smith",
    "Tom Hanks", "Robert De Niro", "Al Pacino", "Marlon Brando", "Jack Nicholson", "Anthony Hopkins",
    "Morgan Freeman", "Denzel Washington", "Samuel L. Jackson", "Harrison Ford", "Clint Eastwood",
    "Sylvester Stallone", "Arnold Schwarzenegger", "Keanu Reeves", "Jim Carrey", "Robin Williams",
    "Eddie Murphy", "Adam Sandler", "Ben Stiller", "Will Ferrell", "Steve Carell", "Jack Black",
    "Rowan Atkinson", "Charlie Chaplin", "Walt Disney", "Stan Lee", "Steven Spielberg", "Quentin Tarantino",
    "Martin Scorsese", "Christopher Nolan", "James Cameron", "Peter Jackson", "George Lucas", "Ridley Scott",
    "Alfred Hitchcock", "Stanley Kubrick", "Francis Ford Coppola", "Sergio Leone", "Federico Fellini",
    "Ennio Morricone", "Luciano Pavarotti", "Andrea Bocelli", "Laura Pausini", "Eros Ramazzotti",
    "Vasco Rossi", "Jovanotti", "Tiziano Ferro", "Pino Daniele", "Rino Gaetano", "Fabrizio De André",
    "Lucio Dalla", "Lucio Battisti", "Mina (cantante)", "Adriano Celentano", "Gianni Morandi", "Claudio Baglioni",
    "Renato Zero", "Antonello Venditti", "Francesco De Gregori", "Franco Battiato", "Enzo Jannacci", "Giorgio Gaber",
    "Colosseo", "Torre di Pisa", "Torre Eiffel", "Statua della Libertà", "Taj Mahal", "Grande muraglia cinese",
    "Machu Picchu", "Cristo Redentore", "Piramide di Cheope", "Stonehenge", "Acropoli di Atene", "Petra",
    "Chichén Itzá", "Angkor Wat", "Alhambra", "Sagrada Família", "Big Ben", "Tower Bridge", "London Eye",
    "Buckingham Palace", "Empire State Building", "Central Park", "Times Square", "Golden Gate Bridge",
    "Scritta Hollywood", "Monte Rushmore", "Grand Canyon", "Cascate del Niagara", "Monte Everest",
    "Monte Fuji", "Uluṟu", "Sydney Opera House", "Burj Khalifa", "Palm Jumeirah", "Marina Bay Sands",
    "Torri Petronas", "Taipei 101", "Monna Lisa", "La notte stellata", "L'urlo",
    # Add more to compensate for landscape filtering
    "Gheparto", "Rinoceronte", "Ippopotamo", "Bisonte", "Alce", "Cammello", "Dromedario", "Lama (animale)",
    "Puma", "Lince", "Coyote", "Iena", "Procione", "Castoro", "Tasso (animale)", "Moffetta", "Foca", "Tricheco",
    "Pellicano", "Gabbiano", "Albatro", "Cormorano", "Airone", "Cicogna", "Corvo", "Gazza", "Rondine", "Pettirosso",
    "Computer portatile", "Tastiera (informatica)", "Mouse", "Monitor", "Stampante", "Tablet computer",
    "Chitarra", "Pianoforte", "Violino", "Violoncello", "Contrabbasso", "Flauto", "Tromba", "Sassofono",
    "Batteria (strumento musicale)", "Tamburo", "Arpa", "Fisarmonica", "Armonica a bocca", "Xilofono",
    "Stadio", "Grattacielo", "Castello", "Ponte", "Faro (architettura)", "Cattedrale", "Moschea", "Tempio",
    "Spiaggia", "Montagna", "Vulcano", "Deserto", "Foresta", "Fiume", "Lago", "Cascata", "Ghiacciaio",
    "Tiramisù", "Lasagne", "Risotto", "Polenta", "Bruschetta", "Focaccia", "Piadina", "Arancino", "Cannolo",
    "Panna cotta", "Macaron", "Croissant", "Waffle", "Pancake", "Muffin", "Donut", "Cheesecake",
    "Dante Alighieri", "William Shakespeare", "Vincent van Gogh", "Pablo Picasso", "Claude Monet", "Salvador Dalí",
    "Galileo Galilei", "Isaac Newton", "Nikola Tesla", "Thomas Edison", "Marie Curie", "Charles Darwin",
    "Giulio Cesare", "Alessandro Magno", "Napoleone Bonaparte", "Cleopatra", "Giovanna d'Arco", "Winston Churchill",
    "Mahatma Gandhi", "Nelson Mandela", "Martin Luther King Jr.", "Madre Teresa di Calcutta", "Papa Giovanni Paolo II",
    "Bill Gates", "Steve Jobs", "Mark Zuckerberg", "Elon Musk", "Jeff Bezos",
    "Spiderman", "Batman", "Superman", "Iron Man", "Capitan America", "Thor", "Hulk", "Wolverine",
    "Darth Vader", "Luke Skywalker", "Yoda", "Han Solo", "Chewbacca", "Harry Potter", "Frodo Baggins",
    "Homer Simpson", "Topolino", "Paperino", "Pippo", "Bugs Bunny", "SpongeBob", "Goku", "Naruto", "Rufy"
]

def clean_answer(title):
    a = title.lower()
    if " (cantante)" in a: a = a.replace(" (cantante)", "")
    if " (animale)" in a: a = a.replace(" (animale)", "")
    if " (informatica)" in a: a = a.replace(" (informatica)", "")
    if " (strumento musicale)" in a: a = a.replace(" (strumento musicale)", "")
    if " (architettura)" in a: a = a.replace(" (architettura)", "")
    if " per cancellare" in a: a = a.replace(" per cancellare", "")
    if " a nastro" in a: a = a.replace(" a nastro", "")
    if " da denti" in a: a = a.replace(" da denti", "")
    if " computer" in a and "tablet" in a: a = a.replace(" computer", "")
    return a.strip()

out_data = []

chunk_size = 50
for i in range(0, len(items), chunk_size):
    chunk = items[i:i+chunk_size]
    titles = "|".join([urllib.parse.quote(c) for c in chunk])
    url = f"https://it.wikipedia.org/w/api.php?action=query&prop=pageimages&titles={titles}&pithumbsize=1000&format=json"
    
    req = urllib.request.Request(url, headers={'User-Agent': 'PartyHubGame/1.0'})
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            pages = data.get("query", {}).get("pages", {})
            for page_id, page_info in pages.items():
                if "thumbnail" in page_info:
                    title = page_info["title"]
                    thumb = page_info["thumbnail"]
                    img_url = thumb["source"]
                    width = thumb["width"]
                    height = thumb["height"]
                    
                    # FILTER FOR LANDSCAPE (width >= height * 1.05)
                    if width < height * 1.05:
                        continue
                    
                    ans = clean_answer(title)
                    answers = [ans]
                    # Also remove accents for alternatives
                    import unicodedata
                    ans_no_accents = ''.join(c for c in unicodedata.normalize('NFD', ans) if unicodedata.category(c) != 'Mn')
                    if ans_no_accents != ans:
                        answers.append(ans_no_accents)

                    if " " in ans:
                        answers.append(ans.replace(" ", ""))
                    if ans == "piramide di cheope": answers.extend(["piramidi di giza", "piramidi"])
                    if ans == "scritta hollywood": answers.extend(["hollywood sign", "hollywood"])
                    if ans == "grande muraglia cinese": answers.append("muraglia cinese")
                    if ans == "statua della libertà": answers.append("statua della liberta")
                    if ans == "monna lisa": answers.append("gioconda")
                    if ans == "darth vader": answers.append("fener")
                    if ans == "capitan america": answers.append("captain america")
                    if ans == "rufy": answers.append("luffy")
                    if ans == "winston churchill": answers.append("churchill")
                    
                    # Remove duplicates
                    answers = list(dict.fromkeys(answers))
                    
                    out_data.append({
                        "imageUrl": img_url,
                        "answers": answers
                    })
    except Exception as e:
        print(f"Error fetching chunk: {e}")
    time.sleep(0.5)

print(f"Successfully fetched {len(out_data)} landscape images.")

ts_content = "export interface IndovinaImmagineQuestion {\n  imageUrl: string;\n  answers: string[];\n}\n\n"
ts_content += "export const indovinaImmagineQuestions: IndovinaImmagineQuestion[] = [\n"

for idx, q in enumerate(out_data):
    ans_str = json.dumps(q["answers"], ensure_ascii=False)
    ts_content += "  {\n"
    ts_content += f"    imageUrl: \"{q['imageUrl']}\",\n"
    ts_content += f"    answers: {ans_str}\n"
    ts_content += "  }" + (",\n" if idx < len(out_data)-1 else "\n")

ts_content += "];\n"

with open("src/games/IndovinaImmagine/data.ts", "w", encoding="utf-8") as f:
    f.write(ts_content)

print("Done writing to data.ts!")
