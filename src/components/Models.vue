<script setup>
import { ref, defineAsyncComponent, watch, onUnmounted } from 'vue';
import * as utils from "../store/utils"
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'

// Async components
const QuantumAdvantageGraph = defineAsyncComponent(() => import('./QuantumAdvantageGraph.vue'));
const QuantumEconomicAdvantageGraph = defineAsyncComponent(() => import('./QuantumEconomicAdvantageGraph.vue'));
const QuantumCharacteristicsGraph = defineAsyncComponent(() => import('./QuantumCharacteristicsGraph.vue'));
const Form = defineAsyncComponent(() => import('./Form.vue'));

const currentYear = new Date().getFullYear();

const props = defineProps({
    model: Object,
    modelIndex: Number
});

const currentAdvantageData = ref({});
const quantumEconomicAdvantageData = ref({});
const roadmapCharacteristicsData = ref({});
const showStepLines = ref(true);
const showCostLines = ref(true);

// --- Calculation Logic ---

function getQuantumAdvantage(logClassicalFunction, logQuantumFunction, logPenaltyFunction, hardwareSlowdown, quantumImprovementRate, processors, costImprovementRate, year) {
    let adjustmentFactor = Number(hardwareSlowdown) + (year - currentYear) * Math.log10(quantumImprovementRate);
    if (!Number.isFinite(adjustmentFactor)) return 0;
    adjustmentFactor = Math.max(adjustmentFactor, 0);

    let effectiveProcessors = processors + (year - currentYear) * Math.log10(costImprovementRate);
    effectiveProcessors = Math.max(effectiveProcessors, 0);
    const pValue = Math.pow(10, effectiveProcessors);

    function evaluate(n) {
        let scope = { n: n, p: pValue, q: n };
        try {
            let classical = logClassicalFunction(n, scope);
            let quantum = logQuantumFunction(n, scope);
            let penalty = logPenaltyFunction(n, scope);
            
            if (classical && typeof classical === 'object' && classical.toNumber) classical = classical.toNumber();
            if (quantum && typeof quantum === 'object' && quantum.toNumber) quantum = quantum.toNumber();
            if (penalty && typeof penalty === 'object' && penalty.toNumber) penalty = penalty.toNumber();
            
            return classical - quantum - penalty - adjustmentFactor;
        } catch (error) {
            return -Infinity;
        }
    }

    let upperBound = 10 ** 100;
    let lowerBound = 2;
    if (evaluate(lowerBound) > 0) return Math.log10(lowerBound);

    let iterations = 0;
    let lastValue = evaluate(lowerBound);
    while (lowerBound < 100 && lastValue < 0 && iterations < 50) {
        lowerBound += 0.5;
        let nextValue = evaluate(lowerBound);
        if (nextValue > 0) break;
        lastValue = nextValue;
        iterations++;
    }

    let result = utils.bisectionMethod(evaluate, lowerBound, upperBound, "QA bisection");
    if (result === null || result === 0) return 0;
    if (result === Infinity) return Infinity;

    return Math.log10(result);
}

function convertQubits(model, expression) {
    if (!model.qubitToProblemSize) return expression;
    const kind = utils.classifyQubitMapping(model.qubitToProblemSize);
    let replacement = "";
    if (kind === 'exp') replacement = "(log(n, 2))";
    else if (kind === 'log') replacement = "(2^n)";
    else if (kind === 'linear') replacement = "n";
    else return expression;
    return utils.replaceVariable(expression, "q", replacement);
}

