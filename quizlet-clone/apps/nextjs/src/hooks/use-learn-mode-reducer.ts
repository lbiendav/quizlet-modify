import { useReducer } from "react";

export const learnModeInitial = {
  index: 0,
  disabled: false,
  correct: 0,
};

type LearnModeState = typeof learnModeInitial;

type LearnModeAction =
  | { type: "RESET"; initialIndex?: number; initialCorrect?: number }
  | { type: "RESTORE"; index: number; correct?: number }
  | { type: "MARK_CORRECT" }
  | { type: "NEXT_CARD" }
  | { type: "DISABLE" }
  | { type: "ENABLE" };

export const learnModeReducer = (
  state: LearnModeState,
  action: LearnModeAction,
): LearnModeState => {
  switch (action.type) {
    case "RESTORE":
      return {
        ...state,
        index: action.index,
        correct: action.correct ?? 0,
        disabled: false,
      };
    case "RESET":
      return {
        index: action.initialIndex ?? 0,
        correct: action.initialCorrect ?? 0,
        disabled: false,
      };
    case "DISABLE":
      return { ...state, disabled: true };
    case "ENABLE":
      return { ...state, disabled: false };
    case "MARK_CORRECT":
      return {
        ...state,
        correct: state.correct + 1,
      };
    case "NEXT_CARD":
      return {
        ...state,
        index: state.index + 1,
      };
    default:
      return learnModeInitial;
  }
};

export const useLearnModeReducer = () =>
  useReducer(learnModeReducer, learnModeInitial);
