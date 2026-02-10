<script setup>
import Multiselect from 'vue-multiselect'
import HardwareSlowdownAdvanced from './HardwareSlowdownAdvanced.vue';
import { useModelsStore } from '../store/models';
import { Switch } from '@headlessui/vue'
import MappingPreview from './MappingPreview.vue'
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import EditRoadmap from './EditRoadmap.vue';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import ReferenceDialog from './ReferenceDialog.vue';
import HardwareReferences from './HardwareReferences.vue';
import ProblemReferences from './ProblemReferences.vue';
import ProblemRuntimeAdvanced from './ProblemRuntimeAdvanced.vue';
import * as math from 'mathjs';
import { algorithmVariants, getBestAlgorithm } from '../store/algorithmVariants';

const models = useModelsStore();
const props = defineProps({ modelId: Number });
const model = ref(null);
const isUpdatingFromAlgorithm = ref(false);

// Local State for Selectors
const selectedProblem = ref(null);
const selectedHardware = ref(null);
const selectedClassicalAlgorithm = ref(null);
const selectedQuantumAlgorithm = ref(null);
const editMode = ref(false);

// Lists
const problems = ref([
    {
        problemName: "Integer Factorization",
        classicalRuntimeInput: "e^((64/9 * n)^(1/3) * log(n, e)^(2/3)) / p",
        classicalWork: "e^((64/9 * n)^(1/3) * log(n, e)^(2/3))",
        quantumRuntimeInput: "n^(2) * log(n, e)",
        quantumWork: "n^(2) * log(n, e) * q",
        qubitToProblemSize: "{q}",
    },
    {
        problemName: "Database Search",
        classicalRuntimeInput: "n / p",
        classicalWork: "n",
        quantumRuntimeInput: "sqrt(n)",
        quantumWork: "sqrt(n) * q",
        qubitToProblemSize: "2^{q}",
    },
    {
        problemName: "Traveling Salesman",
        classicalRuntimeInput: "n^3 * 2^n / p",
        classicalWork: "n^3 * 2^n",
        quantumRuntimeInput: "n * 1.78^n",
        quantumWork: "n * 1.78^n * q",
        qubitToProblemSize: "{q}",
    },
    {
        problemName: "Time Dependent Hartree-Fock Approximation (Quantum Chemistry)",
        classicalRuntimeInput: "n^3",
        classicalWork: "n^3",
        quantumRuntimeInput: "n",
        quantumWork: "n * q",
        qubitToProblemSize: "{q}",
    },
    {
        problemName: "Full Configuration Interaction (Quantum Chemistry)",
        classicalRuntimeInput: "(2 * pi * n)^(1/2) * (n / e)^n",
        classicalWork: "(2 * pi * n)^(1/2) * (n / e)^n",
        quantumRuntimeInput: "n^5",
        quantumWork: "n^5 * q",
        qubitToProblemSize: "{q}",
    },
]);

