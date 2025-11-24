import { useState, useEffect } from 'react';

interface UIState {
  isNavbarCollapsed: boolean;
  selectedTool: 'pen' | 'eraser';
  penColor: string;
  penWidth: number;
  eraserWidth: number;
  customColors: string[];
}

const DEFAULT_UI_STATE: UIState = {
  isNavbarCollapsed: false,
  selectedTool: 'pen',
  penColor: '#ffffff',
  penWidth: 6,
  eraserWidth: 50,
  customColors: ['#ffffff', '#ff6b6b', '#4ecdc4', '#ffe66d', '#a8e6cf', '#ff8b94']
};

const UI_STATE_KEY = 'blackboard-ui-state';

/**
 * UIの状態をローカルストレージで永続化するカスタムフック
 */
export const useUIState = () => {
  const [uiState, setUIState] = useState<UIState>(() => {
    try {
      const saved = localStorage.getItem(UI_STATE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_UI_STATE, ...parsed };
      }
    } catch (error) {
      console.error('Failed to load UI state from localStorage:', error);
    }
    return DEFAULT_UI_STATE;
  });

  // 状態が変更されたらローカルストレージに保存
  useEffect(() => {
    try {
      localStorage.setItem(UI_STATE_KEY, JSON.stringify(uiState));
    } catch (error) {
      console.error('Failed to save UI state to localStorage:', error);
    }
  }, [uiState]);

  const updateUIState = (updates: Partial<UIState>) => {
    setUIState(prev => ({ ...prev, ...updates }));
  };

  const addCustomColor = (color: string) => {
    setUIState(prev => ({
      ...prev,
      customColors: [...prev.customColors, color].slice(0, 12) // 右側に追加、最大12色
    }));
  };

  const removeCustomColor = (color: string) => {
    // 白色は削除不可
    if (color === '#ffffff') return;
    
    setUIState(prev => ({
      ...prev,
      customColors: prev.customColors.filter(c => c !== color)
    }));
  };

  const updateCustomColor = (oldColor: string, newColor: string) => {
    // 白色は更新不可
    if (oldColor === '#ffffff') return;
    
    setUIState(prev => ({
      ...prev,
      customColors: prev.customColors.map(c => c === oldColor ? newColor : c)
    }));
  };

  return {
    uiState,
    updateUIState,
    addCustomColor,
    removeCustomColor,
    updateCustomColor
  };
};
