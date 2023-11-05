import React, {
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import Link from 'next/link'
import 'chart.js/auto'
import { Bar } from 'react-chartjs-2'
import { Store } from '../../helpers/Store'
import { useRouter } from 'next/router'
import { getError } from '../../helpers/error'
import { ToastContainer, toast } from 'react-toastify'
import { ListGroup } from 'reactstrap'
import axios from 'axios'

import { styled } from '@mui/material/styles'
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp'
import MuiAccordion from '@mui/material/Accordion'
import MuiAccordionSummary from '@mui/material/AccordionSummary'
import MuiAccordionDetails from '@mui/material/AccordionDetails'
import Typography from '@mui/material/Typography'
import { CircularProgress } from '@material-ui/core'
import Image from 'next/image'

const Accordion = styled((props) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  '&:not(:last-child)': {
    borderBottom: 0,
  },
  '&:before': {
    display: 'none',
  },
}))

const AccordionSummary = styled((props) => (
  <MuiAccordionSummary
    expandIcon={
      <ArrowForwardIosSharpIcon
        sx={{
          fontSize: '0.9rem',
        }}
      />
    }
    {...props}
  />
))(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, .05)'
      : 'rgba(0, 0, 0, .03)',
  flexDirection: 'row', // Change flexDirection to 'row'
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'rotate(90deg)',
  },
  '& .MuiAccordionSummary-content': {
    marginRight: theme.spacing(1), // Change marginLeft to marginRight
  },
}))

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: '1px solid rgba(0, 0, 0, .125)',
}))

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' }
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, products: action.payload, error: '' }
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload }
    case 'CREATE_REQUEST':
      return { ...state, loadingCreate: true }
    case 'CREATE_SUCCESS':
      return { ...state, loadingCreate: false }
    case 'CREATE_FAIL':
      return { ...state, loadingCreate: false }
    case 'DELETE_REQUEST':
      return { ...state, loadingDelete: true }
    case 'DELETE_SUCCESS':
      return { ...state, loadingDelete: false, successDelete: true }
    case 'DELETE_FAIL':
      return { ...state, loadingDelete: false }
    case 'DELETE_RESET':
      return { ...state, loadingDelete: false, successDelete: false }
    default:
      state
  }
}

function Products() {
  const [expanded, setExpanded] = React.useState('panel1')

  const handleChange = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false)
  }

  const { state } = useContext(Store)
  const { userInfo } = state
  const router = useRouter()
  const ref = useRef()
  const [
    { loading, error, products, loadingCreate, successDelete, loadingDelete },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    products: [],
    error: '',
  })

  useEffect(() => {
    if (!userInfo) {
      router.push('/login')
    }
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' })
        const { data } = await axios.get(`/api/admin/products`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        })
        dispatch({ type: 'FETCH_SUCCESS', payload: data })
      } catch (err) {
        toast.error(`${getError(err)}`)
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) })
      }
    }
    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' })
    } else {
      fetchData()
    }
  }, [successDelete])

  const createHandler = async () => {
    if (!window.confirm('Are you sure?')) {
      return
    }
    try {
      dispatch({ type: 'CREATE_REQUEST' })
      const { data } = await axios.post(
        `/api/admin/products`,
        {},
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        },
      )
      dispatch({ type: 'CREATE_SUCCESS' })
      toast.success(`Product created successfully`)
      router.push(`/admin/product/${data.product._id}`)
    } catch (err) {
      dispatch({ type: 'CREATE_FAIL' })
      toast.error(`${getError(err)}`)
    }
  }

  const deleteHandler = async (productId) => {
    if (!window.confirm('Are you sure?')) {
      return
    }
    try {
      dispatch({ type: 'DELETE_REQUEST' })
      await axios.delete(`/api/admin/products/${productId}`, {
        headers: { authorization: `Bearer ${userInfo.token}` },
      })
      dispatch({ type: 'DELETE_SUCCESS' })
      toast.success(`Product deleted successfully`)
    } catch (err) {
      dispatch({ type: 'DELETE_FAIL' })
      toast.error(`${getError(err)}`)
    }
  }

  const cetegoies = useMemo(() => {
    const categories = products.map((product) => product.category)
    const uniqueCategories = [...new Set(categories)]
    return uniqueCategories
  }, [products])

  return (
    <>
      <Head>
        <title>All Products</title>
        <meta name="description" content="Your Current Cart" />
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
      </Head>
      <main>
        <ToastContainer />
        <ListGroup>
          <>
            {loading ? (
              <CircularProgress />
            ) : error ? (
              <div className="bg-warning">{error}</div>
            ) : (
              <>
                <div className="d-flex justify-content-end mb-2 mt-2">
                  <button className="addTOCart__btn" onClick={createHandler}>
                    Create
                  </button>
                  {loadingCreate && <div>Waiting...</div>}
                  {loadingDelete && <div>Waiting...</div>}
                </div>
                {cetegoies.map((category) => (
                  <Accordion
                    key={category}
                    expanded={expanded === `${category}`}
                    onChange={handleChange(`${category}`)}
                  >
                    <AccordionSummary
                      aria-controls="panel1d-content"
                      id="panel1d-header"
                    >
                      <Typography>
                        {/* show count of product on this category */}
                        <h6 className="text-capitalize">{category}</h6>
                        <p className="mb-0">
                          Available Items{' '}
                          {
                            products.filter(
                              (product) => product.category === category,
                            ).length
                          }
                        </p>
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <div className="d-flex flex-column gap-3 justify-content-between">
                        {products
                          .filter((product) => product.category === category)
                          .map((product) => (
                            <div
                              key={product._id}
                              className="d-flex justify-content-between align-items-center"
                            >
                              <div className="d-flex gap-2">
                                <Image
                                  src={product.image}
                                  alt="product-image"
                                  height={50}
                                  width={50}
                                  className="prouct__image"
                                />
                                <p className="text-capitalize">
                                  {product.name}
                                </p>
                              </div>
                              <div className="d-flex gap-2">
                                <Link
                                  href={`/admin/product/${product._id}`}
                                  passHref
                                  legacyBehavior
                                >
                                  <button className="bg-secondary mr-3 addTOCart__btn">
                                    Edit
                                  </button>
                                </Link>
                                <button
                                  onClick={() => deleteHandler(product._id)}
                                  className="bg-secondary mr-3 addTOCart__btn"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </>
            )}
          </>
        </ListGroup>
      </main>
    </>
  )
}

export default dynamic(() => Promise.resolve(Products), { ssr: false })

{
  /* <Table responsive>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>NAME</th>
                    <th>PRICE</th>
                    <th>CATEGORY</th>
                    <th>COUNT</th>
                    <th>RATING</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id}>
                      <th scope="row">{product._id.substring(20, 24)}</th>
                      <td>{product.name}</td>
                      <td>{product.price}</td>
                      <td>{product.category}</td>
                      <td>{product.countInStock}</td>
                      <td>{product.rating}</td>
                      <td className="d-flex justify-content-between">
                        {' '}
                        <Link
                          href={`/admin/product/${product._id}`}
                          passHref
                          legacyBehavior
                        >
                          <button className="bg-secondary mr-3 addTOCart__btn">
                            Edit
                          </button>
                        </Link>
                        <button
                          onClick={() => deleteHandler(product._id)}
                          className="btn__3"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table> */
}
