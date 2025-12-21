import { Component, Input, Output, EventEmitter, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

/**
 * Search Bar Component
 * 
 * A standardized search input component with consistent styling and behavior.
 * 
 * @example
 * ```html
 * <app-search-bar
 *   [placeholder]="'Search locations...'"
 *   [debounceTime]="300"
 *   (search)="onSearch($event)">
 * </app-search-bar>
 * ```
 */
@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule
  ],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SearchBarComponent {
  /**
   * Search input placeholder
   */
  @Input() placeholder: string = 'Rechercher...';

  /**
   * Initial search value
   */
  @Input() value: string = '';

  /**
   * Debounce time in milliseconds
   */
  @Input() debounceTime: number = 300;

  /**
   * Whether to show clear button
   */
  @Input() showClear: boolean = true;

  /**
   * Search event emitter
   */
  @Output() search = new EventEmitter<string>();

  /**
   * Search input element reference
   */
  @ViewChild('searchInput', { static: false }) searchInput!: ElementRef<HTMLInputElement>;

  /**
   * Current search value
   */
  searchValue: string = '';

  /**
   * Debounce timer
   */
  private debounceTimer: any;

  /**
   * On init
   */
  ngOnInit(): void {
    this.searchValue = this.value;
  }

  /**
   * Handle search input change
   */
  onSearchChange(value: string): void {
    this.searchValue = value;

    // Clear existing timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Set new timer
    this.debounceTimer = setTimeout(() => {
      this.search.emit(value);
    }, this.debounceTime);
  }

  /**
   * Clear search input
   */
  clearSearch(): void {
    this.searchValue = '';
    this.search.emit('');
    if (this.searchInput) {
      this.searchInput.nativeElement.focus();
    }
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }
}

