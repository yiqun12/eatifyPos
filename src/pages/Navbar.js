// import React from 'react'
// import { useState } from 'react';
// import axios from "axios";
// import 'bootstrap/dist/css/bootstrap.css';
// import Button from 'react-bootstrap/Button';
// import { useRef, useEffect } from 'react';
// import "./modal.css"
// import "./shopping_cart.css"
// import item_1_pic from "./item-1.png"
// import plusSvg from './plus.svg';
// import minusSvg from './minus.svg';
// import { useLocation } from 'react-router-dom';
// import { useUserContext } from "../context/userContext";
// import 'bootstrap/dist/css/bootstrap.css'; 
// import './group_list.css';

// const Navbar = () => {
//   const { logoutUser} = useUserContext();
//   const user = JSON.parse(localStorage.getItem('user'));

//   const location = useLocation();
//   const [totalPrice, setTotalPrice] = useState(0);

//   console.log(user)
//   ///shopping cart products
//   const [products, setProducts] = useState([
//   ]);

//   useEffect(() => {
//     // Call the displayAllProductInfo function to retrieve the array of products from local storage
//     let productArray = displayAllProductInfo();
//     // Update the products state with the array of products
//     setProducts(productArray);
//   }, []);

//   useEffect(() => {
//     // Calculate the height of the shopping cart based on the number of products
//     const height = products.length * 123 + 100; // 123 is the height of each product element and 80 is the top and bottom margin of the shopping cart
    
//     // Update the height of the shopping cart element
//     document.querySelector('.shopping-cart').style.height = `${height}px`;
//     //maybe add a line here...
//     const calculateTotalPrice = () => {
//       const total = products.reduce((acc, product) => acc + (product.quantity * product.subtotal), 0);
//       setTotalPrice(total);
//     }
//     calculateTotalPrice();
//   }, [products]);
//   const handleDeleteClick = (productId) => {
//     setProducts((prevProducts) => prevProducts.filter((product) => product.id !== productId));

//   }
//   const handleAddProductClick = () => {
//     setProducts((prevProducts) => [...prevProducts, {
//       id: prevProducts.length + 1,
//       quantity: 1,
//       subtotal: 0,
//       image:item_1_pic
//     }]);
//   }
//   const handlePlusClick = (productId) => {
//     setProducts((prevProducts) => {
//       return prevProducts.map((product) => {
//         if (product.id === productId) {
//           return {
//             ...product,
//             quantity: product.quantity + 1,
//           };
//         }
//         return product;
//       });
//     });
//   }
//   const uploadProductsToLocalStorage = (products) => {
//     // Set the products array in local storage
//     localStorage.setItem("products", JSON.stringify(products));
//   };
//   //display every item.
//   const displayAllProductInfo = () => {
//   // Retrieve the array from local storage
//   let products = JSON.parse(localStorage.getItem("products"));
//   //console.log("displayProductFunction")
//   //console.log(products)
//   // Create an empty array to store the products
//   let productArray = [];

//   // Loop through the array of products
//   for (let i = 0; products != null && i < products.length; i++) {
//     let product = products[i];
//     // Push the product object to the array
//     productArray.push({
//       id: product.id,
//       name: product.name,
//       quantity: product.quantity,
//       subtotal: product.subtotal,
//       image: product.image,
//     });
//   }

//   // Return the array of product objects
//   return productArray;
//   };
//   //display one item by id.
//   const displayProductInfo = (id) => {
//     // Retrieve the array from local storage
//     let products = JSON.parse(localStorage.getItem("products"));
  
//     // Find the product with the matching id
//     let product = products.find((product) => product.id === id);
  
//     // Display the product info
//     console.log(`Product ID: ${product.id}`);
//     console.log(`Product Name: ${product.name}`);
//     console.log(`Product Subtotal: ${product.subtotal}`);
//     console.log(`Product Image: ${product.image}`);
//     console.log(`Product Times Clicked: ${product.timesClicked}`);
//   };

//   const handleLikeClick = (productId) => {
//     setProducts((prevProducts) => {
//       return prevProducts.map((product) => {
//         if (product.id === productId) {
//           return {
//             ...product,
//             liked: !product.liked,
//           };
//         }
//         return product;
//       });
//     });
//   }
//   const handleQuantityChange = (productId, newQuantity) => {
//     // Ensure that the newQuantity is a number and is at least 1
//     const safeQuantity = newQuantity ? Math.max(parseInt(newQuantity, 10), 1) : 1;
  
