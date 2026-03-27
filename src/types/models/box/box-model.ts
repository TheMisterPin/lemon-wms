export interface API_Box {
    id: string;
    name: string;
    description?: string | null;
    closedImage?: string | null;
    contentsImage?: string | null;
    locationId: string;
    createdAt: string;
    updatedAt: string;
}

export type Box = Pick<API_Box, 'id' | 'name' | 'description' | 'locationId' | 'closedImage' | 'contentsImage'>;
