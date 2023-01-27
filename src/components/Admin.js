import React, { useState} from 'react';
import { collection, doc, addDoc, getDocs, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from '../firebase/index';
//import {data} from '../data/data.js'

const Admin = () => {
    /**change app namne and logo */
    const [faviconUrl, setFaviconUrl] = useState('favicon1.ico');
    const [pageTitle, setPageTitle] = useState("Title1");
    
    const handleClickFavicon = () => {
        if (faviconUrl === 'favicon1.ico')
          setFaviconUrl('favicon.ico');
        else
          setFaviconUrl('favicon1.ico')
        updateFavicon();
      }
    
      const handleClickTitle = () => {
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

/*stringify data
[{"id":"price_1MJTkrFOhUhkkYOhL4UIti6Z","name":"Ceasar Salad","category":"salad","image":"https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8c2FsYWQlMjBjZWFzYXJ8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60","price":"$$$","subtotal":"2"},{"id":"price_1MJTlDFOhUhkkYOhbkBbKREK","name":"Bacon Cheeseburger","category":"burger","image":"https://images.unsplash.com/photo-1553979459-d2229ba7433b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTh8fGJ1cmdlcnN8ZW58MHx8MHx8&auto=format&fit=crop&w=1400&q=60","price":"$","subtotal":"3"},{"id":"price_1MJTlfFOhUhkkYOh0hVnh4ib","name":"Mushroom Burger","category":"burger","image":"https://images.unsplash.com/photo-1608767221051-2b9d18f35a2f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTV8fGJ1cmdlcnN8ZW58MHx8MHx8&auto=format&fit=crop&w=1400&q=60","price":"$$","subtotal":"4"},{"id":"price_1MJTlvFOhUhkkYOhK9M6CIhT","name":"Loaded Burger","category":"burger","image":"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8YnVyZ2Vyc3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=1400&q=60","price":"$$$","subtotal":"5"},{"id":"price_1MJTmHFOhUhkkYOhqNKAtICv","name":"Wings","category":"chicken","image":"https://images.unsplash.com/photo-1567620832903-9fc6debc209f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8Y2hpY2tlbiUyMGZvb2R8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60","price":"$$","subtotal":"6"},{"id":"price_1MJTmUFOhUhkkYOhLrfJCvPt","name":"Supreme Pizza","category":"pizza","image":"https://images.unsplash.com/photo-1604382355076-af4b0eb60143?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8N3x8cGl6emF8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60","price":"$$$","subtotal":"7"},{"id":"price_1MJTmyFOhUhkkYOhwRXs0fFv","name":"Meat Lovers","category":"pizza","image":"https://images.unsplash.com/photo-1628840042765-356cda07504e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTh8fHBpenphfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60","price":"$$$$","subtotal":"8"},{"id":"price_1MJTnGFOhUhkkYOhPh3eAAuk","name":"Chicken Tenders","category":"chicken","image":"https://images.unsplash.com/photo-1562967914-608f82629710?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTB8fGNoaWNrZW4lMjBmb29kfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60","price":"$","subtotal":"9"},{"id":"price_1MJTnVFOhUhkkYOhYfbsRz3J","name":"Kale Salad","category":"salad","image":"https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8c2FsYWQlMjBjZWFzYXJ8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60","price":"$$","subtotal":"10"},{"id":"price_1MJTnkFOhUhkkYOhbBfiLpoG","name":"Double Cheeseburger","category":"burger","image":"https://images.unsplash.com/photo-1607013251379-e6eecfffe234?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8YnVyZ2Vyc3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=1400&q=60","price":"$$$$","subtotal":"12"},{"id":"price_1MJTo0FOhUhkkYOhUWpPQMyj","name":"Chicken Kabob","category":"chicken","image":"https://images.unsplash.com/photo-1603360946369-dc9bb6258143?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTN8fGNoaWNrZW4lMjBmb29kfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60","price":"$$$","subtotal":"13"},{"id":"price_1MJToHFOhUhkkYOhrwh3DnFN","name":"Fruit Salad","category":"salad","image":"https://images.unsplash.com/photo-1564093497595-593b96d80180?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8ZnJ1aXQlMjBzYWxhZHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60","price":"$","subtotal":"14"},{"id":"price_1MJToVFOhUhkkYOhtGfbubON","name":"Feta & Spinnach","category":"pizza","image":"https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OHx8cGl6emF8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60","price":"$$","subtotal":"15"},{"id":"price_1MJTokFOhUhkkYOhdVrB44HD","name":"Baked Chicken","category":"chicken","image":"https://images.unsplash.com/photo-1594221708779-94832f4320d1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Nnx8Y2hpY2tlbiUyMGZvb2R8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60","price":"$$$$","subtotal":"16"},{"id":"price_1MJTp0FOhUhkkYOhWfwVHIuU","name":"Cheese Pizza","category":"pizza","image":"https://images.unsplash.com/photo-1548369937-47519962c11a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OXx8Y2hlZXNlJTIwcGl6emF8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60","price":"$","subtotal":"17"},{"id":"price_1MJTpGFOhUhkkYOhzMtHrVLT","name":"Loaded Salad","category":"salad","image":"https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8c2FsYWR8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60","price":"$$$$","subtotal":"18"},{"id":"price_1MJTpGFOhUhkkYOhzMtHrVL2","name":"1/4lb Cheese Deluxe","category":"burger","image":"https://s7d1.scene7.com/is/image/mcdonalds/DC_202201_4282_QuarterPounderCheeseDeluxe_Shredded_832x472:product-header-desktop?wid=830&hei=458&dpr=off","price":"$$$$","subtotal":"19"}]
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
   

    return (
        <section className="Food_array-container">

            <div className="Food_array">
                <h1 className="header">
                    Admin App
                </h1>

                <div>

                    <form onSubmit={addFood_array}>
                        <label>
                            Name:
                            <input type="text" name="name" onChange={(e) => setName(e.target.value)} required />
                        </label>
                        <br />
                        <label>
                            Category:
                            <input type="text" name="category" onChange={(e) => setCategory(e.target.value)} required />
                        </label>
                        <br />
                        <label>
                            Image:
                            <input type="text" name="image" onChange={(e) => setImage(e.target.value)} required />
                        </label>
                        <br />
                        <label>
                            Price:
                            <input type="text" name="price" onChange={(e) => setPrice(e.target.value)} required />
                        </label>
                        <br />
                        <label>
                            Subtotal:
                            <input type="text" name="subtotal" onChange={(e) => setSubtotal(e.target.value)} required />
                        </label>
                        <br />
                        <input type="submit" value="Add Food Item" />
                    </form>

                </div>

                <div>
                    <form>
                        <label>
                            Name:
                            <input type="text" value={updateName} onChange={e => setUpdateName(e.target.value)} />
                        </label>
                        <label>
                            Category:
                            <input type="text" value={updateCategory} onChange={e => setUpdateCategory(e.target.value)} />
                        </label>
                        <label>
                            Image:
                            <input type="text" value={updateImage} onChange={e => setUpdateImage(e.target.value)} />
                        </label>
                        <label>
                            Price:
                            <input type="text" value={updatePrice} onChange={e => setUpdatePrice(e.target.value)} />
                        </label>
                        <label>
                            Subtotal:
                            <input type="text" value={updateSubtotal} onChange={e => setUpdateSubtotal(e.target.value)} />
                        </label>
                        <button onClick={(e) => { e.preventDefault(); updateFood_array(updateId, { name: updateName, category: updateCategory, image: updateImage, price: updatePrice, subtotal: updateSubtotal }) }}>Update</button>

                    </form>
                </div>
                {
                    Food_arrays?.map((Food_array, i) => (
                        <div key={i}>
                            <p>{Food_array.name}</p>
                            <button onClick={() => handleUpdateForm(Food_array.id)}>Show</button>
                            <button onClick={() => deleteFood_array(Food_array.id)}>Delete</button>
                        </div>
                    )
                    )
                }


            </div>

            <form onSubmit={handleSubmit}>
      <label>
        Input Json Data:
        <textarea name="inputData" rows="8" cols="50" onChange={(e) => setInputData(e.target.value)} value={inputData}/>
      </label>
      <br />
      <button type="submit">Submit</button>
      <br />
      <p>Output: {inputData}</p>
    </form>

    <div>
      <button onClick={handleClickFavicon}>Change Favicon</button>
      <button onClick={handleClickTitle}>Change Title</button>
    </div>

        </section>

        
    )
}

export default Admin
