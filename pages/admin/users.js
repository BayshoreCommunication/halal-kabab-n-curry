import React, {
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import dynamic from "next/dynamic";
import Head from "next/head";
import Link from "next/link";
import "chart.js/auto";
import { Bar } from "react-chartjs-2";
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
      return { ...state, loading: false, users: action.payload, error: "" };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    case "DELETE_REQUEST":
      return { ...state, loadingDelete: true };
    case "DELETE_SUCCESS":
      return { ...state, loadingDelete: false, successDelete: true };
    case "DELETE_FAIL":
      return { ...state, loadingDelete: false };
    case "DELETE_RESET":
      return { ...state, loadingDelete: false, successDelete: false };
    default:
      state;
  }
}

function Users() {
  // Accordion set up state
  const [expanded, setExpanded] = useState("panel1");
  const handleChange = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
  };

  const { state } = useContext(Store);
  const { userInfo } = state;
  const router = useRouter();
  const ref = useRef();
  const [{ loading, error, users, successDelete, loadingDelete }, dispatch] =
    useReducer(reducer, {
      loading: true,
      products: [],
      error: "",
    });

  useEffect(() => {
    if (!userInfo) {
      router.push("/login");
    }
    const fetchData = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get(`/api/admin/users`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err) {
        toast.error(`${getError(err)}`);
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };
    if (successDelete) {
      dispatch({ type: "DELETE_RESET" });
    } else {
      fetchData();
    }
  }, [successDelete]);

  const deleteHandler = async (userId) => {
    if (!window.confirm("Are you sure?")) {
      return;
    }
    try {
      dispatch({ type: "DELETE_REQUEST" });
      await axios.delete(`/api/admin/users/${userId}`, {
        headers: { authorization: `Bearer ${userInfo.token}` },
      });
      dispatch({ type: "DELETE_SUCCESS" });
      toast.success(`User deleted successfully`);
    } catch (err) {
      dispatch({ type: "DELETE_FAIL" });
      toast.error(`${getError(err)}`);
    }
  };

  return (
    <>
      <Head>
        <title>All Users</title>
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
                <ListGroupItem action href="/admin/orders" tag="a">
                  Orders
                </ListGroupItem>
                <ListGroupItem action href="/admin/menu" tag="a">
                  Menu
                </ListGroupItem>
                <ListGroupItem
                  action
                  href="/admin/users"
                  className="bg-warning text-light"
                  tag="a"
                >
                  Users
                </ListGroupItem>
              </ListGroup>
            </Col>
            <Col lg="9" md="6">
              <ListGroup>
                <ListGroupItem>
                  <div className="d-flex justify-content-between mb-2 mt-2">
                    <h4>Users</h4>
                    {loadingDelete && <div>Circular loading progress</div>}
                  </div>
                  {loading ? (
                    <CircularProgress />
                  ) : error ? (
                    <div className="bg-warning">{error}</div>
                  ) : (
                    users?.map((user, index) => (
                      <Accordion
                        key={index}
                        expanded={expanded === `${index}`}
                        onChange={handleChange(`${index}`)}
                      >
                        <AccordionSummary>
                          <Typography className="d-flex flex-column">
                            {user.name}
                            <span className="text-muted">
                              {user._id.substring(16, 24)}
                            </span>
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Typography>
                            {/* don't use table here to show details  */}
                            <div className="d-flex justify-content-between">
                              <div>
                                <p className="mb-0">
                                  <strong>Email: </strong>
                                  {user.email}
                                </p>
                                <p className="mb-0">
                                  <strong>Is Admin: </strong>
                                  {user.isAdmin ? "YES" : "NO"}
                                </p>
                              </div>
                            </div>
                            <div className="d-flex gap-2 mt-2">
                              <Link href={`/admin/user/${user._id}`} passHref>
                                <button className="bg-secondary mr-3 addTOCart__btn">
                                  Edit
                                </button>
                              </Link>
                              <button
                                className="bg-secondary mr-3 addTOCart__btn"
                                onClick={() => deleteHandler(user._id)}
                              >
                                Delete
                              </button>
                            </div>
                          </Typography>
                        </AccordionDetails>
                      </Accordion>
                    ))
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

export default dynamic(() => Promise.resolve(Users), { ssr: false });
