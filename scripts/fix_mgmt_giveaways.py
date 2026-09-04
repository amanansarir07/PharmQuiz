import json

with open('data/questions/pharmaceutical-management.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

fixes = {
    176: [
        "Dispensing tablets into individual unit-dose packets for ward use",
        "Sterilising glassware using two separate autoclave cycles",
        "Classifying drugs by their main pharmacological action",
    ],
    191: [
        "Competing brands of the same drug sold by different companies",
        "Raw materials such as binders used in tablet manufacturing",
        "Departments that work together inside a hospital pharmacy",
    ],
    199: [
        "Total cost of printing the brand label on every pack produced",
        "Number of different brand names a company has registered",
        "Weight of the packaging material used for the product",
    ],
    204: [
        "A register that records the daily sales of the pharmacy",
        "A booklet listing the side effects of all dispensed drugs",
        "The official licence required to import medicines into Nepal",
    ],
    210: [
        "Winning a government supply contract through a lucky draw",
        "Locating the cheapest warehouse space available in the city",
        "Predicting the weather for planning outdoor sales events",
    ],
    212: [
        "A pharmacy that is owned and run wholly by the government",
        "A pharmacy restricted to selling one manufacturer's products",
        "A mobile pharmacy van that serves areas without a fixed shop",
    ],
    216: [
        "The air quality and ventilation inside the proposed building",
        "The total number of doctors who have gone to work abroad",
        "The current exchange rate of foreign currencies in the market",
    ],
    225: [
        "Long-term profitability of the business over a five-year period",
        "Total sales of the pharmacy compared with the previous year",
        "The number of employees working in each branch of the firm",
    ],
    227: [
        "Tax is collected only once at the very end of the business year",
        "The customer pays the tax directly to the foreign supplier",
        "All medicines sold in the country are exempt from any tax",
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

with open('data/questions/pharmaceutical-management.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
print('fixed:', changed)
