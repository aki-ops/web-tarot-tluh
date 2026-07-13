declare class DrawCardItemDto {
    position: string;
    cardId: string;
    isReversed?: boolean;
}
export declare class CreateDrawDto {
    type: string;
    intent?: string;
    cards: DrawCardItemDto[];
}
export {};
