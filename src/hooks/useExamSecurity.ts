
import { useEffect, useCallback } from 'react';

interface UseExamSecurityProps {
  isExamSubmitted: boolean;
  examClosed: boolean;
  onAddWarning: (type: string, message: string) => void;
  onAutoSave: () => void;
}

export const useExamSecurity = ({
  isExamSubmitted,
  examClosed,
  onAddWarning,
  onAutoSave
}: UseExamSecurityProps) => {
  const addWarningToSystem = useCallback((type: string, message: string) => {
    onAddWarning(type, message);
    onAutoSave(); // Trigger immediate auto-save when warning occurs
  }, [onAddWarning, onAutoSave]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !isExamSubmitted && !examClosed) {
        addWarningToSystem('Tab Switch', 'Student switched tabs or minimized browser during exam');
      }
    };

    const handleCopy = (e: ClipboardEvent) => {
      if (!isExamSubmitted && !examClosed) {
        e.preventDefault();
        addWarningToSystem('Copy Attempt', 'Student attempted to copy content during exam');
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      if (!isExamSubmitted && !examClosed) {
        e.preventDefault();
        addWarningToSystem('Paste Attempt', 'Student attempted to paste content during exam');
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      if (!isExamSubmitted && !examClosed) {
        e.preventDefault();
        addWarningToSystem('Right Click', 'Student attempted to access context menu');
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const blockedKeys = ['F12', 'F5', 'F11'];
      const blockedCombos = [
        { ctrl: true, shift: true, key: 'I' },
        { ctrl: true, shift: true, key: 'J' },
        { ctrl: true, shift: true, key: 'C' },
        { ctrl: true, key: 'U' },
        { ctrl: true, key: 'S' },
        { ctrl: true, key: 'A' },
        { ctrl: true, key: 'C' },
        { ctrl: true, key: 'V' },
        { ctrl: true, key: 'X' },
        { ctrl: true, key: 'R' },
        { ctrl: true, key: 'H' },
        { alt: true, key: 'Tab' },
      ];

      if (blockedKeys.includes(e.key)) {
        e.preventDefault();
        addWarningToSystem('Blocked Key', `Student attempted to use ${e.key}`);
        return;
      }

      const isBlockedCombo = blockedCombos.some(combo => 
        (!combo.ctrl || e.ctrlKey) &&
        (!combo.shift || e.shiftKey) &&
        (!combo.alt || e.altKey) &&
        e.key.toLowerCase() === combo.key.toLowerCase()
      );

      if (isBlockedCombo && !isExamSubmitted && !examClosed) {
        e.preventDefault();
        addWarningToSystem('Blocked Shortcut', `Student attempted to use blocked keyboard shortcut`);
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isExamSubmitted && !examClosed) {
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave? Your exam progress will be auto-saved but you may lose time.';
        addWarningToSystem('Page Leave Attempt', 'Student attempted to leave the exam page');
        onAutoSave();
      }
    };

    const handleResize = () => {
      if (!isExamSubmitted && !examClosed) {
        addWarningToSystem('Window Resize', 'Window size changed during exam (possible screen sharing)');
      }
    };

    const handleBlur = () => {
      if (!isExamSubmitted && !examClosed) {
        addWarningToSystem('Focus Lost', 'Browser window lost focus during exam');
      }
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('resize', handleResize);
    window.addEventListener('blur', handleBlur);

    // Disable text selection to prevent copying
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('blur', handleBlur);
      
      // Re-enable text selection
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
    };
  }, [isExamSubmitted, examClosed, addWarningToSystem, onAutoSave]);
};
