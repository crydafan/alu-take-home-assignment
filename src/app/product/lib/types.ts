export type Material = {
  label: string;
  detail: string;
};

export type CareItem = {
  label: string;
  detail: string;
};

export type SupplyChainStep = {
  step: string;
  location: string;
};

export type CrossSellItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
};

export type Product = {
  id: string;
  sku: string;
  brand: string;
  name: string;
  color: string;
  price: number;
  image: string;
  description: string;
  materials: Material[];
  care: CareItem[];
  supplyChain: SupplyChainStep[];
  crossSell: CrossSellItem[];
  repairIssues: string[];
};
