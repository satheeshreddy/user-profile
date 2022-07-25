import React, { useState, useContext } from "react";
import { Formik, Form, useField } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";

import classes from "./AuthForm.module.css";
import AuthContext from "../../store/auth-context";

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const authCtx = useContext(AuthContext);
  const navigate = useNavigate();

  const switchAuthModeHandler = () => {
    setIsLogin((prevState) => !prevState);
  };

  const TextInput = ({ label, ...props }) => {
    const [field, meta] = useField(props);
    return (
      <>
        <label htmlFor={props.id || props.name}>{label}</label>
        <input {...field} {...props} />
        {meta.touched && meta.error ? (
          <div className="error">{meta.error}</div>
        ) : null}
      </>
    );
  };

  return (
    <section className={classes.auth}>
      <h1>{isLogin ? "Login" : "Sign Up"}</h1>
      <Formik
        initialValues={{
          email: "",
          password: "",
        }}
        validationSchema={Yup.object({
          email: Yup.string()
            .email("Invalid email address")
            .required("Required"),
          password: Yup.string()
            .min(6, "Must be at least 6 characters")
            .required("Required"),
        })}
        onSubmit={(values, { setSubmitting }) => {
          setSubmitting(true);
          let url = isLogin
            ? "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=[API_KEY]"
            : "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=[API_KEY]";

          fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: values.email,
              password: values.password,
              returnSecureToken: true,
            }),
          })
            .then((response) => {
              setSubmitting(false);
              if (response.ok) {
                return response.json();
              } else {
                return response.json().then((error) => {
                  const errorCode = error.error.message;
                  throw new Error(errorCode);
                }); // throw error
              }
            })
            .then((responseData) => {
              const expirationTime = new Date(new Date().getTime() + (+responseData.expiresIn * 1000));
              authCtx.login(responseData.idToken, expirationTime.toISOString());
              
              navigate("/");
            })
            .catch((error) => {
              alert(error);
            }); // catch error
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <div className={classes.control}>
              <TextInput label="Email" name="email" type="email" />
            </div>
            <div className={classes.control}>
              <TextInput label="Password" name="password" type="password" />
            </div>
            <div className={classes.actions}>
              {!isSubmitting && (
                <button>{isLogin ? "Login" : "Create Account"}</button>
              )}
              {isSubmitting && <button>Sending...</button>}
              <button
                type="button"
                className={classes.toggle}
                onClick={switchAuthModeHandler}
              >
                {isLogin ? "Create new account" : "Login with existing account"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </section>
  );
};

export default AuthForm;
