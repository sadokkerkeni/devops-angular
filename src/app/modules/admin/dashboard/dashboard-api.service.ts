import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface KpiCardDto {
  icon: string;
  title: string;
  value: number | string;
  variation?: number;
  variationLabel?: string;
  color?: string;
}

export interface DashboardKpisDto {
  stockCritique: KpiCardDto;
  picklistsActives: KpiCardDto;
  retoursEnCours: KpiCardDto;
  mouvementsJournee: KpiCardDto;
}

export interface StockEvolutionDto {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    fill: boolean;
    tension: number;
  }[];
}

export interface ActivityDataDto {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
  }[];
}

export interface TopArticlesDto {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
  }[];
}

export interface AlertDto {
  id: number;
  type: string;
  icon: string;
  title: string;
  message: string;
  time: string;
}

export interface TimelineEventDto {
  id: number;
  type: string;
  icon: string;
  iconColor: string;
  title: string;
  description: string;
  time: string;
  user?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardApiService {
  private apiUrl = 'http://localhost:5288/api/dashboard';

  constructor(private http: HttpClient) { }

  getKpis(): Observable<DashboardKpisDto> {
    return this.http.get<DashboardKpisDto>(`${this.apiUrl}/kpis`);
  }

  getStockEvolution(days: number = 7): Observable<StockEvolutionDto> {
    return this.http.get<StockEvolutionDto>(`${this.apiUrl}/stock-evolution?days=${days}`);
  }

  getActivityData(days: number = 7): Observable<ActivityDataDto> {
    return this.http.get<ActivityDataDto>(`${this.apiUrl}/activity?days=${days}`);
  }

  getTopArticles(limit: number = 10): Observable<TopArticlesDto> {
    return this.http.get<TopArticlesDto>(`${this.apiUrl}/top-articles?limit=${limit}`);
  }

  getRecentAlerts(hours: number = 24): Observable<AlertDto[]> {
    return this.http.get<AlertDto[]>(`${this.apiUrl}/alerts?hours=${hours}`);
  }

  getTimelineEvents(hours: number = 24): Observable<TimelineEventDto[]> {
    return this.http.get<TimelineEventDto[]>(`${this.apiUrl}/timeline?hours=${hours}`);
  }
}

