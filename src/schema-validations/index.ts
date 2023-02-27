import * as yup from "yup";

//login
const loginSchema = yup.object({
  body: yup.object({
    email: yup
      .string()
      .email("Invalid email address")
      .required("Email is required"),
  }),
});

//authorize user
const authSchema = yup.object({
  params: yup.object({
    token: yup.string().required("Token is required"),
  }),
});

const urlSchema = yup.object({
  body: yup.object({
    originalUrl: yup.string().required("original url is required"),
  }),
});

const getUrlSchema = yup.object({
  params: yup.object({
    url: yup.string().required("url is required"),
  }),
});

const getAUrlSchema = yup.object({
  params: yup.object({
    id: yup.string().required("id is required"),
  }),
});

const getUrlWithPasswordSchema = yup.object({
  params: yup.object({
    url: yup.string().required("url is required"),
    password: yup.string().required("password is required"),
  }),
});

export {
  loginSchema,
  authSchema,
  urlSchema,
  getUrlSchema,
  getAUrlSchema,
  getUrlWithPasswordSchema,
};
