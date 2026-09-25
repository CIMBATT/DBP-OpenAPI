import type { DigitalBatteryPassport } from './types';

export const createTestPassport = (index: number): DigitalBatteryPassport => {
  const sequence = index.toString().padStart(3, '0');
  const productIdentifier = `battery-${sequence}`;
  const passportIdentifier = `BP-${sequence}`;
  const manufacturerId = `ACME-BATTERY-${sequence}`;
  const operatorId = `ACME-OPS-${sequence}`;
  const qaId = `ACME-QA-${sequence}`;
  const chemistryOptions = [
    { clearName: 'Nickel Manganese Cobalt', shortName: 'NMC 811' },
    { clearName: 'Lithium Iron Phosphate', shortName: 'LFP' },
    { clearName: 'Nickel Cobalt Aluminum', shortName: 'NCA' },
  ];
  const chemistry = chemistryOptions[index % chemistryOptions.length];
  const manufactureMonth = ((index - 1) % 12) + 1;
  const serviceMonth = (manufactureMonth % 12) + 1;
  const manufactureMonthString = manufactureMonth.toString().padStart(2, '0');
  const serviceMonthString = serviceMonth.toString().padStart(2, '0');

  return {
    materialComposition: {
      batteryChemistry: chemistry,
      batteryMaterials: [
        {
          batteryMaterial: 'Nickel',
          batteryMaterialLocation: [{ componentName: 'cathode' }],
          isCriticalRawMaterial: true,
        },
        {
          batteryMaterial: index % 2 === 0 ? 'Graphite' : 'Silicon Graphite',
          batteryMaterialLocation: [{ componentName: 'anode' }],
          isCriticalRawMaterial: false,
        },
        {
          batteryMaterial: 'Lithium',
          batteryMaterialLocation: [{ componentName: 'electrolyte' }],
          isCriticalRawMaterial: true,
        },
      ],
      hazardousSubstances: [
        {
          hazardousSubstanceIdentifier: index % 2 === 0 ? 'lead' : 'electrolyte-solvent',
          hazardousSubstanceImpact: ['restricted disposal', 'environmental risk'],
          hazardousSubstanceLocation: { componentName: 'battery pack casing' },
        },
      ],
    },
    circularity: {
      renewableContent: Number((0.45 + index * 0.005).toFixed(2)),
      recycledContent: [
        { recycledMaterial: 'nickel', postConsumerShare: Number((0.2 + index * 0.003).toFixed(2)), preConsumerShare: 0.18 },
        { recycledMaterial: 'copper', postConsumerShare: Number((0.18 + index * 0.002).toFixed(2)), preConsumerShare: 0.12 },
        { recycledMaterial: 'steel', postConsumerShare: Number((0.22 + index * 0.002).toFixed(2)), preConsumerShare: 0.1 },
        { recycledMaterial: 'graphite', postConsumerShare: Number((0.16 + index * 0.002).toFixed(2)), preConsumerShare: 0.09 },
      ],
      endOfLifeInformation: {
        wastePrevention: `Component re-use plan for passport ${sequence}`,
        separateCollection: 'Mandatory battery collection system',
        informationOnCollection: `Return battery ${sequence} to an authorized collection centre`,
      },
      sparePartSources: [
        {
          nameOfSupplier: `VoltCore Components ${sequence}`,
          components: [{ partName: 'cooling fan' }, { partName: 'battery sensor' }],
        },
      ],
    },
    supplyChainDueDiligence: {
      supplyChainDueDiligenceReport: `https://example.com/due-diligence/report-${sequence}.pdf`,
      supplyChainIndices: Number((0.75 + index * 0.003).toFixed(3)),
      thirdPartyAssurances: `ISO 14001 and RMI audit batch ${sequence}`,
    },
    maintenanceInformation: [
      {
        eventDate: `2026-${serviceMonthString}-16T10:00:00.000Z`,
        activityType: { code: 'REPAIR', definition: 'Battery pack repair' },
        modifications: {
          maintenanceInformation: `Replaced cooling fan and battery sensors for passport ${sequence}.`,
          generalProductInformation: {
            operatorInformation: { identifier: operatorId },
            productIdentifier,
          },
          circularity: {
            replacementComponents: [{ partName: 'cooling fan' }, { partName: 'battery sensor' }],
          },
        },
      },
      {
        eventDate: `2026-${serviceMonthString}-24T14:30:00.000Z`,
        activityType: { code: 'INSPECTION', definition: 'Quarterly safety inspection' },
        modifications: {
          maintenanceInformation: `Inspected connectors, housing, and cooling path for passport ${sequence}.`,
          generalProductInformation: {
            operatorInformation: { identifier: qaId },
            productIdentifier,
          },
          circularity: {
            components: [{ partName: 'connectors' }, { partName: 'housing' }],
          },
        },
      },
    ],
    performance: {
      batteryCondition: {
        capacityFade: {
          capacityFadeValue: Number((0.02 + index * 0.001).toFixed(3)),
          lastUpdate: `2026-${serviceMonthString}-16T10:00:00.000Z`,
        },
        internalResistanceIncrease: [
          {
            lastUpdateInternalResistanceIncrease: `2026-${serviceMonthString}-16T10:00:00.000Z`,
            batteryComponent: 'pack',
            internalResistanceIncreaseValue: Number((0.015 + index * 0.0005).toFixed(4)),
          },
          {
            lastUpdateInternalResistanceIncrease: `2026-${serviceMonthString}-24T14:30:00.000Z`,
            batteryComponent: 'cell',
            internalResistanceIncreaseValue: Number((0.008 + index * 0.0003).toFixed(4)),
          },
        ],
      },
      batteryTechnicalProperties: {
        cRate: Number((1 + index * 0.01).toFixed(2)),
        cRateLifeCycleTest: Number((0.95 + index * 0.008).toFixed(2)),
        capacityThresholdForExhaustion: 0.7,
        expectedLifetime: 2500 + index * 20,
        expectedNumberOfCycles: 3200 + index * 25,
        initialInternalResistance: [{ batteryComponent: 'cell', ohmicResistance: Number((0.012 + index * 0.0002).toFixed(4)) }],
        lifetimeReferenceTest: `EU battery lifecycle report ${sequence}`,
        maximumVoltage: 400 + index,
        minimumVoltage: 240 + (index % 20),
        nominalVoltage: 340 + index,
        originalPowerCapability: [{ powerCapabilityAt: Number((8 + index * 0.15).toFixed(2)), atSoC: 50 }],
        powerFade: Number((0.03 + index * 0.001).toFixed(3)),
        ratedCapacity: 80 + index,
        ratedMaximumPower: 150 + index * 2,
        roundTripEfficiencyFade: Number((0.04 + index * 0.0008).toFixed(3)),
        roundTripEfficiencyat50PerCentCycleLife: Number((0.88 + index * 0.001).toFixed(3)),
        roundtripEfficiency: Number((0.9 + index * 0.0008).toFixed(3)),
        temperatureRangeIdleState: { maximum: 40 + (index % 6), minimum: -25 + (index % 4) },
        ratedEnergy: Number((28 + index * 0.75).toFixed(2)),
        powerCapabilityRatio: Number((1.05 + index * 0.004).toFixed(3)),
        initialSelfDischarge: Number((0.01 + index * 0.0004).toFixed(4)),
      },
    },
    carbonFootprint: {
      absoluteCarbonFootprint: Number((68 + index * 0.9).toFixed(1)),
      batteryCarbonFootprint: Number((64 + index * 0.85).toFixed(1)),
      carbonFootprintStudy: `https://example.com/carbon-footprint-study-${sequence}.pdf`,
      carbonFootprintPerformanceClass: ['A', 'B', 'C'][index % 3],
      carbonFootprintPerLifecycleStage: {
        carbonFootprintPerLifecycleStage1: [
          { lifecycleStage: 'manufacture', carbonFootprint: Number((24 + index * 0.4).toFixed(1)) },
          { lifecycleStage: 'use', carbonFootprint: Number((34 + index * 0.35).toFixed(1)) },
        ],
      },
    },
    generalProductInformation: {
      manufacturerInformation: { identifier: manufacturerId },
      puttingIntoService: `2025-${serviceMonthString}-20T00:00:00.000Z`,
      manufacturingDate: `2025-${manufactureMonthString}-15T00:00:00.000Z`,
      operatorInformation: { identifier: operatorId },
      batteryMass: Number((350 + index * 3.5).toFixed(1)),
      manufacturingPlace: { postalCode1: `80${sequence}` },
      productIdentifier,
      warrantyPeriod: `${60 + index} months`,
      batteryCategory: index % 2 === 0 ? 'EV' : 'LMT',
      batteryPassportIdentifier: passportIdentifier,
    },
    labeling: {
      resultOfTestReport: `CE-TR-2025-${sequence}`,
      declarationOfConformity: `EU Declaration of Conformity ${sequence}`,
      labels: [
        { labelingMeaning: 'CE mark', labelingSymbol: 'CE', labelingSubject: 'battery' },
        { labelingMeaning: 'Battery recycling', labelingSymbol: 'recycle', labelingSubject: 'battery' },
        { labelingMeaning: 'Keep dry', labelingSymbol: 'dry', labelingSubject: 'battery' },
        { labelingMeaning: 'Handle with care', labelingSymbol: 'warning', labelingSubject: 'battery' },
      ],
    },
    dynamicUpdates: [
      {
        lastUpdate: `2026-${serviceMonthString}-16T10:00:00.000Z`,
        generalProductInformation: {
          operatorInformation: { identifier: operatorId },
          batteryStatus: index % 3 === 0 ? 'In maintenance' : 'In service',
        },
        performance: {
          batteryCondition: {
            capacityFade: {
              capacityFadeValue: Number((0.02 + index * 0.001).toFixed(3)),
              lastUpdate: `2026-${serviceMonthString}-16T10:00:00.000Z`,
            },
            internalResistanceIncrease: [
              {
                lastUpdateInternalResistanceIncrease: `2026-${serviceMonthString}-16T10:00:00.000Z`,
                batteryComponent: 'pack',
                internalResistanceIncreaseValue: Number((0.015 + index * 0.0005).toFixed(4)),
              },
            ],
          },
          batteryTechnicalProperties: {
            roundTripEfficiencyFade: Number((0.04 + index * 0.0008).toFixed(3)),
            cRate: Number((1 + index * 0.01).toFixed(2)),
            initialInternalResistance: [{ batteryComponent: 'cell', ohmicResistance: Number((0.012 + index * 0.0002).toFixed(4)) }],
            originalPowerCapability: [{ powerCapabilityAt: Number((8 + index * 0.15).toFixed(2)), atSoC: 50 }],
            ratedCapacity: 80 + index,
            capacityThresholdForExhaustion: 0.7,
            nominalVoltage: 340 + index,
            lifetimeReferenceTest: `EU battery lifecycle report ${sequence}`,
            powerCapabilityRatio: Number((1.05 + index * 0.004).toFixed(3)),
            expectedLifetime: 2500 + index * 20,
            powerFade: Number((0.03 + index * 0.001).toFixed(3)),
            maximumVoltage: 400 + index,
            ratedEnergy: Number((28 + index * 0.75).toFixed(2)),
            cRateLifeCycleTest: Number((0.95 + index * 0.008).toFixed(2)),
            roundTripEfficiencyat50PerCentCycleLife: Number((0.88 + index * 0.001).toFixed(3)),
            ratedMaximumPower: 150 + index * 2,
            roundtripEfficiency: Number((0.9 + index * 0.0008).toFixed(3)),
            temperatureRangeIdleState: { maximum: 40 + (index % 6), minimum: -25 + (index % 4) },
            minimumVoltage: 240 + (index % 20),
            initialSelfDischarge: Number((0.01 + index * 0.0004).toFixed(4)),
            expectedNumberOfCycles: 3200 + index * 25,
          },
        },
      },
    ],
  };
};
