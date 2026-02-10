<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import Dialog from './Dialog.vue';
import Multiselect from 'vue-multiselect'
import * as math from 'mathjs';
import * as utils from "../store/utils"
import katex from 'katex';
import 'katex/dist/katex.min.css';

const props = defineProps({
    classicalRuntimeInput: String,
    quantumRuntimeInput: String,
    penaltyInput: String,
    classicalWork: String,
    quantumWork: String,
    processors: Number,
    availableClassicalAlgorithms: {
        type: Array,
        default: () => []
    },
    availableQuantumAlgorithms: {
        type: Array,
        default: () => []
    },
    selectedClassicalAlgorithm: Object,
    selectedQuantumAlgorithm: Object
});

const emit = defineEmits(['updateFunctions', 'updateAlgorithmChange']);

const dialog = ref(null);

// Local state for inputs
const classicalRuntimeInput = ref(props.classicalRuntimeInput);
const quantumRuntimeInput = ref(props.quantumRuntimeInput);
const penaltyInput = ref(props.penaltyInput);
const classicalWork = ref(props.classicalWork);
const quantumWork = ref(props.quantumWork);
const processors = ref(props.processors);

// Local state for algorithm selection
const localSelectedClassicalAlgorithm = ref(props.selectedClassicalAlgorithm);
const localSelectedQuantumAlgorithm = ref(props.selectedQuantumAlgorithm);

const errors = ref({});

// Watch for prop changes to update local state (when parent updates)
watch(() => props.classicalRuntimeInput, (newVal) => classicalRuntimeInput.value = newVal);
watch(() => props.quantumRuntimeInput, (newVal) => quantumRuntimeInput.value = newVal);
watch(() => props.penaltyInput, (newVal) => penaltyInput.value = newVal);
watch(() => props.classicalWork, (newVal) => classicalWork.value = newVal);
watch(() => props.quantumWork, (newVal) => quantumWork.value = newVal);
watch(() => props.processors, (newVal) => processors.value = newVal);

watch(() => props.selectedClassicalAlgorithm, (newVal) => {
    localSelectedClassicalAlgorithm.value = newVal;
});
watch(() => props.selectedQuantumAlgorithm, (newVal) => {
    localSelectedQuantumAlgorithm.value = newVal;
});

// Watch local selection to auto-fill formulas
watch(localSelectedClassicalAlgorithm, (newAlgo) => {
    if (newAlgo) {
        classicalRuntimeInput.value = newAlgo.classicalRuntimeInput || newAlgo.runtimeFormula;
        classicalWork.value = newAlgo.classicalWork || newAlgo.workFormula;
        validateAllInputs(false); 
    }
});

watch(localSelectedQuantumAlgorithm, (newAlgo) => {
    if (newAlgo) {
        quantumRuntimeInput.value = newAlgo.quantumRuntimeInput || newAlgo.runtimeFormula;
        quantumWork.value = newAlgo.quantumWork || newAlgo.workFormula;
        validateAllInputs(false);
    }
});

function reset() {
    classicalRuntimeInput.value = props.classicalRuntimeInput;
    quantumRuntimeInput.value = props.quantumRuntimeInput;
    penaltyInput.value = props.penaltyInput;
    classicalWork.value = props.classicalWork;
    quantumWork.value = props.quantumWork;
    processors.value = props.processors;
    localSelectedClassicalAlgorithm.value = props.selectedClassicalAlgorithm;
    localSelectedQuantumAlgorithm.value = props.selectedQuantumAlgorithm;
    errors.value = {};
}

function save() {
    validateAllInputs();
    if (Object.values(errors.value).some(v => v)) return;

    // 1. Emit formula updates (for the parent's updateFunctions handler)
    emit('updateFunctions', {
        classicalRuntimeInput: classicalRuntimeInput.value,
        quantumRuntimeInput: quantumRuntimeInput.value,
        penaltyInput: penaltyInput.value,
        classicalWork: classicalWork.value,
        quantumWork: quantumWork.value,
        processors: processors.value
    });

    // 2. Emit algorithm selection updates (for the parent's onAlgorithmChange handler)
    emit('updateAlgorithmChange', {
        classicalAlgorithm: localSelectedClassicalAlgorithm.value,
        quantumAlgorithm: localSelectedQuantumAlgorithm.value
    });

    dialog.value.closeModal();
}

