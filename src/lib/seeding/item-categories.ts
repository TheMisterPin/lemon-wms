// prisma/seed/categories.ts
// 50 parent categories × 5 subcategories = 250 subcategories + 50 parents = 300 total records
// Run via: prisma.$transaction([...upserts]) inside your main seed function

import { type PrismaClient } from '@/generated/prisma'

// ---------------------------------------------------------------------------
// Data definition
// ---------------------------------------------------------------------------

interface SubCategory {
  code: string;
  name: string;
  handlingFlags?: string[];
}

interface ParentCategory {
  code: string;
  name: string;
  description: string;
  handlingFlags?: string[];
  children: SubCategory[];
}

const categories: ParentCategory[] = [
  {
    code: 'ELEC',
    name: 'Electronics',
    description: 'Consumer and industrial electronic devices and components',
    handlingFlags: ['FRAGILE'],
    children: [
      { code: 'KBDS', name: 'Keyboards' },
      { code: 'MNTR', name: 'Monitors', handlingFlags: ['FRAGILE'] },
      { code: 'CABL', name: 'Cables' },
      { code: 'BATT', name: 'Batteries' },
      { code: 'ADPT', name: 'Adapters' }
    ]
  },
  {
    code: 'APRL',
    name: 'Apparel',
    description: 'Clothing, footwear, and fashion accessories',
    children: [
      { code: 'SHRT', name: 'Shirts' },
      { code: 'TRSR', name: 'Trousers' },
      { code: 'FTWR', name: 'Footwear' },
      { code: 'OTWR', name: 'Outerwear' },
      { code: 'ACCS', name: 'Accessories' }
    ]
  },
  {
    code: 'FDBV',
    name: 'Food & Beverage',
    description: 'Dry, canned, and packaged food products',
    handlingFlags: ['PERISHABLE'],
    children: [
      { code: 'DRYG', name: 'Dry Goods' },
      { code: 'CANG', name: 'Canned Goods' },
      { code: 'BVRG', name: 'Beverages' },
      { code: 'SNCK', name: 'Snacks' },
      { code: 'CNDM', name: 'Condiments' }
    ]
  },
  {
    code: 'PHRM',
    name: 'Pharmaceuticals',
    description: 'Prescription and over-the-counter medicinal products',
    handlingFlags: ['PERISHABLE'],
    children: [
      { code: 'VTMN', name: 'Vitamins' },
      { code: 'ANTB', name: 'Antibiotics', handlingFlags: ['PERISHABLE'] },
      { code: 'ANLG', name: 'Analgesics' },
      { code: 'TPCL', name: 'Topicals' },
      { code: 'SPPL', name: 'Supplements' }
    ]
  },
  {
    code: 'FURN',
    name: 'Furniture',
    description: 'Office and domestic furniture items',
    handlingFlags: ['FRAGILE'],
    children: [
      { code: 'CHRS', name: 'Chairs' },
      { code: 'DESK', name: 'Desks' },
      { code: 'SHLV', name: 'Shelving' },
      { code: 'CBNT', name: 'Cabinets' },
      { code: 'TABL', name: 'Tables' }
    ]
  },
  {
    code: 'MCHN',
    name: 'Machinery',
    description: 'Industrial machines and heavy mechanical equipment',
    children: [
      { code: 'PUMP', name: 'Pumps' },
      { code: 'CMPR', name: 'Compressors' },
      { code: 'GNRT', name: 'Generators' },
      { code: 'MOTR', name: 'Motors' },
      { code: 'CNVR', name: 'Conveyors' }
    ]
  },
  {
    code: 'AUTO',
    name: 'Automotive',
    description: 'Vehicle parts, consumables, and accessories',
    children: [
      { code: 'ENGP', name: 'Engine Parts' },
      { code: 'TYRE', name: 'Automotive Tyres' },
      { code: 'BRAK', name: 'Brakes' },
      { code: 'FLTR', name: 'Filters' },
      { code: 'LGHT', name: 'Automotive Lighting' }
    ]
  },
  {
    code: 'CHEM',
    name: 'Chemicals',
    description: 'Industrial and commercial chemical substances',
    handlingFlags: ['HAZMAT'],
    children: [
      { code: 'SLVT', name: 'Solvents', handlingFlags: ['HAZMAT'] },
      { code: 'ADHV', name: 'Adhesives' },
      { code: 'LUBR', name: 'Lubricants' },
      { code: 'CLNR', name: 'Cleaners' },
      { code: 'ACID', name: 'Acids', handlingFlags: ['HAZMAT'] }
    ]
  },
  {
    code: 'MDEV',
    name: 'Medical Devices',
    description: 'Diagnostic, surgical, and monitoring medical equipment',
    handlingFlags: ['FRAGILE'],
    children: [
      { code: 'DGNX', name: 'Diagnostics', handlingFlags: ['FRAGILE'] },
      { code: 'SRGL', name: 'Surgical' },
      { code: 'MNTG', name: 'Monitoring' },
      { code: 'PPED', name: 'PPE' },
      { code: 'IMPL', name: 'Implants', handlingFlags: ['FRAGILE'] }
    ]
  },
  {
    code: 'TOOL',
    name: 'Tools',
    description: 'Hand, power, and precision tools for trade and industry',
    children: [
      { code: 'HNDL', name: 'Hand Tools' },
      { code: 'PWRT', name: 'Power Tools' },
      { code: 'MSRG', name: 'Measuring' },
      { code: 'CTNG', name: 'Cutting' },
      { code: 'FSTN', name: 'Tool Fasteners' }
    ]
  },
  {
    code: 'OFFC',
    name: 'Office Supplies',
    description: 'Stationery, paper, and general office consumables',
    children: [
      { code: 'STTN', name: 'Stationery' },
      { code: 'PAPR', name: 'Paper' },
      { code: 'FILG', name: 'Filing' },
      { code: 'PRNT', name: 'Printing' },
      { code: 'BNDG', name: 'Binding' }
    ]
  },
  {
    code: 'CLNG',
    name: 'Cleaning',
    description: 'Janitorial products, detergents, and hygiene supplies',
    children: [
      { code: 'DTGN', name: 'Detergents' },
      { code: 'MPBR', name: 'Mops & Brooms' },
      { code: 'DSNF', name: 'Disinfectants' },
      { code: 'WSTB', name: 'Waste Bags' },
      { code: 'SPRY', name: 'Sprays' }
    ]
  },
  {
    code: 'PKGN',
    name: 'Packaging',
    description: 'Boxes, wrapping, and packing materials',
    children: [
      { code: 'CRDB', name: 'Cardboard' },
      { code: 'FOAM', name: 'Foam' },
      { code: 'TAPE', name: 'Tape' },
      { code: 'WRAP', name: 'Wrap' },
      { code: 'LBLS', name: 'Labels' }
    ]
  },
  {
    code: 'LTNG',
    name: 'Lighting',
    description: 'Commercial and industrial lighting products',
    children: [
      { code: 'LEDD', name: 'LED' },
      { code: 'FLRS', name: 'Fluorescent' },
      { code: 'SPTL', name: 'Spotlights' },
      { code: 'BULB', name: 'Bulbs' },
      { code: 'FIXR', name: 'Fixtures' }
    ]
  },
  {
    code: 'HVAC',
    name: 'HVAC',
    description: 'Heating, ventilation, and air conditioning equipment',
    children: [
      { code: 'ARHN', name: 'Air Handlers' },
      { code: 'HVFL', name: 'HVAC Filters' },
      { code: 'THST', name: 'Thermostats' },
      { code: 'DUCT', name: 'Ducts' },
      { code: 'COIL', name: 'Coils' }
    ]
  },
  {
    code: 'PLMB',
    name: 'Plumbing',
    description: 'Pipes, fittings, valves, and plumbing accessories',
    children: [
      { code: 'PIPE', name: 'Pipes' },
      { code: 'VALV', name: 'Plumbing Valves' },
      { code: 'FTTG', name: 'Fittings' },
      { code: 'FCUT', name: 'Faucets' },
      { code: 'SEAL', name: 'Seals' }
    ]
  },
  {
    code: 'ELCL',
    name: 'Electrical',
    description: 'Wiring, panels, and electrical distribution components',
    children: [
      { code: 'WRNG', name: 'Wiring' },
      { code: 'BRKR', name: 'Breakers' },
      { code: 'OUTL', name: 'Outlets' },
      { code: 'PANL', name: 'Panels' },
      { code: 'SWTC', name: 'Switches' }
    ]
  },
  {
    code: 'SAFE',
    name: 'Safety Equipment',
    description: 'Personal protective equipment and workplace safety gear',
    children: [
      { code: 'HLMT', name: 'Helmets' },
      { code: 'GLVS', name: 'Gloves' },
      { code: 'HRNS', name: 'Harnesses' },
      { code: 'EYWR', name: 'Eyewear' },
      { code: 'ERPT', name: 'Ear Protection' }
    ]
  },
  {
    code: 'AGRI',
    name: 'Agricultural',
    description: 'Seeds, fertilisers, pesticides, and farm tools',
    handlingFlags: ['HAZMAT'],
    children: [
      { code: 'SEED', name: 'Seeds' },
      { code: 'FERT', name: 'Fertilisers' },
      { code: 'PEST', name: 'Pesticides', handlingFlags: ['HAZMAT'] },
      { code: 'IRGN', name: 'Irrigation' },
      { code: 'AGLT', name: 'Agricultural Tools' }
    ]
  },
  {
    code: 'BVCL',
    name: 'Beverages Cold',
    description: 'Refrigerated and cold-chain beverages',
    handlingFlags: ['COLD', 'PERISHABLE'],
    children: [
      { code: 'JUIC', name: 'Juices', handlingFlags: ['COLD', 'PERISHABLE'] },
      { code: 'DARY', name: 'Dairy Drinks', handlingFlags: ['COLD', 'PERISHABLE'] },
      { code: 'ENRG', name: 'Energy Drinks' },
      { code: 'WATR', name: 'Water' },
      { code: 'SMTH', name: 'Smoothies', handlingFlags: ['COLD', 'PERISHABLE'] }
    ]
  },
  {
    code: 'FRZN',
    name: 'Frozen Foods',
    description: 'Deep-frozen food products requiring cold-chain storage',
    handlingFlags: ['COLD', 'PERISHABLE'],
    children: [
      { code: 'MEAT', name: 'Meat', handlingFlags: ['COLD', 'PERISHABLE'] },
      { code: 'VGTB', name: 'Vegetables', handlingFlags: ['COLD', 'PERISHABLE'] },
      { code: 'RDML', name: 'Ready Meals', handlingFlags: ['COLD', 'PERISHABLE'] },
      { code: 'ICRM', name: 'Ice Cream', handlingFlags: ['COLD', 'PERISHABLE'] },
      { code: 'SFOD', name: 'Seafood', handlingFlags: ['COLD', 'PERISHABLE'] }
    ]
  },
  {
    code: 'CSMT',
    name: 'Cosmetics',
    description: 'Beauty, skincare, and personal care products',
    children: [
      { code: 'SKNC', name: 'Skincare' },
      { code: 'HARC', name: 'Haircare' },
      { code: 'MKUP', name: 'Makeup' },
      { code: 'FRGR', name: 'Fragrances' },
      { code: 'NALC', name: 'Nail Care' }
    ]
  },
  {
    code: 'SPRT',
    name: 'Sports Equipment',
    description: 'Gym, outdoor, and recreational sports gear',
    children: [
      { code: 'GYEQ', name: 'Gym Equipment' },
      { code: 'BALL', name: 'Balls' },
      { code: 'RCKT', name: 'Rackets' },
      { code: 'PTGR', name: 'Protective Gear' },
      { code: 'SWMW', name: 'Swimwear' }
    ]
  },
  {
    code: 'TOYS',
    name: 'Toys',
    description: 'Children\'s toys and games across all age groups',
    children: [
      { code: 'ACFG', name: 'Action Figures' },
      { code: 'PZZL', name: 'Puzzles' },
      { code: 'BRDG', name: 'Board Games' },
      { code: 'DOLL', name: 'Dolls' },
      { code: 'RMCT', name: 'Remote Control' }
    ]
  },
  {
    code: 'BKMR',
    name: 'Books & Media',
    description: 'Physical books, DVDs, and recorded media',
    children: [
      { code: 'TXTB', name: 'Textbooks' },
      { code: 'FICT', name: 'Fiction' },
      { code: 'NFCT', name: 'Non-Fiction' },
      { code: 'DVDS', name: 'DVDs' },
      { code: 'ADBK', name: 'Audiobooks' }
    ]
  },
  {
    code: 'PETS',
    name: 'Pet Supplies',
    description: 'Food, accessories, and healthcare for domestic animals',
    children: [
      { code: 'PTFD', name: 'Pet Food', handlingFlags: ['PERISHABLE'] },
      { code: 'PTAC', name: 'Pet Accessories' },
      { code: 'PTTY', name: 'Pet Toys' },
      { code: 'PTHC', name: 'Pet Healthcare' },
      { code: 'PTBD', name: 'Pet Bedding' }
    ]
  },
  {
    code: 'GRDN',
    name: 'Garden',
    description: 'Plants, soil, pots, and garden maintenance supplies',
    children: [
      { code: 'PLNT', name: 'Plants' },
      { code: 'SOIL', name: 'Soil' },
      { code: 'POTS', name: 'Pots' },
      { code: 'GTLS', name: 'Garden Tools' },
      { code: 'GFRT', name: 'Garden Fertiliser' }
    ]
  },
  {
    code: 'TYRS',
    name: 'Tyres',
    description: 'Passenger, commercial, and specialist vehicle tyres',
    children: [
      { code: 'PASN', name: 'Passenger Tyres' },
      { code: 'SUVT', name: 'SUV Tyres' },
      { code: 'TRCT', name: 'Truck Tyres' },
      { code: 'MSPT', name: 'Motorsport Tyres' },
      { code: 'WNTR', name: 'Winter Tyres' }
    ]
  },
  {
    code: 'BKRY',
    name: 'Bakery',
    description: 'Bread, pastries, cakes, and other baked goods',
    handlingFlags: ['PERISHABLE'],
    children: [
      { code: 'BRED', name: 'Bread', handlingFlags: ['PERISHABLE'] },
      { code: 'PSTR', name: 'Pastries', handlingFlags: ['PERISHABLE'] },
      { code: 'CAKE', name: 'Cakes', handlingFlags: ['PERISHABLE'] },
      { code: 'ROLL', name: 'Rolls', handlingFlags: ['PERISHABLE'] },
      { code: 'BSCT', name: 'Biscuits' }
    ]
  },
  {
    code: 'DIRY',
    name: 'Dairy',
    description: 'Milk, cheese, yogurt, and other dairy products',
    handlingFlags: ['COLD', 'PERISHABLE'],
    children: [
      { code: 'MILK', name: 'Milk', handlingFlags: ['COLD', 'PERISHABLE'] },
      { code: 'CHSE', name: 'Cheese', handlingFlags: ['COLD', 'PERISHABLE'] },
      { code: 'YGRT', name: 'Yogurt', handlingFlags: ['COLD', 'PERISHABLE'] },
      { code: 'BUTR', name: 'Butter', handlingFlags: ['COLD', 'PERISHABLE'] },
      { code: 'CREM', name: 'Cream', handlingFlags: ['COLD', 'PERISHABLE'] }
    ]
  },
  {
    code: 'RAWM',
    name: 'Raw Materials',
    description: 'Base industrial materials before processing',
    children: [
      { code: 'METL', name: 'Metals' },
      { code: 'PLST', name: 'Plastics' },
      { code: 'RUBR', name: 'Rubber' },
      { code: 'TMBR', name: 'Timber' },
      { code: 'GLAS', name: 'Glass', handlingFlags: ['FRAGILE'] }
    ]
  },
  {
    code: 'FAST',
    name: 'Fasteners',
    description: 'Bolts, screws, nuts, and mechanical joining hardware',
    children: [
      { code: 'BOLT', name: 'Bolts' },
      { code: 'SCRW', name: 'Screws' },
      { code: 'NUTS', name: 'Nuts' },
      { code: 'WSHR', name: 'Washers' },
      { code: 'RVTS', name: 'Rivets' }
    ]
  },
  {
    code: 'ADSL',
    name: 'Adhesives & Sealants',
    description: 'Bonding agents, epoxies, and sealant compounds',
    handlingFlags: ['HAZMAT'],
    children: [
      { code: 'EPXY', name: 'Epoxies' },
      { code: 'SLCN', name: 'Silicones' },
      { code: 'CULK', name: 'Caulks' },
      { code: 'HMLT', name: 'Hot Melt' },
      { code: 'THLK', name: 'Threadlockers' }
    ]
  },
  {
    code: 'BERN',
    name: 'Bearings',
    description: 'Ball, roller, and specialty mechanical bearings',
    children: [
      { code: 'BLBR', name: 'Ball Bearings' },
      { code: 'RLBR', name: 'Roller Bearings' },
      { code: 'THBR', name: 'Thrust Bearings' },
      { code: 'NDBR', name: 'Needle Bearings' },
      { code: 'SLBR', name: 'Sleeve Bearings' }
    ]
  },
  {
    code: 'VALX',
    name: 'Valves',
    description: 'Industrial and process flow control valves',
    children: [
      { code: 'GTLV', name: 'Gate Valves' },
      { code: 'BLLV', name: 'Ball Valves' },
      { code: 'CHKV', name: 'Check Valves' },
      { code: 'NEDV', name: 'Needle Valves' },
      { code: 'RLVV', name: 'Relief Valves' }
    ]
  },
  {
    code: 'INST',
    name: 'Instrumentation',
    description: 'Gauges, meters, and process monitoring instruments',
    handlingFlags: ['FRAGILE'],
    children: [
      { code: 'PRSG', name: 'Pressure Gauges', handlingFlags: ['FRAGILE'] },
      { code: 'FLMR', name: 'Flow Meters' },
      { code: 'THRM', name: 'Thermometers' },
      { code: 'LVLS', name: 'Level Sensors' },
      { code: 'TRSM', name: 'Transmitters' }
    ]
  },
  {
    code: 'NTWK',
    name: 'Networking',
    description: 'Network infrastructure hardware and cabling',
    children: [
      { code: 'RTER', name: 'Routers' },
      { code: 'SWCH', name: 'Network Switches' },
      { code: 'NCBL', name: 'Network Cables' },
      { code: 'ACPT', name: 'Access Points' },
      { code: 'PTPL', name: 'Patch Panels' }
    ]
  },
  {
    code: 'SRVR',
    name: 'Server Hardware',
    description: 'Data centre and rack-mount server components',
    handlingFlags: ['FRAGILE'],
    children: [
      { code: 'CPUS', name: 'CPUs', handlingFlags: ['FRAGILE'] },
      { code: 'RAMM', name: 'RAM' },
      { code: 'STRG', name: 'Storage Drives' },
      { code: 'PSUS', name: 'PSUs' },
      { code: 'MTBR', name: 'Motherboards', handlingFlags: ['FRAGILE'] }
    ]
  },
  {
    code: 'PRTS',
    name: 'Printing Supplies',
    description: 'Consumables for printers and imaging equipment',
    children: [
      { code: 'INKC', name: 'Ink Cartridges' },
      { code: 'TONR', name: 'Toner' },
      { code: 'DRUM', name: 'Drums' },
      { code: 'RBBN', name: 'Ribbons' },
      { code: 'PRLS', name: 'Paper Rolls' }
    ]
  },
  {
    code: 'SCTY',
    name: 'Security Systems',
    description: 'Surveillance cameras, alarms, and access control hardware',
    children: [
      { code: 'CAMR', name: 'Cameras' },
      { code: 'ALRM', name: 'Alarms' },
      { code: 'AXCT', name: 'Access Control' },
      { code: 'LOCK', name: 'Locks' },
      { code: 'SNSR', name: 'Sensors' }
    ]
  },
  {
    code: 'TXTL',
    name: 'Textiles',
    description: 'Raw and finished fabric materials',
    children: [
      { code: 'COTN', name: 'Cotton' },
      { code: 'PLYR', name: 'Polyester' },
      { code: 'WOOL', name: 'Wool' },
      { code: 'SILK', name: 'Silk' },
      { code: 'LINN', name: 'Linen' }
    ]
  },
  {
    code: 'FLRG',
    name: 'Flooring',
    description: 'Tiles, hardwood, laminate, and flooring materials',
    children: [
      { code: 'TILE', name: 'Tiles', handlingFlags: ['FRAGILE'] },
      { code: 'HDWD', name: 'Hardwood' },
      { code: 'LMNT', name: 'Laminate' },
      { code: 'CRPT', name: 'Carpet' },
      { code: 'VNYL', name: 'Vinyl' }
    ]
  },
  {
    code: 'PNTC',
    name: 'Paints & Coatings',
    description: 'Interior and exterior paints, primers, and surface treatments',
    handlingFlags: ['HAZMAT'],
    children: [
      { code: 'INTP', name: 'Interior Paints' },
      { code: 'EXTP', name: 'Exterior Paints' },
      { code: 'PRMR', name: 'Primers' },
      { code: 'VRNX', name: 'Varnishes', handlingFlags: ['HAZMAT'] },
      { code: 'STIN', name: 'Stains' }
    ]
  },
  {
    code: 'LBEQ',
    name: 'Lab Equipment',
    description: 'Scientific instruments and laboratory apparatus',
    handlingFlags: ['FRAGILE'],
    children: [
      { code: 'MCRP', name: 'Microscopes', handlingFlags: ['FRAGILE'] },
      { code: 'CNFG', name: 'Centrifuges' },
      { code: 'PPTT', name: 'Pipettes', handlingFlags: ['FRAGILE'] },
      { code: 'INCB', name: 'Incubators' },
      { code: 'SCLS', name: 'Scales' }
    ]
  },
  {
    code: 'MARN',
    name: 'Marine',
    description: 'Ropes, anchors, and marine safety equipment',
    children: [
      { code: 'ROPE', name: 'Ropes' },
      { code: 'ANCR', name: 'Anchors' },
      { code: 'LFJK', name: 'Life Jackets' },
      { code: 'NAVG', name: 'Navigation' },
      { code: 'BLGP', name: 'Bilge Pumps' }
    ]
  },
  {
    code: 'ARSP',
    name: 'Aerospace',
    description: 'Certified aerospace components and structural materials',
    handlingFlags: ['FRAGILE'],
    children: [
      { code: 'ASFT', name: 'Aerospace Fasteners' },
      { code: 'ASLS', name: 'Aerospace Seals' },
      { code: 'HYDL', name: 'Hydraulics' },
      { code: 'AVIO', name: 'Avionics', handlingFlags: ['FRAGILE'] },
      { code: 'CMPS', name: 'Composites' }
    ]
  },
  {
    code: 'RNEN',
    name: 'Renewable Energy',
    description: 'Solar, wind, and battery energy storage components',
    handlingFlags: ['FRAGILE'],
    children: [
      { code: 'SLPN', name: 'Solar Panels', handlingFlags: ['FRAGILE'] },
      { code: 'INVT', name: 'Inverters' },
      { code: 'RNBT', name: 'Renewable Batteries' },
      { code: 'WNDC', name: 'Wind Components' },
      { code: 'RNCA', name: 'Renewable Cables' }
    ]
  },
  {
    code: 'TLCM',
    name: 'Telecom',
    description: 'Telecommunications handsets, antennas, and signal hardware',
    children: [
      { code: 'HNDS', name: 'Handsets' },
      { code: 'SIMC', name: 'SIM Cards' },
      { code: 'ANTN', name: 'Antennas' },
      { code: 'AMPL', name: 'Amplifiers' },
      { code: 'CNNT', name: 'Connectors' }
    ]
  },
  {
    code: 'MING',
    name: 'Mining',
    description: 'Drill bits, PPE, and equipment for extraction operations',
    handlingFlags: ['HAZMAT'],
    children: [
      { code: 'DRBT', name: 'Drill Bits' },
      { code: 'EXPL', name: 'Explosives', handlingFlags: ['HAZMAT'] },
      { code: 'MNPE', name: 'Mining PPE' },
      { code: 'MNCV', name: 'Mining Conveyors' },
      { code: 'SMPL', name: 'Sampling Equipment' }
    ]
  },
  {
    code: 'WSTM',
    name: 'Waste Management',
    description: 'Containers, compactors, and waste processing equipment',
    handlingFlags: ['HAZMAT'],
    children: [
      { code: 'WSCN', name: 'Waste Containers' },
      { code: 'CMPC', name: 'Compactors' },
      { code: 'WSLR', name: 'Liners' },
      { code: 'SHRD', name: 'Shredders' },
      { code: 'SKIP', name: 'Skips' }
    ]
  }
]

// ---------------------------------------------------------------------------
// Seed function
// ---------------------------------------------------------------------------

/**
 * seedCategories.
 * @param prisma - Parameter for seedCategories.
 * @returns Result from seedCategories.
 */
export async function seedCategories(prisma: PrismaClient): Promise<{ parentCount: number, childCount: number }> {

  let parentCount = 0
  let childCount = 0

  for (const cat of categories) {
    // Upsert parent
    await prisma.itemCategory.upsert({
      where: { code: cat.code },
      update: {},
      create: {
        code: cat.code,
        name: cat.name,
        description: cat.description,
        hasChildren: true,
        parentCode: null,
        handlingFlags: cat.handlingFlags ?? []
      }
    })
    parentCount++

    // Upsert children
    for (const child of cat.children) {
      await prisma.itemCategory.upsert({
        where: { code: child.code },
        update: {},
        create: {
          code: child.code,
          name: child.name,
          hasChildren: false,
          parentCode: cat.code,
          handlingFlags: child.handlingFlags ?? []
        }
      })
      childCount++
    }
  }

  return { parentCount, childCount }
}
