const fs = require('fs');

let content = fs.readFileSync('src/data.ts', 'utf8');

const descriptions = {
  'p-stretch-film': `**Stretch film specs** cover material (LLDPE, LDPE), dimensions (thickness, width, length), performance (tensile strength, elongation, cling), and type (manual/hand, machine, pre-stretched, colored, VCI) for securing pallets/products, with key parameters like micron thickness (8-35µm), width (100-600mm), elongation (300-400%), and strength varying by grade for different applications.

**Key Specifications**
* **Material**: Primarily Linear Low-Density Polyethylene (LLDPE), sometimes blended with LDPE or cast/blown for specific properties.
* **Type**:
   * *Manual/Hand*: For lower volume, uses handheld dispensers (e.g., 18µm, 300% elongation).
   * *Machine*: For high-speed pallet wrappers, stronger (e.g., 1.5kg/25mm strength, 400% elongation).
   * *Pre-Stretched*: Thinner, already stretched for efficient application.
   * *Specialty*: Colored (black, blue, green), VCI (for metals), or UV-resistant.
* **Dimensions**: Thickness (8-35µm), Width (100-600mm), Length (100-1500m).
* **Performance Metrics**:
   * *Tensile Strength*: Measures resistance to breaking (e.g., 1-1.5 kg/25mm).
   * *Elongation*: Ability to stretch (e.g., 300-400%).
   * *Cling*: One-sided or two-sided (inner/outer).
   * *Tear Resistance*: Elmendorf tear strength (e.g., 400-500 GMS/Sht MD/TD).
* **Appearance**: Uniform, transparent (unless colored), free from defects like holes, streaks, or gels.
* **Core**: Paper core sizes (e.g., 76mm or 3-inch ID).

* **General Palletizing**: Standard LLDPE, 17-23µm thickness, good elongation and strength for unitizing loads.
* **Heavy/Pointy Loads**: Blown film with higher tear resistance.
* **Food/Pharma**: High clarity, possibly VCI for metal parts.`,

  'p-poly-bag': `A **poly bag's specification** details its material (LDPE, LLDPE, HDPE), dimensions (width, length, gauge/thickness in mils/microns), type (flat, gusseted, wicketed), strength (puncture, tensile, seal), color, and intended use, often adhering to standards like FDA compliance for food contact, with key metrics like density, vapor transmission, and clarity defining performance. Key specs include thickness (e.g., 1-2 mil for light, 4-6 mil for heavy-duty), material (polyethylene types), and dimensional tolerances, crucial for matching the bag to its packaging purpose, from light retail to industrial storage.

**Key Specification Categories**
* **Material**:
   * *LDPE (Low-Density Polyethylene)*: Common for general use, flexible.
   * *LLDPE (Linear Low-Density Polyethylene)*: Offers better tear/puncture resistance.
   * *HDPE (High-Density Polyethylene)*: Strong, often used for stronger, thinner bags.
   * *Blends*: Combinations for specific properties.
* **Dimensions & Thickness (Gauge)**:
   * *Thickness (Mil/Gauge)*: 1-2 mil (light duty), 3 mil (medium), 4-6+ mil (heavy duty).
   * *Dimensions*: Width (flat or layflat), Length (L), Gusset (if applicable).
* **Physical Properties**:
   * *Tensile Strength (MD/TD)*: Machine Direction vs. Transverse Direction strength (ASTM D882).
   * *Puncture Resistance*: Ability to resist piercing (e.g., >12 lbs for 3mil).
   * *Heat Seal Strength*: Seal integrity (e.g., >10 lbs/inch for 3mil).
   * *Density*: (e.g., 0.92-0.98 g/cm³).
   * *MVTR (Material Vapor Transmission Rate)*: Moisture barrier quality.
* **Bag Type/Structure**:
   * *Flat Bags*: Simple, often side-weld.
   * *Gusseted*: Expandable sides for volume.
   * *Wicketed*: Stacked on a wire 'wicket' for automated packing.
   * *U-Shaped/Vest Type*: For carry/retail.
* **Additives & Features**:
   * *Color*: Clear, white, black inner (for privacy).
   * *Anti-Static*: Prevents static cling.
   * *Food Grade*: Complies with FDA regulations (21 CFR).

**Example Specification Breakdown (LDPE Bag)**
* **Material**: LDPE/LLDPE.
* **Thickness**: 3 mil (± 10%).
* **Dimensions**: 10" x 13" (example).
* **Puncture Resistance**: ≥ 12 lbs (ASTM D374).
* **Seal Strength**: ≥ 10 lbs/inch (ASTM D374).
* **Color**: Clear.
* **Use**: General packaging, food storage.`,

  'p-polybox': `"Poly Box" is a general term for a container made from a type of plastic resin, typically polypropylene (PP) or polycarbonate (PC). Due to the variety of applications (from small electronic enclosures to large industrial shipping crates), the specifications vary widely based on the intended use.

Below are specifications for two common types of "Poly Boxes":

**Industrial Foldable Container (e.g., for Automobile Parts)**  
This type is a heavy-duty, large container designed for logistics and warehousing.
* **Material**: Polypropylene (PP)
* **Dimensions**: Typically large, e.g., 1200 x 800 x 950 mm (L x W x H)
* **Capacity (Volume)**: Around 755 Liters
* **Weight**: Approx. 30 kg
* **Load Capacity**:
  * *Maximum/Static Load*: 4000 kg
  * *Dynamic Load*: 1200 kg
  * *Maximum Upload (single use)*: 600 kg
* **Features**:
  * Foldable design to save space when empty
  * Four-way entry for pallet jacks/forklifts
  * Resistant to acids and temperature variations (-20°C to 45°C)
  * Washable at up to 90°C

**Electrical/Electronic Enclosure (e.g., Control Box, Terminal Box)**  
This type is a smaller, robust, and often weatherproof box used to house sensitive components.
* **Material**: Polycarbonate (PC) resin, known for high impact resistance
* **Dimensions**: Wide range of sizes, e.g., 120 x 80 x 75.2 mm (external L x W x H)
* **Protection Grade (IP Rating)**: Typically IP65, meaning it is dust-tight and protected against water jets
* **Color**: Often light gray or white-gray, with options for opaque or transparent lids
* **Operating Temperature Range**: -20°C to +75°C
* **Features**:
  * Self-extinguishing (UL94 V-2 standard)
  * Can include knockouts for wiring
  * Designed for wall mounting without external legs`,

  'p-vci-polybag': `**VCI poly bags** are special plastic bags with embedded Vapor Corrosion Inhibitors that protect metal parts from rust/corrosion during storage/shipping by releasing protective molecules, available in custom sizes, colors (blue/yellow/clear), thicknesses (75-500 microns), and formats (bags, sheets, rolls), offering high strength, water resistance, and anti-corrosion properties for various industries. Key specs include thickness, dimensions (width x length), material (VCI additives), and physical properties like tensile strength and tear resistance, with custom printing often available.

**Key Product Specifications**:
* **Material**: Polyethylene film with integrated VCI chemicals.
* **Protection**: Inhibits corrosion on ferrous and non-ferrous metals by forming a protective layer, preventing rust from moisture/oxygen.
* **Thickness**: Typically ranges from 75 to 500 microns (or 4 MIL for heavy duty), often 90-150 GSM.
* **Sizes**: Customizable; available in widths from 2" to 200" and any length, including rolls and sheets.
* **Colors**: Common options include Blue, Yellow, and Transparent, allowing visibility of contents.
* **Formats**: Can be supplied as flat bags, gusseted bags, sheets, or rolls.
* **Printing**: Options for custom printing, often up to 8 colors.
* **Features**: High strength, good tear resistance, water resistance, and non-toxic/recyclable options.

**Common Applications**:
* Automotive parts, aerospace components, electronics, machinery, and military equipment.

**How They Work**:
* VCI molecules vaporize from the bag's surface, filling the enclosed space and creating a thin, invisible film on metal surfaces, stopping the electrochemical corrosion process.`,

  'p-vci-polybox': `A **VCI Polybox** (Volatile Corrosion Inhibitor Polyethylene Box/Bag) is a specialized packaging product designed to protect metal items from rust and corrosion during storage and transport by releasing anti-corrosive vapors within an enclosed space. The term "Polybox" often refers to a large, box-shaped or gusseted VCI poly bag designed to line a box or crate.

**Key Specifications & Features**
Specifications for VCI Polyboxes can vary by manufacturer and specific application, but generally include the following characteristics:
* **Material**: Typically manufactured from high-quality virgin resins such as LDPE (Low-Density Polyethylene) or HDPE (High-Density Polyethylene) impregnated with VCI chemicals.
* **Protection Mechanism**: Releases VCI molecules that vaporize and condense on all exposed metal surfaces, forming a microscopic protective layer that blocks the electrochemical reactions causing corrosion.
* **Protection Against**: Rust, tarnish, stains, white rust, moisture, condensation, salt, and atmospheric contaminants.
* **Metals Protected**: Suitable for a variety of ferrous and non-ferrous metals, including carbon steels, cast iron, galvanized steel, stainless steel, aluminum, copper, brass, and silver.
* **Physical Properties**:
  * *Thickness*: Commonly available in various thicknesses, ranging from 2.5 mil to 4 mil (approx. 75 to 500 microns), with customizable options.
  * *Color & Transparency*: Often transparent or tinted (blue, yellow, green) for easy visual inspection of contents without opening the package.
  * *Strength*: Designed with high tensile strength and tear resistance for durability during shipping and handling.
* **Shelf Life & Protection Duration**:
  * *Shelf Life (unopened)*: Up to 12 months when stored in original airtight packaging.
  * *Protection Duration (in use)*: Provides effective corrosion protection for up to 2–5 years when sealed properly.
* **Usability & Safety**:
  * *Ready for Use*: Eliminates the need for applying messy oils or greases, meaning metal parts are ready for use immediately upon removal.
  * *Safety*: Non-toxic, free of nitrites, phosphates, and heavy metals.
  * *Environmental*: Recyclable and sometimes available in biodegradable options.

**Available Forms and Styles**
VCI Polyboxes come in different configurations to suit various packaging needs:
* Flat bags
* Gusseted bags (3D/box shape)
* Perforated bags on rolls
* Tubing
* Custom-sized shrouds`,

  'p-shrink-film': `An **LDPE (Low-Density Polyethylene) shrink film specification** details its physical properties like thickness (microns), clarity, shrinkage percentage (MD/TD), and tensile strength, alongside material grade (virgin/prime), density, and application-specific features like perforation or UV resistance, ensuring it provides durable, moisture-resistant packaging with good seal integrity for various products. Key parameters often include density (around 0.922 kg/m³), high elongation, and specific heat shrink temperatures (150-190°C), with thickness varying from 20-100 microns typically.

**Key Specification Parameters**
* **Material Grade**: Premium Virgin LDPE.
* **Color/Clarity**: Natural/Transparent (High Clarity).
* **Thickness**: Commonly 40-80 microns, though can range from 20-150 microns.
* **Density**: Around 922-930 kg/m³.
* **Shrinkage**: Machine Direction (MD) 70-80%, Transverse Direction (TD) 15-30% (Biaxial films).
* **Tensile Strength (MPa)**: MD: 22-30 MPa, TD: 18-25 MPa (varies with thickness).
* **Elongation at Break**: MD/TD >450%.
* **Melt Flow Index (MFI)**: Low, e.g., 0.3-0.8 g/10min.
* **Haze**: Low, <15%.
* **Slip Coefficient (COF)**: Low (e.g., <0.20 for high slip).

**Common Features & Applications**
* **Perforations**: Needle perforations to release trapped air during shrinking (for open-end packs).
* **Sealing**: Can be 3-sided seal or completely closed (bi-axial).
* **Protection**: Excellent moisture barrier, dust resistance, good protection.
* **Temperature**: Shrink temperature profile (e.g., 150°C - 190°C).
* **Applications**: Bundling, product protection for small to large items, attractive packaging.

**Example Specification Snapshot**
* **Product**: LDPE Biaxial Shrinkable Film, Needle Perforated.
* **Thickness**: 50 microns (uniform).
* **Tensile Strength**: MD: 22-30 MPa, TD: 18-25 MPa.
* **Shrink Ratio**: Specific values (e.g., MD: ~75%, TD: ~20%).
* **Finish**: Smooth, transparent.`,

  'p-hdpe-bags': `**HDPE bag specifications** vary by application (fertilizer, chemicals, etc.) but generally cover material (virgin HDPE, denier, mesh), dimensions (length, width, gusset), weight (GSM), strength (load capacity), construction (stitching, cutting, lamination, printing), and color, often referencing standards like IS 9755. Key details include tape denier (e.g., 1000D), mesh count (e.g., 10x10), GSM (e.g., 100-140 GSM for lighter use, higher for jumbo bags), load capacity (e.g., 25kg, 50kg, 100kg), and features like LDPE lamination or gussets for specific contents.

**Key Specification Parameters**
* **Material**: Virgin High-Density Polyethylene (HDPE).
* **Denier**: Tape strength (e.g., 460D to 1600D), often higher for stitching.
* **Mesh**: Threads per inch (e.g., 8x8 to 14x14).
* **GSM (Grams per Square Meter)**: Fabric weight (e.g., 48 GSM to 140 GSM for standard, higher for jumbo).
* **Dimensions**: Width (e.g., 12" to 48") and Length (customizable).
* **Capacity**: Weight the bag holds (e.g., 25kg, 40kg, 50kg, 100kg).
* **Load Bearing**: Minimum weight it must sustain (e.g., 100kg).

**Construction & Features**
* **Weaving**: Close weaving, sometimes with specific tape widths (e.g., 2.5mm).
* **Stitching**: Double-row chain stitch, often with thread denier >20% of fabric tape.
* **Mouth**: Heat cut, plain, zig-zag, or ultrasonic hem.
* **Lamination**: Inner LDPE film (e.g., 25-micron) for moisture barrier, as needed.
* **Gusset**: Side folds (e.g., 2-inch) for shape, if required.
* **Printing**: Up to 4 colors, corona treated ink, company logo/details.
* **Color**: White, yellow, or custom colors (e.g., blue tone).

**Standards & Testing**
* **Standards**: Often conform to Indian Standards (IS) like IS 9755 for fertilizers.
* **Testing**: May require NABL-accredited lab certificates and third-party inspection.`,

  'p-hdpe-covers': `**HDPE covers**, typically in the form of tarpaulins, sheets, or manhole covers, are made from High-Density Polyethylene, known for its durability, water resistance, and UV stabilization. Specific product specifications vary based on the intended application (e.g., industrial, agricultural, or civil engineering use).

**General Material Properties**
* **Material**: High-Density Polyethylene (HDPE), often woven into a fabric and laminated with Low-Density Polyethylene (LDPE) on both sides.
* **Durability**: Offers excellent tensile strength, tear resistance, and puncture resistance.
* **Resistance**:
  * *Waterproof*: 100% waterproof and leak-proof.
  * *Weatherproof*: Resistant to rot, mildew, and harsh weather conditions.
  * *Chemical Resistance*: Inert to most chemicals, solvents, acids, and oils.
  * *UV Resistance*: Typically UV-stabilized to provide protection and a longer life in sunny environments.
* **Physical**: Lightweight, flexible, non-toxic, and non-staining.
* **Recyclability**: HDPE is commonly recyclable and has the resin identification code "2".

**Common Product Specifications by Type**

*HDPE Tarpaulin/Sheet Covers*
Used widely in agriculture, construction, and transportation for covering goods, machinery, and temporary shelters.
* **Weight (GSM)**: Ranging from 50 GSM to 500 GSM and above, with common options like 120 GSM, 150 GSM, and 250 GSM.
* **Size**: Available in various standard and customizable sizes (e.g., 17x11 feet, 4x8 feet, 10x10 feet, or large rolls).
* **Color**: Common colors include blue, green, black, white, silver, and yellow.
* **Features**: Often includes reinforced edges and rust-proof aluminum or reinforced eyelets at regular intervals for secure tying.

*HDPE Manhole Covers*
Used for drainage networks in residential, commercial, and industrial areas.
* **Load Bearing**: High capacity, designed for light-duty to heavy-duty applications.
* **Design**: Slip-resistant surface, anti-theft features, and easy lifting mechanisms.
* **Resistance**: Corrosion-resistant, weatherproof, and UV-stabilized.
* **Sizes**: Available in various diameters and shapes (e.g., 600x600 mm or 24x24 inches).`,

  'p-tarpaulin': `**Tarpaulin specifications** detail material (HDPE, PVC, Canvas), weight (GSM - grams per square meter), thickness, weave (e.g., 28x32), waterproofing, UV resistance, color, and reinforcement (eyelets, hems) for durability, with standards varying by application, from general use (e.g., 170 GSM) to heavy-duty (e.g., 700 GSM PVC) for construction or disaster relief. Key specs include material type, GSM, color, UV treatment, tear strength, and grommet placement.

**Key Specification Categories**
* **Material**: Common types include Polyethylene (HDPE/LDPE), Polyvinyl Chloride (PVC), Canvas (Cotton/Polyester), or blends, chosen for flexibility, strength, and UV resistance.
* **Weight (GSM)**: Grams per Square Meter; higher GSM means thicker, heavier, and stronger (e.g., 100-200 GSM light duty, 300+ GSM heavy duty).
* **Weave & Thickness**: Weave density (e.g., 28x32) and overall thickness (mm) affect strength; multi-layered construction is common.
* **Waterproofing**: Essential feature, often achieved through PE lamination or PVC coating, ensuring leak-proof performance.
* **Reinforcement**: Strong hems (stitched edges) and rust-proof eyelets (brass/aluminum) at intervals for tying down.
* **UV Stabilization**: Important for outdoor use; UV-treated tarps last longer.
* **Color**: Common colors like blue, green, black, or white (reflective).
* **Special Features**: Fire retardant (FR) properties, anti-fungal, or specific logos (e.g., UNICEF).

**Example Specifications**
* **General Purpose HDPE**: 170 GSM, 28x32 weave, blue/black, with eyelets.
* **Heavy Duty PVC**: 700 GSM, waterproof, fire retardant, for demanding conditions.
* **UNICEF Plastic Tarp**: 190g/m², white reflective coating, black inner fibers, specific logo placement, high UV resistance.`,

  'p-bopp-tape': `**BOPP (Biaxially Oriented Polypropylene) Tape** specs vary, but generally include a BOPP film with acrylic/rubber adhesive, common widths like 12-72mm, thicknesses from 35-70 microns (40-50 micron common), and lengths from 25m to 1000m+. Key specs are thickness (strength), width, length, adhesive type (acrylic, rubber), color (clear, brown, colored), core size (usually 76mm), and adhesion strength (tack/peel).

**Typical Specifications**
* **Material**: BOPP Film with Acrylic or Synthetic Rubber Adhesive.
* **Thickness**: 35 to 70 microns (µm); common is 40-50µm, heavy-duty up to 70µm.
* **Width**: 12mm to 72mm (e.g., 1", 2", 3").
* **Length**: 25m to 4000m (e.g., 65m, 100m, 650m).
* **Core ID**: 76mm (3 inches).
* **Color**: Transparent, Brown, or various colors.
* **Adhesion**: High tack & grip, sticks to paper, plastic, wood, metal, etc.

**Performance & Other Specs**
* **Holding Power**: Varies by thickness/adhesive (e.g., 7-10+ hours).
* **Application**: Carton sealing, e-commerce, general packaging.
* **Features**: Consistent coating, strong grip, durable, long shelf life.

**How to Read a BOPP Tape Spec Sheet**
* **Look for thickness (µm)**: Higher number means thicker/stronger tape (e.g., 40µm standard, 70µm heavy duty).
* **Check Width & Length**: Standard roll sizes for packaging.
* **Note Adhesive Type**: Acrylic offers good clarity and aging; rubber offers strong initial tack.
* **Check Colors**: Clear for invisible looks, brown for traditional looks, colored for branding/coding.`,

  'p-masking-tape': `**Masking tape specs** cover backing (crepe paper), adhesive (rubber), width/length (various), color (beige, white, tan), thickness (e.g., 0.17mm), temperature resistance (e.g., 140°C), and performance (easy tear, holds tight, resists bleed-through) for general/high-temp painting/sealing. Key attributes define its use for clean paint lines and temporary adhesion, with variations for high-heat or specific tasks.

**Typical Specifications**
* **Backing Material**: Crepe Paper (for conformability)
* **Adhesive**: Rubber-based (natural or synthetic), solvent-free options available
* **Color**: Beige, Tan, Cream, Milky White, Brown
* **Width**: Varies widely (e.g., 12mm, 24mm, 48mm, 96mm)
* **Length**: Standard rolls (e.g., 45m, 50m)
* **Thickness**: Around 0.17mm (for general purpose)
* **Temperature Resistance**: Varies, e.g., up to 140°C (30 mins) for high-heat, or up to 121°C (250°F) for industrial
* **Performance**: Easy to tear, resists curling/lifting, good paint hold-out (prevents bleed-through).

**Key Features & Uses**
* **General Purpose**: For clean paint lines, bundling, sealing, and general tasks.
* **High-Performance**: For medium-to-high heat applications like automotive painting.
* **Clean Removal**: Designed to remove easily without residue (for typical conditions).
* **Conformability**: Crepe paper backing allows it to stick well around curves and corners.

**Storage & Handling**
* Store in dry conditions, away from direct sunlight, between 15°C-25°C (59°F-77°F) with <50% humidity.
* Use within 12 months of shipment for best results.`,

  'p-pvc-tape': `**PVC Floor Marking Tape specs** include PVC material, rubber-based adhesive, single-sided application, various widths (1"-6"+) & lengths (10m, 20m, 30m, 25yd), common colors (yellow, black, red, blue, green, white), and properties like water/solvent resistance, durability, and conformability for marking aisles, hazards, and zones in industrial settings, often with good abrasion resistance for traffic.

**Key Specifications**
* **Material**: Plasticized PVC Film.
* **Adhesive**: Rubber-based, pressure-sensitive, high-tack, non-corrosive.
* **Backing**: PVC.
* **Sides**: Single-sided.
* **Colors**: Yellow, Black, Red, Blue, Green, White, Orange, or striped (Yellow/Black, Green/White).
* **Widths**: Common sizes include 1", 2", 3", 4", 5", 6", 48mm, 72mm, up to 150mm.
* **Lengths**: Varies by roll, e.g., 10m, 20m, 30m (approx. 33yd), 25 yards.
* **Thickness**: Around 0.14mm to 0.16mm (± 0.01mm) for standard types, with heavy-duty versions available.
* **Durability**: Water, solvent, and oil resistant; good abrasion resistance.
* **Temperature**: Service range around 0°C to +60°C; application +5°C to +40°C.
* **Compliance**: Often RoHS compliant.

**Features & Applications**
* **Features**: Easy to apply by hand or machine, forms well to uneven surfaces, UV resistant for outdoor use, leaves minimal residue on removal.
* **Applications**: Marking traffic lanes, safety zones, work cells, equipment locations, hazard areas (scrap, rework), and dividing spaces in warehouses, factories, and sports facilities.`,

  'p-bubble-wrap': `**Bubble wrap** is a protective packaging material primarily made of low-density polyethylene (LDPE) film with characteristic air-filled bubbles. Key specifications include bubble size, material thickness (GSM/gauge), and various functional properties like anti-static protection.

**Material Composition**
Bubble wrap is composed primarily of polyethylene resin, often with added components to enhance properties.
* **Main Material**: Low-density polyethylene (LDPE) film.
* **Additives**: Other additives can be mixed in to modify properties:
  * Nylon is sometimes included for added strength and better air retention.
  * Antistatic agents are used for pink-colored anti-static bubble wrap to dissipate static charges, protecting sensitive electronic components.
  * Colorants are used to indicate specific types (e.g., green for recycled content) or for custom branding.

**Common Specifications**
Specifications vary based on intended use, but several common options are available in the market.
* **Material**: Polyethylene (PE), specifically LDPE
* **Bubble Diameter**: Ranges from 6 mm (0.24 inches) to 26 mm (1 inch) or more. Common standard sizes are 1/8", 3/16", 5/16", and 1/2".
* **Bubble Height**: Ranges up to 4 mm (small bubble) to 7 mm or more (large bubble).
* **Film Thickness**: Often measured in Gauge (e.g., 400 gauge) or GSM (grams per square meter), with common ranges like 40 GSM to 80 GSM for standard rolls.
* **Roll Dimensions**: Typically available in widths of 0.5 meters, 1 meter, 1.2 meters, and 1.5 meters, with lengths often in 50m or 100m rolls.
* **Properties**: Lightweight, moisture-resistant, shock-absorbent, buoyant, and reusable.

**Specialized Types**
* **Anti-Static Bubble Wrap**: Colored pink and designed to prevent static charge buildup, essential for packaging electronics.
* **Heavy-Duty**: Features thicker film and/or larger, more durable bubbles for enhanced protection against drops and impacts.
* **Inflatable**: A newer form of bubble wrap (e.g., Sealed Air's iBubble Wrap) where flat sheets are inflated by the user on-site, saving storage and transport space. These connected bubbles cannot be "popped" individually.`,

  'p-cross-lamination': `**Cross-lamination** is a manufacturing technique that involves layering materials, such as timber or polymers, with the orientation of each layer perpendicular (typically 90 degrees) to the adjacent layers to enhance dimensional stability, strength, and rigidity. The resulting product, such as Cross-Laminated Timber (CLT), has specific technical specifications related to dimensions, material properties, and performance.

**General Product Specifications**
* **Layer Orientation**: Adjacent layers are typically oriented at 90-degree angles to each other, which provides structural rigidity in both directions.
* **Layers**: Products commonly consist of an odd number of layers (e.g., 3, 5, 7, or 9) to maintain symmetry, ensuring the outer layers have the same orientation.
* **Adhesives**: Structural adhesives such as phenol-resorcinol formaldehyde (PRF), one-component polyurethane (PUR), or emulsion polymer isocyanate (EPI) are used for bonding. The adhesive bond should be stronger than the material itself, leading to wood failure rather than glue-line failure during testing.
* **Dimensional Stability**: The cross-lamination process significantly improves dimensional stability and minimizes shrinking and swelling from moisture variations, compared to solid wood.
* **Anisotropy Reduction**: By cross-laminating, the material's properties become more uniform across the panel, mitigating the natural anisotropy of the base material (e.g., wood).

**Cross-Laminated Timber (CLT) Specifics**
CLT is a common application of this principle in construction, with the following technical specifications:
* **Material**: Made from solid-sawn lumber boards, typically softwood species like spruce, pine, and fir, which are kiln-dried to a moisture content of around 10-15%.
* **Dimensions**: Panels can be manufactured in large sizes, with widths up to 3.5 m and lengths up to 18 m or more. Thicknesses typically range from 60 mm to 360 mm, depending on structural requirements.
* **Strength and Performance**:
  * *High Strength-to-Weight Ratio*: It is lighter than concrete and steel but offers comparable strength, reducing foundation costs.
  * *Fire Resistance*: CLT performs well in fires due to a predictable charring rate (approx. 0.7 mm/min), which insulates the inner layers and helps maintain load-bearing capacity for extended periods (e.g., REI 90 or 120 ratings).
  * *Acoustic Properties*: Provides good sound insulation characteristics, comparable to other construction methods when combined with appropriate systems like suspended ceilings or floor screeds.
  * *Thermal Performance*: Wood's low thermal conductivity (around 0.13 W/mK) makes CLT a good insulator, aiding in energy efficiency.

**Product Standards and Certifications**
Products such as CLT must comply with industry standards to ensure quality and reliability. Relevant standards include ANSI/APA PRG 320 (North America) and EN 16351 (Europe). These standards define requirements for aspects such as:
* **Moisture Content**: Specified range for the base material during manufacturing.
* **Adhesive Bonding**: Testing requirements for block shear strength and delamination percentage under various conditions.
* **Dimensional Tolerances**: Permissible variations in thickness, width, length, squareness, and straightness of the final product.
* **Strength Grading**: The lumber used must meet specific strength classes (e.g., EN 338 ≥ C16).`
};

for (const [id, desc] of Object.entries(descriptions)) {
  const marker = `id: '${id}',`;
  const split = content.split(marker);
  if (split.length > 1) {
    // Insert longDescription after description
    const descMarker = "description: '";
    const chunk = split[1];
    const descStart = chunk.indexOf(descMarker);
    if (descStart !== -1) {
      const descEnd = chunk.indexOf("',", descStart);
      if (descEnd !== -1) {
        const insertion = `\n    longDescription: ` + JSON.stringify(desc) + `,`;
        split[1] = chunk.slice(0, descEnd + 2) + insertion + chunk.slice(descEnd + 2);
        content = split.join(marker);
      }
    }
  }
}

fs.writeFileSync('src/data.ts', content, 'utf8');
