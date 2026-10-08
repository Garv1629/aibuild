export interface UnsavedSectionMeta {
  label: string;
  onDiscard?: () => void;
  onSave?: () => Promise<void>;
}

type Listener = (hasUnsaved: boolean, dirtySections: string[]) => void;

class UnsavedChangesManager {
  private dirtyMap: Map<string, { isDirty: boolean; meta: UnsavedSectionMeta }> = new Map();
  private listeners: Set<Listener> = new Set();
  private isBeforeUnloadAttached = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.attachBeforeUnload();
    }
  }

  private handleBeforeUnload = (e: BeforeUnloadEvent): string | undefined => {
    if (this.hasUnsavedChanges()) {
      const message = 'You have unsaved changes. Are you sure you want to leave without saving?';
      e.preventDefault();
      e.returnValue = message;
      return message;
    }
    return undefined;
  };

  private attachBeforeUnload(): void {
    if (typeof window === 'undefined' || this.isBeforeUnloadAttached) return;
    window.addEventListener('beforeunload', this.handleBeforeUnload);
    this.isBeforeUnloadAttached = true;
  }

  public setDirty(
    sectionId: string,
    isDirty: boolean,
    meta?: Partial<UnsavedSectionMeta>
  ): void {
    if (!isDirty) {
      this.dirtyMap.delete(sectionId);
    } else {
      const existing = this.dirtyMap.get(sectionId);
      this.dirtyMap.set(sectionId, {
        isDirty: true,
        meta: {
          label: meta?.label || existing?.meta.label || sectionId,
          onDiscard: meta?.onDiscard || existing?.meta.onDiscard,
          onSave: meta?.onSave || existing?.meta.onSave,
        },
      });
    }
    this.notify();
  }

  public isSectionDirty(sectionId: string): boolean {
    const entry = this.dirtyMap.get(sectionId);
    return Boolean(entry && entry.isDirty);
  }

  public hasUnsavedChanges(): boolean {
    for (const entry of this.dirtyMap.values()) {
      if (entry.isDirty) return true;
    }
    return false;
  }

  public getDirtySectionLabels(): string[] {
    const labels: string[] = [];
    for (const entry of this.dirtyMap.values()) {
      if (entry.isDirty && entry.meta.label) {
        labels.push(entry.meta.label);
      }
    }
    return labels;
  }

  public discardSection(sectionId: string): void {
    const entry = this.dirtyMap.get(sectionId);
    if (entry?.meta.onDiscard) {
      try {
        entry.meta.onDiscard();
      } catch (err) {
        console.warn(`[UnsavedChanges] Error in onDiscard for ${sectionId}:`, err);
      }
    }
    this.dirtyMap.delete(sectionId);
    this.notify();
  }

  public discardAll(): void {
    for (const [sectionId, entry] of this.dirtyMap.entries()) {
      if (entry.meta.onDiscard) {
        try {
          entry.meta.onDiscard();
        } catch (err) {
          console.warn(`[UnsavedChanges] Error in onDiscard for ${sectionId}:`, err);
        }
      }
    }
    this.dirtyMap.clear();
    this.notify();
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.hasUnsavedChanges(), Array.from(this.dirtyMap.keys()));
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const hasUnsaved = this.hasUnsavedChanges();
    const dirtyKeys = Array.from(this.dirtyMap.keys());
    this.listeners.forEach((listener) => {
      try {
        listener(hasUnsaved, dirtyKeys);
      } catch (err) {
        console.error('[UnsavedChanges] Error notifying listener:', err);
      }
    });
  }
}

export const unsavedChanges = new UnsavedChangesManager();
