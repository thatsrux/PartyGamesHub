import type { JeopardyQuestion } from './data';

export interface JeopardyCurrentCell {
  categoryName: string;
  value: number;
  questionObj: JeopardyQuestion;
  reopened: boolean;
}

export function getJeopardyCellId(categoryName: string, value: number): string {
  return `${categoryName}-${value}`;
}

export function openJeopardyCell(
  completedCells: string[],
  categoryName: string,
  value: number,
  questionObj: JeopardyQuestion,
): { phase: 'question' | 'reveal'; currentCell: JeopardyCurrentCell } {
  const reopened = completedCells.includes(getJeopardyCellId(categoryName, value));
  return {
    phase: reopened ? 'reveal' : 'question',
    currentCell: { categoryName, value, questionObj, reopened },
  };
}

export function completeJeopardyCell(completedCells: string[], currentCell: JeopardyCurrentCell): string[] {
  const cellId = getJeopardyCellId(currentCell.categoryName, currentCell.value);
  return completedCells.includes(cellId) ? completedCells : [...completedCells, cellId];
}
