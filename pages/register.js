import React, { useContext, useEffect } from 'react'
import Head from 'next/head'
import { Container, Row, Col } from 'reactstrap'
import CommonSection from '../components/UI/CommonSection'
import Link from 'next/link'
import { ToastContainer, toast } from 'react-toastify'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { Store } from '../helpers/Store'
import { getError } from '../helpers/error'
import axios from 'axios'
import Cookies from 'js-cookie'

const Register = () => {
  const router = useRouter()
  const { redirect } = router.query // login?redirect=/shipping
  const { state, dispatch } = useContext(Store)
  const { userInfo } = state
  useEffect(() => {
    if (userInfo) {
      router.push('/')
    }
  }, [])
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const submitHandler = async ({ name, email, password }) => {
    try {
      const { data } = await axios.post('/api/users/register', {
        name,
        email,
        password,
      })
      dispatch({ type: 'USER_LOGIN', payload: data })
      Cookies.set('userInfo', data)
      router.push(redirect || '/')
      toast.success('Successfully Register')
    } catch (err) {
      toast.error(`${getError(err)}`)
    }
  }
  return (
    <>
      <Head>
        <Head>
          <title>
            Halal Kabab & Curry | Register | Food Delivery and Takeout | Order
            Online
          </title>
          <meta
            name="description"
            content="We deliver your takeouts or essential groceries from the best-rated local partners straight to your door. Download our app or order online. Food. We Get It."
          />
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
      </Head>
      <CommonSection title="Signup" />
      <ToastContainer />
      <section className="mt-4 mb-4">
        <Container>
          <Row>
            <Col lg="6" md="6" sm="12" className="m-auto text-center">
              <form
                className="form mb-3"
                onSubmit={handleSubmit(submitHandler)}
              >
                <div className="form__group">
                  <input
                    type="text"
                    {...register('name', {
                      required: 'Please enter name',
                      minLength: { value: 3, message: 'Name is more than 2' },
                    })}
                    placeholder="Full name"
                    required
                  ></input>
                  {errors.name && (
                    <div className="text-danger">{errors.name.message}</div>
                  )}
                </div>
                <div className="form__group">
                  <input
                    type="email"
                    {...register('email', {
                      required: 'Please enter email',
                      pattern: {
                        value: /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
                        message: 'Please enter  a valid email address',
                      },
                    })}
                    placeholder="Email"
                    required
                  ></input>
                  {errors.email && (
                    <div className="text-danger">{errors.email.message}</div>
                  )}
                </div>
                <div className="form__group">
                  <input
                    type="password"
                    {...register('password', {
                      required: 'Please enter password',
                      minLength: {
                        value: 6,
                        message: 'Password is more than 5 chars',
                      },
                    })}
                    placeholder="Password"
                    required
                  ></input>
                  {errors.password && (
                    <div className="text-danger">{errors.password.message}</div>
                  )}
                </div>
                <button type="submit" className="addTOCart__btn">
                  Sign Up
                </button>
              </form>
              <Link href="/login" legacyBehavior>
                <a className="link__color mb-4">
                  Already have an account? Login
                </a>
              </Link>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  )
}

export default Register