function cancel() {
    reset();
    dialog.value.closeModal();
}

function validateInput(inputName, overrideClassicalWork = true) {
    const scope = { n: 1 };

    try {
        // Simple validation check
        if (!eval(inputName).value) throw new Error("Empty input");
        
        // Mock compile to check syntax
        const compiled = math.compile(eval(inputName).value);
        
        // Mock scope
        if (inputName == 'classicalRuntimeInput') {
            scope['p'] = 1;
        } else if (inputName == 'quantumWork' || inputName == 'penaltyInput') {
            scope['q'] = 1;
        }

        compiled.evaluate(scope);
        errors.value[inputName] = false;

        // Auto-update work formula if runtime changes (standard behavior)
        if (overrideClassicalWork && inputName == 'classicalRuntimeInput') {
            // Heuristic: remove '/ p' from runtime to get work
            classicalWork.value = utils.replaceVariable(
                classicalRuntimeInput.value,
                'p',
                '(1)'
            );
            validateInput('classicalWork', false);
        }
    } catch {
        errors.value[inputName] = true;
    }
}

function validateAllInputs(overrideClassicalWork = true) {
    validateInput('classicalRuntimeInput', overrideClassicalWork);
    validateInput('quantumRuntimeInput', false);
    validateInput('penaltyInput', false);
    validateInput('classicalWork', false);
    validateInput('quantumWork', false);
}

function renderKaTeX(input) {
    try {
        if (!input) return '';
        const expression = math.parse(input).toTex();
        return katex.renderToString(expression, { throwOnError: false });
    } catch {
        return '';
    }
}
</script>

