import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseCompanyService } from 'app/core/services/base-company.service';
import { AuthService } from 'app/core/auth/auth.service';
import {
    PicklistCreateDto,
    PicklistReadDto,
    PicklistUpdateDto,
    DetailPicklistCreateDto,
    DetailPicklistReadDto,
    DetailPicklistUpdateDto,
    MovementTraceCreateDto,
    MovementTraceReadDto,
    StatusDto,
    WarehouseDto,
    LineDto,
    ArticleDto,
    SapEntryDto
} from './picklist.interfaces';

@Injectable({
  providedIn: 'root',
})
export class PicklistService extends BaseCompanyService {

  protected apiUrl = 'http://localhost:5288/api/Picklists';

  constructor(http: HttpClient, authService: AuthService) {
    super(http, authService);
  }

  // ✅ Get all picklists - Company-aware
  getPicklists(isActive: boolean = true): Observable<PicklistReadDto[]> {
    return this.getAllByCompany(isActive);
  }

  // ✅ Get picklist by ID - Company-aware
  getPicklistById(id: number): Observable<PicklistReadDto> {
    return this.getByIdAndCompany(id);
  }

  // ✅ Create new picklist - Company-aware
  createPicklist(data: PicklistCreateDto): Observable<PicklistReadDto> {
    return this.createForCompany(data);
  }

  // ✅ Update existing picklist - Company-aware
  updatePicklist(id: number, data: PicklistUpdateDto): Observable<PicklistReadDto> {
    return this.updateForCompany(id, data);
  }

  // ✅ Set active/inactive status - Company-aware
  setActiveStatus(id: number, value: boolean): Observable<any> {
    return this.setActiveStatusForCompany(id, value);
  }

  // ✅ Transitions
  markReady(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/ready`, {});
  }
  startShipping(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/ship`, {});
  }
  complete(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/complete`, {});
  }
  

   getWarehouses(): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:5288/api/Warehouses`);
  }
   getlines(): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:5288/api/Lines`);
  }
   getstatus(): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:5288/api/Status`);
  }
   // ✅ Load picklist details - Company-aware
  loadDetailPicklists(id: number): Observable<DetailPicklistReadDto[]> {
    return this.http.get<DetailPicklistReadDto[]>(`http://localhost:5288/api/DetailPicklists/by-picklist/${id}`);
  }

  // ✅ Load picklist details with availability status - Enhanced
  loadDetailPicklistsWithAvailability(id: number): Observable<DetailPicklistReadDto[]> {
    return this.http.get<DetailPicklistReadDto[]>(`http://localhost:5288/api/DetailPicklists/by-picklist/${id}/with-availability`);
  }

  // ✅ Check inventory availability - Enhanced
  checkInventoryAvailability(details: DetailPicklistReadDto[]): Observable<DetailPicklistReadDto[]> {
    return this.http.post<DetailPicklistReadDto[]>(`http://localhost:5288/api/DetailPicklists/check-availability`, details);
  }

  // ✅ Create detail picklist - Company-aware
  createDetailPicklist(createDto: DetailPicklistCreateDto): Observable<DetailPicklistReadDto> {
    const url = `http://localhost:5288/api/DetailPicklists`;
    console.log(`[PicklistService] Creating detail picklist:`, createDto);
    return this.http.post<DetailPicklistReadDto>(url, createDto);
  }

  // ✅ Get articles - Company-aware
  getArticles(): Observable<ArticleDto[]> {
    return this.http.get<ArticleDto[]>('http://localhost:5288/api/Articles?isActive=true');
  }

  // ✅ Get SAP entries for dropdown (stock items)
  getSapEntries(): Observable<SapEntryDto[]> {
    return this.http.get<SapEntryDto[]>('http://localhost:5288/api/Sap?isActive=true');
  }

  // ✅ Create movement trace - Company-aware
  createMovementTrace(dto: MovementTraceCreateDto): Observable<MovementTraceReadDto> {
    return this.http.post<MovementTraceReadDto>(`http://localhost:5288/api/MovementTraces`, dto);
  }

  // ✅ Delete detail picklist - Company-aware
  deleteDetailPicklist(id: number): Observable<any> {
    return this.http.delete<any>(`http://localhost:5288/api/DetailPicklists/${id}`);
  }

  // ✅ Create PicklistUs (scan) - Company-aware
  createPicklistUs(dto: any): Observable<any> {
    return this.http.post<any>(`http://localhost:5288/api/PicklistUs`, dto);
  }
}
