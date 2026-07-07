import type { Product } from "./types";

export const product: Product = {
  id: "51fadda5-a86b-402c-b5a7-b9dd894fb569",
  sku: "LC-SKT-CHJQ-260731",
  brand: "Loom Collective",
  name: "The Serpentine Knit Top",
  color: "Chartreuse snake-print jacquard",
  price: 140,
  image: "/product/DTS_FANTASY_Fanette_Guilloud_Photos_ID7147.jpg",
  description:
    "A sculptural knit top with a fluid, serpentine silhouette. The chartreuse snake-print jacquard is knitted in a single piece, so the pattern flows unbroken across the body — no cut seams interrupting the scales.",
  materials: [
    {
      label: "72% Organic Cotton",
      detail: "GOTS-certified, grown in İzmir, Türkiye",
    },
    {
      label: "28% Recycled Polyester",
      detail: "Spun from post-consumer PET, GRS-certified",
    },
  ],
  care: [
    {
      label: "Machine wash cold",
      detail: "30°C / 85°F max with similar colours",
    },
    {
      label: "Line dry",
      detail: "Reshape while damp; dry flat, out of direct sun",
    },
    {
      label: "Do not tumble dry",
      detail: "Heat weakens the recycled fibres",
    },
  ],
  supplyChain: [
    { step: "Organic cotton grown", location: "İzmir, Türkiye" },
    { step: "Spun into yarn", location: "Guimarães, Portugal" },
    { step: "Knitted & printed", location: "Barcelos, Portugal" },
    { step: "Sewn & finished", location: "Porto, Portugal" },
  ],
  crossSell: [
    {
      id: "plume-mini-skirt",
      name: "Plume Mini Skirt",
      description: "Feather-light A-line skirt in matching organic cotton.",
      price: 120,
      image: "/product/DTS_DECADENT_Debora_Spanhol_Photos_ID12467.jpg",
    },
    {
      id: "block-heel-mule",
      name: "Block Heel Mule",
      description: "Hand-finished leather mule with a sculpted block heel.",
      price: 190,
      image: "/product/DTS_FANTASY_Fanette_Guilloud_Photos_ID7148.jpg",
    },
    {
      id: "knitwear-care-kit",
      name: "Knitwear Care Kit",
      description: "Gentle wash, de-pilling comb and a repair thread set.",
      price: 34,
      image: "/product/DTS_Quiet_Glamour_DTS_Studio_Photos_ID8375.jpg",
    },
  ],
  repairIssues: [
    "Snagged thread",
    "Hole in knit",
    "Torn seam",
    "Stretched out of shape",
    "Stain",
    "Other",
  ],
};
