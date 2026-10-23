export type EditorTransactionType = 'interaction' | 'text' | 'inspector' | 'color';

export type ActiveEditorTransaction<T> = {
  type: EditorTransactionType;
  before: T;
};
