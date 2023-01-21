import React from "react";

const Main = () => {
  const products = [
    { name: "iPhone XR", description: "128GB White", subtotal: "$599", img: "https://i.imgur.com/qSnCFIS.png" },
    { name: "Airpods", description: "With charging case", subtotal: "$199", img: "https://i.imgur.com/qSnCFIS.png" },
    { name: "Belkin Boost Up", description: "Wireless charging pad", subtotal: "$49.95", img: "https://i.imgur.com/qSnCFIS.png" }
  ];
  return (
    <div className="card mt-50 mb-50">
      <div className="col d-flex">
        <span className="text-muted" id="orderno">
          order #546924
        </span>
      </div>
      <div className="gap">
        <div className="col-2 d-flex mx-auto" />
      </div>
      <div className="title mx-auto">Thank you for your order!</div>
      <div className="main">
        <span id="sub-title">
          <p>
            <b>Payment Summary</b>
          </p>
        </span>
        {products.map((product, index) => {
          return (
            <div className="row row-main" key={index}>
              <div className="col-3">
              <img
className="img-fluid"
src={product.img}
alt="product"
style={{ width: '65px', height: '65px',marginTop: '-10px' }}
/>
              </div>
              <div className="col-6">
                <div className="row d-flex">
                  <p>
                    <b>{product.name}</b>
                  </p>
                </div>
                <div className="row d-flex">
                  <p className="text-muted">{product.description}</p>
                </div>
              </div>
              <div className="col-3 d-flex justify-content-end">
                <p>
                  <b>{product.subtotal}</b>
                </p>
              </div>
            </div>
          );
        })}
        <hr />
        <div className="total">
          <div className="row">
            <div className="col">
              <b> Total:</b>
            </div>
            <div className="col d-flex justify-content-end">
              <b>$847.95</b>
            </div>
          </div>{" "}
          <button className="btn d-flex mx-auto"> Track your order </button>
        </div>
      </div>
    </div>
  );
};

export default Main;