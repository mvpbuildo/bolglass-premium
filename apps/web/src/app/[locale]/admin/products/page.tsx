import ProductCard from './ProductCard'; // Correct import - same directory

// ... existing code ...

products.map(product => (
    <ProductCard key={product.id} product={product} />
))
                    )}
                </div >
            </div >
        </main >
    );
}