const hardwares = ref([
    {
        hardwareName: "IBM (Superconducting)",
        penaltyInput: "sqrt(q)",
        processors: 5,
        hardwareSlowdown: 3.78,
        costFactor: 8,
        quantumImprovementRate: -10,
        costImprovementRate: -10,
        physicalLogicalQubitsRatio: 264,
        ratioImprovementRate: -23,
        roadmap: { 2020: 27, 2024: 133, 2025: 156, 2028: 1092 },
        roadmapUnit: "physical",
        extrapolationType: "exponential",
        advancedSlowdown: { gateTime: 12, cpuGHz: 5, speed: 60, gateOverhead: 100, algorithmConstant: 1 },
        reference: "https://www.ibm.com/roadmaps/quantum.pdf"
    },
    {
        hardwareName: "Google (Superconducting)",
        penaltyInput: "sqrt(q)",
        processors: 5,
        hardwareSlowdown: 3.78,
        costFactor: 8,
        quantumImprovementRate: -10,
        costImprovementRate: -10,
        physicalLogicalQubitsRatio: 1000,
        ratioImprovementRate: -10,
        roadmap: { 2019: 53, 2024: 105 },
        roadmapUnit: "physical",
        extrapolationType: "exponential",
        advancedSlowdown: { gateTime: 12, cpuGHz: 5, speed: 60, gateOverhead: 100, algorithmConstant: 1 },
        reference: "Sycamore (2019), and Willow (2024).",
    },
    {
        hardwareName: "Rigetti (Superconducting)",
        penaltyInput: "sqrt(q)",
        processors: 5,
        hardwareSlowdown: 3.78,
        costFactor: 8,
        quantumImprovementRate: -10,
        costImprovementRate: -10,
        physicalLogicalQubitsRatio: 1000,
        ratioImprovementRate: -10,
        roadmap: { 2018: 19, 2021: 40, 2024: 84 },
        roadmapUnit: "physical",
        extrapolationType: "exponential",
        advancedSlowdown: { gateTime: 12, cpuGHz: 5, speed: 60, gateOverhead: 100, algorithmConstant: 1 },
        reference: "19Q (2018), Aspen-M non-modular (2021), Ankaa-3 (2024)",
    },
    {
        hardwareName: "IonQ (Trapped Ion)",
        penaltyInput: "1",
        processors: 5,
        hardwareSlowdown: 8.48,
        costFactor: 8,
        quantumImprovementRate: -10,
        costImprovementRate: -10,
        physicalLogicalQubitsRatio: 32,
        ratioImprovementRate: -23,
        roadmap: { 2021: 22, 2024: 35, 2028: 1024 },
        roadmapUnit: "physical",
        extrapolationType: "exponential",
        advancedSlowdown: { gateTime: 600000, cpuGHz: 5, speed: 3000000, gateOverhead: 100, algorithmConstant: 1 },
        reference: "https://ionq.com/blog/how-we-achieved-our-2024-performance-target-of-aq-35",
    },
    {
        hardwareName: "QuEra (Neutral Atom)",
        penaltyInput: "1",
        processors: 5,
        hardwareSlowdown: 5.1,
        costFactor: 8,
        quantumImprovementRate: -10,
        costImprovementRate: -10,
        physicalLogicalQubitsRatio: 100,
        ratioImprovementRate: -23,
        roadmap: { 2023: 256, 2025: 3000, 2026: 10000 },
        roadmapUnit: "physical",
        extrapolationType: "exponential",
        advancedSlowdown: { gateTime: 250, cpuGHz: 5, speed: 1250, gateOverhead: 100, algorithmConstant: 1 },
        reference: "https://www.quera.com/qec",
    },
    {
        hardwareName: "Pasqal (Neutral Atom)",
        penaltyInput: "sqrt(q)",
        processors: 5,
        hardwareSlowdown: 5.1,
        costFactor: 8,
        quantumImprovementRate: -10,
        costImprovementRate: -10,
        physicalLogicalQubitsRatio: 100,
        ratioImprovementRate: -10,
        roadmap: { 2022: 200, 2024: 1000, 2026: 10000 },
        roadmapUnit: "physical",
        extrapolationType: "exponential",
        advancedSlowdown: { gateTime: 250, cpuGHz: 5, speed: 1250, gateOverhead: 100, algorithmConstant: 1 },
        reference: "https://www.hpcwire.com/2024/03/13/pasqal-issues-roadmap-to-10000-qubits-in-2026-and-fault-tolerance-in-2028/",
    },
    {
        hardwareName: "Infleqtion (Neutral Atom)",
        penaltyInput: "sqrt(q)",
        processors: 5,
        hardwareSlowdown: 5.1,
        costFactor: 8,
        quantumImprovementRate: -10,
        costImprovementRate: -10,
        physicalLogicalQubitsRatio: 800,
        ratioImprovementRate: -10,
        roadmap: { 2024: 2, 2026: 10, 2028: 100 },
        roadmapUnit: "logical",
        extrapolationType: "exponential",
        advancedSlowdown: { gateTime: 250, cpuGHz: 5, speed: 1250, gateOverhead: 100, algorithmConstant: 1 },
        reference: "https://www.nextbigfuture.com/2024/02/infleqtion-1600-qubit-array-today-and-five-year-roadmap-to-fault-tolerant-quantum-computers.html",
    },
    {
        hardwareName: "Quantum Silicon (Semiconductors)",
        penaltyInput: "sqrt(q)",
        processors: 5,
        hardwareSlowdown: 5.1,
        costFactor: 8,
        quantumImprovementRate: -10,
        costImprovementRate: -10,
        physicalLogicalQubitsRatio: 100,
        ratioImprovementRate: -10,
        roadmap: { 2018: 1, 2021: 6, 2024: 100 },
        roadmapUnit: "physical",
        extrapolationType: "exponential",
        advancedSlowdown: { gateTime: 250, cpuGHz: 5, speed: 1250, gateOverhead: 100, algorithmConstant: 1 },
        reference: "https://www.eetimes.eu/cea-leti-details-silicon-based-quantum-computing-roadmap/",
    },
]);

