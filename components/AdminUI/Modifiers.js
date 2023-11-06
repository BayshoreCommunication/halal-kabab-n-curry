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
import { ListGroup } from "reactstrap";
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
      return { ...state, loading: false, modifiers: action.payload, error: "" };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    case "CREATE_REQUEST":
      return { ...state, loadingCreate: true };
    case "CREATE_SUCCESS":
      return { ...state, loadingCreate: false };
    case "CREATE_FAIL":
      return { ...state, loadingCreate: false };
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

function Modifiers() {
  // Accordion set up state
  const [expanded, setExpanded] = useState("panel1");
  const handleChange = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
  };

  const { state } = useContext(Store);
  const [products, setProducts] = useState([]);
  const { userInfo } = state;
  const router = useRouter();
  const ref = useRef();
  const [
    { loading, error, modifiers, loadingCreate, successDelete, loadingDelete },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    modifiers: [],
    error: "",
  });

  useEffect(() => {
    if (!userInfo) {
      router.push("/login");
    }
    const fetchData = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get(`/api/admin/modifiers`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        const { data: productData } = await axios.get(`/api/admin/products`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        setProducts(productData);
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

  const createHandler = async () => {
    if (!window.confirm("Are you sure?")) {
      return;
    }
    try {
      dispatch({ type: "CREATE_REQUEST" });
      const { data } = await axios.post(
        `/api/admin/modifiers`,
        {},
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({ type: "CREATE_SUCCESS" });
      toast.success(`Modifier created successfully`);
      //   console.log('first', data)
      router.push(`/admin/modifier/${data.modifier._id}`);
    } catch (err) {
      dispatch({ type: "CREATE_FAIL" });
      // console.log("err", err);
      toast.error(`${getError(err)}`);
    }
  };

  const deleteHandler = async (modifierId) => {
    if (!window.confirm("Are you sure?")) {
      return;
    }
    try {
      dispatch({ type: "DELETE_REQUEST" });
      await axios.delete(`/api/admin/modifiers/${modifierId}`, {
        headers: { authorization: `Bearer ${userInfo.token}` },
      });
      dispatch({ type: "DELETE_SUCCESS" });
      toast.success(`Modifier deleted successfully`);
    } catch (err) {
      dispatch({ type: "DELETE_FAIL" });
      toast.error(`${getError(err)}`);
    }
  };

  return (
    <>
      <Head>
        <title>All Modifiers</title>
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
                <div className="d-flex justify-content-end">
                  <button
                    className="addTOCart__btn mb-2"
                    onClick={createHandler}
                  >
                    Create
                  </button>
                  {loadingCreate && <div>Waiting...</div>}
                  {loadingDelete && <div>Waiting...</div>}
                </div>
                {modifiers?.map((modifier, index) => {
                  return (
                    // change the desing inside the accordion maybe using table or something else
                    <Accordion
                      key={index}
                      expanded={expanded === `${index}`}
                      onChange={handleChange(`${index}`)}
                    >
                      <AccordionSummary
                        aria-controls={`panel${index + 1}d-content`}
                        id={`panel${index + 1}d-header`}
                      >
                        <Typography className="text-capitalize">
                          {modifier.title}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography>
                          <div className="d-flex flex-column">
                            <div>
                              <span>Option: </span>
                              {modifier?.option.map((item, index) => {
                                return (
                                  <label>
                                    {item}
                                    {index !== modifier?.option.length - 1 &&
                                      ","}
                                  </label>
                                );
                              })}
                            </div>
                            <div>
                              <span>Used In: </span>
                              {modifier?.usedIn.map((item, index) => {
                                return (
                                  <label>
                                    {products.map((product) => {
                                      if (product._id === item) {
                                        return (
                                          product.name +
                                          (index !== modifier?.usedIn.length - 1
                                            ? ","
                                            : "")
                                        );
                                      }
                                    })}
                                  </label>
                                );
                              })}
                            </div>
                            <div>
                              <span>Price: </span>
                              {modifier?.price}
                            </div>
                            <div className="d-flex gap-3 mt-3">
                              <Link
                                href={`/admin/modifier/${modifier?._id}`}
                                passHref
                                legacyBehavior
                              >
                                <button className="bg-secondary mr-3 addTOCart__btn">
                                  Edit
                                </button>
                              </Link>
                              <button
                                onClick={() => deleteHandler(modifier?._id)}
                                className="btn__3"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  );
                })}
              </>
            )}
          </>
        </ListGroup>
      </main>
    </>
  );
}

export default dynamic(() => Promise.resolve(Modifiers), { ssr: false });
