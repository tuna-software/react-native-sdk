/**
 * Tokenization types for Tuna React Native
 */
import { CardData, SavedCard } from './payment';
export interface TokenResponse {
    token: string;
    brand: string;
    validFor?: number;
    code: number | string;
    message?: string;
}
export interface TokenListResponse {
    tokens: SavedCard[];
    code: number | string;
    message?: string;
}
export interface BindResponse {
    validFor?: number;
    code: number | string;
    message?: string;
}
export interface DeleteResponse {
    status: string;
    code: number | string;
    message?: string;
}
export interface GenerateTokenRequest {
    sessionId: string;
    card: CardData;
    authenticationInformation?: {
        code: string;
    };
}
export interface ListTokensRequest {
    sessionId: string;
}
export interface BindTokenRequest {
    sessionId: string;
    token: string;
    cvv: string;
    authenticationInformation?: {
        code: string;
    };
}
export interface DeleteTokenRequest {
    sessionId: string;
    token: string;
}
export interface TokenizationRequest {
    cardNumber: string;
    cardholderName: string;
    expirationMonth: number;
    expirationYear: number;
    cvv: string;
    customerId?: string;
    brand?: string;
}
export interface TokenizationResponse {
    token: string;
    maskedCardNumber: string;
    cardBrand?: string;
    lastFourDigits: string;
    expirationMonth: number;
    expirationYear: number;
    customerId?: string;
    createdAt: Date;
}
export interface SavedToken {
    token: string;
    maskedCardNumber: string;
    cardBrand?: string;
    lastFourDigits: string;
    expirationMonth: number;
    expirationYear: number;
    customerId?: string;
    createdAt: Date;
    isDefault?: boolean;
}
export interface CardTokenizationData {
    CardNumber: string;
    CardHolderName: string;
    ExpirationMonth: number;
    ExpirationYear: number;
    CVV: string;
    CustomerId?: string;
    Brand?: string;
}
export interface TokenBindRequest {
    token: string;
    customerId: string;
    isDefault?: boolean;
}
export interface TokenListRequest {
    customerId?: string;
}
export interface TokenDeleteRequest {
    token: string;
    customerId?: string;
}
//# sourceMappingURL=tokenization.d.ts.map