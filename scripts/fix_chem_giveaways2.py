import json

with open('data/questions/pharmaceutical-chemistry-i.json', 'r', encoding='utf-8') as f:
    data = json.load(f)


def set_opts(q, a, b, c, d):
    """Set options preserving format; assumes array format questions in this file's new section."""
    q['options'] = [a, b, c, d]


fixes = {
    247: [
        'Purified zinc oxide free from any colorant',  # zinc oxide (calamine's color)
        'Hydrated calcium carbonate powder',            # wrong but close (carbonate)
        'Magnesium silicate with ferric oxide tint',    # talc-like pink mineral
    ],
    256: [
        'An effervescent laxative preparation',
        'A tablet disintegrating agent',
        'A local anesthetic for surface use',
    ],
    321: [
        'A standard sulphate solution treated with barium chloride',
        'A standard arsenic solution treated with hydrogen sulfide',
        'A dilute ferric chloride solution matched against iron standard',
    ],
    329: [
        'A standard chloride solution treated with dilute ammonia',
        'A standard sulphate solution treated with barium nitrate',
        'A standard lead solution treated with hydrogen sulfide',
    ],
    330: [
        'Measuring the exact volume of gas liberated in a reaction',
        'Determining the weight of precipitate formed after filtration',
        'Heating samples at controlled temperature for ignition',
    ],
    331: [
        'Total ash and acid-insoluble ash content of the sample',
        'The amount of organic impurities present in the substance',
        'Its refractive index and optical rotation value',
    ],
    344: [
        'Complexometric titration using disodium EDTA solution',
        'Precipitation titration employing silver nitrate reagent',
        'Acid-base titration using standard sodium hydroxide',
    ],
    349: [
        'Determining the melting point of solid substances accurately',
        'Measuring the density of liquids by specific gravity bottle',
        'Weighing precipitates with the help of an analytical balance',
    ],
    352: [
        'Their different solubilities in two immiscible solvents only',
        'Their different partition between moving and stationary liquid phases',
        'The different colors they develop with iodine vapor only',
    ],
    354: [
        'High-boiling non-volatile salts and inorganic metal complexes',
        'Heat-labile protein and enzyme molecules in biological fluids',
        'Water-insoluble polymer materials of high molecular weight',
    ],
}

changed = 0
for i, wrongs in fixes.items():
    q = data[i]
    c = q['options'][q['correct_index']]
    # keep correct option at same position, place wrongs in remaining slots
    pos = q['correct_index']
    others = [w for w in wrongs]
    if pos == 0:
        q['options'] = [c, others[0], others[1], others[2]]
    elif pos == 1:
        q['options'] = [others[0], c, others[1], others[2]]
    elif pos == 2:
        q['options'] = [others[0], others[1], c, others[2]]
    else:
        q['options'] = [others[0], others[1], others[2], c]
    q['correct_index'] = pos
    changed += 1

with open('data/questions/pharmaceutical-chemistry-i.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f'fixed: {changed}')
