import json

with open('data/questions/pharmaceutics-i.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# index -> 3 expanded wrong options (correct stays put)
fixes = {
    219: [
        "An annual journal of new pharmaceutical research findings",
        "A Nepali formulary listing herbal medicine preparations",
        "A trade name of a particular drug manufacturing company",
    ],
    224: [
        "Replace the national drug laws of all member countries",
        "Fix a single retail price for medicines sold worldwide",
        "Compile the manufacturing trade secrets of drug companies",
    ],
    239: [
        "The balls melt down from the heat of constant friction",
        "The mill shell develops cracks from the heavy impacts",
        "The powder inside becomes sterile from the tumbling action",
    ],
    260: [
        "Electrical heating of the vapour stream rising up the column",
        "Mechanical stirring of the boiling liquid in the still pot",
        "A colour indicator that shows when the distillate is pure",
    ],
    264: [
        "Collected separately as the finest and purest alcohol fraction",
        "Used directly as the main medicinal alcohol product",
        "Returned unchanged to the fermenter for another cycle",
    ],
    265: [
        "Separates into distinct layers as soon as it is heated",
        "Never boils at any temperature however high the heat",
        "Contains only one single pure chemical component",
    ],
    281: [
        "Measure the surface tension of the formulated product",
        "Calculate the HLB value needed for a chosen emulsifier",
        "Determine the colour change of the drug on exposure to light",
    ],
    288: [
        "A purely aqueous solution that contains no alcohol at all",
        "A dried powdered drug filled into hard gelatin capsules",
        "A sterile suspension intended for use in the eye",
    ],
    292: [
        "The hair roots only, for colouring or cosmetic purposes",
        "The surface of tablets during the sugar-coating process",
        "The inside of infusion bottles before they are filled",
    ],
    304: [
        "The stomach lumen during the digestion of food",
        "The skin at the site where the drug is applied",
        "The lungs while the drug is being exhaled",
    ],
    307: [
        "Pharmacologically more active than the free unbound drug",
        "Excreted much faster by the kidney into the urine",
        "Always toxic regardless of the dose administered",
    ],
    314: [
        "A drug that shows its action only outside the living body",
        "A counterfeit medicine that is manufactured illegally",
        "A drug that never produces any pharmacological effect",
    ],
    324: [
        "Express the colour intensity of the drug solution",
        "Find the expiry date of the finished product",
        "Convert the drug weight from milligrams into grains",
    ],
}

changed = 0
for i, wrongs in fixes.items():
    q = data[i]
    assert len(q['options']) == 4 and q['correct_index'] in (0, 1, 2, 3)
    pos = q['correct_index']
    if pos == 0:
        q['options'] = [q['options'][0]] + wrongs
    elif pos == 1:
        q['options'] = [wrongs[0], q['options'][1], wrongs[1], wrongs[2]]
    elif pos == 2:
        q['options'] = [wrongs[0], wrongs[1], q['options'][2], wrongs[2]]
    else:
        q['options'] = wrongs + [q['options'][3]]
    changed += 1

with open('data/questions/pharmaceutics-i.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
print('fixed:', changed)