// Computed
const availableClassicalAlgorithms = computed(() => {
    if (!selectedProblem.value) return [];
    const problemVariants = algorithmVariants[selectedProblem.value.problemName];
    if (!problemVariants) return [];
    return problemVariants.classical.filter(a => a.available);
});

const availableQuantumAlgorithms = computed(() => {
    if (!selectedProblem.value) return [];
    const problemVariants = algorithmVariants[selectedProblem.value.problemName];
    if (!problemVariants) return [];
    return problemVariants.quantum.filter(a => a.available);
});

const lockPLQR = computed(() => model.value?.roadmapUnit !== "physical");

// --- Initialization ---
onMounted(() => {
    const storeModel = models.models.find(m => m.id === props.modelId);
    if (storeModel) {
        // We clone it to avoid mutating the store directly without actions
        model.value = JSON.parse(JSON.stringify(storeModel));
        
        // Init UI Selectors based on loaded data
        selectedProblem.value = problems.value.find(p => p.problemName === model.value.problemName) || problems.value[0];
        selectedHardware.value = hardwares.value.find(h => h.hardwareName === model.value.hardwareName) || hardwares.value[0];
    }
});

// --- Watchers ---

// 1. Hardware Change
watch(selectedHardware, (newHw, oldHw) => {
    if (!newHw || !model.value) return;
    if (oldHw && newHw.hardwareName === oldHw.hardwareName) return;

    // Direct Object assign to keep reactivity but update fields
    Object.assign(model.value, {
        hardwareName: newHw.hardwareName,
        penaltyInput: newHw.penaltyInput,
        processors: newHw.processors,
        hardwareSlowdown: newHw.hardwareSlowdown,
        physicalLogicalQubitsRatio: newHw.physicalLogicalQubitsRatio,
        quantumImprovementRate: newHw.quantumImprovementRate,
        roadmap: newHw.roadmap,
        roadmapUnit: newHw.roadmapUnit,
        extrapolationType: newHw.extrapolationType,
        ratioImprovementRate: newHw.ratioImprovementRate,
        costFactor: newHw.costFactor,
        costImprovementRate: newHw.costImprovementRate,
        advancedSlowdown: newHw.advancedSlowdown
    });
}, { deep: true });

