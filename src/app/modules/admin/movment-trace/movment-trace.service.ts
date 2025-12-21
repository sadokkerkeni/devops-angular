// src/app/modules/admin/apps/logistics/movement-traces/movment-trace.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin, Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SapService } from '../sap/sap.service';
import { ReturnService } from '../return-line/return.service';
import { BaseCompanyService } from 'app/core/services/base-company.service';
import { AuthService } from 'app/core/auth/auth.service';


@Injectable({
  providedIn: 'root'
})
export class MovementTraceService extends BaseCompanyService {
  protected apiUrl = 'http://localhost:5288/api/MovementTraces'; // Base URL de votre API MovementTraces
  // private sapUrl = 'http://localhost:5288/api/Sap'; // Pas nécessaire si on utilise SapService
  private returnLinesUrl = 'http://localhost:5288/api/ReturnLines'; // Base URL de votre API ReturnLines

  constructor(
    http: HttpClient,
    authService: AuthService,
    private _sapService: SapService, // Injecter le service Sap
    private _returnService: ReturnService // Injecter le service ReturnLine
  ) { 
    super(http, authService);
  }

  // 🏢 Company-aware methods (inherited from BaseCompanyService)
  // - getAllByCompany(isActive?: boolean): Observable<any[]>
  // - getByIdAndCompany(id: number): Observable<any>
  // - createForCompany(dto: any): Observable<any>
  // - updateForCompany(id: number, dto: any): Observable<any>
  // - setActiveStatusForCompany(id: number, value: boolean): Observable<any>

  // Legacy methods for backward compatibility
  // GET: /api/MovementTraces?isActive=true
  getAll(isActive: boolean | null = true): Observable<any[]> {
    return this.getAllByCompany(isActive); // 🏢 Use company-aware method
  }

  // GET: /api/MovementTraces/{id}
  getById(id: number): Observable<any> {
    return this.getByIdAndCompany(id); // 🏢 Use company-aware method
  }

  // POST: /api/MovementTraces
  create(dto: any): Observable<any> {
    return this.createForCompany(dto); // 🏢 Use company-aware method
  }

  // PUT: /api/MovementTraces/{id}/set-active?value=true
  setActiveStatus(id: number, value: boolean): Observable<any> {
    return this.setActiveStatusForCompany(id, value); // 🏢 Use company-aware method
  }

  // --- MÉTHODE PRINCIPALE POUR LE RETOUR ---
  /**
   * Traite le retour complet d'un MovementTrace :
   * 1. Crée un ReturnLine.
   * 2. Met à jour le stock Sap associé.
   * @param movementTraceData L'objet MovementTraceReadDto complet.
   * @param userId L'ID de l'utilisateur effectuant le retour.
   * @returns Un Observable qui émet un objet contenant les résultats de chaque appel.
   */
  processReturn(
    movementTraceData: any, // MovementTraceReadDto
    userId: number
  ): Observable<{ returnLineCreated: any; sapUpdated: any }> {
    console.log(`[MovementTraceService] Traitement du retour pour MovementTrace ID ${movementTraceData?.id}`);
    console.log('[MovementTraceService] MovementTrace data:', movementTraceData);

    // 1. Vérifier les données d'entrée
    if (!movementTraceData || !movementTraceData.id) {
      console.error('[MovementTraceService] Données de MovementTrace invalides ou ID manquant.');
      return throwError(() => new Error('Données de MovementTrace invalides ou ID manquant.'));
    }
    if (!userId || userId <= 0) {
      console.error('[MovementTraceService] UserId invalide.');
      return throwError(() => new Error('UserId invalide.'));
    }

    // 2. Extraire l'articleId depuis detailPicklist
    const articleId = movementTraceData.detailPicklist?.articleId || movementTraceData.articleId;
    if (!articleId) {
      console.error('[MovementTraceService] ArticleId manquant dans les données du MovementTrace.');
      console.error('[MovementTraceService] DetailPicklist:', movementTraceData.detailPicklist);
      return throwError(() => new Error('ArticleId manquant. Impossible de créer le retour.'));
    }

    // 3. Préparer les données pour ReturnLineCreateDto
    const returnLineData: any = {
      usCode: movementTraceData.usNom, // Utiliser le code US du MovementTrace
      quantite: movementTraceData.quantite, // Utiliser la quantité du MovementTrace
      articleId: articleId, // ArticleId extrait du detailPicklist
      userId: userId, // ID de l'utilisateur passé en paramètre
      statusId: 1 // Statut initial, ex: 1 = "En Attente" (à ajuster selon votre logique)
    };
    
    console.log('[MovementTraceService] ReturnLine data prepared:', returnLineData);

    // 4. Préparer les données pour SapUpdateDto
    const usCodeToUpdate = movementTraceData.usNom;
    if (!usCodeToUpdate) {
      console.error('[MovementTraceService] usCode manquant dans les données du MovementTrace.');
      return throwError(() => new Error('usCode manquant dans les données du MovementTrace.'));
    }

    const sapUpdateData: any = {
      usCode: usCodeToUpdate, // Code US à mettre à jour
      quantite: parseInt(movementTraceData.quantite, 10) || 0 // Quantité à ajouter (le backend doit l'ajouter)
    };
    
    console.log('[MovementTraceService] SAP update data prepared:', sapUpdateData);

    // 5. Créer les observables pour les deux appels API
    // ✅ Utiliser createForCompany qui est déjà company-aware
    const createReturnLine$ = this._returnService.createForCompany(returnLineData);
    console.log('[MovementTraceService] Calling ReturnService.createForCompany with data:', returnLineData);

    // ✅ Utiliser addStock qui appelle l'endpoint /add-stock
    const updateSap$ = this._sapService.addStock(sapUpdateData);
    console.log('[MovementTraceService] Calling SapService.addStock with data:', sapUpdateData);

    // 6. Exécuter les deux appels en parallèle et combiner les résultats
    return forkJoin({
      returnLineCreated: createReturnLine$,
      sapUpdated: updateSap$
    }).pipe(
      catchError((err) => {
        console.error('[MovementTraceService] Erreur dans forkJoin (processReturn):', err);
        console.error('[MovementTraceService] Error details:', err.error);
        return throwError(() => err);
      })
    );
  }
  // --- FIN DE LA MÉTHODE PRINCIPALE ---
}