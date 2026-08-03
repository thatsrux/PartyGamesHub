import json

def check_file():
    with open('c:/Users/thatsrux/Desktop/Games/party-hub/src/data/quiz4.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    errors = []
    for i, q in enumerate(data):
        opts = q['options']
        if q['correctIndex'] < 0 or q['correctIndex'] >= len(opts):
            errors.append(f"Index {i}: correctIndex out of bounds")
        
        if len(opts) != 4:
            errors.append(f"Index {i}: {len(opts)} options instead of 4")
            
        if len(set(opts)) != len(opts):
            errors.append(f"Index {i}: Duplicate options found - {opts}")
            
    if errors:
        for e in errors:
            print(e)
    else:
        print("Nessun errore di formattazione o duplicati trovato.")

if __name__ == '__main__':
    check_file()
