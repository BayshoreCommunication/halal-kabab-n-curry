import React, { useState, useEffect, useContext } from "react";
import { Store } from "../helpers/Store";
import ProductCard from "../components/UI/ProductCard";
import db from "../helpers/db";
import { useRouter } from "next/router";
import Product from "../models/Product";
import { Col, Container, Row } from "reactstrap";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import CommonSection from "../components/UI/CommonSection";

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
  const [category, setCategory] = useState("all items");
  const [filteredProducts, setFilteredProducts] = useState(products);

  useEffect(() => {
    const uniqueCategories = new Set(
      products.map((product) => product.category)
    );
    setMenuList([...uniqueCategories, "all items"]);
    const filteredProducts = products.filter(
      (product) => product.category === category
    );
    if (category === "all items") {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(filteredProducts);
    }
  }, [products, category]);

  const handleClick = (item) => {
    {
      /* if "all items" is set to category then All Items button should be active otherwise it should active depending on category name */
    }
    if (item === "all items") {
      setCategory(item);
    } else {
      setCategory(item);
    }
  };

  const router = useRouter();
  const { state, dispatch } = useContext(Store);

  const addToCartHandler = async (product) => {
    const existItem = state.cart.cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${product._id}`);

    if (data.countInStock <= quantity) {
      toast.error("Sorry we cannot provide this quantity of food!");
      return;
    }
    dispatch({ type: "CART_ADD_ITEM", payload: { ...product, quantity } });
    router.push("/cart");
  };

  return (
    <>
      <ToastContainer />
      <CommonSection title="Menu" />
      <Container className="my-5">
        <Row>
          <Col lg="2">
            <div className="menu-sidebar">
              {/* if "all items" is set to category then All Items button should be active otherwise it should active depending on category name */}
              {menuList
                .map((item, index) => (
                  <button
                    key={index}
                    className={`btn-group__item ${
                      category === item ? "active-sidebar-btn" : ""
                    }`}
                    onClick={() => handleClick(item)}
                  >
                    {item}
                  </button>
                ))
                .reverse()}
            </div>
          </Col>
          <Col lg="10">
            {!filteredProducts && filteredProducts === undefined ? (
              <Loader />
            ) : (
              <div className="product-card-grid">
                {filteredProducts.map((item, index) => (
                  <ProductCard
                    item={item}
                    key={index}
                    click={() => addToCartHandler(item)}
                  />
                ))}
              </div>
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Menu;
