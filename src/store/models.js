/**
 * models.js - Pinia Store for Quantum Computing Models
 * 
 * This store manages the state for quantum computing advantage calculations,
 * including problem configurations, hardware specifications, and algorithm variants.
 */

import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useModelsStore = defineStore('models', () => {
  // Initialize with one default model
  const models = ref([
    {
      id: 1,
      problemName: 'Integer Factorization',
      hardwareName: 'IBM (Superconducting)',
      
      // Runtime expressions
      classicalRuntimeInput: 'n^3',
      quantumRuntimeInput: 'n^2',
      classicalWork: 'n^3',
      quantumWork: 'n^2',
      
      // Qubit mapping
      qubitToProblemSize: '2^q',
      
      // Hardware parameters
      penaltyInput: '1',
      processors: 5,
      hardwareSlowdown: 8.48,
      costFactor: 8,
      quantumImprovementRate: -10,
      costImprovementRate: -10,
      physicalLogicalQubitsRatio: 1000,
      ratioImprovementRate: -23,
      
      // Roadmap
      roadmap: {
        2018: 20,
        2021: 27,
        2024: 156,
      },
      roadmapUnit: 'physical',
      extrapolationType: 'exponential',
      
      // Advanced slowdown parameters
      advancedSlowdown: {
        gateTime: 60,
        cpuGHz: 5,
        speed: 300,
        gateOverhead: 100,
        algorithmConstant: 1,
      },
      
      // Max compute time cap (null = no cap)
      maxComputeTimeCap: null,
      
      reference: '20Q Penguin (2018), 127Q Eagle (2021), 1121Q Condor (2023), 156Q Heron (2024)',
    }
  ]);

  // Counter for generating unique IDs
  const nextId = ref(2);

  /**
   * Add a new model
   * @param {Object} modelData - Model configuration
   * @returns {Object} The newly created model
   */
  function addModel(modelData = {}) {
    const newModel = {
      id: nextId.value++,
      problemName: modelData.problemName || 'Integer Factorization',
      hardwareName: modelData.hardwareName || 'IBM (Superconducting)',
      
      classicalRuntimeInput: modelData.classicalRuntimeInput || 'n^3',
      quantumRuntimeInput: modelData.quantumRuntimeInput || 'n^2',
      classicalWork: modelData.classicalWork || 'n^3',
      quantumWork: modelData.quantumWork || 'n^2',
      
      qubitToProblemSize: modelData.qubitToProblemSize || '2^q',
      
      penaltyInput: modelData.penaltyInput || '1',
      processors: modelData.processors ?? 5,
      hardwareSlowdown: modelData.hardwareSlowdown ?? 8.48,
      costFactor: modelData.costFactor ?? 8,
      quantumImprovementRate: modelData.quantumImprovementRate ?? -10,
      costImprovementRate: modelData.costImprovementRate ?? -10,
      physicalLogicalQubitsRatio: modelData.physicalLogicalQubitsRatio ?? 1000,
      ratioImprovementRate: modelData.ratioImprovementRate ?? -23,
      
      roadmap: modelData.roadmap || {
        2018: 20,
        2021: 27,
        2024: 156,
      },
      roadmapUnit: modelData.roadmapUnit || 'physical',
      extrapolationType: modelData.extrapolationType || 'exponential',
      
      advancedSlowdown: modelData.advancedSlowdown || {
        gateTime: 60,
        cpuGHz: 5,
        speed: 300,
        gateOverhead: 100,
        algorithmConstant: 1,
      },
      
      maxComputeTimeCap: modelData.maxComputeTimeCap || null,
      
      reference: modelData.reference || '',
    };

    models.value.push(newModel);
    return newModel;
  }

  /**
   * Remove a model by ID
   * @param {number} id - Model ID to remove
   */
  function removeModel(id) {
    const index = models.value.findIndex(m => m.id === id);
    if (index !== -1) {
      models.value.splice(index, 1);
    }
  }

  /**
   * Update a model
   * @param {number} id - Model ID to update
   * @param {Object} updates - Fields to update
   */
  function updateModel(id, updates) {
    const model = models.value.find(m => m.id === id);
    if (model) {
      Object.assign(model, updates);
    }
  }

  /**
   * Get a model by ID
   * @param {number} id - Model ID
   * @returns {Object|undefined} The model or undefined
   */
  function getModelById(id) {
    return models.value.find(m => m.id === id);
  }

  /**
   * Duplicate a model
   * @param {number} id - Model ID to duplicate
   * @returns {Object|null} The new model or null if original not found
   */
  function duplicateModel(id) {
    const original = models.value.find(m => m.id === id);
    if (!original) return null;

    const duplicate = {
      ...JSON.parse(JSON.stringify(original)), // Deep clone
      id: nextId.value++,
    };

    models.value.push(duplicate);
    return duplicate;
  }

  return {
    models,
    addModel,
    removeModel,
    updateModel,
    getModelById,
    duplicateModel,
  };
});