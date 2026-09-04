import json

with open('data/questions/pharmacotherapeutics-i.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# index -> (correct text, [3 fuller wrong options])
fixes = {
    218: ("Sodium valproate or lamotrigine", [
        "Levodopa combined with carbidopa",
        "Sumatriptan for acute migraine attacks",
        "Memantine used in Alzheimer's disease",
    ]),
    226: ("Dissolve the clot and restore blood flow if given within the treatment window", [
        "Prevent further seizures developing after the stroke",
        "Reduce intracranial bleeding inside the brain",
        "Lower the blood pressure rapidly in the ambulance",
    ]),
    240: ("Short-acting bronchodilators, oxygen, systemic corticosteroids and antibiotics when indicated", [
        "Immediate high-flow oxygen at fifteen litres per minute",
        "Withholding all bronchodilator medicines during the attack",
        "Giving sedatives to calm the distressed patient",
    ]),
    247: ("It is defined clinically by a productive cough on most days for at least three months in two consecutive years", [
        "It always requires lifelong antibiotic treatment",
        "It is a purely restrictive rather than obstructive disease",
        "It is caused only by bacterial infection of the airways",
    ]),
    248: ("Two months of intensive phase with four drugs, then four months of continuation phase", [
        "Six weeks of intensive treatment with two drugs only",
        "Twelve months of treatment with a single drug",
        "Three days of triple antibiotic therapy",
    ]),
    250: ("A third-generation cephalosporin such as ceftriaxone", [
        "Metronidazole used for anaerobic infections",
        "A topical antifungal applied to the skin",
        "An antimalarial drug such as chloroquine",
    ]),
    253: ("Life-threatening organ dysfunction caused by a dysregulated response to infection", [
        "Any fever occurring with an ordinary common cold",
        "A localised skin abscess that heals on its own",
        "High blood pressure that develops during infection",
    ]),
    254: ("Uncomplicated lower urinary tract infection (cystitis)", [
        "Pyelonephritis with high fever and flank pain",
        "Bacterial meningitis needing cerebrospinal fluid penetration",
        "Falciparum malaria needing blood-stage killing",
    ]),
    256: ("Liposomal amphotericin B or miltefosine", [
        "Chloroquine tablets for malaria treatment",
        "Doxycycline used for atypical pneumonia",
        "Ivermectin given for filarial infection",
    ]),
    258: ("Acyclovir given early in the illness", [
        "Amoxicillin for bacterial throat infections",
        "Metronidazole for anaerobic infections",
        "Chloroquine for malaria treatment",
    ]),
    260: ("Rabies vaccine together with rabies immunoglobulin into and around the wound", [
        "Oral antibiotics taken daily for one week",
        "A single dose of tetanus toxoid only",
        "Antimalarial treatment for one month",
    ]),
    261: ("Supportive care with fluids and paracetamol, avoiding NSAIDs and aspirin", [
        "Aggressive antibiotic therapy for all patients",
        "Corticosteroid pulses given to every patient",
        "Blood transfusion for every confirmed case",
    ]),
}

changed = 0
for i, (correct, wrongs) in fixes.items():
    q = data[i]
    assert len(q['options']) == 4, i
    pos = None
    for oi, o in enumerate(q['options']):
        if o.strip() == correct.strip():
            pos = oi
            break
    if pos is None:
        print('NOT FOUND at', i, '->', q['question_text'][:50])
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

with open('data/questions/pharmacotherapeutics-i.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
print('fixed:', changed)
