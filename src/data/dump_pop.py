import json
d = json.load(open('vero_falso.json', encoding='utf-8'))
pop = [f"{i}: {q['text']} -> {q['answer']}" for i,q in enumerate(d) if q['category'] == 'Cultura Pop e Gossip']
with open('pop_check.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(pop))
