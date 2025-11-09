// Open the AI layout UI
penpot.ui.open("Penpot AI Layout", `?theme=${penpot.theme}`, {
  width: 400,
  height: 600,
});

// Send available frames to UI on initialization
sendAvailableFrames();

// Handle messages from the UI
penpot.ui.onMessage((message: any) => {
  if (message.type === "generate-layouts") {
    generateAILayouts(message.prompt, message.targetFrame, message.apiKey, message.model);
  } else if (message.type === "apply-layout") {
    applySelectedLayout(message.layoutData, message.targetFrame);
  } else if (message.type === "request-frames") {
    sendAvailableFrames();
  }
});

// Generate AI-powered layout variations
async function generateAILayouts(prompt: string, _targetFrame: string, apiKey: string, model: string) {
  try {
    // Call OpenRouter API to generate layout suggestions
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: "You are a UI/UX design expert. Generate layout suggestions as JSON structures that can be used to create Penpot boards with flex layouts. Return 3-5 different layout variations based on the user's prompt. Each layout should include: name, description, layout properties (flex direction, alignment, etc.), and child elements with their types and basic properties.",
          },
          {
            role: "user",
            content: `Generate 4 different layout variations for: "${prompt}". Return as JSON array with objects containing: name, description, layout (with type and properties), and children array (with element types and properties).`,
          },
        ],
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const layouts = JSON.parse(data.choices[0].message.content);

    // Send layouts back to UI for preview
    penpot.ui.sendMessage({
      type: "layouts-generated",
      layouts: layouts,
    });
  } catch (error) {
    penpot.ui.sendMessage({
      type: "error",
      message: `Failed to generate layouts: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
}

// Apply the selected layout to a target frame
function applySelectedLayout(layoutData: any, targetFrameId: string) {
  try {
    // Find the target frame
    const targetFrame = penpot.root && (penpot.root as any).findNode ? (penpot.root as any).findNode(targetFrameId) : null;
    if (!targetFrame) {
      penpot.ui.sendMessage({
        type: "error",
        message: "Target frame not found",
      });
      return;
    }

    // Clear existing content
    if ((targetFrame as any).children) {
      (targetFrame as any).children.forEach((child: any) => {
        child.remove();
      });
    }

    // Create the layout structure based on layoutData
    const board = penpot.createBoard();
    board.name = layoutData.name;

    // Apply layout properties
    if (layoutData.layout?.type === "flex") {
      const flex = board.addFlexLayout();
      applyFlexProperties(flex, layoutData.layout.properties);
    }

    // Add child elements
    if (layoutData.children) {
      layoutData.children.forEach((childData: any) => {
        const child = createElementFromData(childData);
        if (child) {
          board.appendChild(child);
        }
      });
    }

    // Replace target frame content
    targetFrame.appendChild(board);

    penpot.ui.sendMessage({
      type: "layout-applied",
      message: "Layout applied successfully",
    });
  } catch (error) {
    penpot.ui.sendMessage({
      type: "error",
      message: `Failed to apply layout: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
}

// Helper function to apply flex properties
function applyFlexProperties(flex: any, properties: any) {
  if (properties.dir) flex.dir = properties.dir;
  if (properties.wrap) flex.wrap = properties.wrap;
  if (properties.alignItems) flex.alignItems = properties.alignItems;
  if (properties.justifyContent) flex.justifyContent = properties.justifyContent;
  if (properties.verticalPadding !== undefined) flex.verticalPadding = properties.verticalPadding;
  if (properties.horizontalPadding !== undefined) flex.horizontalPadding = properties.horizontalPadding;
  if (properties.rowGap !== undefined) flex.rowGap = properties.rowGap;
  if (properties.columnGap !== undefined) flex.columnGap = properties.columnGap;
}

// Helper function to create elements from layout data
function createElementFromData(elementData: any): any {
  switch (elementData.type) {
    case "rectangle":
      const rect = penpot.createRectangle();
      if (elementData.width && elementData.height) {
        rect.resize(elementData.width, elementData.height);
      }
      if (elementData.fills) rect.fills = elementData.fills;
      if (elementData.strokes) rect.strokes = elementData.strokes;
      return rect;

    case "text":
      const text = penpot.createText(elementData.content || "Sample text");
      if (text) {
        if (elementData.fontSize) text.fontSize = elementData.fontSize;
        if (elementData.fontFamily) text.fontFamily = elementData.fontFamily;
      }
      return text;

    case "ellipse":
      const ellipse = penpot.createEllipse();
      if (elementData.width && elementData.height) {
        ellipse.resize(elementData.width, elementData.height);
      }
      return ellipse;

    default:
      return null;
  }
}

// Send available frames to the UI
function sendAvailableFrames() {
  const frames = getAvailableFrames();
  penpot.ui.sendMessage({
    type: "frames-available",
    frames: frames,
  });
}

// Get available frames from the current page
function getAvailableFrames(): any[] {
  const frames: any[] = [];

  // Get frames from the current page
  if (penpot.root && (penpot.root as any).children) {
    (penpot.root as any).children.forEach((node: any) => {
      if (node && node.type === "frame") {
        frames.push({
          id: node.id,
          name: node.name || "Unnamed Frame",
          type: "frame",
        });
      }
    });
  }

  // If no frames found, check current selection
  if (frames.length === 0 && penpot.selection.length > 0) {
    penpot.selection.forEach((node: any) => {
      if (node && node.type === "frame") {
        frames.push({
          id: node.id,
          name: node.name || "Unnamed Frame",
          type: "frame",
        });
      }
    });
  }

  return frames;
}

// Update the theme in the iframe
penpot.on("themechange", (theme) => {
  penpot.ui.sendMessage({
    source: "penpot",
    type: "themechange",
    theme,
  });
});
