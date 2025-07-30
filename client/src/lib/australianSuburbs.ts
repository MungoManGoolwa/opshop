// Australian Suburbs Database for Location Search
// Contains major suburbs with coordinates for radius search functionality

export interface Suburb {
  name: string;
  state: string;
  postcode: string;
  latitude: number;
  longitude: number;
}

export const AUSTRALIAN_SUBURBS: Suburb[] = [
  // New South Wales - Major Cities and Suburbs
  { name: "Sydney", state: "NSW", postcode: "2000", latitude: -33.8688, longitude: 151.2093 },
  { name: "Bondi", state: "NSW", postcode: "2026", latitude: -33.8915, longitude: 151.2767 },
  { name: "Manly", state: "NSW", postcode: "2095", latitude: -33.7969, longitude: 151.2840 },
  { name: "Parramatta", state: "NSW", postcode: "2150", latitude: -33.8150, longitude: 151.0000 },
  { name: "Newcastle", state: "NSW", postcode: "2300", latitude: -32.9283, longitude: 151.7817 },
  { name: "Wollongong", state: "NSW", postcode: "2500", latitude: -34.4278, longitude: 150.8931 },
  { name: "Blue Mountains", state: "NSW", postcode: "2780", latitude: -33.7123, longitude: 150.3109 },
  { name: "Surry Hills", state: "NSW", postcode: "2010", latitude: -33.8886, longitude: 151.2094 },
  { name: "Paddington", state: "NSW", postcode: "2021", latitude: -33.8847, longitude: 151.2303 },
  { name: "Double Bay", state: "NSW", postcode: "2028", latitude: -33.8774, longitude: 151.2433 },
  { name: "Cronulla", state: "NSW", postcode: "2230", latitude: -34.0578, longitude: 151.1527 },
  { name: "Penrith", state: "NSW", postcode: "2750", latitude: -33.7506, longitude: 150.6938 },
  { name: "Blacktown", state: "NSW", postcode: "2148", latitude: -33.7688, longitude: 150.9061 },
  { name: "Campbelltown", state: "NSW", postcode: "2560", latitude: -34.0639, longitude: 150.8131 },
  { name: "Liverpool", state: "NSW", postcode: "2170", latitude: -33.9194, longitude: 150.9236 },
  { name: "Bankstown", state: "NSW", postcode: "2200", latitude: -33.9181, longitude: 151.0353 },
  { name: "Chatswood", state: "NSW", postcode: "2067", latitude: -33.7969, longitude: 151.1831 },
  { name: "Hornsby", state: "NSW", postcode: "2077", latitude: -33.7047, longitude: 151.0994 },
  { name: "Gosford", state: "NSW", postcode: "2250", latitude: -33.4269, longitude: 151.3428 },
  { name: "Port Macquarie", state: "NSW", postcode: "2444", latitude: -31.4308, longitude: 152.9089 },
  { name: "Coffs Harbour", state: "NSW", postcode: "2450", latitude: -30.2963, longitude: 153.1169 },
  { name: "Tweed Heads", state: "NSW", postcode: "2485", latitude: -28.1742, longitude: 153.5422 },
  { name: "Byron Bay", state: "NSW", postcode: "2481", latitude: -28.6474, longitude: 153.6020 },
  { name: "Lismore", state: "NSW", postcode: "2480", latitude: -28.8142, longitude: 153.2789 },
  { name: "Grafton", state: "NSW", postcode: "2460", latitude: -29.6917, longitude: 152.9322 },
  { name: "Tamworth", state: "NSW", postcode: "2340", latitude: -31.0927, longitude: 150.9306 },
  { name: "Armidale", state: "NSW", postcode: "2350", latitude: -30.5169, longitude: 151.6669 },
  { name: "Orange", state: "NSW", postcode: "2800", latitude: -33.2839, longitude: 149.0994 },
  { name: "Bathurst", state: "NSW", postcode: "2795", latitude: -33.4194, longitude: 149.5806 },
  { name: "Dubbo", state: "NSW", postcode: "2830", latitude: -32.2569, longitude: 148.6017 },
  { name: "Wagga Wagga", state: "NSW", postcode: "2650", latitude: -35.1183, longitude: 147.3669 },
  { name: "Albury", state: "NSW", postcode: "2640", latitude: -36.0737, longitude: 146.9135 },
  { name: "Broken Hill", state: "NSW", postcode: "2880", latitude: -31.9594, longitude: 141.4583 },

  // Victoria - Major Cities and Suburbs
  { name: "Melbourne", state: "VIC", postcode: "3000", latitude: -37.8136, longitude: 144.9631 },
  { name: "South Yarra", state: "VIC", postcode: "3141", latitude: -37.8403, longitude: 144.9875 },
  { name: "Richmond", state: "VIC", postcode: "3121", latitude: -37.8197, longitude: 144.9975 },
  { name: "St Kilda", state: "VIC", postcode: "3182", latitude: -37.8678, longitude: 144.9836 },
  { name: "Carlton", state: "VIC", postcode: "3053", latitude: -37.7986, longitude: 144.9675 },
  { name: "Fitzroy", state: "VIC", postcode: "3065", latitude: -37.7997, longitude: 144.9789 },
  { name: "Collingwood", state: "VIC", postcode: "3066", latitude: -37.8056, longitude: 144.9889 },
  { name: "Hawthorn", state: "VIC", postcode: "3122", latitude: -37.8225, longitude: 145.0308 },
  { name: "Toorak", state: "VIC", postcode: "3142", latitude: -37.8486, longitude: 145.0142 },
  { name: "Brighton", state: "VIC", postcode: "3186", latitude: -37.9067, longitude: 144.9939 },
  { name: "Frankston", state: "VIC", postcode: "3199", latitude: -38.1425, longitude: 145.1233 },
  { name: "Geelong", state: "VIC", postcode: "3220", latitude: -38.1499, longitude: 144.3617 },
  { name: "Ballarat", state: "VIC", postcode: "3350", latitude: -37.5622, longitude: 143.8503 },
  { name: "Bendigo", state: "VIC", postcode: "3550", latitude: -36.7570, longitude: 144.2794 },
  { name: "Shepparton", state: "VIC", postcode: "3630", latitude: -36.3803, longitude: 145.3953 },
  { name: "Warrnambool", state: "VIC", postcode: "3280", latitude: -38.3839, longitude: 142.4850 },
  { name: "Mildura", state: "VIC", postcode: "3500", latitude: -34.1872, longitude: 142.1617 },
  { name: "Horsham", state: "VIC", postcode: "3400", latitude: -36.7186, longitude: 142.1972 },
  { name: "Sale", state: "VIC", postcode: "3850", latitude: -38.1039, longitude: 147.0706 },
  { name: "Traralgon", state: "VIC", postcode: "3844", latitude: -38.1964, longitude: 146.5411 },
  { name: "Morwell", state: "VIC", postcode: "3840", latitude: -38.2347, longitude: 146.3981 },
  { name: "Dandenong", state: "VIC", postcode: "3175", latitude: -37.9875, longitude: 145.2131 },
  { name: "Cranbourne", state: "VIC", postcode: "3977", latitude: -38.0992, longitude: 145.2828 },
  { name: "Pakenham", state: "VIC", postcode: "3810", latitude: -38.0708, longitude: 145.4842 },
  { name: "Werribee", state: "VIC", postcode: "3030", latitude: -37.9019, longitude: 144.6656 },
  { name: "Sunbury", state: "VIC", postcode: "3429", latitude: -37.5761, longitude: 144.7267 },
  { name: "Melton", state: "VIC", postcode: "3337", latitude: -37.6836, longitude: 144.5781 },

  // Queensland - Major Cities and Suburbs
  { name: "Brisbane", state: "QLD", postcode: "4000", latitude: -27.4698, longitude: 153.0251 },
  { name: "Gold Coast", state: "QLD", postcode: "4217", latitude: -28.0167, longitude: 153.4000 },
  { name: "Cairns", state: "QLD", postcode: "4870", latitude: -16.9186, longitude: 145.7781 },
  { name: "Townsville", state: "QLD", postcode: "4810", latitude: -19.2590, longitude: 146.8169 },
  { name: "Toowoomba", state: "QLD", postcode: "4350", latitude: -27.5598, longitude: 151.9507 },
  { name: "Rockhampton", state: "QLD", postcode: "4700", latitude: -23.3781, longitude: 150.5069 },
  { name: "Mackay", state: "QLD", postcode: "4740", latitude: -21.1558, longitude: 149.1869 },
  { name: "Bundaberg", state: "QLD", postcode: "4670", latitude: -24.8661, longitude: 152.3489 },
  { name: "Hervey Bay", state: "QLD", postcode: "4655", latitude: -25.2986, longitude: 152.8536 },
  { name: "Gladstone", state: "QLD", postcode: "4680", latitude: -23.8469, longitude: 151.2569 },
  { name: "Mount Isa", state: "QLD", postcode: "4825", latitude: -20.7256, longitude: 139.4927 },
  { name: "Maryborough", state: "QLD", postcode: "4650", latitude: -25.5408, longitude: 152.7022 },
  { name: "Gympie", state: "QLD", postcode: "4570", latitude: -26.1908, longitude: 152.6656 },
  { name: "Warwick", state: "QLD", postcode: "4370", latitude: -28.2203, longitude: 152.0331 },
  { name: "Charleville", state: "QLD", postcode: "4470", latitude: -26.4069, longitude: 146.2611 },
  { name: "Roma", state: "QLD", postcode: "4455", latitude: -26.5706, longitude: 148.7864 },
  { name: "Chinchilla", state: "QLD", postcode: "4413", latitude: -26.7453, longitude: 150.6281 },
  { name: "Dalby", state: "QLD", postcode: "4405", latitude: -27.1831, longitude: 151.2619 },
  { name: "Kingaroy", state: "QLD", postcode: "4610", latitude: -26.5386, longitude: 151.8358 },
  { name: "Charters Towers", state: "QLD", postcode: "4820", latitude: -20.0700, longitude: 146.2619 },
  { name: "Emerald", state: "QLD", postcode: "4720", latitude: -23.5281, longitude: 148.1569 },
  { name: "Longreach", state: "QLD", postcode: "4730", latitude: -23.4403, longitude: 144.2492 },
  { name: "Biloela", state: "QLD", postcode: "4715", latitude: -24.4089, longitude: 150.5119 },
  { name: "Weipa", state: "QLD", postcode: "4874", latitude: -12.6767, longitude: 141.8703 },
  { name: "Thursday Island", state: "QLD", postcode: "4875", latitude: -10.5847, longitude: 142.2169 },

  // South Australia - Major Cities and Suburbs
  { name: "Adelaide", state: "SA", postcode: "5000", latitude: -34.9285, longitude: 138.6007 },
  { name: "North Adelaide", state: "SA", postcode: "5006", latitude: -34.9081, longitude: 138.5933 },
  { name: "Glenelg", state: "SA", postcode: "5045", latitude: -34.9803, longitude: 138.5131 },
  { name: "Port Adelaide", state: "SA", postcode: "5015", latitude: -34.8459, longitude: 138.5089 },
  { name: "Mount Barker", state: "SA", postcode: "5251", latitude: -35.0686, longitude: 138.8584 },
  { name: "Murray Bridge", state: "SA", postcode: "5253", latitude: -35.1197, longitude: 139.2731 },
  { name: "Victor Harbor", state: "SA", postcode: "5211", latitude: -35.5517, longitude: 138.6290 },
  { name: "Goolwa", state: "SA", postcode: "5214", latitude: -35.5173, longitude: 138.7846 },
  { name: "Whyalla", state: "SA", postcode: "5600", latitude: -33.0333, longitude: 137.5833 },
  { name: "Port Pirie", state: "SA", postcode: "5540", latitude: -33.1886, longitude: 138.0133 },
  { name: "Port Lincoln", state: "SA", postcode: "5606", latitude: -34.7289, longitude: 135.8658 },
  { name: "Mount Gambier", state: "SA", postcode: "5290", latitude: -37.8283, longitude: 140.7831 },
  { name: "Berri", state: "SA", postcode: "5343", latitude: -34.2806, longitude: 140.5983 },
  { name: "Renmark", state: "SA", postcode: "5341", latitude: -34.1747, longitude: 140.7453 },
  { name: "Loxton", state: "SA", postcode: "5333", latitude: -34.4486, longitude: 140.5706 },
  { name: "Clare", state: "SA", postcode: "5453", latitude: -33.8306, longitude: 138.6086 },
  { name: "Kadina", state: "SA", postcode: "5554", latitude: -33.9633, longitude: 137.7164 },
  { name: "Wallaroo", state: "SA", postcode: "5556", latitude: -33.9342, longitude: 137.6375 },
  { name: "Moonta", state: "SA", postcode: "5558", latitude: -34.0636, longitude: 137.5983 },
  { name: "Coober Pedy", state: "SA", postcode: "5723", latitude: -29.0139, longitude: 134.7544 },
  { name: "Roxby Downs", state: "SA", postcode: "5725", latitude: -30.5583, longitude: 136.8833 },
  { name: "Ceduna", state: "SA", postcode: "5690", latitude: -32.1281, longitude: 133.6764 },

  // Western Australia - Major Cities and Suburbs
  { name: "Perth", state: "WA", postcode: "6000", latitude: -31.9505, longitude: 115.8605 },
  { name: "Fremantle", state: "WA", postcode: "6160", latitude: -32.0569, longitude: 115.7425 },
  { name: "Mandurah", state: "WA", postcode: "6210", latitude: -32.5269, longitude: 115.7211 },
  { name: "Bunbury", state: "WA", postcode: "6230", latitude: -33.3267, longitude: 115.6411 },
  { name: "Geraldton", state: "WA", postcode: "6530", latitude: -28.7781, longitude: 114.6144 },
  { name: "Kalgoorlie", state: "WA", postcode: "6430", latitude: -30.7489, longitude: 121.4656 },
  { name: "Albany", state: "WA", postcode: "6330", latitude: -35.0269, longitude: 117.8842 },
  { name: "Broome", state: "WA", postcode: "6725", latitude: -17.9644, longitude: 122.2369 },
  { name: "Port Hedland", state: "WA", postcode: "6721", latitude: -20.3097, longitude: 118.6069 },
  { name: "Karratha", state: "WA", postcode: "6714", latitude: -20.7367, longitude: 116.8458 },
  { name: "Newman", state: "WA", postcode: "6753", latitude: -23.3597, longitude: 119.7333 },
  { name: "Carnarvon", state: "WA", postcode: "6701", latitude: -24.8797, longitude: 113.6633 },
  { name: "Northam", state: "WA", postcode: "6401", latitude: -31.6528, longitude: 116.6689 },
  { name: "York", state: "WA", postcode: "6302", latitude: -31.8869, longitude: 116.7683 },
  { name: "Esperance", state: "WA", postcode: "6450", latitude: -33.8597, longitude: 121.8911 },
  { name: "Collie", state: "WA", postcode: "6225", latitude: -33.3611, longitude: 116.1547 },
  { name: "Busselton", state: "WA", postcode: "6280", latitude: -33.6539, longitude: 115.3436 },
  { name: "Margaret River", state: "WA", postcode: "6285", latitude: -33.9544, longitude: 115.0717 },
  { name: "Denmark", state: "WA", postcode: "6333", latitude: -34.9597, longitude: 117.3508 },
  { name: "Mount Barker", state: "WA", postcode: "6324", latitude: -34.6286, longitude: 117.6689 },

  // Tasmania - Major Cities and Suburbs  
  { name: "Hobart", state: "TAS", postcode: "7000", latitude: -42.8821, longitude: 147.3272 },
  { name: "Launceston", state: "TAS", postcode: "7250", latitude: -41.4332, longitude: 147.1441 },
  { name: "Devonport", state: "TAS", postcode: "7310", latitude: -41.1789, longitude: 146.3494 },
  { name: "Burnie", state: "TAS", postcode: "7320", latitude: -41.0581, longitude: 145.9133 },
  { name: "Ulverstone", state: "TAS", postcode: "7315", latitude: -41.1564, longitude: 146.1683 },
  { name: "Glenorchy", state: "TAS", postcode: "7010", latitude: -42.8353, longitude: 147.2644 },
  { name: "Clarence", state: "TAS", postcode: "7018", latitude: -42.8878, longitude: 147.4822 },
  { name: "Kingston", state: "TAS", postcode: "7050", latitude: -42.9739, longitude: 147.3058 },
  { name: "New Norfolk", state: "TAS", postcode: "7140", latitude: -42.7822, longitude: 147.0558 },
  { name: "Sorell", state: "TAS", postcode: "7172", latitude: -42.7853, longitude: 147.5644 },
  { name: "George Town", state: "TAS", postcode: "7253", latitude: -41.1047, longitude: 146.8344 },
  { name: "Scottsdale", state: "TAS", postcode: "7260", latitude: -41.1575, longitude: 147.5169 },
  { name: "Smithton", state: "TAS", postcode: "7330", latitude: -40.8428, longitude: 145.1197 },
  { name: "Wynyard", state: "TAS", postcode: "7325", latitude: -40.9919, longitude: 145.7275 },
  { name: "Queenstown", state: "TAS", postcode: "7467", latitude: -42.0847, longitude: 145.5497 },
  { name: "Strahan", state: "TAS", postcode: "7468", latitude: -42.1558, longitude: 145.3289 },

  // Northern Territory - Major Cities and Towns
  { name: "Darwin", state: "NT", postcode: "0800", latitude: -12.4634, longitude: 130.8456 },
  { name: "Alice Springs", state: "NT", postcode: "0870", latitude: -23.6980, longitude: 133.8807 },
  { name: "Katherine", state: "NT", postcode: "0850", latitude: -14.4669, longitude: 132.2647 },
  { name: "Tennant Creek", state: "NT", postcode: "0860", latitude: -19.6494, longitude: 134.1844 },
  { name: "Nhulunbuy", state: "NT", postcode: "0880", latitude: -12.2086, longitude: 136.7717 },
  { name: "Jabiru", state: "NT", postcode: "0886", latitude: -12.6658, longitude: 132.8394 },
  { name: "Yulara", state: "NT", postcode: "0872", latitude: -25.2406, longitude: 130.9889 },
  { name: "Palmerston", state: "NT", postcode: "0830", latitude: -12.4833, longitude: 130.9833 },
  { name: "Humpty Doo", state: "NT", postcode: "0836", latitude: -12.5794, longitude: 131.1411 },
  { name: "Howard Springs", state: "NT", postcode: "0835", latitude: -12.4983, longitude: 131.0469 },
  { name: "Batchelor", state: "NT", postcode: "0845", latitude: -13.0506, longitude: 131.0269 },
  { name: "Pine Creek", state: "NT", postcode: "0847", latitude: -13.8183, longitude: 131.8367 },
  { name: "Mataranka", state: "NT", postcode: "0852", latitude: -14.9244, longitude: 133.0697 },
  { name: "Borroloola", state: "NT", postcode: "0854", latitude: -16.0744, longitude: 136.3044 },
  { name: "Elliot", state: "NT", postcode: "0862", latitude: -17.5419, longitude: 133.5419 },
  { name: "Ti Tree", state: "NT", postcode: "0872", latitude: -22.1169, longitude: 133.2419 },

  // Australian Capital Territory
  { name: "Canberra", state: "ACT", postcode: "2600", latitude: -35.2809, longitude: 149.1300 },
  { name: "Acton", state: "ACT", postcode: "2601", latitude: -35.2772, longitude: 149.1069 },
  { name: "Barton", state: "ACT", postcode: "2600", latitude: -35.3019, longitude: 149.1419 },
  { name: "Civic", state: "ACT", postcode: "2608", latitude: -35.2809, longitude: 149.1300 },
  { name: "Dickson", state: "ACT", postcode: "2602", latitude: -35.2508, longitude: 149.1397 },
  { name: "Gungahlin", state: "ACT", postcode: "2912", latitude: -35.1847, longitude: 149.1322 },
  { name: "Belconnen", state: "ACT", postcode: "2617", latitude: -35.2397, longitude: 149.0672 },
  { name: "Tuggeranong", state: "ACT", postcode: "2900", latitude: -35.4244, longitude: 149.0869 },
  { name: "Woden", state: "ACT", postcode: "2606", latitude: -35.3444, longitude: 149.0869 },
  { name: "Queanbeyan", state: "ACT", postcode: "2620", latitude: -35.3558, longitude: 149.2322 },
  { name: "Central Coast", state: "NSW", postcode: "2250", latitude: -33.4269, longitude: 151.3426 },
  
  // Victoria
  { name: "Melbourne", state: "VIC", postcode: "3000", latitude: -37.8136, longitude: 144.9631 },
  { name: "St Kilda", state: "VIC", postcode: "3182", latitude: -37.8677, longitude: 144.9811 },
  { name: "Richmond", state: "VIC", postcode: "3121", latitude: -37.8197, longitude: 144.9956 },
  { name: "Fitzroy", state: "VIC", postcode: "3065", latitude: -37.7986, longitude: 144.9781 },
  { name: "Geelong", state: "VIC", postcode: "3220", latitude: -38.1499, longitude: 144.3617 },
  { name: "Ballarat", state: "VIC", postcode: "3350", latitude: -37.5622, longitude: 143.8503 },
  { name: "Bendigo", state: "VIC", postcode: "3550", latitude: -36.7570, longitude: 144.2794 },
  { name: "Frankston", state: "VIC", postcode: "3199", latitude: -38.1421, longitude: 145.1218 },
  
  // Queensland
  { name: "Brisbane", state: "QLD", postcode: "4000", latitude: -27.4698, longitude: 153.0251 },
  { name: "Gold Coast", state: "QLD", postcode: "4217", latitude: -28.0167, longitude: 153.4000 },
  { name: "Sunshine Coast", state: "QLD", postcode: "4558", latitude: -26.6500, longitude: 153.0667 },
  { name: "Cairns", state: "QLD", postcode: "4870", latitude: -16.9186, longitude: 145.7781 },
  { name: "Townsville", state: "QLD", postcode: "4810", latitude: -19.2590, longitude: 146.8169 },
  { name: "Toowoomba", state: "QLD", postcode: "4350", latitude: -27.5598, longitude: 151.9507 },
  { name: "Rockhampton", state: "QLD", postcode: "4700", latitude: -23.3781, longitude: 150.5136 },
  
  // Western Australia
  { name: "Perth", state: "WA", postcode: "6000", latitude: -31.9505, longitude: 115.8605 },
  { name: "Fremantle", state: "WA", postcode: "6160", latitude: -32.0569, longitude: 115.7508 },
  { name: "Bunbury", state: "WA", postcode: "6230", latitude: -33.3267, longitude: 115.6369 },
  { name: "Mandurah", state: "WA", postcode: "6210", latitude: -32.5269, longitude: 115.7217 },
  { name: "Kalgoorlie", state: "WA", postcode: "6430", latitude: -30.7333, longitude: 121.4667 },
  { name: "Albany", state: "WA", postcode: "6330", latitude: -35.0275, longitude: 117.8840 },
  
  // Tasmania
  { name: "Hobart", state: "TAS", postcode: "7000", latitude: -42.8821, longitude: 147.3272 },
  { name: "Launceston", state: "TAS", postcode: "7250", latitude: -41.4332, longitude: 147.1441 },
  { name: "Devonport", state: "TAS", postcode: "7310", latitude: -41.1789, longitude: 146.3516 },
  { name: "Burnie", state: "TAS", postcode: "7320", latitude: -41.0545, longitude: 145.9092 },
  
  // Northern Territory
  { name: "Darwin", state: "NT", postcode: "0800", latitude: -12.4634, longitude: 130.8456 },
  { name: "Alice Springs", state: "NT", postcode: "0870", latitude: -23.6980, longitude: 133.8807 },
  { name: "Katherine", state: "NT", postcode: "0850", latitude: -14.4652, longitude: 132.2642 },
  
  // Australian Capital Territory
  { name: "Canberra", state: "ACT", postcode: "2600", latitude: -35.2809, longitude: 149.1300 },
  { name: "Tuggeranong", state: "ACT", postcode: "2900", latitude: -35.4244, longitude: 149.0931 },
  { name: "Belconnen", state: "ACT", postcode: "2617", latitude: -35.2388, longitude: 149.0628 },
];

