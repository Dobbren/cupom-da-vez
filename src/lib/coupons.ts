export interface Coupon {
  id: number;
  productName: string;
  barcode: string;
  reward: number;
  image: string;
}

export const coupons: Coupon[] = [
  {
    id: 1,
    productName: "Nike Air Max 270",
    barcode: "96714954",
    reward: 15000,
    image: "/coupon-images/nike-air-max.webp",
  },
  {
    id: 2,
    productName: "Nike Air Force (Rosa)",
    barcode: "87526465",
    reward: 17500,
    image: "/coupon-images/nike-air-force.webp",
  },
  {
    id: 3,
    productName: "JBL Boombox",
    barcode: "94141786",
    reward: 19000,
    image: "/coupon-images/jbl-boombox.webp",
  },
  {
    id: 4,
    productName: "Samsung Galaxy S23 Ultra",
    barcode: "67661371",
    reward: 16500,
    image: "/coupon-images/samsung-s23.webp",
  },
  {
    id: 5,
    productName: "Samsung Galaxy S20",
    barcode: "81795889",
    reward: 18500,
    image: "/coupon-images/samsung-s20.webp",
  },
  {
    id: 6,
    productName: "Riachuelo Salto Alto",
    barcode: "66777793",
    reward: 15000,
    image: "/coupon-images/riachuelo-shoe.webp",
  },
];

// Total: 15000 + 17500 + 19000 + 16500 + 18500 + 15000 = 101500 Kz

// Helper function to generate fake codes for options
export const generateCodeOptions = (correctCode: string): string[] => {
  const options: string[] = [correctCode];
  
  while (options.length < 4) {
    let fakeCode = "";
    for (let i = 0; i < 8; i++) {
      fakeCode += Math.floor(Math.random() * 10).toString();
    }
    if (!options.includes(fakeCode)) {
      options.push(fakeCode);
    }
  }
  
  // Shuffle the options
  return options.sort(() => Math.random() - 0.5);
};