<template>
    <Dialog title="Runtime Functions & Algorithm Selection" ref="dialog" @save="save" @cancel="cancel" @reset="reset"
        @openModal="reset" classes="max-w-2xl">
        <template v-slot:button="{ openModal }">
            <slot :openModal="openModal" />
        </template>

        <template #content>
            <div class="flex flex-col gap-4">
                <div class="border rounded-lg p-4 bg-gray-50">
                    <h3 class="font-semibold text-md mb-3 text-gray-700">Classical Algorithm</h3>

                    <div v-if="availableClassicalAlgorithms.length" class="mb-3">
                        <label class="font-medium text-sm" for="classicalAlgorithmVariant">
                            Select Classical Algorithm
                        </label>
                        <Multiselect id="classicalAlgorithmVariant" class="custom-multiselect mt-1" track-by="key"
                            label="name" v-model="localSelectedClassicalAlgorithm"
                            :options="availableClassicalAlgorithms" :searchable="false" :close-on-select="true"
                            :allowEmpty="false" :show-labels="false" placeholder="Choose classical algorithm">
                            <template #option="{ option }">
                                <div>
                                    <div class="font-medium">{{ option.name }}</div>
                                    <div class="text-xs text-gray-500">{{ option.description }}</div>
                                </div>
                            </template>
                        </Multiselect>
                    </div>

                    <div class="mb-3">
                        <label class="font-medium text-sm">Classical Runtime Formula <span class="text-xs text-gray-500">(ops)</span></label>
                        <input type="text" v-model="classicalRuntimeInput"
                            @blur="validateInput('classicalRuntimeInput')"
                            class="w-full mt-1 p-2 border rounded text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            :class="errors.classicalRuntimeInput ? 'border-red-500 bg-red-50' : 'border-gray-300'" />
                        <div v-if="!errors.classicalRuntimeInput" class="mt-1 h-8 overflow-hidden" v-html="renderKaTeX(classicalRuntimeInput)"></div>
                        <span v-else class="text-xs text-red-500">Invalid formula</span>
                    </div>

                     <div>
                        <label class="font-medium text-sm">Classical Work Formula <span class="text-xs text-gray-500">(ops)</span></label>
                        <input type="text" v-model="classicalWork"
                            @blur="validateInput('classicalWork', false)"
                            class="w-full mt-1 p-2 border rounded text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            :class="errors.classicalWork ? 'border-red-500 bg-red-50' : 'border-gray-300'" />
                        <div v-if="!errors.classicalWork" class="mt-1 h-8 overflow-hidden" v-html="renderKaTeX(classicalWork)"></div>
                    </div>
                </div>

                <div class="border rounded-lg p-4 bg-gray-50">
                    <h3 class="font-semibold text-md mb-3 text-gray-700">Quantum Algorithm</h3>

                    <div v-if="availableQuantumAlgorithms.length" class="mb-3">
                        <label class="font-medium text-sm" for="quantumAlgorithmVariant">
                            Select Quantum Algorithm
                        </label>
                        <Multiselect id="quantumAlgorithmVariant" class="custom-multiselect mt-1" track-by="key"
                            label="name" v-model="localSelectedQuantumAlgorithm"
                            :options="availableQuantumAlgorithms" :searchable="false" :close-on-select="true"
                            :allowEmpty="false" :show-labels="false" placeholder="Choose quantum algorithm">
                            <template #option="{ option }">
                                <div>
                                    <div class="font-medium">{{ option.name }}</div>
                                    <div class="text-xs text-gray-500">{{ option.description }}</div>
                                </div>
                            </template>
                        </Multiselect>
                    </div>

                    <div class="mb-3">
                        <label class="font-medium text-sm">Quantum Runtime Formula <span class="text-xs text-gray-500">(ops)</span></label>
                        <input type="text" v-model="quantumRuntimeInput"
                            @blur="validateInput('quantumRuntimeInput')"
                            class="w-full mt-1 p-2 border rounded text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            :class="errors.quantumRuntimeInput ? 'border-red-500 bg-red-50' : 'border-gray-300'" />
                        <div v-if="!errors.quantumRuntimeInput" class="mt-1 h-8 overflow-hidden" v-html="renderKaTeX(quantumRuntimeInput)"></div>
                         <span v-else class="text-xs text-red-500">Invalid formula</span>
                    </div>

                     <div>
                        <label class="font-medium text-sm">Quantum Work Formula <span class="text-xs text-gray-500">(ops)</span></label>
                        <input type="text" v-model="quantumWork"
                             @blur="validateInput('quantumWork')"
                            class="w-full mt-1 p-2 border rounded text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            :class="errors.quantumWork ? 'border-red-500 bg-red-50' : 'border-gray-300'" />
                        <div v-if="!errors.quantumWork" class="mt-1 h-8 overflow-hidden" v-html="renderKaTeX(quantumWork)"></div>
                    </div>
                </div>

                <div class="border rounded-lg p-4 bg-gray-50">
                    <h3 class="font-semibold text-md mb-3 text-gray-700">Overhead</h3>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="font-medium text-sm">Hardware Processors (p)</label>
                            <input type="number" v-model="processors"
                                class="w-full mt-1 p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                        </div>
                        <div>
                            <label class="font-medium text-sm">Penalty Overhead</label>
                            <input type="text" v-model="penaltyInput"
                                @blur="validateInput('penaltyInput')"
                                class="w-full mt-1 p-2 border rounded text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                                :class="errors.penaltyInput ? 'border-red-500 bg-red-50' : 'border-gray-300'" />
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </Dialog>
</template>

<style src="vue-multiselect/dist/vue-multiselect.css"></style>
<style lang="css" scoped>
.custom-multiselect :deep(.multiselect__tags) .multiselect__tag { background-color: #002D9D; }
.custom-multiselect :deep(.multiselect__option--highlight) { background-color: #002D9D; }
</style>