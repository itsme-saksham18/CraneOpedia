const Crane = require("../models/Crane");

// HOME PAGE
module.exports.home = async (req, res) => {
    try {
        // Get distinct crane types
        const types = await Crane.distinct("type");
        
        // Get comparison data if session has comparison IDs
        const comparisonData = await Crane.find({
            _id: { $in: req.session.comparison || [] }
        }).lean();
        
        // Get counts for stats
        const craneCount = await Crane.countDocuments();
        const manufacturerCount = await Crane.distinct("manufacturer").then(arr => arr.length);
        
        // Get recent cranes
        const recentCranes = await Crane.find()
            .sort({ createdAt: -1 })
            .limit(6)
            .lean();

        res.render("home", {
            title: 'CraneOpedia - Home',
            currentPage: 'home',
            types,
            comparisonData,
            craneCount,
            manufacturerCount,
            recentCranes
        });
    } catch (error) {
        console.error('Home controller error:', error);
        req.flash('error', 'Error loading home page');
        res.redirect('/');
    }
};


// GET UNIQUE TYPES
module.exports.getTypes = async (req, res) => {
    const types = await Crane.distinct("type");
    res.json({ types });
};

// GET MANUFACTURERS FOR SELECTED TYPE
module.exports.getManufacturers = async (req, res) => {
    try {
        const type = req.params.type;
        const manufacturers = await Crane.distinct("manufacturer", { type: type });
        
        // Transform array of strings to array of objects
        const manufacturersData = manufacturers.map(mfg => ({
            _id: mfg, // Use manufacturer name as ID since you don't have separate IDs
            name: mfg
        }));
        
        res.json(manufacturersData); // Send array, not object with manufacturers key
    } catch (error) {
        console.error('Manufacturers API error:', error);
        res.json([]);
    }
};

// GET MODELS FOR TYPE + MANUFACTURER
module.exports.getModels = async (req, res) => {
    try {
        const { type, manufacturer } = req.params;
        
        // Find cranes that match type and manufacturer
        const models = await Crane.find({ 
            type: type, 
            manufacturer: manufacturer 
        })
        .select('_id model max_load_capacity boom_length manufacturer type image')
        .lean();
        
        res.json(models); // Return array of objects
    } catch (error) {
        console.error('Models API error:', error);
        res.json([]);
    }
};

