export interface Product {
    id: string;
    name: string;
    price: number;
    currency: string;
    image: string;
    category: 'set' | 'single' | 'workshop';
}

export const mockProducts: Product[] = [
    {
        id: 'p1',
        name: 'Zestaw "Magia Świąt" (6 szt)',
        price: 120,
        currency: 'PLN',
        image: '/images/set-magic.jpg',
        category: 'set'
    },
    {
        id: 'p2',
        name: 'Bombka Personalizowana "Imienna"',
        price: 45,
        currency: 'PLN',
        image: '/images/single-name.jpg',
        category: 'single'
    },
    {
        id: 'w1',
        name: 'Warsztaty Rodzinne (Bilet)',
        price: 60,
        currency: 'PLN',
        image: '/images/workshop-family.jpg',
        category: 'workshop'
    }
];

export async function getProducts(locale: string = 'pl'): Promise<Product[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Minimal localization simulation
    if (locale === 'en') {
        return mockProducts.map(p => ({
            ...p,
            name: p.name === 'Zestaw "Magia Świąt" (6 szt)' ? 'Set "Holiday Magic" (6 pcs)' : p.name,
            price: Math.round(p.price / 4), // Rough conversion
            currency: 'EUR'
        }));
    }

    if (locale === 'de') {
        return mockProducts.map(p => ({
            ...p,
            name: p.name === 'Zestaw "Magia Świąt" (6 szt)' ? 'Set "Weihnachtszauber" (6 Stk)' : p.name,
            price: Math.round(p.price / 4),
            currency: 'EUR'
        }));
    }

    return mockProducts;
}
