import "./style.css";

// Get the current theme from the URL
const searchParams = new URLSearchParams(window.location.search);
document.body.dataset.theme = searchParams.get("theme") ?? "light";

// UI state
let selectedFrameId: string | null = null;
let generatedLayouts: any[] = [];
let selectedModelType: "free" | "paid" = "free";
let selectedModel: string = "anthropic/claude-3-haiku";

// DOM elements
const promptInput = document.getElementById("prompt-input") as HTMLTextAreaElement;
const generateBtn = document.getElementById("generate-btn") as HTMLButtonElement;
const loadingSpinner = document.getElementById("loading-spinner") as HTMLElement;
const layoutsGrid = document.getElementById("layouts-grid") as HTMLElement;
const errorMessage = document.getElementById("error-message") as HTMLElement;
const frameSelect = document.getElementById("frame-select") as HTMLSelectElement;
const apiKeyInput = document.getElementById("api-key-input") as HTMLInputElement;
const modelSelect = document.getElementById("model-select") as HTMLSelectElement;
const freeModelsBtn = document.getElementById("free-models-btn") as HTMLButtonElement;
const paidModelsBtn = document.getElementById("paid-models-btn") as HTMLButtonElement;

// Model configurations - will be populated from OpenRouter API
interface OpenRouterModel {
  id: string;
  name: string;
  pricing?: {
    prompt: string;
    completion: string;
  };
  context_length: number;
}

let ALL_MODELS: OpenRouterModel[] = [];

// Initialize the UI
async function init() {
  // Set up event listeners
  generateBtn.addEventListener("click", handleGenerate);
  promptInput.addEventListener("input", updateGenerateButton);
  frameSelect.addEventListener("change", updateGenerateButton);
  apiKeyInput.addEventListener("input", handleApiKeyChange);
  modelSelect.addEventListener("change", handleModelChange);
  freeModelsBtn.addEventListener("click", () => setModelType("free"));
  paidModelsBtn.addEventListener("click", () => setModelType("paid"));

  // Load available frames
  loadAvailableFrames();

  // Initialize settings
  await initializeSettings();

  // Set initial button state
  updateGenerateButton();
}

// Fetch models from OpenRouter API
async function fetchOpenRouterModels(apiKey: string): Promise<OpenRouterModel[]> {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching models:", error);
    return [];
  }
}

// Determine if a model is free (has zero pricing)
function isFreeModel(model: OpenRouterModel): boolean {
  if (!model.pricing) return true;
  const promptPrice = parseFloat(model.pricing.prompt);
  const completionPrice = parseFloat(model.pricing.completion);
  return promptPrice === 0 && completionPrice === 0;
}

// Initialize settings from localStorage or defaults
async function initializeSettings() {
  // Load API key from localStorage
  const savedApiKey = localStorage.getItem("penpot-ai-layout-api-key");
  if (savedApiKey) {
    apiKeyInput.value = savedApiKey;
    // Fetch models if we have an API key
    await loadModels(savedApiKey);
  }

  // Load model type from localStorage
  const savedModelType = localStorage.getItem("penpot-ai-layout-model-type") as "free" | "paid" || "free";
  selectedModelType = savedModelType;

  // Load selected model from localStorage
  const savedModel = localStorage.getItem("penpot-ai-layout-model");
  if (savedModel) {
    selectedModel = savedModel;
  }

  // Update UI
  updateModelTypeUI();
  populateModelSelect();
}

// Load models from OpenRouter API
async function loadModels(apiKey: string) {
  if (!apiKey.trim()) {
    ALL_MODELS = [];
    return;
  }

  const models = await fetchOpenRouterModels(apiKey);
  ALL_MODELS = models;

  // If we don't have a selected model or it's not in the list, select the first appropriate one
  if (!selectedModel || !ALL_MODELS.find(m => m.id === selectedModel)) {
    const filteredModels = selectedModelType === "free"
      ? ALL_MODELS.filter(isFreeModel)
      : ALL_MODELS.filter(m => !isFreeModel(m));

    if (filteredModels.length > 0) {
      selectedModel = filteredModels[0].id;
      localStorage.setItem("penpot-ai-layout-model", selectedModel);
    }
  }

  populateModelSelect();
}

// Handle API key input changes
async function handleApiKeyChange() {
  const apiKey = apiKeyInput.value.trim();
  localStorage.setItem("penpot-ai-layout-api-key", apiKey);

  // Fetch models when API key changes
  await loadModels(apiKey);
}

// Handle model selection changes
function handleModelChange() {
  selectedModel = modelSelect.value;
  localStorage.setItem("penpot-ai-layout-model", selectedModel);
}

// Set model type (free/paid)
function setModelType(type: "free" | "paid") {
  selectedModelType = type;
  localStorage.setItem("penpot-ai-layout-model-type", type);
  updateModelTypeUI();
  populateModelSelect();
  updateGenerateButton();
}

// Update the model type toggle UI
function updateModelTypeUI() {
  if (selectedModelType === "free") {
    freeModelsBtn.classList.add("active");
    paidModelsBtn.classList.remove("active");
  } else {
    paidModelsBtn.classList.add("active");
    freeModelsBtn.classList.remove("active");
  }
}

