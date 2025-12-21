import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginator, MatPaginatorModule, PageEvent as MatPageEvent } from '@angular/material/paginator';

export interface PaginationEvent {
    pageIndex: number;
    pageSize: number;
    length: number;
    previousPageIndex: number;
}

@Component({
    selector: 'app-pagination',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule, MatSelectModule, MatPaginatorModule],
    templateUrl: './pagination.component.html',
    styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent implements OnChanges, AfterViewInit {
    @Input() length = 0;
    @Input() pageIndex = 0;
    @Input() pageSize = 10;
    @Input() pageSizeOptions: number[] = [10, 25, 50, 100];
    @Input() ariaLabel = 'Pagination';

    @Output() page = new EventEmitter<PaginationEvent>();

    readonly maxVisiblePages = 5;

    @ViewChild(MatPaginator, { static: true }) private _matPaginator!: MatPaginator;

    get matPaginator(): MatPaginator {
        return this._matPaginator;
    }

    ngAfterViewInit(): void {
        this.syncInternalPaginator();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if ((changes['length'] || changes['pageSize']) && this.totalPages > 0) {
            this.pageIndex = Math.min(this.pageIndex, this.totalPages - 1);
        }
        if (this._matPaginator) {
            this.syncInternalPaginator();
        }
    }

    get totalPages(): number {
        return Math.max(1, Math.ceil(this.length / this.pageSize));
    }

    get rangeStart(): number {
        if (this.length === 0) {
            return 0;
        }
        return this.pageIndex * this.pageSize + 1;
    }

    get rangeEnd(): number {
        if (this.length === 0) {
            return 0;
        }
        return Math.min(this.length, (this.pageIndex + 1) * this.pageSize);
    }

    get pageNumbers(): number[] {
        const total = this.totalPages;
        if (total <= this.maxVisiblePages) {
            return Array.from({ length: total }, (_, i) => i);
        }

        let start = Math.max(0, this.pageIndex - Math.floor(this.maxVisiblePages / 2));
        let end = start + this.maxVisiblePages;

        if (end > total) {
            end = total;
            start = end - this.maxVisiblePages;
        }

        return Array.from({ length: end - start }, (_, i) => start + i);
    }

    get canGoPrevious(): boolean {
        return this.pageIndex > 0;
    }

    get canGoNext(): boolean {
        return this.pageIndex < this.totalPages - 1;
    }

    onPageSizeChange(newSize: number): void {
        const previousIndex = this.pageIndex;
        this.pageSize = newSize;
        this.pageIndex = 0;
        this.emitPage(previousIndex);
    }

    goToPage(index: number): void {
        if (index === this.pageIndex || index < 0 || index > this.totalPages - 1) {
            return;
        }
        const previousIndex = this.pageIndex;
        this.pageIndex = index;
        this.emitPage(previousIndex);
    }

    goToPrevious(): void {
        if (!this.canGoPrevious) return;
        this.goToPage(this.pageIndex - 1);
    }

    goToFirst(): void {
        if (!this.canGoPrevious) return;
        this.goToPage(0);
    }

    goToNext(): void {
        if (!this.canGoNext) return;
        this.goToPage(this.pageIndex + 1);
    }

    goToLast(): void {
        if (!this.canGoNext) return;
        this.goToPage(this.totalPages - 1);
    }

    onMatPaginatorPage(event: MatPageEvent): void {
        const previousIndex = this.pageIndex;
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;
        this.emitPage(previousIndex, false);
    }

    private emitPage(previousIndex: number, emitToMatPaginator: boolean = true): void {
        this.syncInternalPaginator(emitToMatPaginator, previousIndex);
        this.page.emit({
            pageIndex: this.pageIndex,
            pageSize: this.pageSize,
            length: this.length,
            previousPageIndex: previousIndex
        });
    }

    private syncInternalPaginator(emitEvent = false, previousIndex = this.pageIndex): void {
        if (!this._matPaginator) return;
        this._matPaginator.length = this.length;
        this._matPaginator.pageIndex = this.pageIndex;
        this._matPaginator.pageSize = this.pageSize;
        if (emitEvent) {
            this._matPaginator.page.emit({
                pageIndex: this.pageIndex,
                pageSize: this.pageSize,
                length: this.length,
                previousPageIndex: previousIndex
            });
        }
    }
}
