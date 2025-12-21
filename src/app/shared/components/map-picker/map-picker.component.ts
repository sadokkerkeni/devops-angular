import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { HttpClient } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

declare var L: any;

export interface MapLocation {
  latitude: number;
  longitude: number;
  address?: string;
  displayName?: string;
}

@Component({
  selector: 'app-map-picker',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatAutocompleteModule
  ],
  template: `
    <div class="map-picker-container">
      <!-- Search Bar -->
      <div class="search-container">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label></mat-label>
          <input 
            matInput 
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange($event)"
            [matAutocomplete]="auto">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
        
        <mat-autocomplete #auto="matAutocomplete" (optionSelected)="onSuggestionSelected($event)">
          <mat-option *ngFor="let suggestion of suggestions" [value]="suggestion.display_name">
            <div class="suggestion-item">
              <mat-icon class="suggestion-icon">place</mat-icon>
              <span class="suggestion-text">{{ suggestion.display_name }}</span>
            </div>
          </mat-option>
        </mat-autocomplete>
        
        <mat-spinner *ngIf="isSearching" diameter="24" class="search-spinner"></mat-spinner>
      </div>

      <!-- Map Container -->
      <div #mapContainer class="map-container" [style.height]="height"></div>

      <!-- Selected Location Info -->
      <div class="location-info" *ngIf="selectedLocation">
        <div class="location-coords">
          <mat-icon class="location-icon">my_location</mat-icon>
          <div class="coords-text">
            <span class="coord-label">Lat:</span> {{ selectedLocation.latitude?.toFixed(6) }}
            <span class="coord-separator">|</span>
            <span class="coord-label">Lng:</span> {{ selectedLocation.longitude?.toFixed(6) }}
          </div>
        </div>
        <div class="location-address" *ngIf="selectedLocation.address">
          <mat-icon class="address-icon">place</mat-icon>
          <span>{{ selectedLocation.address }}</span>
        </div>
      </div>

      <!-- Instructions -->
      <div class="instructions" *ngIf="!selectedLocation">
        <mat-icon>touch_app</mat-icon>
        <span>Cliquez sur la carte ou recherchez une adresse pour sélectionner un emplacement</span>
      </div>
    </div>
  `,
  styles: [`
    .map-picker-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
      width: 100%;
    }

    .search-container {
      position: relative;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .search-field {
      flex: 1;
    }

    .search-spinner {
      position: absolute;
      right: 48px;
      top: 50%;
      transform: translateY(-50%);
    }

    .map-container {
      width: 100%;
      border-radius: 12px;
      border: 2px solid #e5e7eb;
      overflow: hidden;
      transition: border-color 0.2s ease;
    }

    .map-container:hover {
      border-color: #3b82f6;
    }

    .location-info {
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border-radius: 8px;
      padding: 12px 16px;
      border: 1px solid #bae6fd;
    }

    .location-coords {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .location-icon {
      color: #0284c7;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .coords-text {
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 13px;
      color: #0369a1;
    }

    .coord-label {
      font-weight: 600;
      color: #075985;
    }

    .coord-separator {
      margin: 0 8px;
      color: #7dd3fc;
    }

    .location-address {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      font-size: 13px;
      color: #0c4a6e;
    }

    .address-icon {
      color: #0ea5e9;
      font-size: 18px;
      width: 18px;
      height: 18px;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .instructions {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px;
      background: #f8fafc;
      border-radius: 8px;
      color: #64748b;
      font-size: 13px;
    }

    .instructions mat-icon {
      color: #94a3b8;
    }

    .suggestion-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .suggestion-icon {
      color: #ef4444;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .suggestion-text {
      font-size: 13px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    ::ng-deep .map-picker-container .leaflet-container {
      font-family: inherit;
    }

    ::ng-deep .map-picker-container .leaflet-popup-content-wrapper {
      border-radius: 8px;
    }

    ::ng-deep .map-picker-container .leaflet-popup-content {
      margin: 12px;
    }
  `]
})
export class MapPickerComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  
  @Input() height: string = '350px';
  @Input() initialLatitude: number = 36.8065; // Default: Tunis, Tunisia
  @Input() initialLongitude: number = 10.1815;
  @Input() initialZoom: number = 13;
  
  @Output() locationSelected = new EventEmitter<MapLocation>();

  searchQuery: string = '';
  suggestions: any[] = [];
  isSearching: boolean = false;
  selectedLocation: MapLocation | null = null;

  private map: any;
  private marker: any;
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Setup search debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      this.searchAddress(query);
    });
  }

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.map) {
      this.map.remove();
    }
  }

  private initializeMap(): void {
    // Load Leaflet CSS dynamically
    this.loadLeafletCSS();

    // Load Leaflet JS dynamically
    this.loadLeafletJS().then(() => {
      // Initialize map
      this.map = L.map(this.mapContainer.nativeElement).setView(
        [this.initialLatitude, this.initialLongitude],
        this.initialZoom
      );

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(this.map);

      // Add click handler
      this.map.on('click', (e: any) => {
        this.onMapClick(e.latlng.lat, e.latlng.lng);
      });

      // If initial location is set, add marker
      if (this.initialLatitude && this.initialLongitude) {
        this.setMarker(this.initialLatitude, this.initialLongitude);
      }
    });
  }

  private loadLeafletCSS(): void {
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
  }

  private loadLeafletJS(): Promise<void> {
    return new Promise((resolve) => {
      if (typeof L !== 'undefined') {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => resolve();
      document.head.appendChild(script);
    });
  }

  private onMapClick(lat: number, lng: number): void {
    this.setMarker(lat, lng);
    this.reverseGeocode(lat, lng);
  }

  private setMarker(lat: number, lng: number): void {
    if (this.marker) {
      this.map.removeLayer(this.marker);
    }

    // Custom marker icon
    const customIcon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        ">
          <div style="
            width: 8px;
            height: 8px;
            background: white;
            border-radius: 50%;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          "></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });

    this.marker = L.marker([lat, lng], { icon: customIcon }).addTo(this.map);
    
    // Center map on marker
    this.map.setView([lat, lng], this.map.getZoom());
  }

  private reverseGeocode(lat: number, lng: number): void {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;
    
    this.http.get<any>(url).subscribe({
      next: (result) => {
        const location: MapLocation = {
          latitude: lat,
          longitude: lng,
          address: result.display_name,
          displayName: result.display_name
        };
        this.selectedLocation = location;
        this.locationSelected.emit(location);
      },
      error: () => {
        const location: MapLocation = {
          latitude: lat,
          longitude: lng
        };
        this.selectedLocation = location;
        this.locationSelected.emit(location);
      }
    });
  }

  onSearchChange(query: string): void {
    if (query && query.length >= 3) {
      this.searchSubject.next(query);
    } else {
      this.suggestions = [];
    }
  }

  private searchAddress(query: string): void {
    if (!query || query.length < 3) {
      this.suggestions = [];
      return;
    }

    this.isSearching = true;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;

    this.http.get<any[]>(url).subscribe({
      next: (results) => {
        this.suggestions = results;
        this.isSearching = false;
      },
      error: () => {
        this.suggestions = [];
        this.isSearching = false;
      }
    });
  }

  onSuggestionSelected(event: any): void {
    const selectedAddress = event.option.value;
    const suggestion = this.suggestions.find(s => s.display_name === selectedAddress);
    
    if (suggestion) {
      const lat = parseFloat(suggestion.lat);
      const lng = parseFloat(suggestion.lon);
      
      this.setMarker(lat, lng);
      this.map.setView([lat, lng], 16);
      
      const location: MapLocation = {
        latitude: lat,
        longitude: lng,
        address: suggestion.display_name,
        displayName: suggestion.display_name
      };
      this.selectedLocation = location;
      this.locationSelected.emit(location);
    }
  }

  // Public method to set location programmatically
  setLocation(lat: number, lng: number, address?: string): void {
    if (this.map) {
      this.setMarker(lat, lng);
      this.map.setView([lat, lng], 16);
      
      const location: MapLocation = {
        latitude: lat,
        longitude: lng,
        address: address
      };
      this.selectedLocation = location;
    }
  }

  // Public method to get current location
  getCurrentLocation(): MapLocation | null {
    return this.selectedLocation;
  }
}

