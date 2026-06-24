# -*- coding: utf-8 -*-
"""Build claim-safe copy spec for top 15 products (NVWA/EU compliant)."""
import json, os

man = {p['rank']: p for p in json.load(open('data/top15-manifest.json'))}

# Curated, brand-aligned accent per product (data-driven extract refined for punch/contrast)
ACCENT = {
 1:'#E84E4E', 2:'#3E9BD6', 3:'#E8602E', 4:'#2E9BD6', 5:'#E0791F',
 6:'#C8202E', 7:'#3CA63C', 8:'#E6A400', 9:'#1FA39C', 10:'#C8202E',
 11:'#36A85A', 12:'#8E2DB0', 13:'#E8487E', 14:'#5BB6E8', 15:'#A66A33',
}

def darken(hx, f=0.66):
    r=int(hx[1:3],16); g=int(hx[3:5],16); b=int(hx[5:7],16)
    return '#%02X%02X%02X' % (int(r*f), int(g*f), int(b*f))

# Editorial copy — claim-safe. health claims ONLY where EU-authorized (protein, creatine).
GEN_SUP = 'Voedingssupplement. Niet ter vervanging van een gevarieerde voeding en gezonde leefstijl. Buiten bereik van jonge kinderen bewaren.'
CAF = 'Bevat cafeïne. Niet aanbevolen voor kinderen en zwangere of borstvoedende vrouwen. Voedingssupplement — varieer je voeding.'
FOOD = 'Onderdeel van een gevarieerde, evenwichtige voeding en een gezonde leefstijl.'
CLAIM_PROT = 'Eiwitten dragen bij aan de groei en het behoud van spiermassa.¹'
CLAIM_CREA = 'Creatine verhoogt de fysieke prestatie bij opeenvolgende korte, zeer intensieve inspanningen.²'