module.exports.calculateLoadAnalysis = async (req, res) => {
  try {
    // Read inputs
    const {
      loadWeight,      // tons
      boomLength,      // meters (extended boom)
      workingRadius,   // meters (horizontal)
      terrainType,     // string from UI
      windCondition,   // string from UI (e.g., "Calm", "Moderate", "Strong", "Severe")
      craneId           // optional
    } = req.body;

    // Parse numeric inputs carefully
    const load = Number(loadWeight);
    const boom = Number(boomLength);
    const radius = Number(workingRadius);

    // Validate
    const errors = [];
    if (Number.isNaN(load) || load <= 0) errors.push("Invalid loadWeight (must be > 0 tons).");
    if (Number.isNaN(boom) || boom <= 0) errors.push("Invalid boomLength (must be > 0 meters).");
    if (Number.isNaN(radius) || radius <= 0) errors.push("Invalid workingRadius (must be > 0 meters).");
    if (radius > boom) errors.push("Working radius cannot exceed boom length.");
    if (!terrainType) errors.push("terrainType is required.");
    if (!windCondition) errors.push("windCondition is required.");

    if (errors.length) return res.status(400).json({ error: "Invalid input", details: errors });

    // Constants & unit conversions
    const GRAVITY = 9.81; // m/s^2 (used to compute load force in kN if needed)
    // Convert load (tons) -> kN (metric ton = 1000 kg; 1 kN ≈ 101.9716 kg·m/s²)
    // We'll keep both tons and kN for clarity/engineering steps
    const load_kg = load * 1000; // kg
    const load_kN = +(load_kg * GRAVITY / 1000).toFixed(2); // kN

    // Maps tuned to your UI labels
    const terrainFactors = {
      "Concrete/Asphalt": 1.0,
      "Compact Soil": 1.15,
      "Loose Soil": 1.35,
      "Gravel": 1.25,
      "Sand": 1.5,
      "Unstable Ground": 1.8
    };

    const soilBearingCapacity_kPa = {
      "Concrete/Asphalt": 200,   // high
      "Compact Soil": 150,
      "Loose Soil": 90,
      "Gravel": 130,
      "Sand": 60,
      "Unstable Ground": 30
    };

    // Wind categories — convert to conservative numeric factor
    // These are multiplicative deration factors used for safety margin
    const windFactors = {
      "Calm (0-20 km/h)": 1.0,
      "Moderate (21-40 km/h)": 1.05,
      "Strong (41-60 km/h)": 1.25,
      "Severe (61+ km/h)": 1.5
    };

    // Normalize UI values to keys used above (allow both shorthand and full labels)
    function normalizeWindKey(key) {
      if (!key) return "Calm (0-20 km/h)";
      if (key.toLowerCase().includes("calm")) return "Calm (0-20 km/h)";
      if (key.toLowerCase().includes("moderate")) return "Moderate (21-40 km/h)";
      if (key.toLowerCase().includes("strong")) return "Strong (41-60 km/h)";
      if (key.toLowerCase().includes("severe") || key.toLowerCase().includes("61")) return "Severe (61+ km/h)";
      return key;
    }

    const windKey = normalizeWindKey(windCondition);
    const wf = windFactors[windKey] ?? 1.0;
    const terrainFactor = terrainFactors[terrainType] ?? 1.2;
    const soilCapacity = soilBearingCapacity_kPa[terrainType] ?? 100;

    // Optional: fetch crane specs if craneId provided
    let crane = null;
    if (craneId) {
      try {
        crane = await Crane.findById(craneId).lean();
      } catch (e) {
        // ignore, we'll proceed without crane-specific checks
        crane = null;
      }
    }

    // Basic geometry & physics
    // 1) Load moment about crane center (ton·m)
    const loadMoment_t_m = +(load * radius).toFixed(3); // ton * m

    // 2) Convert to kN·m if needed: (load_kg * g) * radius / 1000 = kN·m
    const loadMoment_kN_m = +((load_kg * GRAVITY * radius) / 1000).toFixed(2);

    // 3) Estimate required counterweight (tonnes) - conservative heuristic:
    //    counterweight_t = (loadMoment_t_m / (typicalCounterweightLever_m))
    //    choose lever 8 m as a conservative lever arm for counterweight (this depends on crane)
    const typicalCounterweightLever = crane && crane.specs && crane.specs.counterweight_lever_m
      ? Number(crane.specs.counterweight_lever_m) : 8.0; // meters
    const counterweight_t = +((loadMoment_t_m / typicalCounterweightLever) * wf).toFixed(2);

    // 4) Ground pressure estimate:
    // Force on ground (kN) approximated as (load_kN + selfWeightEquivalent) * terrainFactor
    // Self weight equivalent includes crane/structure reaction — we'll estimate a proportional constant
    const craneSelfWeight_kN_estimate = crane && crane.specs && crane.specs.self_weight_kN
      ? Number(crane.specs.self_weight_kN)
      : Math.max(50, load_kN * 0.5); // fallback estimate
    const totalVerticalLoad_kN = +( (load_kN + craneSelfWeight_kN_estimate) * terrainFactor * wf ).toFixed(2);

    // Assume outrigger footprint area — if crane known use spec, else conservative
    const outriggerArea_m2 = crane && crane.specs && crane.specs.outrigger_area_m2
      ? Number(crane.specs.outrigger_area_m2)
      : 1.0 * 4; // assume 4 outriggers each 1 m^2 (conservative)

    // ground pressure in kPa = (totalVerticalLoad_kN * 1000 N/kN) / (area m2) / 1000 = totalVerticalLoad_kN / area_m2 (kPa)
    const outriggerPressure_kPa = +(totalVerticalLoad_kN / outriggerArea_m2).toFixed(2);

    // 5) Pad size heuristic (m^2) to keep pressure below soil capacity
    // requiredPadArea = totalVerticalLoad_kN / allowablePressure_kN_per_m2
    // soilCapacity is in kPa (kN/m2), so pad area = totalVerticalLoad_kN / soilCapacity (m^2)
    const requiredPadArea_m2 = +(totalVerticalLoad_kN / soilCapacity).toFixed(2);

    // 6) Overturning / tipping check (very simplified)
    // Overturning moment at tipping edge must exceed overturning caused by load
    // tippingMomentResistance_kN_m: approximate from counterweight * lever + stability factor
    const stabilityFactor = crane && crane.specs && crane.specs.stability_factor
      ? Number(crane.specs.stability_factor) : 0.9; // lower is conservative
    const tippingResistance_kN_m = +((counterweight_t * 1000 * GRAVITY * typicalCounterweightLever / 1000) * stabilityFactor).toFixed(2); // kN·m

    // Compare moments (use loadMoment_kN_m vs tippingResistance_kN_m)
    const overturningRatio = tippingResistance_kN_m > 0 ? +(loadMoment_kN_m / tippingResistance_kN_m).toFixed(3) : 9.99;

    // 7) Safety Factor (combined)
    // Combine wind deration and terrain factor with a base recommended factor (1.25)
    const baseSafetyFactor = 1.25; // industry conservative baseline for working load
    const computedSafetyFactor = +(baseSafetyFactor / (terrainFactor * wf)).toFixed(2);

    // 8) Capacity checks if crane provided
    let capacityWarnings = [];
    if (crane && crane.max_load_capacity) {
      // crane.max_load_capacity stored as string (e.g., "90 tons") — extract numeric
      const capacityNum = Number(String(crane.max_load_capacity).replace(/[^\d.]/g, ""));
      if (!Number.isNaN(capacityNum)) {
        if (load > capacityNum) {
          capacityWarnings.push(`Load (${load} t) exceeds crane's rated capacity (${capacityNum} t). Operation NOT permitted.`);
        } else {
          // check derated capacity based on radius if we have load charts (not available here) - warn if close to capacity
          const headroomPercent = ((capacityNum - load) / capacityNum) * 100;
          if (headroomPercent < 10) {
            capacityWarnings.push(`Load is within 10% of crane's capacity — use caution and verify load chart.`);
          }
        }
      }
    }

    // 9) Compose rich warnings with actionable language
    const warnings = [];

    // Overturning
    if (overturningRatio > 0.9 && overturningRatio < 1.1) {
      warnings.push({
        code: "near_overturn",
        severity: "warning",
        message: "Overturning risk: the calculated resisting moment is close to the load moment. Reduce boom length or load, increase counterweight, or check ground conditions."
      });
    } else if (overturningRatio >= 1.1) {
      // good (resistance > load)
      // no warning
    } else {
      // tipping resistance < load moment — critical
      warnings.push({
        code: "overturning",
        severity: "danger",
        message: `High overturning risk: calculated overturning ratio ${overturningRatio} (<1 means tipping likely). Immediate action required: reduce load/radius, increase counterweight, or abort lift.`
      });
    }

    // Wind
    if (windKey === "Strong (41-60 km/h)") {
      warnings.push({
        code: "wind_strong",
        severity: "warning",
        message: "Strong winds expected. Reduce boom extension, slow operations, and consult your crane's wind-speed operating chart."
      });
    } else if (windKey === "Severe (61+ km/h)") {
      warnings.push({
        code: "wind_severe",
        severity: "danger",
        message: "Severe winds (≥61 km/h). Crane operation is not recommended. Secure equipment and postpone lifting."
      });
    }

    // Terrain
    if (terrainType === "Sand" || terrainType === "Unstable Ground") {
      warnings.push({
        code: "weak_terrain",
        severity: "warning",
        message: `Ground is weak ("${terrainType}"). Use heavy-duty timber mats or engineered crane pads; consult geotechnical/structural engineer if unsure.`
      });
    }

    // Pad size large
    if (requiredPadArea_m2 > 4) {
      warnings.push({
        code: "large_pad",
        severity: "warning",
        message: `Large pad area recommended (${requiredPadArea_m2} m²) to keep pressure below soil capacity (${soilCapacity} kPa). Consider engineered mats or timber cribbing.`
      });
    }

    // Outrigger pressure exceed
    if (outriggerPressure_kPa > soilCapacity) {
      warnings.push({
        code: "outrigger_exceed",
        severity: "danger",
        message: `Estimated outrigger pressure (${outriggerPressure_kPa} kPa) exceeds soil bearing capacity (${soilCapacity} kPa). DO NOT OPERATE without increasing pad area or ground improvement.`
      });
    }

    // Crane capacity warnings (if any)
    capacityWarnings.forEach(msg => {
      warnings.push({
        code: "capacity",
        severity: "danger",
        message: msg
      });
    });

    // Boom angle low
    const boomAngleDeg = (() => {
      // prevent domain errors
      if (radius >= boom) return 0;
      const cos = radius / boom;
      return +(Math.acos(cos) * (180 / Math.PI)).toFixed(1);
    })();
    if (boomAngleDeg < 30) {
      warnings.push({
        code: "low_boom_angle",
        severity: "warning",
        message: `Calculated boom angle is ${boomAngleDeg}°. Low boom angles increase sway and instability — shorten boom or reduce load.`
      });
    }

    // Compose response (rich, structured)
    const response = {
      inputs: {
        load_tons: load,
        boom_m: boom,
        radius_m: radius,
        terrain: terrainType,
        wind: windKey,
        craneId: craneId || null
      },
      physics: {
        load_kN,
        loadMoment_t_m,
        loadMoment_kN_m,
        boomAngleDeg
      },
      counterweight: {
        value_t: counterweight_t,
        note: `Estimated counterweight using lever ${typicalCounterweightLever} m and wind factor ${wf}. Use crane-specific counterweight tables for exact values.`,
        status: counterweight_t > (crane && crane.specs && crane.specs.max_counterweight_t ? Number(crane.specs.max_counterweight_t) * 0.8 : 100) ? "warning" : "safe"
      },
      ground: {
        totalVerticalLoad_kN: totalVerticalLoad_kN,
        outriggerArea_m2,
        outriggerPressure_kPa,
        soilCapacity_kPa: soilCapacity,
        requiredPadArea_m2
      },
      stability: {
        tippingResistance_kN_m,
        overturningRatio,
        computedSafetyFactor
      },
      warnings,
      recommendedActions: [
        "Verify load (weight + rigging) with certified scale or calculation.",
        "Consult the crane's manufacturer load chart for the exact radius/boom combination.",
        "If any 'danger' warnings appear, do not proceed until mitigations are implemented (larger pads, reduced load, reduced radius, more counterweight).",
        "For site-specific geotechnical concerns (soft or unstable ground) consult a geotechnical engineer."
      ],
      diagram: {
        boomAngleDeg,
        boom,
        radius,
        load_kN,
        loadMoment_kN_m
      }
    };

    return res.json(response);

  } catch (err) {
    console.error("Load analysis error:", err);
    return res.status(500).json({ error: "Load analysis calculation failed." });
  }
};