function calculateCurrentAdvantage(model) {
    if (!model.classicalRuntimeInput || !model.quantumRuntimeInput) return;
    
    const hardwareSlowdown = Number(model.hardwareSlowdown) || 0;
    const quantumImprovementRate = utils.percentageToFraction(Number(model.quantumImprovementRate) || 0);
    const costFactor = Number(model.costFactor) || 1;
    const costImprovementRate = utils.percentageToFraction(Number(model.costImprovementRate) || 0);
    const processors = Number(model.processors) || 1;

    const penaltyInput = convertQubits(model, model.penaltyInput || "0");
    const quantumWork = convertQubits(model, model.quantumWork || "0");

    const lcf = utils.createLoggedFunction(model.classicalRuntimeInput);
    const lqf = utils.createLoggedFunction(model.quantumRuntimeInput);
    const lpf = utils.createLoggedFunction(penaltyInput);

    const ccf = utils.createConvertedFunction(model.classicalRuntimeInput);
    const cqf = utils.createConvertedFunction(model.quantumRuntimeInput);
    const cpf = utils.createConvertedFunction(penaltyInput);

    const lcfc = utils.createLoggedFunction(model.classicalWork);
    const lqfc = utils.createLoggedFunction(quantumWork);
    const ccfc = utils.createConvertedFunction(model.classicalWork);
    const cqfc = utils.createConvertedFunction(quantumWork);

    let advantage = getQuantumAdvantage(lcf, lqf, lpf, hardwareSlowdown, quantumImprovementRate, processors, costImprovementRate, currentYear);
    let costAdvantage = getQuantumAdvantage(lcfc, lqfc, lpf, costFactor, costImprovementRate, processors, costImprovementRate, currentYear);

    let xMax = 100; 
    let currentAdvantageDataAux = { nStar: 0, stepStar: 0, nCostStar: 0, stepCostStar: 0 };
    const isAdvInfinite = advantage === Infinity;
    const isCostInfinite = costAdvantage === Infinity;

    if (isAdvInfinite && isCostInfinite) {
        xMax = 100;
        currentAdvantageDataAux = { nStar: -1, stepStar: -1, nCostStar: -1, stepCostStar: -1 };
    } else {
        let maxVal = 0;
        if (!isAdvInfinite) maxVal = Math.max(maxVal, advantage);
        if (!isCostInfinite) maxVal = Math.max(maxVal, costAdvantage);
        if (maxVal === 0) xMax = 100;
        else xMax = maxVal * 1.5; 
        if (xMax > 1e100) xMax = 1e100;

        currentAdvantageDataAux.nStar = isAdvInfinite ? -1 : advantage;
        currentAdvantageDataAux.nCostStar = isCostInfinite ? -1 : costAdvantage;
        
        const pVal = Math.pow(10, processors);
        if (!isAdvInfinite) {
            currentAdvantageDataAux.stepStar = ccf(advantage, { n: advantage, p: pVal });
        }
        if (!isCostInfinite) {
            currentAdvantageDataAux.stepCostStar = ccfc(costAdvantage, { n: costAdvantage, p: pVal });
        }
    }

    const stepSize = xMax / 200;
    let range = [];
    for (let i = stepSize; i <= xMax; i += stepSize) {
        range.push(i);
    }
    
    const pVal = Math.pow(10, processors);
    const safeCalc = (fn, n, scope) => {
        try {
            const val = fn(n, scope);
            return (Number.isFinite(val) && val > 0) ? val : null;
        } catch { return null; }
    };

    const qSteps = range.map(i => [i, safeCalc(cqf, i) + safeCalc(cpf, i) + hardwareSlowdown]);
    const cSteps = range.map(i => [i, safeCalc(ccf, i, {n:i, p:pVal})]);
    const qCostSteps = range.map(i => [i, safeCalc(cqfc, i) + safeCalc(cpf, i) + costFactor]);
    const cCostSteps = range.map(i => [i, safeCalc(ccfc, i)]);

    currentAdvantageData.value = {
        ...currentAdvantageDataAux,
        quantumSteps: qSteps.map(p => [p[0], p[1] || 99999]), 
        classicalSteps: cSteps.map(p => [p[0], p[1] || -1]),
        quantumCostSteps: qCostSteps.map(p => [p[0], p[1] || 99999]),
        classicalCostSteps: cCostSteps.map(p => [p[0], p[1] || -1]),
        problemName: model.problemName,
    };
}

