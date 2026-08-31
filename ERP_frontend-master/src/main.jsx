import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Provider } from "react-redux";
import store from "./redux/store";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import ErrorBoundary from './components/ErrorBoundary';

import { ToastContainer, cssTransition } from "react-toastify";
import { X } from "react-bootstrap-icons";
const Fade = cssTransition({
  enter: "toast-fade-in",
  exit: "toast-fade-out",
  collapse: true,
  collapseDuration: 300,
});
const WhiteCloseButton = ({ closeToast }) => (
  <button
    onClick={closeToast}
    style={{
      background: "transparent",
      border: "none",
      color: "white",       // 👈 makes it white
      // fontSize: "16px",
      display: "flex",
      alignItems: "end", // 👈 fixes vertical alignment
      justifyContent: "end",
      cursor: "pointer",
      padding: 0,        // 👈 remove padding
      margin: 0,
    }}
  >
    <X size={30} />
  </button>
);


// ReactDOM.createRoot(document.getElementById("root")).render(
//   <Provider store={store}>
//     <BrowserRouter>
//       <App />
//     </BrowserRouter>
//   </Provider>
// );

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <Provider store={store}>
      <BrowserRouter>
        <App />
         <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={true}
          closeOnClick
          transition={Fade}
           closeButton={WhiteCloseButton} 
           style={{ top: "80px" }} 
           icon ={false}
        />
      </BrowserRouter>
    </Provider>
  </ErrorBoundary>
);
