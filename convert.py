import json

input = json.load(open("schools.json"))
output = open("schools-new.json", "w+")
out = []

for a in input:
    region_index = -1
    for b in range(len(out)):
        if out[b]["region_name"] == a["region"]:
            region_index = b

    if region_index == -1:
        out.append({"region_name": a["region"], "cities": [{"city_name": a["stad"], "schools": [{"name": a["namn"], "id": a["id"]}]}]})

    else:
        city_index = -1
        
        for c in range(len(out[region_index]["cities"])):
            if out[region_index]["cities"][c]["city_name"] == a["stad"]:
                city_index = c

        if city_index == -1:
            out[region_index]["cities"].append({"city_name": a["stad"], "schools": [{"name": a["namn"], "id": a["id"]}]})
        else:
            out[region_index]["cities"][city_index]["schools"].append({"name": a["namn"], "id": a["id"]})
            
json.dump(out, output)
