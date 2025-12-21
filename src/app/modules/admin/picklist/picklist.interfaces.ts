// Picklist interfaces matching backend DTOs
export interface PicklistCreateDto {
    quantity: number;
    warehouseId: number;
    lineId: number;
    statusId: number;
    createdAt?: Date;
    createdBy?: string;
}

export interface PicklistReadDto {
    id: number;
    quantity: number;
    warehouseId: number;
    lineId: number;
    statusId: number;
    status?: StatusDto;
    warehouse?: WarehouseDto;
    line?: LineDto;
    createdAt?: Date;
    createdBy?: string;
    modifiedAt?: Date;
    modifiedBy?: string;
    isActive: boolean;
}

export interface PicklistUpdateDto {
    quantity?: number;
    warehouseId?: number;
    lineId?: number;
    statusId?: number;
    modifiedAt?: Date;
    modifiedBy?: string;
}

export interface DetailPicklistCreateDto {
    quantite: number;
    picklistId: number;
    articleId: number;
    createdAt?: Date;
    createdBy?: string;
}

export interface DetailPicklistReadDto {
    id: number;
    quantite: number;
    picklistId: number;
    articleId: number;
    article?: ArticleDto;
    picklist?: PicklistReadDto;
    createdAt?: Date;
    createdBy?: string;
    modifiedAt?: Date;
    modifiedBy?: string;
    isActive: boolean;
    // Additional properties for availability checking
    isAvailable?: boolean;
    availableQuantity?: number;
    emplacement?: string;
    status?: StatusDto;
}

export interface DetailPicklistUpdateDto {
    quantite?: number;
    picklistId?: number;
    articleId?: number;
    modifiedAt?: Date;
    modifiedBy?: string;
}

export interface MovementTraceCreateDto {
    quantite: number;
    articleId: number;
    type: string; // 'IN' | 'OUT' | 'RETURN' | 'ADJUSTMENT'
    reference?: string;
    createdAt?: Date;
    createdBy?: string;
}

export interface MovementTraceReadDto {
    id: number;
    quantite: number;
    articleId: number;
    article?: ArticleDto;
    type: string;
    reference?: string;
    createdAt?: Date;
    createdBy?: string;
    modifiedAt?: Date;
    modifiedBy?: string;
    isActive: boolean;
}

export interface StatusDto {
    id: number;
    description: string;
    type?: string;
    createdAt?: Date;
    createdBy?: string;
    modifiedAt?: Date;
    modifiedBy?: string;
    isActive: boolean;
}

export interface WarehouseDto {
    id: number;
    name: string;
    location?: string;
    createdAt?: Date;
    createdBy?: string;
    modifiedAt?: Date;
    modifiedBy?: string;
    isActive: boolean;
}

export interface LineDto {
    id: number;
    name: string;
    description?: string;
    createdAt?: Date;
    createdBy?: string;
    modifiedAt?: Date;
    modifiedBy?: string;
    isActive: boolean;
}

export interface ArticleDto {
    id: number;
    codeProduit: string;
    designation: string;
    quantity?: number;
    price?: number;
    createdAt?: Date;
    createdBy?: string;
    modifiedAt?: Date;
    modifiedBy?: string;
    isActive: boolean;
}

// SAP Entry DTO for stock items dropdown
export interface SapEntryDto {
    id: number;
    article: string;      // Article code (CODE US)
    usCode: string;       // US Code
    quantite: number;     // Available quantity
    isActive: boolean;
}