//     setProducts((prevProducts) => {
//       return prevProducts.map((product) => {
//         if (product.id === productId) {
//           return {
//             ...product,
//             quantity: safeQuantity,
//           };
//         }
//         return product;
//       });
//     });
//   };
//   const handleMinusClick = (productId) => {
//     setProducts((prevProducts) => {
//       return prevProducts.map((product) => {
//         if (product.id === productId) {
//           // Constrain the quantity of the product to be at least 1
//           return {
//             ...product,
//             quantity: Math.max(product.quantity - 1, 1),
//           };
//         }
//         return product;
//       });
//     });
//   };
//     // modal. 
//     const modalRef = useRef(null);
//     const btnRef = useRef(null);
//     const spanRef = useRef(null);
//     const openModal = () => {
//     // Call the displayAllProductInfo function to retrieve the array of products from local storage
//     let productArray = displayAllProductInfo();
//     console.log(productArray)
//     // Update the products state with the array of products
//     setProducts(productArray);
//       modalRef.current.style.display = 'block';
//     // Retrieve the array from local storage
//     };
  
//     const closeModal = () => {
//       console.log(products)
//       localStorage.setItem('products', JSON.stringify(products));
//       modalRef.current.style.display = 'none';
      
//     };
  
//     useEffect(() => {
//       // Get the modal
//       const modal = modalRef.current;
  
//       // Get the button that opens the modal
//       const btn = btnRef.current;
  
//       // Get the <span> element that closes the modal
//       const span = spanRef.current;

//       // When the user clicks anywhere outside of the modal, close it
//       window.onclick = (event) => {
//         if (event.target === modal) {
          
//           localStorage.setItem('products', JSON.stringify(products));
//           modal.style.display = "none";
//         }
//       }
//     }, [products]);// pass `products` as a dependency
//   //This will ensure that the useEffect hook is re-run every time the products value changes, and the latest value will be saved to local storage.
//     //google login button functions
//     const [loginData, setLoginData] = useState(
//     localStorage.getItem('loginData')
//     ?JSON.parse(localStorage.getItem('loginData'))
//     :null
//    );
//     const url = "http://localhost:8080"
//     const handleLogin = async (googleData) => {
//         const res = await fetch(url + '/api/google-login', {
//           method: 'POST',
//           credentials: 'include',
//           body: JSON.stringify({
//             token: googleData.tokenId,
//           }),
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         });
//          const data = await res.json();
//          setLoginData(data);
//          console.log(data)
//          localStorage.setItem('loginData', JSON.stringify(data));
//          localStorage.setItem('picture', JSON.stringify(data.picture));
//          sessionStorage.setItem('token', googleData.tokenId);
//          localStorage.setItem('loginID',JSON.stringify(data.id))
//          // console.log(document.cookie);
//          window.location.reload(false);
//        };
//        const handleLogout = () => {
//         axios.get(url + "/logout").then((response) => {//get logout for cookie 
//         // delete cookies front end :)
//           //document.cookie=document.cookie+";max-age=0";
//           //document.cookie=document.cookie+";max-age=0";
//           console.log("clean cookie");
//         });
//        localStorage.removeItem('loginData');//remove localstorage data user name.
//        localStorage.removeItem('loginID');
//        localStorage.removeItem('picture');
//        localStorage.removeItem('name');
//        localStorage.removeItem('email');
//        sessionStorage.removeItem('token');
//        setLoginData(null);//empty the localstorage data
//        window.location.reload(false);
//      };
//      const handleFailure = (response) => {
//         console.log("Fail to login",response)
//       }

//       const HandleCheckout = async () => {
//         localStorage.setItem('products', JSON.stringify(products));
//   // Get the products from local storage
//   const lineItem = JSON.parse(localStorage.getItem('products'));

//   // Create the line items array
//   const lineItems = lineItem.map((product) => {
//     return { price: product.id, quantity: product.quantity };
//   });
//         try {
//           const response = await fetch('http://localhost:4242/create-checkout-session', {
//             method: 'POST',
//             headers: {
//               'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ line_items: lineItems }),
//           });
//           const data = await response.json();
      
