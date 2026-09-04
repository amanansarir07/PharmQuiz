import json

with open('data/questions/pharmacognosy.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

FIX = {
    "Penicillin and streptomycin are obtained from:": {1: "Animal endocrine glands and tissues", 2: "Deep sea mineral deposits", 3: "Marine fish liver oils"},
    "Ergot is a drug obtained from:": {1: "A marine brown alga used in pharmacy", 2: "A mineral deposit of sedimentary origin", 3: "An endocrine gland of the ox"},
    "Loss on drying of a crude drug measures:": {1: "The ash content of the drug sample", 2: "The volatile oil content present", 3: "The crude fiber content only"},
    "Bitterness value is used to evaluate drugs that act as:": {1: "Sedatives and hypnotic agents", 2: "Expectorant cough remedies", 3: "Antacid preparations"},
    "Microscopic measurement of plant cells and crystals is carried out with:": {1: "An ordinary ruler and measuring tape", 2: "A graduated laboratory measuring cylinder", 3: "A mercury barometer instrument"},
    "Belladonna herb consists of the:": {1: "Dried bark of the mature trunk", 2: "Ripe berries and their juice", 3: "Dried wood of the woody stem"},
    "Physostigmine is obtained from the:": {1: "Unripe capsules of opium poppy", 2: "Bark of Cinchona officinalis", 3: "Seeds of Strychnos nux-vomica"},
    "Glycyrrhizic acid on hydrolysis yields:": {1: "Sennosides together with glucose", 2: "Digoxin and digitoxose sugars", 3: "Amygdalin and benzaldehyde"},
    "Hesperidin, a flavonoid glycoside, is present in:": {1: "Roasted coffee bean kernels", 2: "Fermented cocoa bean nibs", 3: "Fresh peppermint leaves"},
    "Cardiac glycosides are used therapeutically for:": {1: "Hypertensive crisis management", 2: "Acute bronchial asthma attacks", 3: "Peptic ulcer disease therapy"},
    "The cold expression (scarification) method is used to obtain oil from:": {1: "Delicate rose petals and jasmine", 2: "Dried clove flower buds", 3: "Sandalwood heartwood chips"},
    "Oil of wintergreen is used externally as:": {1: "An oral antacid suspension", 2: "An intravenous anesthetic agent", 3: "A stimulant laxative preparation"},
    "Chemically, resins are:": {1: "Simple sugars and starch polysaccharides", 2: "Pure proteins of plant origin only", 3: "Salts of inorganic mineral acids"},
    "An oleo-resin is a combination of:": {1: "Fixed oil and gum together only", 2: "Resin and alkaloid together only", 3: "Sugar and mucilage together only"},
    "Colophony (rosin) is obtained from:": {1: "The latex of Papaver somniferum plant", 2: "The bark of Cinchona officinalis", 3: "The rhizome of Zingiber officinale"},
    "Capsaicin, the pungent principle of capsicum, is used as:": {1: "An oral antidiabetic drug", 2: "A cardiac stimulant drug", 3: "A stimulant laxative agent"},
    "Compound tincture of benzoin is used as:": {1: "An oral anticoagulant medicine", 2: "A laxative syrup preparation", 3: "An antidote for acute poisoning"},
    "Peru balsam is used in medicine as:": {1: "A cardiac glycoside preparation", 2: "A hypoglycemic agent for diabetes", 3: "A diagnostic reagent in laboratories"},
    "Fixed oils and fats are chemically:": {1: "Complex terpene hydrocarbon mixtures", 2: "Polysaccharide polymers of glucose", 3: "Protein complexes found in plants"},
    "Carrageenan is obtained from:": {1: "Brown algae of the Phaeophyceae class", 2: "Green algae of freshwater origin", 3: "Blue-green algae of the Cyanophyceae"},
    "Agar is used in pharmacy as:": {1: "A volatile oil source material", 2: "An alkaloidal precipitating reagent", 3: "A mineral filler substance"},
    "An example of a killed (inactivated) vaccine is:": {1: "BCG tuberculosis vaccine", 2: "MMR measles mumps rubella vaccine", 3: "Oral polio vaccine (OPV)"},
    "Bromelain is used therapeutically as:": {1: "An antidiabetic agent for diabetes", 2: "A local anesthetic agent", 3: "A laxative preparation"},
    "Urease is obtained from:": {1: "Pineapple stem latex", 2: "Germinated barley malt", 3: "The ox stomach lining"},
    "The first step in natural product drug discovery is:": {1: "Clinical trials in human volunteers", 2: "Marketing of the finished product", 3: "Filing of the product patent"},
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

with open('data/questions/pharmacognosy.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
print('changed:', changed)