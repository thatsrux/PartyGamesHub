import re
import os

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = re.sub(r'Date\.now\(\)', 'getServerTime()', content)
    
    if new_content != content:
        import_stmt = "import { getServerTime } from '../../utils/serverTime';\n"
        if import_stmt not in new_content and "import { getServerTime" not in new_content:
            parts = new_content.split('\n')
            last_import = 0
            for i, line in enumerate(parts):
                if line.startswith('import '):
                    last_import = i
            
            # calculate depth
            depth = filepath.count(os.sep) - 1 # src/games/X/X.tsx -> 2 dirs
            if 'party-hub' in filepath:
                # Need to be robust: src\games\...
                rel = os.path.relpath(filepath, "src")
                depth = rel.count(os.sep)
                prefix = '../' * depth
                stmt = f"import {{ getServerTime }} from '{prefix}utils/serverTime';"
            else:
                stmt = "import { getServerTime } from '../../utils/serverTime';"
            
            parts.insert(last_import + 1, stmt)
            new_content = '\n'.join(parts)
            
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed {filepath}")

for root, _, files in os.walk("src/games"):
    for file in files:
        if file.endswith(".tsx") or file.endswith(".ts"):
            fix_file(os.path.join(root, file))

print("Done replacing Date.now() with getServerTime().")