function calculateQuantumEconomicAdvantage(model) {
    if (!model.classicalRuntimeInput || !model.quantumRuntimeInput) return;

    const hardwareSlowdown = model.hardwareSlowdown || 0;
    const physicalLogicalQubitsRatio = model.physicalLogicalQubitsRatio || 1000;
    const ratioImprovementRate = utils.percentageToFraction(Number(model.ratioImprovementRate) || -10);
    const quantumImprovementRate = utils.percentageToFraction(Number(model.quantumImprovementRate) || -10);
    const costImprovementRate = utils.percentageToFraction(Number(model.costImprovementRate) || -10);
    const costFactor = Number(model.costFactor) || 1;
    const processors = Number(model.processors) || 1;
    
    const qubitToProblemSize = model.qubitToProblemSize || "q";
    const roadmapUnit = model.roadmapUnit || "physical";
    const penaltyInput = convertQubits(model, model.penaltyInput || "0");

    const lcf = utils.createLoggedFunction(model.classicalRuntimeInput);
    const lqf = utils.createLoggedFunction(model.quantumRuntimeInput);
    const lpf = utils.createLoggedFunction(penaltyInput);
    const lcfc = utils.createLoggedFunction(model.classicalWork);
    const lqfc = utils.createLoggedFunction(convertQubits(model, model.quantumWork));

    const qf = (year) => getQuantumFeasible(year, model.roadmap, physicalLogicalQubitsRatio, ratioImprovementRate, qubitToProblemSize, roadmapUnit);
    const qa = (year) => getQuantumAdvantage(lcf, lqf, lpf, hardwareSlowdown, quantumImprovementRate, processors, costImprovementRate, year);
    const qca = (year) => getQuantumAdvantage(lcfc, lqfc, lpf, costFactor, costImprovementRate, processors, costImprovementRate, year);

    const tStar = utils.bisectionMethod(year => qf(year) - qa(year), currentYear, 3000, "tStar");
    const tCostStar = utils.bisectionMethod(year => qf(year) - qca(year), currentYear, 3000, "tCostStar");

    let yearRadius = 5;
    const validTStar = (tStar !== null && tStar !== Infinity && tStar !== 0);
    const validTCostStar = (tCostStar !== null && tCostStar !== Infinity && tCostStar !== 0);

    if (validTStar && validTCostStar) {
        yearRadius = (Math.max(tStar, tCostStar) - currentYear) + 5;
    } else if (validTStar) {
        yearRadius = (tStar - currentYear) + 5;
    } else if (validTCostStar) {
        yearRadius = (tCostStar - currentYear) + 5;
    }
    
    if (yearRadius > 100) yearRadius = 100;
    if (yearRadius < 5) yearRadius = 5;

    let range = [];
    const endYear = currentYear + yearRadius;
    for (let y = currentYear; y <= endYear; y += yearRadius/50) {
        range.push(y);
    }

    // Map Infinite values to a high ceiling (100) to ensure the graph area fills correctly
    const safeMap = (y, fn) => {
        const val = fn(y);
        return [y, Number.isFinite(val) ? val : 100];
    };

    const quantumFeasibleList = range.map(y => safeMap(y, qf));
    const quantumAdvantageList = range.map(y => safeMap(y, qa));
    const quantumCostAdvantageList = range.map(y => safeMap(y, qca));

    // Calculate safe "midpoints" for the labels so they don't disappear if data is weird
    const safeMid = (x) => (Number.isFinite(x) && x > currentYear) ? x : (currentYear + 20);
    
    const auxData = {
        tStar: tStar || Infinity,
        nStar: validTStar ? qf(tStar) : Infinity,
        tCostStar: tCostStar || Infinity,
        nCostStar: validTCostStar ? qf(tCostStar) : Infinity,
        quantumFeasible: quantumFeasibleList,
        quantumAdvantage: quantumAdvantageList,
        quantumCostAdvantage: quantumCostAdvantageList,
        problemName: model.problemName,
        // Helper coordinates for labels
        advantageAreaMid: [safeMid(tStar), 50], 
    };

    quantumEconomicAdvantageData.value = auxData;

    roadmapCharacteristicsData.value = {
        roadmapUnit,
        tCostStar: auxData.tCostStar,
        tStar: auxData.tStar,
        nStar: auxData.nStar, // Pass this through for labels
        nCostStar: auxData.nCostStar,
        roadmap: model.roadmap,
        extrapolationType: model.extrapolationType,
        physicalLogicalQubitsRatio,
        ratioImprovementRate,
        qubitToProblemSize,
        quantumFeasible: quantumFeasibleList,
        quantumAdvantage: quantumAdvantageList,
        quantumCostAdvantage: quantumCostAdvantageList,
        // Add safe label coordinates for the Characteristics graph
        advantageAreaMid: [safeMid(tStar), 50],
    };
}

