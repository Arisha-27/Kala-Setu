import os

CACHE_TTL_HOURS = int(os.getenv("CACHE_TTL_HOURS", 6))

KEYWORDS_BY_CATEGORY = {
    "decor": [
    # Festival & ritual
    "handmade diya",
    "clay diya",
    "wall toran",
    "bandhanwar",
    "rangoli decor",
    "puja thali",
    "kalash decoration",
    "mandir decoration",
    "home temple decor",

    # Sustainable / local
    "eco friendly decor",
    "recycled decor",
    "handmade wall hanging",
    "macrame wall hanging",
    "bamboo decor",
    "jute decor items",

    # Home utility decor
    "table centerpiece decor",
    "handcrafted candle holders",
    "festival lights handmade",
    "brass decor items",
    "wooden home decor"
],

    "jewelry": [
    # Traditional
    "kundan earrings",
    "temple jewelry",
    "oxidized jewelry",
    "tribal jewelry",
    "meenakari jewelry",
    "silver ethnic jewelry",

    # Handmade
    "handmade earrings",
    "beaded necklace",
    "pearl jewelry",
    "thread jewelry",
    "fabric jewelry",

    # Occasion based
    "bridal jewelry",
    "wedding accessories",
    "festive jewelry",
    "gift jewelry"
],
    "textiles": [
    # Sarees & ethnic wear
    "handloom saree",
    "cotton saree",
    "silk saree",
    "block print saree",
    "ikat saree",
    "chanderi saree",

    # Daily wear
    "cotton kurti",
    "printed kurti",
    "embroidered kurti",
    "ethnic stoles",
    "embroidered dupatta",

    # Seasonal
    "woolen shawl",
    "winter ethnic wear",
    "festive clothing",

    # Sustainable
    "handwoven fabric",
    "sustainable fabric",
    "natural dyed fabric",
    "khadi clothing"
],
    "craft": [
    "handcrafted wooden items",
    "wooden toys",
    "lac bangles",
    "terracotta products",
    "clay pots",
    "brass utensils",
    "copper water bottle",
    "stone craft items",

    "handmade bags",
    "jute bags",
    "fabric tote bags",
    "handcrafted footwear",
    "kolhapuri chappal"
]


}

