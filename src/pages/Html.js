import React, { useState, useEffect } from 'react';
import './html.css';
import './html2.css';
import $ from 'jquery';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping } from "@fortawesome/free-solid-svg-icons";

const Cart = () => {
  /**dorp food */
  const charSet = [
    "banana",
    "bento"
  ];

  const [width, setWidth] = useState(window.innerWidth - 64);

  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth - 64);
    }

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleDropFood = () => {
    /**shake */
    const cart = $('#cart');
    const newCartTotal = cartTotal + 1;
    setCartTotal(newCartTotal);//update cart bubble

    setTimeout(() => {
      $('#cart').addClass('shake');
    }, 500);

    setTimeout(() => {
      cart.removeClass('shake');
    }, 1000);
    /**drop */
    const left = Math.floor(Math.random() * width);
    const emoji = charSet[Math.floor(Math.random() * charSet.length)];
    const add = `<img class="emoji" style="left: ${left}px;" src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/168840/${emoji}.svg"/>`;
    $(add).appendTo(".container").animate(
      {
        top: $(document).height()
      },
      1600,
      function () {
        $(this).remove();
      }
    );
  };
  /**drop food */

  const [cartTotal, setCartTotal] = useState(
    parseInt(localStorage.getItem('cartTotal')) || 0
  );

  useEffect(() => {
    localStorage.setItem('cartTotal', cartTotal);
  }, [cartTotal]);


  return (
    <div>
      <div id="cart" className="cart" data-totalitems={cartTotal}>
      <FontAwesomeIcon icon={faCartShopping} />
      Cart
      </div>
      <div className="container">
      <button className="button" onClick={handleDropFood}>
        DROP FOOD
      </button>
      </div>

    </div>
  );
};

export default Cart;
