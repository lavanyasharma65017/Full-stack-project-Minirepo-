// apps/frontend/pages/_app.js

import React from 'react';

// Minimal global styling
const globalStyles = `
  body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
    background-color: #f4f4f9;
  }
  h1, h2 {
    color: #333;
  }
  button {
    cursor: pointer;
    padding: 10px 15px;
    border: none;
    border-radius: 5px;
    background-color: #007bff;
    color: white;
  }
  input, select, textarea {
    padding: 10px;
    margin-top: 5px;
    margin-bottom: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
  }
`;

export default function App({ Component, pageProps }) {
  return (
    <React.Fragment>
      <style global jsx>{globalStyles}</style>
      <header style={{ padding: '15px', background: '#333', color: 'white' }}>
        Mini Compete Service
      </header>
      <main style={{ padding: '20px' }}>
        <Component {...pageProps} />
      </main>
    </React.Fragment>
  );
}