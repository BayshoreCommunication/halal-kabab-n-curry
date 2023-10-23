import React, { useState, useEffect } from "react";
import ProductCard from "../components/UI/ProductCard";
import db from "../helpers/db";
import Product from "../models/Product";

export async function getServerSideProps() {
  await db.connect();
  const products = await Product.find({}, "-reviews").lean();
  await db.disconnect();
  return {
    props: {
      products: products.map(db.convertDocToObj),
    },
  };
}

const Menu = ({ products }) => {
  const [menuList, setMenuList] = useState([]);
  const [category, setCategory] = useState("All");
  const [filteredProducts, setFilteredProducts] = useState(products);

  useEffect(() => {
    const uniqueCategories = new Set(
      products.map((product) => product.category)
    );
    setMenuList([...uniqueCategories, "All"]);
  }, [products]);

  useEffect(() => {
    const filteredProducts = products.filter(
      (product) => product.category === category
    );
    setFilteredProducts(filteredProducts);
  }, [category, products]);

  const handleClick = (category) => {
    if (category === "All") {
      setFilteredProducts(products);
    } else {
      setCategory(category);
    }
  };

  return (
    <div>
      <nav className="navbar">
        <div className="btn-group">
          {menuList.map((category) => (
            <button
              key={category}
              className={`btn-group__item ${
                category === category ? "active" : ""
              }`}
              onClick={() => handleClick(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </nav>

      <div className="menu-card">
        {filteredProducts.map((item, index) => (
          <ProductCard key={index} item={item} />
        ))}
      </div>
    </div>
  );
};

export default Menu;
