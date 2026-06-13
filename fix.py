import os
import glob
files = glob.glob('e2e/**/*.spec.ts', recursive=True)
for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    new_content = content.replace("'./helpers/auth'", "'../helpers/auth'").replace("'./helpers/tenant'", "'../helpers/tenant'")
    with open(f, 'w', encoding='utf-8') as file:
        file.write(new_content)
