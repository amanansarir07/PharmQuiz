import json

with open('data/questions/biochemistry-microbiology.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# index -> list of [correct, w1, w2, w3] in correct-position order handled below
fixes = {
    225: ("Analysis of blood, urine and other body fluids to diagnose and monitor disease", [
        "Dispensing prescribed medicines to patients across the pharmacy counter",
        "Large-scale manufacturing of tablets and capsules in the industry",
        "Supervision of inventory and accounts of a hospital pharmacy",
    ]),
    233: ("Fatty acids are oxidised rapidly during starvation or uncontrolled diabetes", [
        "Carbohydrates are eaten in far excess of the daily requirement",
        "Dietary protein intake is extremely high in the regular diet",
        "The body is fully hydrated with adequate stores of glucose",
    ]),
    240: ("Niacin (vitamin B3)", [
        "Vitamin C (ascorbic acid)",
        "Vitamin A (retinol)",
        "Vitamin K (phylloquinone)",
    ]),
    241: ("Intrinsic factor from the stomach is lacking, preventing B12 absorption", [
        "Vitamin B12 is not present in any food source at all",
        "The body produces too many red blood cells every day",
        "Iron is absorbed from the gut in excessive amounts",
    ]),
    244: ("Zymogen or proenzyme", [
        "Coenzyme (organic non-protein helper)",
        "Isoenzyme (multiple molecular forms)",
        "Apoenzyme (protein part of holoenzyme)",
    ]),
    255: ("A small circular extrachromosomal DNA molecule that replicates independently", [
        "The protein shell that surrounds and protects a virus particle",
        "A single strand of messenger RNA carrying the genetic code",
        "A lipid bilayer vesicle used for drug delivery experiments",
    ]),
    265: ("Bilirubin and dark-coloured urine with pale stools", [
        "No appreciable change in the colour or composition of the urine",
        "Large amounts of ketone bodies with an acetone-like smell",
        "Excess sodium chloride with very dilute and clear urine",
    ]),
    272: ("Diabetic ketoacidosis or prolonged fasting", [
        "A urinary tract infection causing pus and bacteria in the urine",
        "Drinking unusually large volumes of water during the day",
        "Chronic liver cirrhosis without any other metabolic problem",
    ]),
    277: ("Processing antigens and presenting them on their surface to T lymphocytes", [
        "Producing large quantities of antibodies against the invading antigen",
        "Engulfing and destroying the body's own red blood cells",
        "Clotting the blood rapidly at the site of an infection",
    ]),
    280: ("Combination vaccine containing toxoids and killed bacteria", [
        "A live attenuated vaccine prepared from weakened viruses",
        "A pure DNA vaccine encoding a single microbial protein",
        "A sugar solution containing no antigenic material at all",
    ]),
    282: ("The immune system destroys the insulin-producing beta cells of the pancreas", [
        "The kidneys fail to reabsorb glucose back into the blood",
        "The pancreas secretes insulin in greatly excessive amounts",
        "The liver loses its ability to store glucose as glycogen",
    ]),
    285: ("Detoxified bacterial toxin that retains its ability to stimulate immunity", [
        "A living weakened bacterium used as a vaccine against disease",
        "A type of white blood cell that destroys foreign proteins",
        "A serum protein that destroys antibodies in the circulation",
    ]),
    292: ("Disproving spontaneous generation and developing pasteurisation and vaccines", [
        "Discovering the double-helical structure of deoxyribonucleic acid",
        "Inventing the first compound microscope for observing cells",
        "Classifying all flowering plants into their natural families",
    ]),
    293: ("A mould (Penicillium) inhibited the growth of Staphylococcus bacteria", [
        "Bacteria could be grown in pure culture on solid media",
        "Viruses could pass through the finest porcelain filters",
        "Yeast ferments sugar to alcohol and carbon dioxide gas",
    ]),
    295: ("Microbial quality, sterility and safety of medicines and pharmaceutical products", [
        "Growing medicinal vegetables for large-scale drug extraction",
        "Studying the migration patterns of birds and other wildlife",
        "Designing and testing tablet compression machines for industry",
    ]),
    297: ("Antibiotics such as streptomycin and tetracyclines", [
        "Digoxin and digitoxin obtained from Digitalis plant leaves",
        "Morphine and codeine extracted from the opium poppy plant",
        "Human insulin prepared from genetically engineered plants",
    ]),
    303: ("Antibiotics, vitamins, alcohol and organic acids", [
        "Plastic packaging materials and glass containers for medicines",
        "Sterile glass ampoules and vials for injectable products",
        "Paper labels and cardboard boxes used for tablet strips",
    ]),
    304: ("Introducing solid culture media, pure culture technique and postulates to prove causation", [
        "Inventing the pasteurisation process for preserving milk",
        "Discovering the first vaccine against smallpox disease",
        "Describing the nucleus and organelles of plant cells",
    ]),
    308: ("Mycobacterium tuberculosis and leprosy bacilli", [
        "Streptococcus pyogenes causing throat infections",
        "Vibrio cholerae causing watery diarrhoea",
        "Neisseria meningitidis causing meningitis",
    ]),
    312: ("General-purpose (basal) medium supporting growth of most non-fastidious bacteria", [
        "A highly selective medium that grows only a single species",
        "A living tissue culture system used for growing viruses",
        "A medium used exclusively for growing bacteriophages",
    ]),
    319: ("Are highly resistant to heat, drying and disinfectants, surviving for years", [
        "Help the bacterium swim towards nutrients and away from poisons",
        "Enable the bacterium to photosynthesise using sunlight energy",
        "Are the reproductive gametes produced by the fungi",
    ]),
    330: ("Blood and cerebrospinal fluid", [
        "Skin and the surface of the upper respiratory tract",
        "Mouth and the whole of the gastrointestinal tract",
        "Large intestine of all healthy adult human beings",
    ]),
    332: ("Live beneficial microorganisms that improve the health of the host when consumed", [
        "Antibiotics that kill the normal bacteria of the gut",
        "Vaccines that protect against intestinal infections",
        "Digestive enzymes that break down lactose present in milk",
    ]),
    336: ("Presterilised disposable syringes, catheters and plastic products", [
        "Aqueous injections containing heat-stable antibiotics",
        "Culture media that contain serum and blood products",
        "Glass ampoules that are completely filled with fixed oils",
    ]),
    339: ("Cold sterilant for heat-sensitive instruments such as endoscopes", [
        "A general anaesthetic gas that is given by inhalation",
        "A sweetening agent used in sugar-coated tablets",
        "A radioactive tracer used in diagnostic imaging",
    ]),
    347: ("Prevent airborne microorganisms from contaminating sterile materials", [
        "Warm the culture media to body temperature before use",
        "Dry the cleaned glassware quickly before the experiment",
        "Sterilise the culture media by boiling them completely",
    ]),
    350: ("Potency or biological activity", [
        "Colour intensity of the antibiotic solution",
        "Molecular weight of the active ingredient",
        "Expiry date printed on the product label",
    ]),
    356: ("Amount of growth (turbidity or acid production) of the test organism", [
        "The colour developed by the vitamin in the solution",
        "The weight of the tablet or capsule sample taken",
        "The temperature at which the assay is conducted",
    ]),
    358: ("The reduction in turbidity (growth) of a broth culture of the test organism", [
        "The change in pH of the culture medium during incubation",
        "The weight of filter paper used to harvest the culture",
        "The fluorescence emitted by the antibiotic solution",
    ]),
    361: ("Standardise the turbidity (number of bacteria) of the inoculum", [
        "Calibrate the pH meter before the test is performed",
        "Weigh the antibiotic powder accurately for the assay",
        "Measure the diameter of the zone of inhibition",
    ]),
}

changed = 0
for i, (correct, wrongs) in fixes.items():
    q = data[i]
    assert len(q['options']) == 4, i
    # locate position of correct text
    pos = None
    for oi, o in enumerate(q['options']):
        if o.strip() == correct.strip():
            pos = oi
            break
    if pos is None:
        print('CORRECT NOT FOUND at', i, '->', q['question_text'][:50], '| opts:', q['options'])
        continue
    assert len(wrongs) == 3
    if pos == 0:
        q['options'] = [correct] + wrongs
    elif pos == 1:
        q['options'] = [wrongs[0], correct, wrongs[1], wrongs[2]]
    elif pos == 2:
        q['options'] = [wrongs[0], wrongs[1], correct, wrongs[2]]
    else:
        q['options'] = wrongs + [correct]
    changed += 1

with open('data/questions/biochemistry-microbiology.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
print('fixed:', changed)
