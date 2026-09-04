import json

with open('data/questions/public-health-pharmacy.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

fixes = {
    193: [
        "Coordination among the doctors of one hospital only",
        "Agreement between rival drug manufacturing companies",
        "The union of two private clinics into a single firm",
    ],
    195: [
        "Keep every patient permanently in the village health post",
        "Send all patients abroad for their medical treatment",
        "Stop patients from changing their treating doctor",
    ],
    198: [
        "The central ministry office located in Kathmandu",
        "The provincial health headquarters of their region",
        "Medical college operation theatres in the cities",
    ],
    200: [
        "Only branded imported medicines are supplied everywhere",
        "Medicines are sold only in private retail pharmacies",
        "Patients receive free cosmetics from health posts",
    ],
    205: [
        "The skin barrier that protects the susceptible host",
        "The microscope slide used in the laboratory",
        "The syringe used for giving immunisation",
    ],
    212: [
        "Total deaths in the whole country in one full year",
        "Number of cases recorded in the previous decade",
        "Ratio of males to females living in the village",
    ],
    213: [
        "Deaths that occur among hospitalised patients only",
        "Disease occurring in people with no contact at all",
        "The annual birth rate of the whole community",
    ],
    222: [
        "Kill all the bacteria in the water instantly",
        "Make the treated water taste naturally sweet",
        "Remove the dissolved fluoride from the water",
    ],
    223: [
        "Improve the colour of the treated water",
        "Soften the hard water completely",
        "Remove suspended sand particles",
    ],
    228: [
        "Burning all refuse in the open air",
        "Dumping waste into the nearest river",
        "Feeding the waste to stray animals",
    ],
    230: [
        "Collect rainwater for household drinking purposes",
        "Store solid waste before it is incinerated",
        "Breed fish for community nutrition programmes",
    ],
}

changed = 0
for i, wrongs in fixes.items():
    q = data[i]
    pos = q['correct_index']
    assert pos in (0, 1, 2, 3) and len(q['options']) == 4
    if pos == 0:
        q['options'] = [q['options'][0]] + wrongs
    elif pos == 1:
        q['options'] = [wrongs[0], q['options'][1], wrongs[1], wrongs[2]]
    elif pos == 2:
        q['options'] = [wrongs[0], wrongs[1], q['options'][2], wrongs[2]]
    else:
        q['options'] = wrongs + [q['options'][3]]
    changed += 1

with open('data/questions/public-health-pharmacy.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
print('fixed:', changed)