//           // Redirect the user to the Checkout session URL
//           window.location.href = data.sessionUrl;
//         } catch (error) {
//           console.error(error);
//         }
//       };
//       const { promise } = useUserContext();

//     return (
//         <>
// <div>
//   </div>
//       <div ref={modalRef} className="modal">
            

// {/* popup content */}
//           <div className="shopping-cart">
            
//       {/* shoppig cart */}
//       <div className="title" style={{height:'80px'}}>
//         Total Price: ${totalPrice} 
//         <button style={{ margin: '10px', marginLeft: '10px'}} className="btn btn-info" onClick={() => HandleCheckout()}>Checkout</button>

//         <span className="delete-btn" style={{float: 'right',cursor: 'pointer'}} ref={spanRef} onClick={closeModal}></span>
//       </div>

//       {products.map((product) => (
        
//         <div key={product.id} className="item">
//           <div className="buttons">
//             <span className="delete-btn" onClick={() => handleDeleteClick(product.id)}></span>
//             {/* <span className={`like-btn ${product.liked ? 'is-active' : ''}`} onClick = {() => handleLikeClick(product.id)}></span> */}
//           </div>

//           <div className="image">
//           <div class="image-container">
//   <img src={product.image} alt="" />
// </div>
//           </div>

//           <div className="description">
//             <span>{product.name}</span>
//             <span>${product.quantity * product.subtotal}</span>
//           </div>

//           <div className="quantity">
//             <button className="plus-btn" type="button" name="button" onClick={() => handlePlusClick(product.id)}>
//             <img src={plusSvg} alt="" />
//             </button>
//             <input
//   type="number"
//   name="name"
//   value={product.quantity}
//   onChange={(e) => handleQuantityChange(product.id, e.target.value)}
//   min="1"
// />
//             <button className="minus-btn" type="button" name="button" onClick={() => handleMinusClick(product.id)}>
//             <img src={minusSvg} alt="" />
//             </button>

//           </div>
//         </div>
//       ))}
          
//     </div>
//     </div>

//             <div className="flex max-w-[1240px] mx-auto items-center p-4 justify-between"
//             style = {{"border-bottom": "solid"}} >
//                 <div className="cursor-pointer" >
//                     <h1 onClick={event =>  window.location.href='/'} className='font-bold text-3xl sm:text-4xl lg:text-4xl '>Eatify</h1>
//                 </div>
//                 <div className='flex'>
//                 {user  ?
                
//                     <div className="login">

//       {location.pathname !== '/account' && <Button variant="dark" style={{ marginLeft: '10px',padding:' 7px 20px' }} ref={btnRef} onClick={openModal}>Cart</Button>}
//       {location.pathname !== '/' && <Button variant="dark" style={{ marginLeft: '10px',padding:' 7px 20px' }} onClick={event =>  window.location.href='/'}>Home</Button>}
//       {location.pathname !== '/account' && <Button variant="dark" style={{ marginLeft: '10px',padding:' 7px 20px' }} onClick={event =>  window.location.href='/account'}>Account</Button>}
//       <Button variant="dark" style={{ marginLeft: '10px',padding:' 7px 20px' }} onClick= {logoutUser}>Log Out</Button>
//                     </div>
// :
// <div className="login">
// <Button variant="dark" style={{ marginLeft: '10px',padding:' 7px 20px' }} onClick={event =>  window.location.href='/login'}>Log in</Button>
// <Button variant="dark" style={{ marginLeft: '10px',padding:' 7px 20px' }} onClick={event =>  window.location.href='/signup'}>Sign up</Button>
// {location.pathname !== '/login' &&location.pathname !== '/signup' && <Button variant="dark" style={{ marginLeft: '10px',padding:' 7px 20px' }} ref={btnRef} onClick={openModal}>Cart</Button>}

// </div>
// }

//                 </div>
//             </div>
//         </>
//     )
// }

