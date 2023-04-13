import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { SIGNEDIN_KEY } from "../shared/Constants";

const port = "8000";
// const domain = "http://192.168.1.73";
const domain = "http://localhost";
let baseURL = null;

baseURL = `${domain}:${port}`;

const apiClient = axios.create({
  baseURL,
});

apiClient.interceptors.request.use(async (config) => {
  const data = await AsyncStorage.getItem(SIGNEDIN_KEY);

  const parsedData = data ? JSON.parse(data) : null;
  const jwt = parsedData?.token;

  config.headers["content-type"] = "application/json";
  if (jwt) {
    config.headers["access-token"] = `Bearer: ${jwt}`;
  }
  config.headers["content-language"] = "en";

  return config;
});

apiClient.interceptors.response.use(
  function (response) {
    //console.log('RESPONSE: ', response.config.url, response.data);
    return response;
  },
  function (error) {
    console.log("ERROR", error);
    if (
      error?.response?.data?.statusCode === 401 ||
      error?.response?.status === 401
    ) {
      handleLogout();
    } else {
      if (error?.response?.data?.message || error?.data?.message) {
        console.log(
          "Api error",
          error?.response?.data?.message || error?.data?.message
        );
      } else {
      }
    }

    return Promise.reject(error.response);
  }
);

const handleLogout = () => {
  AsyncStorage.removeItem(SIGNEDIN_KEY);
};

export { apiClient as default, domain, port };
