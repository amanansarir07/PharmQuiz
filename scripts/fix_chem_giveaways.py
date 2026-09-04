import json

with open('data/questions/pharmaceutical-chemistry-i.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

FIX = {
    "Phenol in small concentration is used as a preservative in:": {1: "Effervescent tablet formulations", 2: "Ointment base preparations", 3: "Oral syrup formulations only"},
    "Calamine is chemically a:": {1: "Pure zinc oxide powder", 2: "Calcium carbonate powder", 3: "Bismuth carbonate powder"},
    "Chlorinated lime is used as:": {1: "A sweetening agent for syrups", 2: "A tablet binding agent", 3: "A food coloring agent"},
    "Sodium hypochlorite solution is used as a:": {1: "Buffer solution for injections", 2: "Sweetening syrup base", 3: "Lubricating jelly base"},
    "Formaldehyde solution (formalin) is used as:": {1: "An oral sweetening agent", 2: "A tablet coloring agent", 3: "A mild analgesic drug"},
    "The recommended level of fluoride in community drinking water is about:": {1: "10-20 ppm in all supplies", 2: "100 ppm for safe use", 3: "500 ppm for best results"},
    "Stannous fluoride is commonly used as:": {1: "An antacid preparation", 2: "A laxative agent", 3: "A sweetening agent"},
    "Sodium monofluorophosphate is incorporated in toothpastes as:": {1: "A foaming detergent agent", 2: "A flavoring agent", 3: "An abrasive agent"},
    "Dilute hydrogen peroxide is used in mouthwashes as:": {1: "A local anesthetic agent", 2: "A sweetening agent", 3: "A tooth whitener only"},
    "A common side effect of oral ferrous sulphate therapy is:": {1: "Excessive salivation at night", 2: "Hair loss and baldness", 3: "Blurred vision in daylight"},
    "Iron deficiency anemia is treated with:": {1: "Vitamin B12 injections", 2: "Folic acid supplements alone", 3: "Erythropoietin injections only"},
    "Methylene blue is used as an antidote for:": {1: "Lead poisoning in children", 2: "Digitalis toxicity states", 3: "Morphine overdose cases"},
    "Potassium permanganate is used in poisoning as:": {1: "A chelating antidote agent", 2: "An emetic drug only", 3: "A central stimulant"},
    "The WHO-recommended ORS contains sodium chloride, potassium chloride, glucose and:": {1: "Magnesium sulphate heptahydrate", 2: "Calcium carbonate powder", 3: "Zinc sulphate crystals"},
    "Barium sulphate is used as an X-ray contrast agent for imaging the:": {1: "Brain tissue structures", 2: "Lung air spaces", 3: "Bone skeleton"},
    "The limit test for heavy metals compares the color produced with:": {1: "A standard chloride solution", 2: "A standard arsenic solution", 3: "Plain distilled water"},
    "Nessler's reagent is used in the limit test for:": {1: "Chloride ions present", 2: "Sulphate ions present", 3: "Iron ions present"},
    "The limit test for iron is based on the color produced by iron with:": {1: "Silver nitrate solution", 2: "Barium chloride solution", 3: "Mercuric chloride solution"},
    "In the limit test for chloride, the opalescence produced is compared with:": {1: "A standard sulphate solution", 2: "A standard lead solution", 3: "Plain distilled water"},
    "Nessler cylinders are used in limit tests for:": {1: "Measuring the volume of gas evolved", 2: "Weighing the precipitate formed", 3: "Filtration under vacuum"},
    "Loss on ignition of a substance mainly indicates:": {1: "Its heavy metal content", 2: "Its arsenic content", 3: "Its optical activity"},
    "Complexometric titration using EDTA is commonly employed to estimate:": {1: "Sodium and potassium ions", 2: "Chloride and bromide ions", 3: "Glucose and starch content"},
    "Eriochrome black T is the indicator used in the EDTA titration of:": {1: "Sodium ions in solution", 2: "Potassium ions in solution", 3: "Nitrate ions in solution"},
    "An example of a redox titration is the estimation of ferrous iron using:": {1: "EDTA solution titration", 2: "Silver nitrate titration", 3: "Barium chloride titration"},
    "Chromatography is a technique used for:": {1: "Measuring the melting point of solids", 2: "Determining the density of liquids", 3: "Weighing precipitates accurately"},
    "Adsorption chromatography separates components according to their:": {1: "Different molecular sizes only", 2: "Different boiling points only", 3: "Different colors only"},
    "Gas chromatography is mainly used for the analysis of:": {1: "Non-volatile salt compounds", 2: "Thermolabile protein molecules", 3: "Insoluble polymer materials"},
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

with open('data/questions/pharmaceutical-chemistry-i.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
print('changed:', changed)