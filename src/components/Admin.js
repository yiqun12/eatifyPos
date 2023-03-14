import React, { useState, useEffect} from 'react';
import { collection, doc, addDoc, getDocs, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from '../firebase/index';
import { Button, Checkbox, Form } from 'semantic-ui-react'
import { useMyHook } from '../pages/myHook';
// import { Button, Dropdown, Input, Page, setOptions } from '@mobiscroll/react';

//import {data} from '../data/data.js'

const Admin = () => {
  /**listen to localtsorage */
  const { id, saveId } = useMyHook(null);
  useEffect(() => {
    //console.log('Component B - ID changed:', id);
  }, [id]);

    /**change app namne and logo */
    const [faviconUrl, setFaviconUrl] = useState('https://upload.wikimedia.org/wikipedia/en/thumb/e/ef/LUwithShield-CMYK.svg/1200px-LUwithShield-CMYK.svg.png');
    const [pageTitle, setPageTitle] = useState("Title1");
    const handleOpenCashDraw =async ()=>{
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

    const [Food_array, setFood_array] = useState("");
    const [Food_arrays, setFood_arrays] = useState(JSON.parse(localStorage.getItem("Food_arrays")));

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
  for(let i=0; i<temp.length; i++){
    console.log(temp[i])
    console.log(addJson_array(temp[i].name, temp[i].category, temp[i].image, temp[i].price, temp[i].subtotal))
} 
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
    const addFood_array = async (e) => {
        
        e.preventDefault();
        console.log(e)
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
    const updateFood_array = async (id, updatedFood_array) => {
        //(id, updatedFood_array).preventDefault();

        try {
            await updateDoc(doc(db, "food_data", id), updatedFood_array);
            console.log("Document updated with ID: ", id);
        } catch (e) {
            console.error("Error updating document: ", e);
        }
    };

    const deleteFood_array = async (id) => {
        console.log(id)
        try {
            await deleteDoc(doc(db, "food_data", id));
            console.log("Document deleted with ID: ", id);
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
        console.log(trans)
        console.log(localStorage.getItem("translationsMode"))

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

    return (
        <section className="Food_array-container" style={{maxWidth: '1240px', display: 'grid', justifySelf: 'center', justifyContent: 'center', margin: 'auto',alignItems: 'center'}}>

            <div className="Food_array" style={{"background-color":"#f5f7f9",maxWidth: '1240px'}}>
                <h1 className="header" style={{display: 'flex', justifyContent: 'center'}}>
                <button style={{border: '1px solid', padding: '3px', margin: '5px', borderRadius: "10px", boxShadow: "rgba(0, 0, 0, 0.17) 0px -23px 25px 0px inset, rgba(0, 0, 0, 0.15) 0px -36px 30px 0px inset, rgba(0, 0, 0, 0.1) 0px -79px 40px 0px inset, rgba(0, 0, 0, 0.06) 0px 2px 1px, rgba(0, 0, 0, 0.09) 0px 4px 2px, rgba(0, 0, 0, 0.09) 0px 8px 4px, rgba(0, 0, 0, 0.09) 0px 16px 8px, rgba(0, 0, 0, 0.09) 0px 32px 16px"}} onClick={handleOpenCashDraw}>{t("OPEN CASH DRAW")}</button>                </h1>

                <div style={{display:'flex', justifyContent: 'center', margin: '10px'}}>

                    <form style={{display: 'flex', flexDirection: 'column'}} onSubmit={addFood_array}>
                        <div style={{display: 'flex'}}>
                            <label>
                                {t("Name")}:
                                <input type="text" name="name" style={{display: 'flex', flexDirection: 'column',border: "1px solid", borderRadius: '10px', width: "175px", marginRight: "5px"}} onChange={(e) => setName(e.target.value)} required />
                            </label>
                            <label>
                                {t("Category")}:
                                <input type="text" name="category" style={{display: 'flex', flexDirection: 'column',border: "1px solid", borderRadius: '10px', width: "175px", marginRight: "5px"}} onChange={(e) => setCategory(e.target.value)} required />
                            </label>
                            <label>
                            {t("Price")}:
                            <input type="text" name="price" style={{display: 'flex', flexDirection: 'column',border: "1px solid", borderRadius: '10px', width: "175px", marginRight: "5px"}} onChange={(e) => setPrice(e.target.value)} required />
                            </label>
                            <label>
                            {t("Subtotal")}:
                            <input type="text" name="subtotal" style={{display: 'flex', flexDirection: 'column',border: "1px solid", borderRadius: '10px', width: "175px", marginRight: "5px"}} onChange={(e) => setSubtotal(e.target.value)} required />
                            </label>
                        </div>
                        <div style={{display: 'flex'}}>
                            <label style={{display: 'flex', flexDirection: 'column', width: '100%'}}>
                                {t("Image")}:
                                <div>
                                <input type="text" name="image"  style={{border: "1px solid", borderRadius: '10px', marginTop: "5px", marginBottom: "5px", width: "80%"}} onChange={(e) => setImage(e.target.value)} required />
                                <input type="submit" style={{border: "1px solid", width: "fit-content", padding: '3px', marginLeft: "20px", borderRadius: "10px", boxShadow: "rgba(0, 0, 0, 0.17) 0px -23px 25px 0px inset, rgba(0, 0, 0, 0.15) 0px -36px 30px 0px inset, rgba(0, 0, 0, 0.1) 0px -79px 40px 0px inset, rgba(0, 0, 0, 0.06) 0px 2px 1px, rgba(0, 0, 0, 0.09) 0px 4px 2px, rgba(0, 0, 0, 0.09) 0px 8px 4px, rgba(0, 0, 0, 0.09) 0px 16px 8px, rgba(0, 0, 0, 0.09) 0px 32px 16px" }} value={t("Add Food Item")} />
                                </div>
                            </label>
                        </div>
                    </form>

                </div>

                <div style={{ "background-color":"#f5f7f9",display: "flex", justifyContent:'space-evenly', margin: '10px'}}>
                
                    <div style={{"background-color":"#f5f7f9",maxHeight: '300px', overflowY: 'scroll', width: 'fitContent'}}>
                        {
                            Food_arrays?.map((Food_array, i) => (
                                <div key={i}>
                                    <div style={{display: 'flex', flexDirection: "column"}}>
                                        <span>{t(Food_array.name)}</span>
                                        <div style={{display: 'flex'}}>
                                            <button style={{marginRight: '5px', padding: '2px', border: '1px solid', borderRadius: '10px', backgroundColor: 'green', color: "white", boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px"}} onClick={() => handleUpdateForm(Food_array.id)}>{t("Show")}</button>
                                            <button style={{marginRight: '5px', padding: '2px', border: '1px solid', borderRadius: '10px', backgroundColor: 'red', color: "white", boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px"}} onClick={() => deleteFood_array(Food_array.id)}>{t("Delete")}</button>
                                        </div>
                                    </div>
                                    <hr/>
                                </div>
                            )
                            )
                        }
                    </div>

                        {/* this is the update div */}
                        <div style={{display:'flex',justifyContent: 'space-evenly'}}>
                            <form style={{display: "inline-grid"}}>
                                <div style={{display: 'flex', height: '300px'}}>
                                <div style={{display: "flex", flexDirection: 'column', margin: 'auto'}}>
                                <label>
                                    {t("Name")}:
                                    <input type="text" style={{border: "1px solid" }} value={updateName} onChange={e => setUpdateName(e.target.value)} />
                                </label>
                                <label>
                                    {t("Category")}:
                                    <input type="text" style={{border: "1px solid" }} value={updateCategory} onChange={e => setUpdateCategory(e.target.value)} />
                                </label>
                                <label>
                                    {t("Image")}:
                                    <input type="text" style={{border: "1px solid" }} value={updateImage} onChange={e => setUpdateImage(e.target.value)} />
                                </label>
                                <label>
                                    {t("Price")}:
                                    <input type="text" style={{border: "1px solid" }} value={updatePrice} onChange={e => setUpdatePrice(e.target.value)} />
                                </label>
                                <label>
                                    {t("Subtotal")}:
                                    <input type="text" style={{border: "1px solid" }} value={updateSubtotal} onChange={e => setUpdateSubtotal(e.target.value)} />
                                </label>
                                </div>
                                    <div style={{justifyContent: "center", alignItems: 'center', display: 'flex', flexDirection: 'column'}}>
                                        <img style={{width: '200px', height: '200px', padding: '20px'}} src={updateImage}/>
                                        <button style={{border: "1px solid", padding: "20px", borderRadius: "10px", boxShadow: "rgba(0, 0, 0, 0.17) 0px -23px 25px 0px inset, rgba(0, 0, 0, 0.15) 0px -36px 30px 0px inset, rgba(0, 0, 0, 0.1) 0px -79px 40px 0px inset, rgba(0, 0, 0, 0.06) 0px 2px 1px, rgba(0, 0, 0, 0.09) 0px 4px 2px, rgba(0, 0, 0, 0.09) 0px 8px 4px, rgba(0, 0, 0, 0.09) 0px 16px 8px, rgba(0, 0, 0, 0.09) 0px 32px 16px" }} onClick={(e) => { e.preventDefault(); updateFood_array(updateId, { name: updateName, category: updateCategory, image: updateImage, price: updatePrice, subtotal: updateSubtotal }) }}>{t("Update")}</button>
                                    </div>
                                </div>
                                
                            </form>
                        </div>

                    {/* picture element */}
                    {/* <div>
                        <div>
                            <span>{updateCategory}</span>
                            <img style={{width: '200px', height: '200px'}} src={updateImage}/>
                        </div>
                        <div></div>
                        <div></div>
                    </div> */}

                </div>

            </div>

    <form style={{display:'flex', justifyContent: 'center', margin: '10px'}} onSubmit={handleSubmit}>
    <div style={{display: 'grid'}}>
        <div style={{display: 'flex'}}>
            <div style={{display: 'inline-grid'}}>
                <label>
                    {t("Input Json Data")}:
                </label>
                <textarea name="inputData" rows="4" cols="80" style={{border: '1px solid'}} onChange={(e) => setInputData(e.target.value)} value={inputData}/>
            </div>
            <button style={{margin: 'auto', padding: '10px',border: '1px solid', borderRadius: "10px", boxShadow: "rgba(0, 0, 0, 0.17) 0px -23px 25px 0px inset, rgba(0, 0, 0, 0.15) 0px -36px 30px 0px inset, rgba(0, 0, 0, 0.1) 0px -79px 40px 0px inset, rgba(0, 0, 0, 0.06) 0px 2px 1px, rgba(0, 0, 0, 0.09) 0px 4px 2px, rgba(0, 0, 0, 0.09) 0px 8px 4px, rgba(0, 0, 0, 0.09) 0px 16px 8px, rgba(0, 0, 0, 0.09) 0px 32px 16px"}}type="submit">{t("Submit")}</button>
        </div>
        <p style={{width: '750px', overflowX: 'scroll'}}>{t("Output")}: {inputData}</p>
    </div>
    </form>

    <div style={{display: 'flex', justifyContent: 'space-evenly', margin: '10px'}}>
  <form onSubmit={handleClickFavicon}>
    <input type="text" name="faviconURL" placeholder="Enter Favicon URL" />
    <button style={{border: '1px solid', padding: '3px', margin: '5px', borderRadius: "10px", boxShadow: "rgba(0, 0, 0, 0.17) 0px -23px 25px 0px inset, rgba(0, 0, 0, 0.15) 0px -36px 30px 0px inset, rgba(0, 0, 0, 0.1) 0px -79px 40px 0px inset, rgba(0, 0, 0, 0.06) 0px 2px 1px, rgba(0, 0, 0, 0.09) 0px 4px 2px, rgba(0, 0, 0, 0.09) 0px 8px 4px, rgba(0, 0, 0, 0.09) 0px 16px 8px, rgba(0, 0, 0, 0.09) 0px 32px 16px"}}>{t("Change Favicon")}</button>
  </form>
  <form onSubmit={handleClickTitle}>
    <input type="text" name="title" placeholder="Enter Title" />
    <button style={{border: '1px solid', padding: '3px', margin: '5px', borderRadius: "10px", boxShadow: "rgba(0, 0, 0, 0.17) 0px -23px 25px 0px inset, rgba(0, 0, 0, 0.15) 0px -36px 30px 0px inset, rgba(0, 0, 0, 0.1) 0px -79px 40px 0px inset, rgba(0, 0, 0, 0.06) 0px 2px 1px, rgba(0, 0, 0, 0.09) 0px 4px 2px, rgba(0, 0, 0, 0.09) 0px 8px 4px, rgba(0, 0, 0, 0.09) 0px 16px 8px, rgba(0, 0, 0, 0.09) 0px 32px 16px"}}>{t("Change Title")}</button>
  </form>
</div>

        </section>

        
    )
}

export default Admin
