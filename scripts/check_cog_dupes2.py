import json
import re

with open('data/questions/pharmacognosy.json', 'r', encoding='utf-8') as f:
    now = json.load(f)
now_texts = {q['question_text'] for q in now}

planned = []
for fn in ['scripts/add_pharmacognosy3.py', 'scripts/add_pharmacognosy4.py']:
    with open(fn, 'r', encoding='utf-8') as f:
        src = f.read()
    # grab the question_text value from every q.append dict (handle any formatting)
    for m in re.finditer(r'"question_text"\s*:\s*"((?:[^"\\]|\\.)*)"', src):
        planned.append(m.group(1))

print('planned found by robust regex:', len(planned))

missing = [t for t in planned if t not in now_texts]
print('planned but NOT in file (skipped):', len(missing))
for t in missing:
    print('  SKIPPED:', t[:100])

# which of those exist in the original 241?
with open('scripts/cog_orig.json', 'r', encoding='utf-8') as f:
    orig = json.load(f)
orig_texts = {q['question_text'] for q in orig}
print('\nOf the skipped, present in ORIGINAL 241:', sum(1 for t in missing if t in orig_texts))