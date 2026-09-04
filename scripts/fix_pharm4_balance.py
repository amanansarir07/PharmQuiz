import json

with open('data/questions/pharmacology-i.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

FIX = {
    "The drug of choice for an acute severe asthma attack is:": {
        1: "Intravenous corticosteroids given as first-line treatment",
        2: "Oral theophylline tablets as the first choice",
        3: "Montelukast syrup used as the only therapy",
    },
    "Zileuton is a:": {
        1: "Selective beta-2 adrenergic receptor agonist",
        2: "Mast cell membrane stabilizing agent",
        3: "Systemic corticosteroid anti-inflammatory",
    },
    "Clarithromycin is commonly used in the treatment of:": {
        1: "Typhoid fever in endemic areas",
        2: "Uncomplicated urinary tract infections",
        3: "Scabies and lice infestations",
    },
    "Vancomycin is the drug of choice for infections caused by:": {
        1: "Escherichia coli urinary infections",
        2: "Candida albicans fungal infections",
        3: "Plasmodium falciparum malaria infection",
    },
}

changed = 0
for q in data:
    t = q['question_text']
    if t in FIX:
        ci = q['correct_index']
        for pos, text in FIX[t].items():
            if pos == ci:
                print('REFUSED overwrite correct in:', t)
                continue
            if q['options'][pos] != text:
                q['options'][pos] = text
                changed += 1

with open('data/questions/pharmacology-i.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
print('changed:', changed)