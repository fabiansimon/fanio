const KEYS = {
  scoreIds: 'scoreIds',
};

export class LocalStorage {
  static fetchScoreIds(): Set<string> {
    const idsData = localStorage.getItem(KEYS.scoreIds);
    if (idsData) {
      return new Set(JSON.parse(idsData));
    }

    return new Set();
  }

  static saveScoreId(id: string) {
    const storedIds = this.fetchScoreIds();
    storedIds.add(id);
    localStorage.setItem(KEYS.scoreIds, JSON.stringify([...storedIds]));
  }
}