// 2. Problem Change (Atomic Update)
watch(selectedProblem, (newProblem, oldProblem) => {
    if (!newProblem || !model.value) return;
    if (oldProblem && newProblem.problemName === oldProblem.problemName) return;

    // Lock to prevent algorithm watcher from firing cyclically
    isUpdatingFromAlgorithm.value = true;

    const updates = {
        problemName: newProblem.problemName,
        qubitToProblemSize: newProblem.qubitToProblemSize
    };

    // Auto-select best algorithms for this problem
    const problemVariants = algorithmVariants[newProblem.problemName];
    if (problemVariants) {
        const bestClassical = getBestAlgorithm(problemVariants.classical);
        const bestQuantum = getBestAlgorithm(problemVariants.quantum);
        
        selectedClassicalAlgorithm.value = bestClassical || null;
        selectedQuantumAlgorithm.value = bestQuantum || null;

        // Use best algo formula if available, otherwise default to problem fallback
        if (bestClassical) {
            updates.classicalRuntimeInput = bestClassical.classicalRuntimeInput || bestClassical.runtimeFormula;
            updates.classicalWork = bestClassical.classicalWork || bestClassical.workFormula;
        } else {
            updates.classicalRuntimeInput = newProblem.classicalRuntimeInput;
            updates.classicalWork = newProblem.classicalWork;
        }

        if (bestQuantum) {
            updates.quantumRuntimeInput = bestQuantum.quantumRuntimeInput || bestQuantum.runtimeFormula;
            updates.quantumWork = bestQuantum.quantumWork || bestQuantum.workFormula;
        } else {
            updates.quantumRuntimeInput = newProblem.quantumRuntimeInput;
            updates.quantumWork = newProblem.quantumWork;
        }
    } else {
        selectedClassicalAlgorithm.value = null;
        selectedQuantumAlgorithm.value = null;
        updates.classicalRuntimeInput = newProblem.classicalRuntimeInput;
        updates.classicalWork = newProblem.classicalWork;
        updates.quantumRuntimeInput = newProblem.quantumRuntimeInput;
        updates.quantumWork = newProblem.quantumWork;
    }

    // Apply updates atomically
    Object.assign(model.value, updates);

    nextTick(() => {
        isUpdatingFromAlgorithm.value = false;
    });
}, { deep: true });

// 3. Algorithm Changes (Manual Selection Only)
watch(selectedClassicalAlgorithm, (newAlg) => {
    if (!newAlg || isUpdatingFromAlgorithm.value || !model.value) return;
    
    model.value.classicalRuntimeInput = newAlg.runtimeFormula || newAlg.classicalRuntimeInput;
    model.value.classicalWork = newAlg.workFormula || newAlg.classicalWork;
});

watch(selectedQuantumAlgorithm, (newAlg) => {
    if (!newAlg || isUpdatingFromAlgorithm.value || !model.value) return;

    model.value.quantumRuntimeInput = newAlg.runtimeFormula || newAlg.quantumRuntimeInput;
    model.value.quantumWork = newAlg.workFormula || newAlg.quantumWork;
});

// 4. Sync to Pinia Store
watch(model, (newVal) => {
    if (newVal) {
        models.updateModel(props.modelId, newVal);
    }
}, { deep: true });


// --- Actions ---
function updateSlowdown(hwSlowdown, advancedSlowdown) {
    model.value.hardwareSlowdown = hwSlowdown;
    model.value.advancedSlowdown = advancedSlowdown;
}

function updateRoadmap(value) {
    Object.assign(model.value, {
        roadmap: value.roadmap,
        extrapolationType: value.extrapolationType,
        roadmapUnit: value.roadmapUnit
    });
}

function removeModel() { models.removeModel(props.modelId); }
function duplicateModel() { models.duplicateModel(props.modelId); }

function getRelevantRoadmapPoints(data) {
    if (!data) return {};
    const keys = Object.keys(data);
    if (keys.length <= 3) return data;
    const result = {};
    result[keys[0]] = data[keys[0]];
    result[keys[keys.length - 1]] = data[keys[keys.length - 1]];
    const middleIndex = Math.floor((keys.length - 1) / 2);
    result[keys[middleIndex]] = data[keys[middleIndex]];
    return result;
}

