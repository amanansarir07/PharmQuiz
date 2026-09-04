import json
import re

with open('scripts/cog_orig.json', 'r', encoding='utf-8') as f:
    orig = json.load(f)
orig_texts = {q['question_text'] for q in orig}

planned = []
for fn in ['scripts/add_pharmacognosy3.py', 'scripts/add_pharmacognosy4.py']:
    with open(fn, 'r', encoding='utf-8') as f:
        src = f.read()
    planned += re.findall(r'"question_text":\s*"([^"]+)"', src)

print('planned entries:', len(planned))

vs_orig = [t for t in planned if t in orig_texts]
print('collided with ORIGINAL 241:', len(vs_orig))
for t in vs_orig:
    print('  ORIG-DUP:', t[:90])

from collections import Counter
counts = Counter(planned)
internal = [(t, c) for t, c in counts.items() if c > 1]
print('internal dupes within my batches:', len(internal))
for t, c in internal:
    print('  SELF-DUP x%d: %s' % (c, t[:90]))