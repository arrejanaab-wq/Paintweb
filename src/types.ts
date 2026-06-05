export interface PaintProduct {
  id: string;
  name: string;
  code: string;
  type: string;
  price: string;
  tone: string;
  finish: string;
}

export interface PresetSpaces {
  id: string;
  name: string;
  type: 'interior' | 'exterior';
  image: string;
  defaultWallColor: string;
  defaultAccentColor: string;
  polygons: {
    name: string;
    points: [number, number][]; // scalable percentage coordinates [x, y] from 0 to 100
    type: 'wall' | 'trim' | 'accent';
  }[];
}

export interface ConsultationBooking {
  token?: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  scheduledDate: string;
  preferredCategory: string;
  notes: string;
  status?: string;
  createdAt?: string;
}

export interface SavedCustomization {
  id: string;
  presetId: string;
  wallHex: string;
  accentHex: string;
  finishType: string;
  notes?: string;
  date: string;
}

export interface OrderRecord {
  orderId: string;
  clientName: string;
  address: string;
  contact: string;
  items: {
    productName: string;
    productCode: string;
    colorHex: string;
    quantity: number;
    price: string;
  }[];
  totalCost: string;
  date: string;
  status: string;
}
