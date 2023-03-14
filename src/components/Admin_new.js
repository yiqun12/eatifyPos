import React from 'react';
import './style.css';
import { useState, useEffect } from 'react';
import { collection, doc, addDoc, getDocs, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from '../firebase/index';
import { useMyHook } from '../pages/myHook';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import icons8Drawer from './icons8-drawer-32.png'; // Tell webpack this JS file uses this image

import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Row, Col, Container } from "react-bootstrap"
import { useRef } from "react";
import { useUserContext } from "../context/userContext";


const theme = createTheme();

function App() {
    const [orders, setOrders] = useState();
    const [Food_array, setFood_array] = useState("");
    const [Food_arrays, setFood_arrays] = useState(JSON.parse(localStorage.getItem("Food_arrays")));
    /**listen to localtsorage */
    const { id, saveId } = useMyHook(null);
    useEffect(() => {
        setFood_arrays(JSON.parse(localStorage.getItem("Food_arrays")));
    }, [id]);
    const [selectedItem, setSelectedItem] = useState('Item');

    function handleItemClick(item) {
        setSelectedItem(item);
        saveId(Math.random())
        console.log(selectedItem)
    }
    /**change app namne and logo */
    const [faviconUrl, setFaviconUrl] = useState('https://upload.wikimedia.org/wikipedia/en/thumb/e/ef/LUwithShield-CMYK.svg/1200px-LUwithShield-CMYK.svg.png');
    const [pageTitle, setPageTitle] = useState("Title1");
    const handleOpenCashDraw = async () => {
        try {
            const dateTime = new Date().toISOString();
            const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
            const docRef = await addDoc(collection(db, "open_cashdraw"), {
                date: date
            });
            console.log("Document written with ID: ", docRef.id);
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    }
    const handleClickFavicon = (e) => {
        e.preventDefault();
        console.log(e.target.faviconURL.value);
        if (faviconUrl === 'https://upload.wikimedia.org/wikipedia/en/thumb/6/65/LehighMountainHawks.svg/1200px-LehighMountainHawks.svg.png')
            setFaviconUrl('https://upload.wikimedia.org/wikipedia/en/thumb/e/ef/LUwithShield-CMYK.svg/1200px-LUwithShield-CMYK.svg.png');
        else
            setFaviconUrl('https://upload.wikimedia.org/wikipedia/en/thumb/6/65/LehighMountainHawks.svg/1200px-LehighMountainHawks.svg.png')
        updateFavicon();
    }

    const handleClickTitle = (e) => {
        e.preventDefault();
        console.log(e.target.title.value);
        if (pageTitle === "Title1")
            setPageTitle("Title2")
        else
            setPageTitle("Title1")
        updateTitle();
    }

    const updateFavicon = () => {
        const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        link.href = `${faviconUrl}?t=${Date.now()}`;
        document.getElementsByTagName('head')[0].appendChild(link);
    }

    const updateTitle = () => {
        // setPageTitle("My New Title");
        document.title = pageTitle;
    }
    /**change app namne and logo */


    //for the add
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [image, setImage] = useState("");
    const [price, setPrice] = useState("");
    const [subtotal, setSubtotal] = useState("");
    //for the add
    //for the update
    const [updateId, setUpdateId] = useState('');
    const [updateName, setUpdateName] = useState('');
    const [updateCategory, setUpdateCategory] = useState('');
    const [updateImage, setUpdateImage] = useState('');
    const [updatePrice, setUpdatePrice] = useState('');
    const [updateSubtotal, setUpdateSubtotal] = useState('');
    // for json update

    /* stringify data
    // [{"id":"price_1MJTkrFOhUhkkYOhL4UIti6Z","name":"Ceasar Salad","category":"salad","image":"https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8c2FsYWQlMjBjZWFzYXJ8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60","price":"$$$","subtotal":"2"},{"id":"price_1MJTlDFOhUhkkYOhbkBbKREK","name":"Bacon Cheeseburger","category":"burger","image":"https://images.unsplash.com/photo-1553979459-d2229ba7433b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTh8fGJ1cmdlcnN8ZW58MHx8MHx8&auto=format&fit=crop&w=1400&q=60","price":"$","subtotal":"3"},{"id":"price_1MJTlfFOhUhkkYOh0hVnh4ib","name":"Mushroom Burger","category":"burger","image":"https://images.unsplash.com/photo-1608767221051-2b9d18f35a2f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTV8fGJ1cmdlcnN8ZW58MHx8MHx8&auto=format&fit=crop&w=1400&q=60","price":"$$","subtotal":"4"},{"id":"price_1MJTlvFOhUhkkYOhK9M6CIhT","name":"Loaded Burger","category":"burger","image":"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8YnVyZ2Vyc3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=1400&q=60","price":"$$$","subtotal":"5"},{"id":"price_1MJTmHFOhUhkkYOhqNKAtICv","name":"Wings","category":"chicken","image":"https://images.unsplash.com/photo-1567620832903-9fc6debc209f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8Y2hpY2tlbiUyMGZvb2R8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60","price":"$$","subtotal":"6"},{"id":"price_1MJTmUFOhUhkkYOhLrfJCvPt","name":"Supreme Pizza","category":"pizza","image":"https://images.unsplash.com/photo-1604382355076-af4b0eb60143?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8N3x8cGl6emF8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60","price":"$$$","subtotal":"7"},{"id":"price_1MJTmyFOhUhkkYOhwRXs0fFv","name":"Meat Lovers","category":"pizza","image":"https://images.unsplash.com/photo-1628840042765-356cda07504e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTh8fHBpenphfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60","price":"$$$$","subtotal":"8"},{"id":"price_1MJTnGFOhUhkkYOhPh3eAAuk","name":"Chicken Tenders","category":"chicken","image":"https://images.unsplash.com/photo-1562967914-608f82629710?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTB8fGNoaWNrZW4lMjBmb29kfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60","price":"$","subtotal":"9"},{"id":"price_1MJTnVFOhUhkkYOhYfbsRz3J","name":"Kale Salad","category":"salad","image":"https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8c2FsYWQlMjBjZWFzYXJ8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60","price":"$$","subtotal":"10"},{"id":"price_1MJTnkFOhUhkkYOhbBfiLpoG","name":"Double Cheeseburger","category":"burger","image":"https://images.unsplash.com/photo-1607013251379-e6eecfffe234?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8YnVyZ2Vyc3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=1400&q=60","price":"$$$$","subtotal":"12"},{"id":"price_1MJTo0FOhUhkkYOhUWpPQMyj","name":"Chicken Kabob","category":"chicken","image":"https://images.unsplash.com/photo-1603360946369-dc9bb6258143?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTN8fGNoaWNrZW4lMjBmb29kfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60","price":"$$$","subtotal":"13"},{"id":"price_1MJToHFOhUhkkYOhrwh3DnFN","name":"Fruit Salad","category":"salad","image":"https://images.unsplash.com/photo-1564093497595-593b96d80180?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8ZnJ1aXQlMjBzYWxhZHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60","price":"$","subtotal":"14"},{"id":"price_1MJToVFOhUhkkYOhtGfbubON","name":"Feta & Spinnach","category":"pizza","image":"https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OHx8cGl6emF8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60","price":"$$","subtotal":"15"},{"id":"price_1MJTokFOhUhkkYOhdVrB44HD","name":"Baked Chicken","category":"chicken","image":"https://images.unsplash.com/photo-1594221708779-94832f4320d1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Nnx8Y2hpY2tlbiUyMGZvb2R8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60","price":"$$$$","subtotal":"16"},{"id":"price_1MJTp0FOhUhkkYOhWfwVHIuU","name":"Cheese Pizza","category":"pizza","image":"https://images.unsplash.com/photo-1548369937-47519962c11a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OXx8Y2hlZXNlJTIwcGl6emF8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60","price":"$","subtotal":"17"},{"id":"price_1MJTpGFOhUhkkYOhzMtHrVLT","name":"Loaded Salad","category":"salad","image":"https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8c2FsYWR8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60","price":"$$$$","subtotal":"18"},{"id":"price_1MJTpGFOhUhkkYOhzMtHrVL2","name":"1/4lb Cheese Deluxe","category":"burger","image":"https://s7d1.scene7.com/is/image/mcdonalds/DC_202201_4282_QuarterPounderCheeseDeluxe_Shredded_832x472:product-header-desktop?wid=830&hei=458&dpr=off","price":"$$$$","subtotal":"19"}]
    */

    const [inputData, setInputData] = useState([]);

    const handleSubmit = async (event) => {
        //console.log(JSON.stringify(data))

        event.preventDefault();
        setInputData(event.target.inputData.value);
        console.log(inputData)
        let temp = JSON.parse(inputData)
        console.log(temp)//convert string to json.
        for (let i = 0; i < temp.length; i++) {
            console.log(temp[i])
            console.log(addJson_array(temp[i].name, temp[i].category, temp[i].image, temp[i].price, temp[i].subtotal))
        }
        await getDocs(collection(db, "food_data"))
            .then((querySnapshot) => {
                const newData = querySnapshot.docs
                    .map((doc) => ({ ...doc.data(), id: doc.id }));
                console.log(JSON.stringify(newData))
                localStorage.setItem("Food_arrays", JSON.stringify(newData));
            })
        saveId(Math.random())
    }

    const addJson_array = async (name, category, image, price, subtotal) => {
        try {
            const docRef = await addDoc(collection(db, "food_data"), {
                name: name,
                category: category,
                image: image,
                price: price,
                subtotal: subtotal,
            });
            console.log("Document written with ID: ", docRef.id);


        } catch (e) {
            console.error("Error adding document: ", e);
        }
    }

    //for json update
    const handleUpdateForm = (id) => {
        setUpdateId(id);
        setUpdateName(Food_arrays.find(item => item.id === id).name);
        setUpdateCategory(Food_arrays.find(item => item.id === id).category);
        setUpdateImage(Food_arrays.find(item => item.id === id).image);
        setUpdatePrice(Food_arrays.find(item => item.id === id).price);
        setUpdateSubtotal(Food_arrays.find(item => item.id === id).subtotal);

    }
    //for the update
    const addFood_array = async (updatedFood_array) => {

        console.log(updatedFood_array)
        try {
            const docRef = await addDoc(collection(db, "food_data"), {
                name: updatedFood_array.name,
                category: updatedFood_array.category,
                image: updatedFood_array.image,
                price: updatedFood_array.price,
                subtotal: updatedFood_array.subtotal,
            });
            console.log("Document written with ID: ", docRef.id);
            await getDocs(collection(db, "food_data"))
                .then((querySnapshot) => {
                    const newData = querySnapshot.docs
                        .map((doc) => ({ ...doc.data(), id: doc.id }));
                    console.log(JSON.stringify(newData))
                    localStorage.setItem("Food_arrays", JSON.stringify(newData));
                })
            saveId(Math.random())
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    }

    const updateFood_array = async (id, updatedFood_array) => {
        //(id, updatedFood_array).preventDefault();

        try {
            await updateDoc(doc(db, "food_data", id), updatedFood_array);
            console.log("Document updated with ID: ", id);
            await getDocs(collection(db, "food_data"))
                .then((querySnapshot) => {
                    const newData = querySnapshot.docs
                        .map((doc) => ({ ...doc.data(), id: doc.id }));
                    console.log(JSON.stringify(newData))
                    localStorage.setItem("Food_arrays", JSON.stringify(newData));
                })
            saveId(Math.random())
        } catch (e) {
            console.error("Error updating document: ", e);
        }
    };

    const deleteFood_array = async (id) => {
        console.log(id)
        try {
            await deleteDoc(doc(db, "food_data", id));
            console.log("Document deleted with ID: ", id);
            await getDocs(collection(db, "food_data"))
                .then((querySnapshot) => {
                    const newData = querySnapshot.docs
                        .map((doc) => ({ ...doc.data(), id: doc.id }));
                    console.log(JSON.stringify(newData))
                    localStorage.setItem("Food_arrays", JSON.stringify(newData));
                })
            saveId(Math.random())
        } catch (e) {
            console.error("Error deleting document: ", e);
        }
    }
    //Food_arrays = 
    // margin: auto;
    // max-width: 1240px;
    // display: grid;
    // justify-self: center;
    // justify-content: center;
    // align-items: stretch;

    // for translate
    const trans = JSON.parse(localStorage.getItem("translations"))
    const t = (text) => {
        // const trans = localStorage.getItem("translations")
        //console.log(trans)
        //console.log(localStorage.getItem("translationsMode"))

        if (trans != null) {
            if (localStorage.getItem("translationsMode") != null) {
                // return the translated text with the right mode
                if (trans[text] != null) {
                    if (trans[text][localStorage.getItem("translationsMode")] != null)
                        return trans[text][localStorage.getItem("translationsMode")]
                }
            }
        }
        // base case to just return the text if no modes/translations are found
        return text
    }


    const moment = require('moment');

    const fetchPost = async () => {
        console.log("fetchPost");
        await getDocs(collection(db, "success_payment")).then((querySnapshot) => {
          const newData = querySnapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }));
          newData.sort((a, b) =>
            moment(b.dateTime, "YYYY-MM-DD-HH-mm-ss-SS").valueOf() -
            moment(a.dateTime, "YYYY-MM-DD-HH-mm-ss-SS").valueOf()
          );
      
          const newItems = []; // Declare an empty array to hold the new items
      
          newData.forEach((item) => {
            const formattedDate = moment(item.dateTime, "YYYY-MM-DD-HH-mm-ss-SS")
              .subtract(7, "hours")
              .format("M/D/YYYY h:mma");
            const newItem = {
              id: item.id.substring(0, 4), // use only the first 4 characters of item.id as the value for the id property
              receiptData: item.receiptData,
              date: formattedDate,
              email: item.user_email,
              dineMode: item.isDinein,
              status:"pending",
              total:"$"+parseInt(item.amount_received)/100,
              name: item.charges.data[0].billing_details.name,
            };
            newItems.push(newItem); // Push the new item into the array
          });
          setOrders(newItems)
          console.log(newItems); // Log the array to the console or do whatever you want with it
        });
      };
    
      
      
      
    
    useEffect(() => {
        fetchPost();
    }, [])

    return (
        <div style={{ maxWidth: '1240px', display: 'grid', justifySelf: 'center', justifyContent: 'center', margin: 'auto', alignContent: 'center' }}>
            <section className="container2">
                <nav>
                    <section className="navigation">


                        <ul className="main-nav" style={{ "padding": 0 }}>
                            <li className="main-nav__item">
                                <a className="main-nav__link" style={{ background: "#e1ecf4", display: "inline-block" }} onClick={handleOpenCashDraw}>
                                    <img src={icons8Drawer} alt="Icons8 Drawer" style={{ display: "inline-block" }} />
                                    {t("OPEN DRAWER")}
                                </a>
                            </li>
                            <li className="main-nav__item">
                                <a className="main-nav__link" onClick={() => handleItemClick('Item')}>
                                    Item
                                </a>
                            </li>
                            <li className="main-nav__item">
                                <a className="main-nav__link" onClick={() => handleItemClick('Revenue')}>
                                    Revenue
                                </a>
                            </li>
                            <li className="main-nav__item">
                                <a className="main-nav__link" onClick={() => handleItemClick('Order')}>
                                    Order
                                </a>
                            </li>
                            <li className="main-nav__item">
                                <a className="main-nav__link" onClick={() => handleItemClick('History')}>
                                    History
                                </a>
                            </li>
                            <li className="main-nav__item">
                                <a className="main-nav__link" onClick={() => handleItemClick('Settings')}>
                                    Settings
                                </a>
                            </li>
                        </ul>
                    </section>
                </nav>
                <main>
                {selectedItem === 'Item' ? <>

                <header className="main-header">

<div className="search-wrap">
    <form style={{ display: 'flex', justifyContent: 'center', margin: '10px' }} onSubmit={handleSubmit}>
        <div className="grid grid-cols-2" style={{ width: '100%' }}>
            <input
                type="text"
                name="inputData"
                placeholder={t("Input Json Data")}
                className="search-bar"
                style={{ marginLeft: "5%", height: '50px', width: "150%" }}
                onChange={(e) => setInputData(e.target.value)}
                value={inputData}
            />
            <Button
                fullWidth
                type="submit"
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                style={{ margin: "0", marginLeft: "60%", height: '50px', width: "30%", float: 'right' }}
            >
                {t("Submit")}
            </Button>
        </div>
    </form>

</div>
<div className="main-header__wrap-right">
    <a className="email-link material-icons">email</a>
    <a className="notification-bell material-icons">notifications</a>
    <div className="current-date">
        <span className="current-date__time">17:30</span>
        <div className="current-date__day">18 August</div>
    </div>
</div>

</header>

<ThemeProvider theme={theme} >

<Container component="main" maxWidth="xs">

    <CssBaseline />
    <Box
        sx={{
            marginTop: 0,

            marginLeft: 2,

            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        }}
    >
        <Box component="form" noValidate sx={{ mt: 1 }}>

            <Grid container spacing={0}>

                <div style={{ width: "100%" }}>

                    <div class="grid grid-cols-2">
                        <div class="col-span-1">
                            <div style={{ width: "200px", height: "200px", padding: "5px", borderRadius: '0.625rem' }} class="image-container">
                                <img src={updateImage} alt="" />
                            </div>
                        </div>
                        <div class="col-span-1 text-right">
                            <div className="folder-card"
                                onClick={(e) => {
                                    e.preventDefault();
                                    addFood_array({ name: updateName, category: updateCategory, image: updateImage, price: updatePrice, subtotal: updateSubtotal })
                                }}
                                style={{ float: 'right', width: '200px', height: '200px', padding: '20px', display: 'flex', flexDirection: 'column', marginRight: "0", justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                                <div className="folder-card__icon" style={{ marginBottom: '10px' }}></div>
                                <span className="folder-card__title">Add New Food</span>
                            </div>

                        </div>
                    </div>
                </div>

                <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="Name"
                    label={t("Name")}
                    name="Name"
                    autoComplete="Name"
                    autoFocus
                    value={updateName}
                    onChange={(e) => {
                        setName(e.target.value);
                        setUpdateName(e.target.value);
                    }}
                />
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="Category"
                    label={t("Category")}
                    name="Category"
                    autoComplete="Category"
                    autoFocus
                    value={updateCategory}
                    onChange={(e) => {
                        setUpdateCategory(e.target.value);
                        setCategory(e.target.value);
                    }}
                />

                <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="Image"
                    label={t("Image")}
                    name="Image"
                    autoComplete="Image"
                    autoFocus
                    value={updateImage}
                    onChange={(e) => {
                        setUpdateImage(e.target.value);
                        setImage(e.target.value);
                    }}
                />
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="Price"
                    label={t("Price")}
                    name="Price"
                    autoComplete="Price"
                    autoFocus
                    value={updatePrice}
                    onChange={(e) => {
                        setUpdatePrice(e.target.value);
                        setPrice(e.target.value);
                    }}
                />
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="Subtotal"
                    label={t("Subtotal")}
                    name="Subtotal"
                    autoComplete="Subtotal"
                    autoFocus
                    value={updateSubtotal}
                    onChange={(e) => {
                        setUpdateSubtotal(e.target.value);
                        setSubtotal(e.target.value);
                    }}
                />

            </Grid>
            <Grid container>

                <Button
                    onClick={(e) => {
                        e.preventDefault();
                        updateFood_array(updateId, { name: updateName, category: updateCategory, image: updateImage, price: updatePrice, subtotal: updateSubtotal })
                    }}
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                >
                    {t("Update")}
                </Button>

            </Grid>
            <Grid container>
                <Grid item xs>
                </Grid>
                <Grid item>
                </Grid>
            </Grid>
        </Box>
    </Box>
</Container>

</ThemeProvider>

<section className="task-list">
<h2>Food Items</h2>
<div className="task-wrap" style={{ minHeight: '650px', maxHeight: '650px', overflowY: 'scroll' }}>
    {Food_arrays.sort((a, b) => (a.name > b.name) ? 1 : -1).map((task) => (


        <div className={`task-card ${task.checked ? "task-card--done" : ""}`}>
            <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ width: "50px", height: "50px", padding: "5px" }} class="image-container">
                    <img src={task.image} alt="" />
                </div>
                <div style={{ marginLeft: "10px" }}>{task.name}</div>
            </div>
            <span style={{ cursor: 'pointer' }}
                onClick={() => handleUpdateForm(task.id)}
                className="task-card__tag task-card__tag--marketing">{t("Edit")}</span>
            <span className="task-card__option">
                <span style={{ cursor: 'pointer' }}
                    onClick={() => deleteFood_array(task.id)}
                    className="task-card__tag task-card__tag--design">{t("Delete")}</span>
            </span>
        </div>
    ))}
</div>
</section>

                </> :



 selectedItem === 'Revenue' ? <div>revenue</div> :
 selectedItem === 'Order' ? <div>order</div> :







 selectedItem === 'History' ? <>
 
 <table
  className="shop_table my_account_orders"
  style={{
    borderCollapse: "collapse",
    width: "100%",
    borderSpacing: "6px", // added CSS
  }}
>
  <thead>
    <tr>
      <th className="order-number" style={{ marginRight: "10px",width: "10%" }}>
        OrderID
      </th>
      <th className="order-name" style={{ width: "20%" }}>
        Name
      </th>
      <th className="order-email" style={{ width: "20%" }}>
        Email
      </th>
      <th className="order-date" style={{ width: "15%" }}>
        Date
      </th>
      <th className="order-status" style={{ width: "10%" }}>
        Status
      </th>
      <th className="order-total" style={{ width: "10%" }}>
        Total
      </th>
      <th className="order-dine-mode" style={{ width: "10%" }}>
        DineMode
      </th>
      <th className="order-details" style={{ width: "5%" }}>
        Details
      </th>
    </tr>
  </thead>
  <tbody>
    {orders.map((order) => (
      <tr
        key={order.id}
        className="order"
        style={{ borderBottom: "1px solid #ddd" }}
      >
        <td className="order-number" data-title="OrderID">
          <a href="*">{order.id}</a>
        </td>
        <td
          className="order-name"
          data-title="Name"
          style={{ whiteSpace: "nowrap" }}
        >
          {order.name}
        </td>
        <td
          className="order-email"
          data-title="Email"
          style={{ whiteSpace: "nowrap" }}
        >
          {order.email}
        </td>
        <td
          className="order-date"
          data-title="Date"
          style={{ whiteSpace: "nowrap" }}
        >
          <time dateTime={order.date} title={order.date} nowrap>
            {order.date}
          </time>
        </td>
        <td
          className="order-status"
          data-title="Status"
          style={{ whiteSpace: "nowrap" }}
        >
          {order.status}
        </td>
        <td
          className="order-total"
          data-title="Total"
          style={{ whiteSpace: "nowrap" }}
        >
          <span className="amount">{order.total}</span>
        </td>
        <td
          className="order-dine-mode"
          data-title="DineMode"
          style={{ whiteSpace: "nowrap" }}
        >
          {order.dineMode}
        </td>
        <td
          className="order-details"
          style={{ whiteSpace: "nowrap" }}
          data-title="Details"
        >
          <a href="*">View Details</a>
        </td>
      </tr>
    ))}
  </tbody>
</table>

    
    </> :









 selectedItem === 'Settings' ? <div>settings</div> :
 null}
                    
                </main>
            </section>
            <footer style={{ 'height': "100px", 'color': 'transparent', 'userSelect': 'none' }}>
                void
            </footer>
        </div>

    );
}
export default App;
