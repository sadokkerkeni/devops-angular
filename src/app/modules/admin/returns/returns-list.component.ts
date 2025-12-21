import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ReturnsService, Return } from './returns.service';

@Component({
    selector: 'app-returns-list',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatProgressSpinnerModule,
        MatChipsModule,
        DatePipe
    ],
    templateUrl: './returns-list.component.html',
    styleUrls: ['./returns-list.component.scss']
})
export class ReturnsListComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();

    // Table configuration
    displayedColumns: string[] = ['id', 'articleCode', 'articleDescription', 'warehouse', 'quantity', 'reason', 'status', 'createdDate', 'actions'];
    dataSource = new MatTableDataSource<Return>([]);

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    // State
    loading = true;
    error: string | null = null;

    constructor(
        private returnsService: ReturnsService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.loadReturns();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    ngAfterViewInit(): void {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    loadReturns(): void {
        this.loading = true;
        this.error = null;

        this.returnsService.getReturns()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.dataSource.data = data;
                    this.loading = false;
                },
                error: (err) => {
                    this.error = err.message || 'Erreur lors du chargement des retours';
                    this.loading = false;
                    console.error('Error loading returns:', err);
                }
            });
    }

    getStatusColor(status: string): string {
        switch (status?.toLowerCase()) {
            case 'pending':
            case 'en cours':
                return 'warn';
            case 'approved':
            case 'approuvé':
                return 'primary';
            case 'rejected':
            case 'rejeté':
                return 'accent';
            default:
                return '';
        }
    }

    viewDetails(returnItem: Return): void {
        // Navigate to return details page
        this.router.navigate(['/returns', returnItem.id]);
    }

    goBack(): void {
        this.router.navigate(['/dashboard']);
    }

    retry(): void {
        this.loadReturns();
    }
}
