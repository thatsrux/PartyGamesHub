import re
from collections import defaultdict, Counter

with open(r'C:\Users\thatsrux\Desktop\Games\party-hub\src\games\Jeopardy\data.ts', 'r', encoding='utf-8') as f:
    content = f.read()
    q_count = len(re.findall(r'\"question\"\s*:', content))
    cats = re.findall(r'\"name\"\s*:\s*\"([^\"]+)\"', content)
    print(f'Jeopardy: {q_count} questions, {len(cats)} categories')
    
    lines = content.split('\n')
    current_diff = None
    diff_counts = defaultdict(int)
    for line in lines:
        m = re.search(r'\"(100|200|300|400|500)\"\s*:\s*\[', line)
        if m:
            current_diff = m.group(1)
        elif '\"question\"' in line and current_diff:
            diff_counts[current_diff] += 1
    print('Jeopardy by difficulty:', dict(diff_counts))

with open(r'C:\Users\thatsrux\Desktop\Games\party-hub\src\games\IndovinaImmagine\data.ts', 'r', encoding='utf-8') as f:
    content = f.read()
    q_count = len(re.findall(r'imageUrl\s*:', content))
    print(f'IndovinaImmagine: {q_count} questions')

with open(r'C:\Users\thatsrux\Desktop\Games\party-hub\src\games\Ordina\data.ts', 'r', encoding='utf-8') as f:
    content = f.read()
    q_count = len(re.findall(r'\"question\"\s*:', content))
    cats = re.findall(r'\"category\"\s*:\s*\"([^\"]+)\"', content)
    print(f'Ordina: {q_count} questions, Categories: {dict(Counter(cats))}')
