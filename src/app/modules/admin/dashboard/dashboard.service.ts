import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';

export interface StockEvolutionData {
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

export interface ActivityData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
  }[];
}

export interface TopArticlesData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:5288/api/dashboard';

  constructor(private http: HttpClient) { }

  // Stock Evolution (Line Chart)
  getStockEvolution(): Observable<StockEvolutionData> {
    const data: StockEvolutionData = {
      labels: ['Lun 27', 'Mar 28', 'Mer 29', 'Jeu 30', 'Ven 1', 'Sam 2', 'Dim 3'],
      datasets: [
        {
          label: 'Quantité totale',
          data: [2450, 2380, 2420, 2350, 2400, 2380, 2410],
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    };

    return of(data).pipe(delay(800));
  }

  // Activity Picklists (Bar Chart)
  getActivityData(): Observable<ActivityData> {
    const data: ActivityData = {
      labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
      datasets: [
        {
          label: 'Créées',
          data: [12, 15, 10, 18, 14, 8, 6],
          backgroundColor: '#667eea'
        },
        {
          label: 'Livrées',
          data: [8, 12, 9, 15, 12, 7, 5],
          backgroundColor: '#4ade80'
        }
      ]
    };

    return of(data).pipe(delay(1000));
  }

  // Top 10 Articles (Horizontal Bar Chart)
  getTopArticles(): Observable<TopArticlesData> {
    const data: TopArticlesData = {
      labels: [
        'ART-001',
        'ART-023',
        'ART-045',
        'ART-012',
        'ART-089',
        'ART-034',
        'ART-067',
        'ART-091',
        'ART-015',
        'ART-078'
      ],
      datasets: [
        {
          label: 'Mouvements',
          data: [450, 380, 325, 298, 275, 245, 220, 195, 180, 165],
          backgroundColor: [
            '#667eea',
            '#764ba2',
            '#f093fb',
            '#f5576c',
            '#fa709a',
            '#fee140',
            '#30cfd0',
            '#330867',
            '#4ade80',
            '#3b82f6'
          ]
        }
      ]
    };

    return of(data).pipe(delay(1200));
  }
}

