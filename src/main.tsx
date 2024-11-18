// import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.scss'
import store from "./redux/state";

const div = document.getElementById("boo");
const root = ReactDOM.createRoot(div!);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rerenderEntireTree = () => {
  root.render(<App />);
};

rerenderEntireTree();
store.subscribe(rerenderEntireTree);
// ReactDOM.createRoot(root!).render(<React.StrictMode> <App /></React.StrictMode>,)
