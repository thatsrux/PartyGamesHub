import json
import sys

def load_data():
    with open('vero_falso.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def save_data(d):
    with open('vero_falso.json', 'w', encoding='utf-8') as f:
        json.dump(d, f, indent=2, ensure_ascii=False)

def main():
    if len(sys.argv) < 2:
        return
    cmd = sys.argv[1]
    d = load_data()
    
    if cmd == 'read':
        s, e = int(sys.argv[2]), int(sys.argv[3])
        for i, q in enumerate(d[s:e]):
            print(f"{s+i}: [{q['category']}] {q['text']} -> {q['answer']}")
    elif cmd == 'update':
        i = int(sys.argv[2])
        d[i]['text'] = sys.argv[3]
        if len(sys.argv) > 4:
            d[i]['answer'] = sys.argv[4]
        save_data(d)
        print(f"Updated {i}")
    elif cmd == 'check_sport':
        # Let's filter just the Sport ones
        for i, q in enumerate(d):
            if q['category'] == 'Sport':
                print(f"{i}: [{q['category']}] {q['text']} -> {q['answer']}")
                
if __name__ == '__main__':
    main()
