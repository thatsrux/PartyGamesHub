import json
import glob
import random

files = glob.glob(r'C:\Users\thatsrux\Desktop\Games\party-hub\src\data\piu_vicino_cat_*.json')

for fpath in files:
    with open(fpath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    for item in data:
        orig_min = item['min']
        orig_max = item['max']
        ans = item['answer']
        
        span = orig_max - orig_min
        if span <= 0:
            continue
            
        # pick a random offset percentage (either lower bound or upper bound heavy)
        if random.random() < 0.5:
            p = random.uniform(0.1, 0.35)
        else:
            p = random.uniform(0.65, 0.9)
            
        new_min = ans - (p * span)
        
        # Don't allow negative min if it was originally >= 0
        if orig_min >= 0 and new_min < 0:
            new_min = 0
            
        new_max = new_min + span
        
        # Rounding logic
        if span >= 5000:
            new_min = round(new_min / 1000) * 1000
            new_max = round(new_max / 1000) * 1000
        elif span >= 1000:
            new_min = round(new_min / 100) * 100
            new_max = round(new_max / 100) * 100
        elif span >= 50:
            new_min = round(new_min / 10) * 10
            new_max = round(new_max / 10) * 10
        else:
            new_min = round(new_min)
            new_max = round(new_max)
            
        # Edge case clamping to ensure ans is strictly within [new_min, new_max]
        if new_min >= ans:
            new_min = ans - (1 if span < 10 else int(span*0.1))
            if orig_min >= 0 and new_min < 0: new_min = 0
        
        if new_max <= ans:
            new_max = ans + (1 if span < 10 else int(span*0.1))
            
        item['min'] = new_min
        item['max'] = new_max

    with open(fpath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        
print("All files processed successfully.")