COPY = {
 1:{'kicker':'Monohydraat · 100% puur','name':'CREATINE','sub':'Onbewerkt & smaakloos','flavor':'Smaakloos',
    'problem':'Elke dag je creatine vergeten?','solution':'1 schep (3 g) per dag. Smaakloos en snel oplosbaar.',
    'usps':['3 g monohydraat per schep','Smaakloos & fijn poeder','Mengt direct met water'],
    'claim':CLAIM_CREA,'legal':GEN_SUP+' ² Bij een dagelijkse inname van 3 g creatine.',
    'quote':'Topkwaliteit voor een eerlijke prijs. Lost perfect op.'},
 2:{'kicker':'Whey Protein · Eiwitten Maximaal','name':'WHEY PROTEIN','sub':'Eiwitten Maximaal','flavor':'Meerdere smaken',
    'problem':'Genoeg eiwitten halen op een drukke dag?','solution':'Eén shake = een flinke portie eiwitten. Klaar in 30 sec.',
    'usps':['Hoog eiwitgehalte per shake','Mixt romig & klontvrij','Keuze uit meerdere smaken'],
    'claim':CLAIM_PROT,'legal':GEN_SUP+' ¹ Geldt bij voldoende eiwitinname per dag.',
    'quote':'Mixt super en smaakt echt lekker. Snelle levering!'},
 3:{'kicker':'Proteïne ontbijtgranen','name':'PROTEIN POPS','sub':'Knapperige proteïne granen','flavor':'Crunchy',
    'problem':'Saai standaard ontbijt?','solution':'Knapperige protein pops met je (plantaardige) melk.',
    'usps':['Eiwitrijke ontbijtgranen','Knapperig & luchtig','Snel klaar in 1 minuut'],
    'claim':None,'legal':FOOD,'quote':'Eindelijk een ontbijt dat én lekker én handig is.'},
 4:{'kicker':'Extreme Pre-Workout','name':'TSUNAMI','sub':'Blue Watermelon','flavor':'Blue Watermelon',
    'problem':'Smaakloze pre-workouts beu?','solution':'Intens frisse smaak. Jouw vaste ritueel vóór de training.',
    'usps':['Volle, frisse smaak','Mengt helder & klontvrij','Ruime hoeveelheid scoops'],
    'claim':None,'legal':CAF,'quote':'Beste smaak die ik geprobeerd heb. Vaste keuze nu.'},
 5:{'kicker':'Extreme Pre-Workout','name':'APOCALYPSE','sub':'Intens smaakprofiel','flavor':'Bold flavour',
    'problem':'Toe aan een nieuwe favoriete smaak?','solution':'Pittig smaakprofiel. Jouw pre-lift ritueel.',
    'usps':['Intense, volle smaak','Lost snel & helder op','Ruime hoeveelheid scoops'],
    'claim':None,'legal':CAF,'quote':'Smaak is echt next level. Mengt perfect.'},
 6:{'kicker':'Protein Cheat Bar','name':'CHEAT BAR','sub':'Eiwitrijke reep','flavor':'Chocolade',
    'problem':'Trek in iets lekkers tussendoor?','solution':'Een eiwitrijke reep die smaakt als een cheat.',
    'usps':['Eiwitrijke snack','Smaakt als een candybar','Handig voor onderweg'],
    'claim':None,'legal':FOOD,'quote':'Smaakt veel te lekker voor een proteïnereep.'},
 7:{'kicker':'Extreme Pre-Workout','name':'MADLABS','sub':'Knallende smaak','flavor':'Sour candy',
    'problem':'Standaard smaken te flauw?','solution':'Knallend zuur-zoet smaakprofiel. Jouw pre-lift ritueel.',
    'usps':['Zuur-zoete smaakbom','Mengt helder & soepel','Ruime hoeveelheid scoops'],
    'claim':None,'legal':CAF,'quote':'Wat een smaak! Mengt zonder klontjes.'},
 8:{'kicker':'ORS-poeder · Elektrolyten','name':'ELECTROLYTE','sub':'Met natrium, kalium & magnesium','flavor':'Frisse smaak',
    'problem':'Veel zweten op intensieve of warme dagen?','solution':'ORS-poeder met natrium, kalium & magnesium. Frisse smaak.',
    'usps':['Natrium · kalium · magnesium','Lost snel op in water','Frisse, lichte smaak'],
    'claim':None,'legal':GEN_SUP,'quote':'Ideaal voor warme dagen en lange sessies.'},
 9:{'kicker':'Extreme Pre-Workout','name':'ANACONDA','sub':'Vol smaakprofiel','flavor':'Tropical',
    'problem':'Op zoek naar een nieuwe smaak?','solution':'Tropisch, vol smaakprofiel. Jouw pre-lift ritueel.',
    'usps':['Tropische, volle smaak','Mengt helder & klontvrij','Ruime hoeveelheid scoops'],
    'claim':None,'legal':CAF,'quote':'Tropische smaak is heerlijk. Vaste pre nu.'},
 10:{'kicker':'Weight Gainer','name':'BULK','sub':'Calorie- & eiwitrijke shake','flavor':'Meerdere smaken',
    'problem':'Moeite om genoeg calorieën binnen te krijgen?','solution':'Calorie- en eiwitrijke shake. Makkelijk extra binnenkrijgen.',
    'usps':['Calorie- & eiwitrijk','Romige, volle shake','Keuze uit meerdere smaken'],
    'claim':CLAIM_PROT,'legal':GEN_SUP+' ¹ Geldt bij voldoende eiwitinname per dag.',
    'quote':'Eindelijk makkelijk mijn calorieën halen. Lekker ook.'},
 11:{'kicker':'KSM-66 · Wortelextract','name':'ASHWAGANDHA','sub':'KSM-66 · 600 mg · Veganistisch','flavor':'Capsules',
    'problem':'Specifiek op zoek naar KSM-66?','solution':'600 mg KSM-66 wortelextract per dosering. Veganistisch.',
    'usps':['KSM-66 wortelextract','600 mg per dosering','Veganistische capsules'],
    'claim':None,'legal':GEN_SUP,'quote':'Fijne capsules, makkelijk in te nemen. Snelle levering.'},
 12:{'kicker':'Extreme Pre-Workout','name':'SAMURAI','sub':'Scherp smaakprofiel','flavor':'Berry blast',
    'problem':'Zin in een scherpe, frisse smaak?','solution':'Scherp bessen-smaakprofiel. Jouw pre-lift ritueel.',
    'usps':['Frisse bessensmaak','Lost helder & snel op','Ruime hoeveelheid scoops'],
    'claim':None,'legal':CAF,'quote':'Frisse smaak en mengt perfect. Aanrader.'},
 13:{'kicker':'Pre-Workout · 0 mg cafeïne','name':'OPGEPOMPT','sub':'Cafeïnevrij','flavor':'Cafeïnevrij',
    'problem':'Liever trainen zónder cafeïne?','solution':'Pre-workout zonder cafeïne. Volle smaak, elk moment van de dag.',
    'usps':['0 mg cafeïne','Geschikt voor avondtraining','Volle, frisse smaak'],
    'claim':None,'legal':GEN_SUP,'quote':'Perfect voor avondtrainingen zonder cafeïne.'},
 14:{'kicker':'Clear Whey · Heldere eiwitdrank','name':'CLEAR WHEY','sub':'Frisse, heldere shake','flavor':'Fruitig',
    'problem':'Geen zin in dikke, romige shakes?','solution':'Frisse, heldere eiwitdrank. Smaakt als limonade.',
    'usps':['Heldere, frisse drank','Fruitige smaken','Licht en niet vullend'],
    'claim':CLAIM_PROT,'legal':GEN_SUP+' ¹ Geldt bij voldoende eiwitinname per dag.',
    'quote':'Verfrissend en helemaal niet zwaar. Top in de zomer.'},
 15:{'kicker':'Protein IJskoffie','name':'IJSKOFFIE','sub':'Koffie met eiwitten','flavor':'Koffie',
    'problem':'Koffie én je eiwitten in één?','solution':'Frisse ijskoffie met eiwitten. Lekker koud, zo klaar.',
    'usps':['Koffie met eiwitten','Lekker koud te drinken','Snel klaar te maken'],
    'claim':None,'legal':FOOD,'quote':'Mijn vaste ochtendkoffie nu. Lekker en handig.'},
}

specs=[]
for r in range(1,16):
    m=man[r]; c=COPY[r]; acc=ACCENT[r]
    specs.append({
        'rank':r,'handle':m['handle'],'title':m['title'],'type':m['type'],
        'price':m['price'],'accent':acc,'accentDeep':darken(acc),
        'cutAbs':'file://'+os.path.abspath(m['cut']),
        **c,
    })
json.dump(specs, open('data/copy.json','w'), indent=2, ensure_ascii=False)
print('Wrote data/copy.json for', len(specs), 'products')
for s in specs: print(f" p{s['rank']:02d} {s['name']:14s} accent {s['accent']}  claim={'Y' if s['claim'] else '-'}")
