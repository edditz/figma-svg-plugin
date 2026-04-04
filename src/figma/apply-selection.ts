function isSceneNode(node: BaseNode | null): node is SceneNode {
  return node !== null && "visible" in node
}

export function applySelection(nodeIds: string[]) {
  const nextSelection = nodeIds.map((id) => figma.getNodeById(id)).filter(isSceneNode)

  figma.currentPage.selection = nextSelection

  if (nextSelection.length > 0) {
    figma.viewport.scrollAndZoomIntoView(nextSelection)
  }

  return nextSelection.map((node) => node.id)
}