// Search function with fuzzy matching
export function searchSuburbs(query: string): Suburb[] {
  const searchTerm = query.toLowerCase().trim();
  
  if (!searchTerm) return AUSTRALIAN_SUBURBS.slice(0, 10); // Return top 10 when empty
  
  return AUSTRALIAN_SUBURBS
    .filter(suburb => 
      suburb.name.toLowerCase().includes(searchTerm) ||
      suburb.state.toLowerCase().includes(searchTerm) ||
      suburb.postcode.includes(searchTerm)
    )
    .sort((a, b) => {
      // Prioritize exact matches
      const aExact = a.name.toLowerCase() === searchTerm;
      const bExact = b.name.toLowerCase() === searchTerm;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      // Then prioritize starts with
      const aStarts = a.name.toLowerCase().startsWith(searchTerm);
      const bStarts = b.name.toLowerCase().startsWith(searchTerm);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      
      // Finally alphabetical
      return a.name.localeCompare(b.name);
    })
    .slice(0, 20); // Limit to 20 results
}

// Calculate distance between two coordinates (Haversine formula)
export function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return distance;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI/180);
}

// Get suburbs within radius
export function getSuburbsWithinRadius(
  centerLat: number, 
  centerLon: number, 
  radiusKm: number
): Suburb[] {
  return AUSTRALIAN_SUBURBS.filter(suburb => {
    const distance = calculateDistance(centerLat, centerLon, suburb.latitude, suburb.longitude);
    return distance <= radiusKm;
  });
}