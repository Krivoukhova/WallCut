export type BlockSelection = {
  type: 'block';
  ids: string[];
  activeId: string;
};

export type SceneSelection = {
  type: 'scene';
  sceneId: string;
};

export type EditorSelection = { type: 'none' } | SceneSelection | BlockSelection;

export const noSelection = (): EditorSelection => ({ type: 'none' });

export const sceneSelection = (sceneId: string): SceneSelection => ({
  type: 'scene',
  sceneId,
});

export const blockSelection = (ids: string[], activeId = ids[ids.length - 1]): EditorSelection => {
  const uniqueIds = [...new Set(ids)];
  if (!uniqueIds.length || !activeId || !uniqueIds.includes(activeId)) {
    return noSelection();
  }
  return {
    type: 'block',
    ids: uniqueIds,
    activeId,
  };
};

export const getSelectedBlockId = (selection: EditorSelection): string | null =>
  selection.type === 'block' ? selection.activeId : null;

export const getSelectedBlockIds = (selection: EditorSelection): string[] =>
  selection.type === 'block' ? selection.ids : [];

export const getSelectedSceneId = (selection: EditorSelection): string | null =>
  selection.type === 'scene' ? selection.sceneId : null;
