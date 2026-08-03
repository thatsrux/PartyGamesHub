import re
import os
import json

files = [
    r'C:\Users\thatsrux\Desktop\Games\party-hub\src\games\IndovinaImmagine\data.ts',
    r'C:\Users\thatsrux\Desktop\Games\party-hub\src\games\Jeopardy\data.ts',
    r'C:\Users\thatsrux\Desktop\Games\party-hub\src\games\Ordina\data.ts',
    r'C:\Users\thatsrux\Desktop\Games\party-hub\src\games\PiuVicinoVince\data.ts'
]

for f in files:
    if not os.path.exists(f): continue
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
        print(f'\n--- {os.path.basename(os.path.dirname(f))} ---')
        
        # count objects with id / question etc.
        # Jeopardy
        if 'Jeopardy' in f:
            # Questions are grouped by categories. Let's find points and categories
            diffs = re.findall(r'points:\s*(\d+)', content)
            from collections import Counter
            c = Counter(diffs)
            print(f'Jeopardy questions by points: {dict(c)}')
            
            cats = re.findall(r'title:\s*[\'\"`]?([^\'\"`,]+)[\'\"`]?,', content)
            print(f'Jeopardy categories ({len(cats)}): {cats[:5]}...')
            
        elif 'IndovinaImmagine' in f:
            items = re.findall(r'id:\s*[\'\"`]?([^\'\"`,]+)[\'\"`]?,', content)
            print(f'IndovinaImmagine items: {len(items)}')
            
        elif 'Ordina' in f:
            items = re.findall(r'id:\s*[\'\"`]?([^\'\"`,]+)[\'\"`]?,', content)
            print(f'Ordina items: {len(items)}')
            
        elif 'PiuVicinoVince' in f:
            items = re.findall(r'id:\s*[\'\"`]?([^\'\"`,]+)[\'\"`]?,', content)
            print(f'PiuVicinoVince items: {len(items)}')
