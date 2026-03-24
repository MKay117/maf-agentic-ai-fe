import React, { useState, useEffect } from "react";

const TOAST_LIMIT = 3; // number of visible toasts
const TOAST_REMOVE_DELAY = 5000; // 5 seconds

let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

// Internal state for all toasts
let memoryState = { toasts: [] };
const listeners = [];
const toastTimeouts = new Map();

function dispatch(action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => listener(memoryState));
}

function addToRemoveQueue(toastId) {
  if (toastTimeouts.has(toastId)) return;
  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({ type: "REMOVE_TOAST", toastId });
  }, TOAST_REMOVE_DELAY);
  toastTimeouts.set(toastId, timeout);
}

function reducer(state, action) {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };
    case "DISMISS_TOAST":
      state.toasts.forEach((t) => {
        if (!action.toastId || t.id === action.toastId) {
          t.open = false;
          addToRemoveQueue(t.id);
        }
      });
      return { ...state, toasts: [...state.toasts] };
    case "REMOVE_TOAST":
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
    default:
      return state;
  }
}

// Hook for React components
export function useToast() {
  const [state, setState] = useState(memoryState);

  useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  const toast = ({ title, description }) => {
    const id = genId();
    dispatch({
      type: "ADD_TOAST",
      toast: { id, title, description, open: true },
    });
    return {
      id,
      dismiss: () => dispatch({ type: "DISMISS_TOAST", toastId: id }),
    };
  };

  return {
    toasts: state.toasts,
    toast,
    dismiss: (toastId) => dispatch({ type: "DISMISS_TOAST", toastId }),
  };
}