function checkLimits() {
    ['quantumImprovementRate', 'costImprovementRate', 'ratioImprovementRate'].forEach(k => {
        if (model.value[k] > 90) model.value[k] = 90;
        if (model.value[k] < -90) model.value[k] = -90;
    });
    if (model.value.physicalLogicalQubitsRatio < 3) model.value.physicalLogicalQubitsRatio = 3;
}

function updateFunctions(updatedValues) {
    Object.assign(model.value, updatedValues);
    model.value.processors = Number(updatedValues.processors);
}

function onAlgorithmChange({ classicalAlgorithm, quantumAlgorithm }) {
    // 1. Update the local selection state
    if (classicalAlgorithm) selectedClassicalAlgorithm.value = classicalAlgorithm;
    if (quantumAlgorithm) selectedQuantumAlgorithm.value = quantumAlgorithm;

    // 2. FORCE update the model formulas immediately. 
    // The watchers might not fire if the object reference is identical or if isUpdatingFromAlgorithm is true.
    if (model.value) {
        const updates = {};
        if (classicalAlgorithm) {
            updates.classicalRuntimeInput = classicalAlgorithm.runtimeFormula || classicalAlgorithm.classicalRuntimeInput;
            updates.classicalWork = classicalAlgorithm.workFormula || classicalAlgorithm.classicalWork;
        }
        if (quantumAlgorithm) {
            updates.quantumRuntimeInput = quantumAlgorithm.runtimeFormula || quantumAlgorithm.quantumRuntimeInput;
            updates.quantumWork = quantumAlgorithm.workFormula || quantumAlgorithm.quantumWork;
        }
        
        // Apply updates to the reactive model
        Object.assign(model.value, updates);
        
        // 3. Force a store sync
        models.updateModel(props.modelId, model.value);
    }
}
</script>

