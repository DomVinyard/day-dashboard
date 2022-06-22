import React from "react";
import { render } from "react-dom";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import App from "./app";

const rootElement = document.getElementById("root");
// 1. Using a style object
const theme = {
  styles: {
    global: {
      "html, body": {
        background: "#232325",
        color: "gray.400",
        lineHeight: "tall",
        fontSize: "lg"
      },
      a: {
        color: "teal.500"
      }
    }
  }
};

const themeExt = extendTheme(theme);
render(
  <ChakraProvider theme={themeExt}>
    <App />
  </ChakraProvider>,
  rootElement
);
