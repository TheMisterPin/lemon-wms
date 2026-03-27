
export interface API_Location {
  id: string;
  name: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export type Location = Pick<API_Location, 'id' | 'name' | 'icon'>;
