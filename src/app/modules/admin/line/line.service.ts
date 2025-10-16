import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LineService {
  private apiUrl = 'http://localhost:5288/api/Lines';

  constructor(private http: HttpClient) {}

  getAll(): Observable<any[]> {
    return from(
      Promise.all([
        this.http.get<any[]>(`${this.apiUrl}?isActive=true`).toPromise(),
        this.http.get<any[]>(`${this.apiUrl}?isActive=false`).toPromise()
      ]).then(([activeLines, inactiveLines]) => {
        return [...(activeLines || []), ...(inactiveLines || [])];
      }).catch(error => {
        throw error;
      })
    );
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  create(line: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, line);
  }

  update(id: number, line: any): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, line);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  setActive(id: number, active: boolean): Observable<void> {
    const params = new HttpParams().set('value', active.toString());
    return this.http.put<void>(`${this.apiUrl}/${id}/set-active`, {}, { params });
  }

  assignPicklist(lineId: number, picklistId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${lineId}/picklists`, { picklistId });
  }
}