function getLogicalQubits(year, roadmap, physicalLogicalQubitsRatio, ratioImprovementRate, roadmapUnit) {
    const logOfPhysicalQubits = utils.getPhysicalQubits(year, roadmap, props.model.extrapolationType);
    if (roadmapUnit === "logical") return logOfPhysicalQubits;
    let adjustedPLQR = Math.log10(physicalLogicalQubitsRatio) + (year - currentYear) * Math.log10(ratioImprovementRate);
    adjustedPLQR = Math.max(adjustedPLQR, Math.log10(3));
    return logOfPhysicalQubits - adjustedPLQR;
}

function getQuantumFeasible(year, roadmap, physicalLogicalQubitsRatio, ratioImprovementRate, qubitToProblemSize, roadmapUnit) {
    const logLogicalQubits = getLogicalQubits(year, roadmap, physicalLogicalQubitsRatio, ratioImprovementRate, roadmapUnit);
    const kind = utils.classifyQubitMapping(qubitToProblemSize);
    if (kind === 'exp') return 10 ** (logLogicalQubits + Math.log10(Math.log10(2)));
    if (kind === 'doubleexp') return Math.pow(2, Math.pow(10, logLogicalQubits)) * Math.log10(2);
    if (kind === 'linear') return logLogicalQubits;
    if (kind === 'log') {
        const val = Math.log10(logLogicalQubits) - Math.log10(Math.log10(2));
        return isNaN(val) ? 0 : val;
    }
    const logicalQubits = Math.pow(10, logLogicalQubits);
    const mapped = utils.evaluateQubitMapping(qubitToProblemSize, logicalQubits, { clamp: 1e300 });
    return mapped.ok ? mapped.value : 0;
}

let debounceTimer = null;
watch(() => props.model, (newModel) => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        if (!newModel) return;
        requestAnimationFrame(() => {
            calculateCurrentAdvantage(newModel);
            calculateQuantumEconomicAdvantage(newModel);
        });
    }, 50); 
}, { immediate: true, deep: true });

onUnmounted(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
});
</script>

<template>
    <div class="max-w-7xl mx-auto my-4 border border-gray-100 rounded-lg shadow-lg">
        <div>
            <Form :modelId="model.id" />
        </div>
        
        <Disclosure as="div" class="px-8 py-2" v-slot="{ open }" defaultOpen>
            <DisclosureButton class="py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 text-left px-4 rounded-md flex justify-between w-full border border-gray-200">
                Quantum Economic Advantage
                <span>{{ open ? '-' : '+' }}</span>
            </DisclosureButton>
            <DisclosurePanel class="text-gray-500">
                <div class="flex flex-wrap items-center justify-end gap-4 py-2">
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-gray-600">Show steps / speed</span>
                        <button type="button" @click="showStepLines = !showStepLines" :class="['w-10 h-5 rounded-full transition-colors duration-200 flex items-center', showStepLines ? 'bg-[#002D9D]/80' : 'bg-gray-300']">
                            <span :class="['w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200', showStepLines ? 'translate-x-5' : 'translate-x-1']" />
                        </button>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-gray-600">Show cost</span>
                        <button type="button" @click="showCostLines = !showCostLines" :class="['w-10 h-5 rounded-full transition-colors duration-200 flex items-center', showCostLines ? 'bg-[#002D9D]/80' : 'bg-gray-300']">
                            <span :class="['w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200', showCostLines ? 'translate-x-5' : 'translate-x-1']" />
                        </button>
                    </div>
                </div>

                <div class="lg:flex gap-4 py-2 min-h-[400px]">
                    <QuantumAdvantageGraph :data="currentAdvantageData" :show-steps="showStepLines" :show-cost="showCostLines" />
                    <QuantumEconomicAdvantageGraph :data="quantumEconomicAdvantageData" :show-steps="showStepLines" :show-cost="showCostLines" />
                </div>
            </DisclosurePanel>
        </Disclosure>

        <Disclosure as="div" class="px-8 py-2" v-slot="{ open }" defaultOpen>
            <DisclosureButton class="py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 text-left px-4 rounded-md flex justify-between w-full border border-gray-200">
                Quantum Timelines
                <span>{{ open ? '-' : '+' }}</span>
            </DisclosureButton>
            <DisclosurePanel class="text-gray-500">
                <QuantumCharacteristicsGraph :data="roadmapCharacteristicsData" />
            </DisclosurePanel>
        </Disclosure>
    </div>
</template>