// Populate model select dropdown
function populateModelSelect() {
  modelSelect.innerHTML = "";

  if (ALL_MODELS.length === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "Enter API key to load models...";
    option.disabled = true;
    modelSelect.appendChild(option);
    return;
  }

  // Filter models based on free/paid selection
  const models = selectedModelType === "free"
    ? ALL_MODELS.filter(isFreeModel)
    : ALL_MODELS.filter(m => !isFreeModel(m));

  if (models.length === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = `No ${selectedModelType} models available`;
    option.disabled = true;
    modelSelect.appendChild(option);
    return;
  }

  models.forEach(model => {
    const option = document.createElement("option");
    option.value = model.id;
    option.textContent = model.name;
    if (model.id === selectedModel) {
      option.selected = true;
    }
    modelSelect.appendChild(option);
  });

  // If current model is not in the filtered list, select the first one
  if (!models.find(m => m.id === selectedModel)) {
    selectedModel = models[0].id;
    modelSelect.value = selectedModel;
    localStorage.setItem("penpot-ai-layout-model", selectedModel);
  }
}

// Handle generate button click
function handleGenerate() {
  const prompt = promptInput.value.trim();
  if (!prompt) return;

  const targetFrame = frameSelect.value;
  if (!targetFrame) {
    showError("Please select a target frame");
    return;
  }

  const apiKey = apiKeyInput.value.trim();
  if (!apiKey) {
    showError("Please enter your OpenRouter API key in settings");
    return;
  }

  selectedFrameId = targetFrame;
  setLoading(true);
  hideError();

  // Send message to plugin
  parent.postMessage({
    type: "generate-layouts",
    prompt: prompt,
    targetFrame: targetFrame,
    apiKey: apiKey,
    model: selectedModel,
  }, "*");
}

// Update generate button state
function updateGenerateButton() {
  const hasPrompt = promptInput.value.trim().length > 0;
  const hasFrame = frameSelect.value !== "";
  generateBtn.disabled = !hasPrompt || !hasFrame;
}

// Request available frames from Penpot
function loadAvailableFrames() {
  // Clear existing options except the default
  frameSelect.innerHTML = "";
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Select a frame...";
  frameSelect.appendChild(defaultOption);

  // Request frames from the plugin
  parent.postMessage({
    type: "request-frames",
  }, "*");
}

// Handle frames received from plugin
function handleFramesAvailable(frames: any[]) {
  // Clear existing options except the default
  const defaultOption = frameSelect.querySelector("option[value='']");
  frameSelect.innerHTML = "";
  if (defaultOption) {
    frameSelect.appendChild(defaultOption);
  }

  // Add frames from Penpot
  frames.forEach(frame => {
    const option = document.createElement("option");
    option.value = frame.id;
    option.textContent = frame.name;
    frameSelect.appendChild(option);
  });

  // If no frames available, show a message
  if (frames.length === 0) {
    const noFramesOption = document.createElement("option");
    noFramesOption.value = "";
    noFramesOption.textContent = "No frames available";
    noFramesOption.disabled = true;
    frameSelect.appendChild(noFramesOption);
  }

  // Update button state
  updateGenerateButton();
}

// Show loading state
function setLoading(loading: boolean) {
  generateBtn.disabled = loading;
  loadingSpinner.style.display = loading ? "block" : "none";
  if (loading) {
    generateBtn.textContent = "Generating...";
  } else {
    generateBtn.textContent = "Generate Layouts";
  }
}

// Display generated layouts
function displayLayouts(layouts: any[]) {
  layoutsGrid.innerHTML = "";
  generatedLayouts = layouts;

  layouts.forEach((layout, index) => {
    const layoutCard = createLayoutCard(layout, index);
    layoutsGrid.appendChild(layoutCard);
  });
}

// Create a layout preview card
function createLayoutCard(layout: any, index: number) {
  const card = document.createElement("div");
  card.className = "layout-card";

  const thumbnail = document.createElement("div");
  thumbnail.className = "layout-thumbnail";
  thumbnail.textContent = "📐"; // Placeholder for layout preview

  const title = document.createElement("h3");
  title.className = "layout-title";
  title.textContent = layout.name;

  const description = document.createElement("p");
  description.className = "layout-description";
  description.textContent = layout.description;

  const applyBtn = document.createElement("button");
  applyBtn.className = "apply-btn";
  applyBtn.textContent = "Apply Layout";
  applyBtn.addEventListener("click", () => applyLayout(index));

  card.appendChild(thumbnail);
  card.appendChild(title);
  card.appendChild(description);
  card.appendChild(applyBtn);

  return card;
}

// Apply selected layout
function applyLayout(layoutIndex: number) {
  if (!selectedFrameId) return;

  const layout = generatedLayouts[layoutIndex];
  parent.postMessage({
    type: "apply-layout",
    layoutData: layout,
    targetFrame: selectedFrameId,
  }, "*");

  showSuccess("Layout applied successfully!");
}

// Show error message
function showError(message: string) {
  errorMessage.textContent = message;
  errorMessage.style.display = "block";
}

// Hide error message
function hideError() {
  errorMessage.style.display = "none";
}

// Show success message
function showSuccess(message: string) {
  // Could implement a toast notification here
  console.log("Success:", message);
}

// Listen for messages from plugin.ts
window.addEventListener("message", (event) => {
  if (event.data.source === "penpot") {
    document.body.dataset.theme = event.data.theme;
  } else if (event.data.type === "layouts-generated") {
    setLoading(false);
    displayLayouts(event.data.layouts);
  } else if (event.data.type === "frames-available") {
    handleFramesAvailable(event.data.frames);
  } else if (event.data.type === "error") {
    setLoading(false);
    showError(event.data.message);
  } else if (event.data.type === "layout-applied") {
    showSuccess(event.data.message);
  }
});

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => init());
} else {
  init();
}
