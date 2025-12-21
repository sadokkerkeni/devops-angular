import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: Date;
  resultsCount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class SearchHistoryService {
  private readonly STORAGE_KEY = 'search_history';
  private readonly MAX_HISTORY_ITEMS = 50;
  
  private _history$: BehaviorSubject<SearchHistoryItem[]> = new BehaviorSubject<SearchHistoryItem[]>([]);
  public history$: Observable<SearchHistoryItem[]> = this._history$.asObservable();

  constructor() {
    this.loadHistory();
  }

  /**
   * Load search history from localStorage
   */
  private loadHistory(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const items: SearchHistoryItem[] = JSON.parse(stored).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        this._history$.next(items);
      }
    } catch (error) {
      console.error('Error loading search history:', error);
      this._history$.next([]);
    }
  }

  /**
   * Save search history to localStorage
   */
  private saveHistory(items: SearchHistoryItem[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
      this._history$.next(items);
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  }

  /**
   * Add a new search to history
   */
  addSearch(query: string, resultsCount?: number): void {
    if (!query || query.trim().length === 0) {
      return;
    }

    const currentHistory = this._history$.value;
    const newItem: SearchHistoryItem = {
      id: this.generateId(),
      query: query.trim(),
      timestamp: new Date(),
      resultsCount
    };

    // Remove duplicates (same query)
    const filteredHistory = currentHistory.filter(
      item => item.query.toLowerCase() !== newItem.query.toLowerCase()
    );

    // Add new item at the beginning
    const updatedHistory = [newItem, ...filteredHistory].slice(0, this.MAX_HISTORY_ITEMS);
    this.saveHistory(updatedHistory);
  }

  /**
   * Get all search history
   */
  getHistory(): SearchHistoryItem[] {
    return this._history$.value;
  }

  /**
   * Get recent searches (last N items)
   */
  getRecentSearches(count: number = 10): SearchHistoryItem[] {
    return this._history$.value.slice(0, count);
  }

  /**
   * Clear all search history
   */
  clearHistory(): void {
    this.saveHistory([]);
  }

  /**
   * Remove a specific search from history
   */
  removeSearch(id: string): void {
    const updatedHistory = this._history$.value.filter(item => item.id !== id);
    this.saveHistory(updatedHistory);
  }

  /**
   * Get search history as context for chatbot
   */
  getHistoryAsContext(maxItems: number = 20): string {
    const recentSearches = this.getRecentSearches(maxItems);
    if (recentSearches.length === 0) {
      return 'Aucun historique de recherche disponible.';
    }

    return recentSearches
      .map((item, index) => {
        const date = item.timestamp.toLocaleString('fr-FR');
        const results = item.resultsCount !== undefined ? ` (${item.resultsCount} résultats)` : '';
        return `${index + 1}. "${item.query}" - ${date}${results}`;
      })
      .join('\n');
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