// export default Navbar
import React from 'react'
import { useState } from 'react';
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.css';
import Button from 'react-bootstrap/Button';
import { useRef, useEffect } from 'react';
import "./modal.css"
import "./shopping_cart.css"
import item_1_pic from "./item-1.png"
import plusSvg from './plus.svg';
import minusSvg from './minus.svg';
import { useLocation } from 'react-router-dom';
import { useUserContext } from "../context/userContext";
import 'bootstrap/dist/css/bootstrap.css'; 
import './group_list.css';
import { flexbox } from '@mui/system';

const Navbar = () => {
  const { logoutUser} = useUserContext();
  const user = JSON.parse(localStorage.getItem('user'));

  const location = useLocation();
  const [totalPrice, setTotalPrice] = useState(0);

  console.log(user)
  ///shopping cart products
  const [products, setProducts] = useState([
  ]);

  useEffect(() => {
    // Call the displayAllProductInfo function to retrieve the array of products from local storage
    let productArray = displayAllProductInfo();
    // Update the products state with the array of products
    setProducts(productArray);
  }, []);

  useEffect(() => {
    // Calculate the height of the shopping cart based on the number of products
    const height = products.length * 123 + 100; // 123 is the height of each product element and 80 is the top and bottom margin of the shopping cart
    
    // Update the height of the shopping cart element
    document.querySelector('.shopping-cart').style.height = `${height}px`;
    //maybe add a line here...
    const calculateTotalPrice = () => {
      const total = products.reduce((acc, product) => acc + (product.quantity * product.subtotal), 0);
      setTotalPrice(total);
    }
    calculateTotalPrice();
  }, [products]);
  const handleDeleteClick = (productId) => {
    setProducts((prevProducts) => prevProducts.filter((product) => product.id !== productId));

  }
  const handleAddProductClick = () => {
    setProducts((prevProducts) => [...prevProducts, {
      id: prevProducts.length + 1,
      quantity: 1,
      subtotal: 0,
      image:item_1_pic
    }]);
  }
  const handlePlusClick = (productId) => {
    setProducts((prevProducts) => {
      return prevProducts.map((product) => {
        if (product.id === productId) {
          return {
            ...product,
            quantity: product.quantity + 1,
          };
        }
        return product;
      });
    });
  }
  const uploadProductsToLocalStorage = (products) => {
    // Set the products array in local storage
    localStorage.setItem("products", JSON.stringify(products));
  };
  //display every item.
  const displayAllProductInfo = () => {
  // Retrieve the array from local storage
  let products = JSON.parse(localStorage.getItem("products"));
  //console.log("displayProductFunction")
  //console.log(products)
  // Create an empty array to store the products
  let productArray = [];

  // Loop through the array of products
  for (let i = 0; products != null && i < products.length; i++) {
    let product = products[i];
    // Push the product object to the array
    productArray.push({
      id: product.id,
      name: product.name,
      quantity: product.quantity,
      subtotal: product.subtotal,
      image: product.image,
    });
  }

  // Return the array of product objects
  return productArray;
  };
  //display one item by id.
  const displayProductInfo = (id) => {
    // Retrieve the array from local storage
    let products = JSON.parse(localStorage.getItem("products"));
  
    // Find the product with the matching id
    let product = products.find((product) => product.id === id);
  
    // Display the product info
    console.log(`Product ID: ${product.id}`);
    console.log(`Product Name: ${product.name}`);
    console.log(`Product Subtotal: ${product.subtotal}`);
    console.log(`Product Image: ${product.image}`);
    console.log(`Product Times Clicked: ${product.timesClicked}`);
  };

  const handleLikeClick = (productId) => {
    setProducts((prevProducts) => {
      return prevProducts.map((product) => {
        if (product.id === productId) {
          return {
            ...product,
            liked: !product.liked,
          };
        }
        return product;
      });
    });
  }
  const handleQuantityChange = (productId, newQuantity) => {
    // Ensure that the newQuantity is a number and is at least 1
    const safeQuantity = newQuantity ? Math.max(parseInt(newQuantity, 10), 1) : 1;
  
    setProducts((prevProducts) => {
      return prevProducts.map((product) => {
        if (product.id === productId) {
          return {
            ...product,
            quantity: safeQuantity,
          };
        }
        return product;
      });
    });
  };
  const handleMinusClick = (productId) => {
    setProducts((prevProducts) => {
      return prevProducts.map((product) => {
        if (product.id === productId) {
          // Constrain the quantity of the product to be at least 1
          return {
            ...product,
            quantity: Math.max(product.quantity - 1, 1),
          };
        }
        return product;
      });
    });
  };
    // modal. 
    const modalRef = useRef(null);
    const btnRef = useRef(null);
    const spanRef = useRef(null);
    const openModal = () => {
    // Call the displayAllProductInfo function to retrieve the array of products from local storage
    let productArray = displayAllProductInfo();
    console.log(productArray)
    // Update the products state with the array of products
    setProducts(productArray);
      modalRef.current.style.display = 'block';
    // Retrieve the array from local storage
    };
  
    const closeModal = () => {
      console.log(products)
      localStorage.setItem('products', JSON.stringify(products));
      modalRef.current.style.display = 'none';
      
    };
  
    useEffect(() => {
      // Get the modal
      const modal = modalRef.current;
  
      // Get the button that opens the modal
      const btn = btnRef.current;
  
      // Get the <span> element that closes the modal
      const span = spanRef.current;

      // When the user clicks anywhere outside of the modal, close it
      window.onclick = (event) => {
        if (event.target === modal) {
          
          localStorage.setItem('products', JSON.stringify(products));
          modal.style.display = "none";
        }
      }
    }, [products]);// pass `products` as a dependency
  //This will ensure that the useEffect hook is re-run every time the products value changes, and the latest value will be saved to local storage.
    //google login button functions
    const [loginData, setLoginData] = useState(
    localStorage.getItem('loginData')
    ?JSON.parse(localStorage.getItem('loginData'))
    :null
   );
    const url = "http://localhost:8080"
    const handleLogin = async (googleData) => {
        const res = await fetch(url + '/api/google-login', {
          method: 'POST',
          credentials: 'include',
          body: JSON.stringify({
            token: googleData.tokenId,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        });
         const data = await res.json();
         setLoginData(data);
         console.log(data)
         localStorage.setItem('loginData', JSON.stringify(data));
         localStorage.setItem('picture', JSON.stringify(data.picture));
         sessionStorage.setItem('token', googleData.tokenId);
         localStorage.setItem('loginID',JSON.stringify(data.id))
         // console.log(document.cookie);
         window.location.reload(false);
       };
       const handleLogout = () => {
        axios.get(url + "/logout").then((response) => {//get logout for cookie 
        // delete cookies front end :)
          //document.cookie=document.cookie+";max-age=0";
          //document.cookie=document.cookie+";max-age=0";
          console.log("clean cookie");
        });
       localStorage.removeItem('loginData');//remove localstorage data user name.
       localStorage.removeItem('loginID');
       localStorage.removeItem('picture');
       localStorage.removeItem('name');
       localStorage.removeItem('email');
       sessionStorage.removeItem('token');
       setLoginData(null);//empty the localstorage data
       window.location.reload(false);
     };
     const handleFailure = (response) => {
        console.log("Fail to login",response)
      }

      const HandleCheckout = async () => {
        localStorage.setItem('products', JSON.stringify(products));
  // Get the products from local storage
  const lineItem = JSON.parse(localStorage.getItem('products'));

  // Create the line items array
  const lineItems = lineItem.map((product) => {
    return { price: product.id, quantity: product.quantity };
  });
        try {
          const response = await fetch('http://localhost:4242/create-checkout-session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ line_items: lineItems }),
          });
          const data = await response.json();
      
          // Redirect the user to the Checkout session URL
          window.location.href = data.sessionUrl;
        } catch (error) {
          console.error(error);
        }
      };
      const { promise } = useUserContext();

    return (
        <>
<div>
  </div>
      <div ref={modalRef} className="modal">
            

{/* popup content */}
          <div className="shopping-cart">
            
      {/* shoppig cart */}
      <div className="title" style={{height:'80px'}}>
        Total Price: ${totalPrice} 
        <button style={{ margin: '10px', marginLeft: '10px', backgroundColor: 'black', color: 'white'}} className="btn btn-info" onClick={event =>  window.location.href='/Checkout'}>Checkout</button>
        <span className="delete-btn" style={{float: 'right',cursor: 'pointer', margin: '0'}} ref={spanRef} onClick={closeModal}></span>
      </div>

      {products.map((product) => (
        
        <div key={product.id} className="item">
          <div className="buttons">
            <span className="delete-btn" onClick={() => handleDeleteClick(product.id)}></span>
            {/* <span className={`like-btn ${product.liked ? 'is-active' : ''}`} onClick = {() => handleLikeClick(product.id)}></span> */}
          </div>

          <div className="image">
          <div class="image-container">
  <img style={{margin: '0px'}} src={product.image} alt="" />
</div>
          </div>

          <div className="description">
            <span style={{whiteSpace: 'nowrap'}}>{product.name}</span>
            <span>${product.quantity * product.subtotal}</span>
          </div>

        {/* <div className="theset"> */}
          <div className="quantity" style={{marginRight: '0px', display: 'flex', whiteSpace: 'nowrap', width: '80px', paddingTop: "20px", height: "fit-content" }}>
            <div style={{padding: '2px',  border: "1px solid", alignItems: 'center', justifyContent: 'center', display: "flex"}}>
            <button className="plus-btn" type="button" name="button" style={{margin: '0px', width: '20px', height: '20px',alignItems: 'center', justifyContent: 'center', display: "flex"}} onClick={() => handlePlusClick(product.id)}>
            <img style={{margin: '0px', width: '20px', height: '20px'}} src={plusSvg} alt="" />
            </button>
            </div>
            <span style= {{width: '40px', height: '40px' ,alignItems: 'center', justifyContent: 'center', border: "1px solid", display: "flex"}}>{product.quantity}</span>
            {/* <input
  type="number"
  name="name"
  value={product.quantity}
  onChange={(e) => handleQuantityChange(product.id, e.target.value)}
  min="1"
/> */}
            <div style={{padding: '2px', border: "1px solid", alignItems: 'center', justifyContent: 'center', display: "flex"}}>
            <button className="minus-btn" type="button" name="button" style={{marginTop: '0px', width: '20px', height: '20px' ,alignItems: 'center', justifyContent: 'center', display: "flex"}} onClick={() => handleMinusClick(product.id)}>
            <img style={{margin: '0px', width: '20px', height: '20px'}} src={minusSvg} alt="" />
            </button>
            </div>
            {/* </div> */}

          </div>
        </div>
      ))}
          
    </div>
    </div>

            <div className="flex max-w-[1240px] mx-auto items-center p-4 justify-between"
            style = {{"border-bottom": "solid"}} >
                <div className="cursor-pointer" >
                    <h1 onClick={event =>  window.location.href='/'} className='font-bold text-3xl sm:text-4xl lg:text-4xl '>Eatify</h1>
                </div>
                <div className='flex'>
                {user  ?
                
                    <div className="login" style={{whiteSpace: 'nowrap', maxWidth: '70%'}}>
                    {/* // <div className="login" style={{                    display: flex justify-content: space-around;}}> */}

      {location.pathname !== '/account' && <Button variant="dark" style={{ marginLeft: '10px', maxWidth: '80px'}} ref={btnRef} onClick={openModal}>Cart</Button>}
      {location.pathname !== '/' && <Button variant="dark" style={{ marginLeft: '10px', maxWidth: '80px' }} onClick={event =>  window.location.href='/'}>Home</Button>}
      {location.pathname !== '/account' && <Button variant="dark" style={{ marginLeft: '10px', maxWidth: '80px' }} onClick={event =>  window.location.href='/account'}>Account</Button>}
      <Button variant="dark" style={{ marginLeft: '10px', maxWidth: '80px' }} onClick= {logoutUser}>Log Out</Button>
                    </div>
:
<div className="login" style={{whiteSpace: 'nowrap', maxWidth: '70%'}}>
<Button variant="dark" style={{ marginLeft: '10px', maxWidth: '80px' }} onClick={event =>  window.location.href='/login'}>Log in</Button>
<Button variant="dark" style={{ marginLeft: '10px', maxWidth: '80px' }} onClick={event =>  window.location.href='/signup'}>Sign up</Button>
{location.pathname !== '/login' &&location.pathname !== '/signup' && <Button variant="dark" style={{ marginLeft: '10px', maxWidth: '80px' }} ref={btnRef} onClick={openModal}>Cart</Button>}

</div>
}

                </div>
            </div>
        </>
    )
}

export default Navbar