<template>
    <div class="" v-if="model">
        <div class="flex justify-between items-center border-b w-full px-8 py-2 bg-slate-100">
            <h2 class="text-xl text-center font-medium">{{ model.id }}. {{ model.problemName }} on {{ model.hardwareName }}</h2>

            <div class="flex flex-wrap items-center gap-4">
                <label class="flex items-center gap-1 cursor-pointer">
                    <Switch v-model="editMode" :class="!editMode ? 'bg-[#002D9D]' : 'bg-gray-400'"
                        class="relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75">
                        <span class="sr-only">Advanced Options</span>
                        <span aria-hidden="true" :class="!editMode ? 'translate-x-4' : 'translate-x-0'"
                            class="pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out" />
                    </Switch>
                    <span class="text-sm" :class="!editMode ? 'text-[#002D9D]' : 'text-gray-400'">Advanced Options</span>
                </label>
                <button class="flex items-center justify-center rounded-md bg-blue-100 ring-1 ring-opacity-50 ring-[#002D9D] px-2 py-2 text-sm text-[#002D9D] hover:bg-blue-200" @click="duplicateModel">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                    </svg>
                </button>
                <button class="flex items-center justify-center rounded-md bg-red-50 ring-1 ring-opacity-50 ring-red-900 px-2 py-2 text-sm text-red-900 hover:bg-red-100" @click="removeModel">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                </button>
            </div>
        </div>

        <div class="px-8 py-2 justify-between items-center gap-8 transition-all duration-500 ease-in-out"
            :class="{ 'max-h-96 opacity-100 flex flex-wrap md:flex-nowrap': editMode, 'max-h-0 opacity-0 hidden': !editMode }">
            <div class="w-full">
                <div class="flex items-center gap-2">
                    <label class="font-medium">Problem</label>
                    <ReferenceDialog title="References" classes="max-w-3xl">
                        <template #content><ProblemReferences /></template>
                    </ReferenceDialog>
                </div>
                <multiselect class="custom-multiselect mt-1" track-by="problemName" label="problemName"
                    v-model="selectedProblem" :options="problems" :searchable="true" :close-on-select="true"
                    :allowEmpty="false" :show-labels="false" placeholder="Pick a value" />
            </div>

            <div class="w-full">
                <div class="flex items-center gap-2">
                    <label class="font-medium">Roadmap</label>
                    <ReferenceDialog title="References" classes="max-w-lg">
                        <template #content><HardwareReferences /></template>
                    </ReferenceDialog>
                </div>
                <multiselect class="custom-multiselect" track-by="hardwareName" label="hardwareName"
                    v-model="selectedHardware" :options="hardwares" :searchable="true" :close-on-select="true"
                    :allowEmpty="false" :show-labels="false" placeholder="Pick a hardware provider">
                </multiselect>
            </div>
        </div>

        <div class="px-8 py-2 md:flex justify-between gap-8 transition-all duration-500 ease-in-out" v-show="!editMode"
            :class="{ 'max-h-screen pb-8 opacity-100': !editMode, 'max-h-0 opacity-0 hidden': editMode }">
            
            <div class="lg:grid grid-cols-2 gap-4 lg:w-2/4">
                <div>
                    <div class="flex justify-between mb-1">
                        <div class="flex items-center gap-2">
                            <label class="font-medium">Problem</label>
                            <ReferenceDialog title="References" classes="max-w-3xl">
                                <template #content><ProblemReferences /></template>
                            </ReferenceDialog>
                        </div>
                        <ProblemRuntimeAdvanced :classicalRuntimeInput="model.classicalRuntimeInput"
                            :quantumRuntimeInput="model.quantumRuntimeInput" :penaltyInput="model.penaltyInput"
                            :classicalWork="model.classicalWork" :quantumWork="model.quantumWork"
                            :processors="model.processors" :availableClassicalAlgorithms="availableClassicalAlgorithms"
                            :availableQuantumAlgorithms="availableQuantumAlgorithms"
                            :selectedClassicalAlgorithm="selectedClassicalAlgorithm"
                            :selectedQuantumAlgorithm="selectedQuantumAlgorithm" @updateFunctions="updateFunctions"
                            @updateAlgorithmChange="onAlgorithmChange" v-slot="{ openModal }">
                            <button class="rounded-md bg-gray-500 text-xs p-0.5 px-2 text-white hover:bg-gray-600" @click="openModal">
                                Advanced options
                            </button>
                        </ProblemRuntimeAdvanced>
                    </div>

                    <multiselect class="custom-multiselect mt-1" track-by="problemName" label="problemName"
                        v-model="selectedProblem" :options="problems" :searchable="true" :close-on-select="true"
                        :show-labels="false" placeholder="Pick a value"></multiselect>

                    <div class="mt-2">
                        <p class="text-sm font-medium">Classical Runtime</p>
                        <div class="flex items-center justify-center gap-2 bg-gray-100 p-2 rounded-lg min-h-[40px]">
                            <span v-if="model.classicalRuntimeInput" v-html="katex.renderToString(math.parse(model.classicalRuntimeInput).toTex())"></span>
                            <span v-else class="text-gray-400 italic">Loading...</span>
                        </div>
                    </div>
                    <div class="mt-2">
                        <p class="text-sm font-medium">Quantum Runtime</p>
                        <div class="flex items-center justify-center gap-2 bg-gray-100 p-2 rounded-lg min-h-[40px]">
                            <span v-if="model.quantumRuntimeInput" v-html="katex.renderToString(math.parse(model.quantumRuntimeInput).toTex())"></span>
                            <span v-else class="text-gray-400 italic">Loading...</span>
                        </div>
                    </div>
                </div>

                <div>
                    <div class="flex justify-between mb-1">
                        <div class="flex items-center gap-2">
                            <label class="font-medium">Roadmap</label>
                            <ReferenceDialog title="References" classes="max-w-lg">
                                <template #content><HardwareReferences /></template>
                            </ReferenceDialog>
                        </div>
                        <EditRoadmap :name="model.hardwareName" :roadmap="model.roadmap"
                            :extrapolationType="model.extrapolationType" @updateRoadmap="updateRoadmap"
                            :roadmapUnit="model.roadmapUnit"
                            :physicalLogicalQubitsRatio="model.physicalLogicalQubitsRatio" v-slot="{ openModal }">
                            <button class="rounded-md bg-gray-500 text-xs p-0.5 px-2 text-white hover:bg-gray-600" @click="openModal">
                                Edit roadmap
                            </button>
                        </EditRoadmap>
                    </div>

                    <multiselect class="custom-multiselect" track-by="hardwareName" label="hardwareName"
                        v-model="selectedHardware" :options="hardwares" :searchable="true" :close-on-select="true"
                        :allowEmpty="false" :show-labels="false" placeholder="Pick a hardware provider">
                    </multiselect>

                    <table class="w-full table-auto mt-4 text-xs">
                        <thead class="bg-gray-100">
                            <tr class="text-left"><th>Year</th><th># of {{ model.roadmapUnit }} Qubits</th></tr>
                        </thead>
                        <tbody class="text-left">
                            <tr v-for="(value, key) in getRelevantRoadmapPoints(model.roadmap)" :key="key" class="border-b">
                                <td class="p-1">{{ key }}</td><td>{{ value }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="flex flex-col">
                    <label class="font-medium text-sm">Connectivity Penalty</label>
                    <p class="text-xs text-gray-600">Overhead to embed circuit in hardware.</p>
                    <div class="flex items-center justify-center gap-2 bg-gray-100 p-2 rounded-lg min-h-[40px]">
                        <span v-if="model.penaltyInput" v-html="katex.renderToString(math.parse(model.penaltyInput).toTex())"></span>
                        <span v-else class="text-gray-400 italic">Loading...</span>
                    </div>
                </div>

                <div class="flex flex-col">
                    <label class="font-medium text-sm">Qubits to Problem Size</label>
                    <p class="text-xs text-gray-600">Correlates max problem size with qubits (q).</p>
                    <input class="mt-1 bg-gray-100 p-2 rounded-lg text-sm" v-model="model.qubitToProblemSize" type="text" placeholder="q" />
                    <MappingPreview :expr="model.qubitToProblemSize" :roadmap="model.roadmap" />
                </div>
            </div>

            <div class="flex-1">
                 <div>
                    <div class="flex gap-2 items-center justify-between">
                        <div class="flex items-center gap-2">
                            <label class="font-medium text-s">Classical Hardware Speed Advantage</label>
                            <ReferenceDialog title="References" classes="max-w-lg">
                                <template #content>
                                    <h3 class="text-medium text-sm mt-4">Classical Hardware Speed Advantage</h3>
                                    <ul class="text-sm"><li class="ml-4 list-disc"><a class="text-[#012D9D] hover:underline" href="https://arxiv.org/pdf/2310.15505.pdf" target="_blank">The Quantum Tortoise and the Classical Hare</a></li></ul>
                                </template>
                            </ReferenceDialog>
                        </div>
                        <HardwareSlowdownAdvanced :advancedSlowdown="model.advancedSlowdown" @updateSlowdown="updateSlowdown" v-slot="{ openModal }">
                            <button class="rounded-md bg-gray-500 text-xs p-0.5 px-2 text-white hover:bg-gray-600" @click="openModal">Advanced options</button>
                        </HardwareSlowdownAdvanced>
                    </div>
                    <p class="text-xs text-gray-600">Ops classical computer performs in time of one quantum op.</p>
                    <div class="flex items-center justify-between w-full gap-2 mt-2 mb-4">
                        <input class="flex-1 accent-[#002D9D]" type="range" min="0" max="16" step="0.5" v-model="model.hardwareSlowdown" />
                        <div class="bg-gray-100 p-2 rounded-lg text-center w-1/5 flex items-center justify-center relative">
                            <span class="pr-2">10 </span>
                            <input class="w-[6ch] bg-transparent absolute t-0 l-0 ml-14 mb-4 text-xs" type="number" min="0" max="16" step="0.5" v-model="model.hardwareSlowdown" />
                        </div>
                        <div class="bg-gray-100 p-2 rounded-lg text-center w-1/3 flex items-center justify-center relative">
                            <input class="w-[6ch] bg-transparent text-center" type="number" min="-90" max="90" step="1" v-model="model.quantumImprovementRate" @input="checkLimits" />
                            <span class="text-xs text-gray-600 text-left">% change per year</span>
                        </div>
                    </div>
                </div>

                <div class="flex flex-col">
                    <label class="font-medium text-s">Classical Compute Cost Advantage</label>
                    <p class="text-xs text-gray-600">Cost of one quantum op vs one classical op.</p>
                    <div class="flex items-center justify-between w-full gap-2 mt-2 mb-4">
                        <input class="flex-1 accent-[#002D9D]" type="range" min="0" max="16" step="0.5" v-model="model.costFactor" />
                        <div class="bg-gray-100 p-2 rounded-lg text-center w-1/5 flex items-center justify-center relative">
                            <span class="pr-2">10 </span>
                            <input class="w-[6ch] bg-transparent absolute t-0 l-0 ml-14 mb-4 text-xs" type="number" min="0" max="16" step="0.5" v-model="model.costFactor" />
                        </div>
                        <div class="bg-gray-100 p-2 rounded-lg text-center w-1/3 flex items-center justify-center relative">
                            <input class="w-[6ch] bg-transparent text-center" type="number" min="-90" max="90" step="1" v-model="model.costImprovementRate" @input="checkLimits" />
                            <span class="text-xs text-gray-600 text-left">% change per year</span>
                        </div>
                    </div>
                </div>

                <div class="flex flex-col relative">
                    <label class="font-medium text-s">Physical-Logical Qubit Ratio</label>
                    <p class="text-xs text-gray-600">Physical qubits per error corrected logical qubit.</p>
                    <div class="flex items-center justify-between w-full gap-2 mt-2 mb-4 relative">
                        <div v-if="lockPLQR" class="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center text-gray-800 text-sm font-semibold rounded-lg pointer-events-none z-10 drop-shadow-lg px-4 text-center">
                            Physical-Logical Qubit Ratio is unused when roadmap is defined in terms of logical qubits.
                        </div>
                        <input class="flex-1 accent-[#002D9D]" type="range" v-model="model.physicalLogicalQubitsRatio" min="3" max="2000" :disabled="lockPLQR" />
                        <input class="bg-gray-100 p-2 rounded-lg text-center w-1/5" type="number" v-model="model.physicalLogicalQubitsRatio" :disabled="lockPLQR" />
                        <div class="bg-gray-100 p-2 rounded-lg text-center w-1/3 flex items-center justify-center relative">
                            <input class="w-[6ch] bg-transparent text-center" type="number" min="-90" step="1" v-model="model.ratioImprovementRate" @input="checkLimits" :disabled="lockPLQR" />
                            <span class="text-xs text-gray-600 text-left">% change per year</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style src="vue-multiselect/dist/vue-multiselect.css"></style>
<style lang="css" scoped>
.custom-multiselect :deep(.multiselect__tags) .multiselect__tag { background-color: #002D9D; z-index: 999 !important; }
.custom-multiselect :deep(.multiselect__option) { background-color: white; color: #002D9D; border-radius: 4px; padding: 0.25rem; }
.custom-multiselect :deep(.multiselect__option)--highlight { background-color: #002D9D; color: white; }
.hide-arrow[type="number"]::-webkit-inner-spin-button, .hide-arrow[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
.hide-arrow[type="number"] { -moz-appearance: textfield; appearance: textfield; }
</style>