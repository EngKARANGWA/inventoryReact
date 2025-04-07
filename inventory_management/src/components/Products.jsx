import React from 'react';

const Products = () => {
  const products = [
    { id: 1, name: 'Product A', price: 29.99, stock: 45 },
    { id: 2, name: 'Product B', price: 49.99, stock: 30 },
    { id: 3, name: 'Product C', price: 19.99, stock: 60 },
    { id: 4, name: 'Product D', price: 39.99, stock: 25 },
  ];

  return (
    <div className="products-container">
      <h2>Products</h2>
      <div className="products-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>${product.price.toFixed(2)}</td>
                <td>{product.stock}</td>
                <td>
                  <button className="edit-btn">Edit</button>
                  <button className="delete-btn">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Products; 