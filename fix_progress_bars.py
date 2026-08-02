import re
import os

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. HostDisegnatore.tsx, HostFalsario.tsx, HostImpostore.tsx
    content = re.sub(
        r'(<ProgressBar\s+durationMs=\{[^}]+\})\s+(onComplete=)',
        r'\1 startTime={gameState.startTime} \2',
        content
    )
    
    content = re.sub(
        r'(<ProgressBar\s+durationMs=\{30000\})\s+(onComplete=)',
        r'\1 startTime={gameState.startTime} \2',
        content
    )

    # 2. Multi-line ProgressBar
    new_content = ""
    lines = content.splitlines()
    i = 0
    while i < len(lines):
        line = lines[i]
        if "<ProgressBar" in line and "startTime=" not in line:
            has_start_time = False
            for j in range(i, min(i+5, len(lines))):
                if "startTime=" in lines[j]:
                    has_start_time = True
                    break
            
            if not has_start_time:
                line = line.replace("<ProgressBar", "<ProgressBar startTime={gameState.startTime}")
        new_content += line + "\n"
        i += 1

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed {filepath}")

for root, _, files in os.walk("src/games"):
    for file in files:
        if file.endswith(".tsx"):
            fix_file(os.path.join(root, file))

print("Done fixing ProgressBars.")
