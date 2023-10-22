import React, { useState, useContext, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Container, Row, Col } from 'reactstrap'
import CommonSection from '../components/UI/CommonSection'
import ProductCard from '../components/UI/ProductCard'
import ReactPaginate from 'react-paginate'
import db from '../helpers/db'
import Product from '../models/Product'
import axios from 'axios'
import { toast, ToastContainer } from 'react-toastify'
import { Store } from '../helpers/Store'
import foodCategoryImg01 from '../public/images/hamburger.png'
import foodCategoryImg02 from '../public/images/pizza.png'
import foodCategoryImg03 from '../public/images/bread.png'
import Image from 'next/image'

export default function Shop(props) {
  const router = useRouter()
  const { state, dispatch } = useContext(Store)
  const [searchTerm, setSearchTerm] = useState('')
  const [pageNumber, setPageNumber] = useState(0)
  const [category, setCategory] = useState('ALL')
  const [allProducts, setAllProducts] = useState([])
  const { products } = props

  const searchedProduct = Array.isArray(products)
    ? products.filter((item) => {
        if (searchTerm.value === '') {
          return item
        }
        if (item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
          return item
        } else {
          return console.log('not found')
        }
      })
    : []

  /**
   * Number of food to show per page
   */
  const productPerPage = 12
  const visitedPage = pageNumber * productPerPage
  const displayPage = searchedProduct.slice(
    visitedPage,
    visitedPage + productPerPage,
  )

  const pageCount = Math.ceil(searchedProduct.length / productPerPage)

  const changePage = ({ selected }) => {
    setPageNumber(selected)
  }
  /***
   * add item to cart
   */
  const addToCartHandler = async (product) => {
    const existItem = state.cart.cartItems.find((x) => x._id === product._id)
    const quantity = existItem ? existItem.quantity + 1 : 1
    const { data } = await axios.get(`/api/products/${product._id}`)

    if (data.countInStock <= quantity) {
      toast.error('Sorry we cannot provide this quantity of food!')
      return
    }
    dispatch({ type: 'CART_ADD_ITEM', payload: { ...product, quantity } })

    router.push('/cart')
  }

  useEffect(() => {
    if (category == 'ALL') {
      setAllProducts(products)
    }
    if (category == 'BURGER') {
      const filteredProducts = products.filter(
        (item) => item.category == 'Burger',
      )
      setAllProducts(filteredProducts)
    }

    if (category == 'PIZZA') {
      const filteredProducts = products.filter(
        (item) => item.category == 'Pizza',
      )
      setAllProducts(filteredProducts)
    }

    if (category == 'BREAD') {
      const filteredProducts = products.filter(
        (item) => item.category == 'Bread',
      )
      setAllProducts(filteredProducts)
    }
  }, [category])

  return (
    <>
      <Head>
        <title>Menu</title>
        <meta name="description" content="All foods" />
        {/* <link rel="icon" href="/favicon.ico" /> */}
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>
      <main>
        <CommonSection title="Menu" />
        <ToastContainer />
        <section>
          <Container>
            <Row>
              {/* <Col lg="12" className="text-center">
                <h2>Popular Foods</h2>
              </Col> */}

              <Col lg="12">
                <div className="food__category d-flex align-items-center justify-content-center gap-4">
                  <button
                    className={`all__btns ${
                      category == 'ALL' ? 'foodBtnActive' : ''
                    } `}
                    onClick={() => setCategory('ALL')}
                  >
                    All
                  </button>
                  <button
                    className={`d-flex align-items-center gap-2  ${
                      category == 'BURGER' ? 'foodBtnActive' : ''
                    } `}
                    onClick={() => setCategory('BURGER')}
                  >
                    <div className="foodCategoryImg">
                      <Image
                        src={foodCategoryImg01}
                        height={20}
                        width={20}
                        alt="Category Image 1"
                      />
                    </div>
                    Burger
                  </button>
                  <button
                    className={`d-flex align-items-center gap-2  ${
                      category == 'PIZZA' ? 'foodBtnActive' : ''
                    } `}
                    onClick={() => setCategory('PIZZA')}
                  >
                    <div className="foodCategoryImg">
                      <Image
                        src={foodCategoryImg02}
                        height={20}
                        width={20}
                        alt="Category Image 2"
                      />
                    </div>
                    Pizza
                  </button>
                  <button
                    className={`d-flex align-items-center gap-2 ${
                      category == 'BREAD' ? 'foodBtnActive' : ''
                    } `}
                    onClick={() => setCategory('BREAD')}
                  >
                    <div className="foodCategoryImg">
                      <Image
                        src={foodCategoryImg03}
                        height={20}
                        width={20}
                        alt="Category Image 3"
                      />
                    </div>
                    Bread
                  </button>
                </div>
              </Col>

              {!allProducts && allProducts == undefined ? (
                <Loader />
              ) : (
                allProducts.map((item) => (
                  <Col
                    lg="3"
                    md="4"
                    sm="6"
                    xs="6"
                    key={item.id}
                    className="mt-5"
                  >
                    <ProductCard
                      item={item}
                      click={() => addToCartHandler(item)}
                    />
                  </Col>
                ))
              )}
            </Row>
          </Container>
        </section>
      </main>
    </>
  )
}

export async function getServerSideProps() {
  await db.connect()
  const products = await Product.find({}, '-reviews').lean()
  await db.disconnect()
  return {
    props: {
      products: products.map(db.convertDocToObj),
    },
  }
}
