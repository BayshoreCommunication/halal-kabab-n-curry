import React, { useContext, useEffect, useReducer, useRef } from "react";
import dynamic from "next/dynamic";
import Head from "next/head";
import Link from "next/link";
import "chart.js/auto";
import { Store } from "../../helpers/Store";
import { useRouter } from "next/router";
import { getError } from "../../helpers/error";
import { ToastContainer, toast } from "react-toastify";
import {
  Container,
  Row,
  Col,
  ListGroup,
  ListGroupItem,
  Table,
} from "reactstrap";
import axios from "axios";
import { CircularProgress } from "@material-ui/core";

import { styled } from "@mui/material/styles";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import MuiAccordion from "@mui/material/Accordion";
import MuiAccordionSummary from "@mui/material/AccordionSummary";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";

const Accordion = styled((props) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  "&:not(:last-child)": {
    borderBottom: 0,
  },
  "&:before": {
    display: "none",
  },
}));

const AccordionSummary = styled((props) => (
  <MuiAccordionSummary
    expandIcon={
      <ArrowForwardIosSharpIcon
        sx={{
          fontSize: "0.9rem",
        }}
      />
    }
    {...props}
  />
))(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, .05)"
      : "rgba(0, 0, 0, .03)",
  flexDirection: "row", // Change flexDirection to 'row'
  "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
    transform: "rotate(90deg)",
  },
  "& .MuiAccordionSummary-content": {
    marginRight: theme.spacing(1), // Change marginLeft to marginRight
  },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: "1px solid rgba(0, 0, 0, .125)",
}));

function reducer(state, action) {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true, error: "" };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, orders: action.payload, error: "" };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    default:
      state;
  }
}

function Orders() {
  const { state } = useContext(Store);
  const { userInfo } = state;
  const router = useRouter();
  const [{ loading, error, orders }, dispatch] = useReducer(reducer, {
    loading: true,
    orders: [],
    error: "",
  });

  useEffect(() => {
    if (!userInfo) {
      router.push("/login");
    }
    const fetchData = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get(`/api/admin/orders`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err) {
        toast.error(`${getError(err)}`);
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };
    fetchData();
  }, []);

  const handleDelivery = async (id) => {
    try {
      // check if order is delivered or not
      // if delivered, return
      // if not delivered, update order status to delivered
      if (orders.filter((order) => order._id === id)[0].isDelivered) {
        toast.error("Order already delivered");
        return;
      }

      const { data } = await axios.patch(
        `/api/admin/orders/${id}`,
        {},
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      );
      // refresh page
      router.reload();
      toast.success("Order Delivered");
      dispatch({ type: "FETCH_SUCCESS", payload: data });
    } catch (err) {
      toast.error(`${getError(err)}`);
    }
  };

  console.log("orders", orders);

  return (
    <>
      <Head>
        <title>Order History</title>
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
        <Container className="mt-4 mb-4">
          <Row>
            <Col lg="3" md="6" className="mb-3">
              <ListGroup>
                <ListGroupItem action href="/admin/dashboard" tag="a">
                  Admin Dashboard
                </ListGroupItem>
                <ListGroupItem
                  action
                  href="/admin/orders"
                  className="bg-warning text-light"
                  tag="a"
                >
                  Orders
                </ListGroupItem>
                <ListGroupItem action href="/admin/menu" tag="a">
                  Menu
                </ListGroupItem>
                <ListGroupItem action href="/admin/users" tag="a">
                  Users
                </ListGroupItem>
              </ListGroup>
            </Col>
            <Col lg="9" md="6">
              <ListGroup>
                <ListGroupItem>
                  <h1>All Orders</h1>
                  {loading ? (
                    <CircularProgress />
                  ) : error ? (
                    <div className="bg-warning">{error}</div>
                  ) : (
                    orders?.map((order) => {
                      return (
                        <>
                          <Accordion key={order._id}>
                            <AccordionSummary>
                              <Typography>Order ID: {order._id}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              {/*  */}
                              <Table
                                striped
                                bordered
                                hover
                                responsive
                                className="table-sm"
                              >
                                <thead>
                                  <tr>
                                    <th>ITEM</th>
                                    <th>QTY</th>
                                    <th>ADDON</th>
                                    <th>PRICE</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {order.orderItems.map((item) => {
                                    return (
                                      <tr key={item._id}>
                                        <td>{item.name}</td>
                                        <td>{item.quantity}</td>
                                        <td>
                                          {item?.addon} $
                                          {item?.addonPrice * item?.quantity}
                                        </td>
                                        <td>${item.price * item?.quantity}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </Table>
                              <div className="d-flex justify-content-between">
                                <div>
                                  <h5>Tax: {order.taxPrice}</h5>
                                  <h5>Shipping: {order.shippingPrice}</h5>
                                  <h5>Order Total: ${order.totalPrice}</h5>
                                  <h5>
                                    Order Status:{" "}
                                    {order.isDelivered
                                      ? "Delivered"
                                      : "Not Delivered"}
                                  </h5>
                                </div>
                                <div>
                                  <button
                                    className={`btn text-white ${
                                      order.isDelivered
                                        ? "btn-success disabled"
                                        : "btn-warning"
                                    }`}
                                    onClick={() => handleDelivery(order._id)}
                                  >
                                    {order.isDelivered
                                      ? "Delivered"
                                      : "Mark As Delivered"}
                                  </button>
                                </div>
                              </div>
                            </AccordionDetails>
                          </Accordion>
                        </>
                      );
                    })
                  )}
                </ListGroupItem>
              </ListGroup>
            </Col>
          </Row>
        </Container>
      </main>
    </>
  );
}

export default dynamic(() => Promise.resolve(Orders), { ssr: false });
