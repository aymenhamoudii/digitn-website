import re

current_file = ""
added_funcs = []
with open("core_diff.txt", "r", encoding="utf-8") as f:
    for line in f:
        if line.startswith("+++ "):
            current_file = line[4:].strip().split("\t")[0]
            if current_file.startswith("b/"):
                current_file = current_file[2:]
        elif line.startswith("+") and not line.startswith("+++"):
            code = line[1:].strip()
            if code.startswith("function ") or code.startswith("const ") and " = (" in code or code.startswith("const ") and " = async" in code:
                added_funcs.append(f"{current_file}: {code}")

for f in added_funcs:
    print(f)
