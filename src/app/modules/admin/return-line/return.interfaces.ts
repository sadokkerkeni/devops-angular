// Return Line interfaces matching backend DTOs
export interface ReturnLineCreateDto {
    dateRetour: Date;
    quantite: number;
    usCode: string;
    articleId: number;
    userId: number;
    statusId: number;
    picklistId?: number;
    isActive?: boolean;
    createdAt?: Date;
    createdBy?: string;
}

export interface ReturnLineReadDto {
    id: number;
    dateRetour: Date;
    quantite: number;
    usCode: string;
    articleId: number;
    userId: number;
    statusId: number;
    picklistId?: number;
    article?: ArticleDto;
    user?: UserDto;
    status?: StatusDto;
    picklist?: PicklistDto;
    createdAt?: Date;
    createdBy?: string;
    modifiedAt?: Date;
    modifiedBy?: string;
    isActive: boolean;
}

export interface ReturnLineUpdateDto {
    dateRetour?: Date;
    quantite?: number;
    usCode?: string;
    articleId?: number;
    userId?: number;
    statusId?: number;
    picklistId?: number;
    isActive?: boolean;
    modifiedAt?: Date;
    modifiedBy?: string;
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

export interface UserDto {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
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

export interface PicklistDto {
    id: number;
    quantity: number;
    warehouseId: number;
    lineId: number;
    statusId: number;
    createdAt?: Date;
    createdBy?: string;
    modifiedAt?: Date;
    modifiedBy?: string;
    isActive: boolean;
}
