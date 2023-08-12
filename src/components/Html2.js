import React, { useState } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/functions';
import { v4 as uuidv4 } from 'uuid'; // Import UUID generator

const GoogleVisionDemo = () => {
    const [imageUrl, setImageUrl] = useState('');
    const [extractedText, setExtractedText] = useState('');

    const GOOGLE_CLOUD_VISION_API_KEY = 'AIzaSyCw8WmZfhBIuYJVw34gTE6LlEfOE0e1Dqo';

    const handleImageChange = (e) => {
        setImageUrl(e.target.value);
    };
    async function translate(text) {
      const apiKey = 'AIzaSyCw8WmZfhBIuYJVw34gTE6LlEfOE0e1Dqo';  // Your API Key
  
      const apiUrl = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
  
      const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              q: text,
              target: 'zh-CN',
              format: 'text'
          })
      });
  
      const data = await response.json();
      if (data.error) {
          throw new Error(data.error.message);
      }
  
      return data.data.translations[0].translatedText;
  }
  
  const generateOnePicForArray = async (jsonArray) => {
    try {
      const myFunction = firebase.functions().httpsCallable('generateOnePicForArray');
      const result = await myFunction(jsonArray);
      return result.data.result
      //console.log(result.data.result)
    } catch (error) {
      //return []
    }
  };

    const formJson = async (pic_name) => {
      //console.log(isGenChi)
      //console.log(pic_name)
      try {
        const myFunction = firebase.functions().httpsCallable('format_text');
        return await myFunction(pic_name)
      } catch (error) {  
        //return []
      }
    };
    function stringToJson(str) {
      const items = str.split(' N: ');
      const result = [];
      
      for(let i = 1; i < items.length; i++) {
          const parts = items[i].split(' C: ');
          result.push({
              name: parts[0],
              category: parts[1]
          });
      }
      
      return result;
  }
  
    const extractTextFromImage = async (img) => {
        const response = await fetch('https://vision.googleapis.com/v1/images:annotate?key=' + GOOGLE_CLOUD_VISION_API_KEY, {
            method: 'POST',
            body: JSON.stringify({
                requests: [
                    {
                        image: {
                            source: {
                                imageUri: img
                            }
                        },
                        features: [{ type: 'TEXT_DETECTION' }]
                    }
                ]
            }),
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();
        if (data.responses && data.responses[0] && data.responses[0].textAnnotations) {
            const extractedTextData = data.responses[0].textAnnotations[0].description;
            //console.log(extractedTextData.replace(/[\s\r\n]+/g, ' '))
            const result = await formJson(extractedTextData.replace(/[\s\r\n]+/g, ' '))
            console.log(result.data.replace(/[\s\r\n]+/g, ' '))
            setExtractedText(result.data.replace(/[\s\r\n]+/g, ' '));
            const jsonOutput = stringToJson(result.data.replace(/[\s\r\n]+/g, ' '));
            console.log(jsonOutput)
            translate(jsonOutput.map(item => item.name).join('|||')).then(async (translatedText) => { // Mark this function as async
              const translatedNames = translatedText.split('|||');
      
              const translatedMenuItems = jsonOutput.map((item, index) => ({
                  ...item,
                  CHI: translatedNames[index]
              }));
      
              console.log(translatedMenuItems);
              const jsonWithImage = await generateOnePicForArray(translatedMenuItems); // This is now inside an async function
              console.log(jsonWithImage);
              
              const generatedUUIDs = new Set(); // To keep track of generated UUIDs and ensure uniqueness

              jsonWithImage.forEach((item) => {
                let id;
                do {
                  id = uuidv4();
                } while (generatedUUIDs.has(id));
              
                generatedUUIDs.add(id);
              
                item.id = id;
                item.subtotal = 0;
                item.priority = 9999;
              });
              console.log(jsonWithImage);
              sessionStorage.setItem("Food_arrays",JSON.stringify(jsonWithImage))
              setPreviewUrl("https://t3.ftcdn.net/jpg/02/88/11/58/360_F_288115814_5DZzdedkmpKpz79Djn9RZeIcY8CVuN7q.jpg")

              //imageUrl
          });

        } else {
            console.error("Unexpected API response:", data);
        }

    };
    const [previewUrl, setPreviewUrl] = useState("https://imagedelivery.net/D2Yu9GcuKDLfOUNdrm2hHQ/62c46944-13ab-4dac-0f3d-1cde91df8100/public")
    const handleFileChangeAndUpload = async (event) => {
      const selectedFile = event.target.files[0];
      if (!selectedFile) {
        //setUploadStatus('No file selected.');
        return;
      }
    
      // Show a preview of the selected file
    
      const formData = new FormData();
      formData.append('file', selectedFile);
    
      try {
        const response = await fetch('https://hello-world-twilight-art-645c.eatify12.workers.dev/', {
          method: 'POST',
          body: formData,
        });
    
        const data = await response.json();
    
        if (data.success) {
          //console.log(data.result.variants[0])
          //setPreviewUrl(data.result.variants[0])
          setPreviewUrl("https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExcW9lZDRyMG9tdGw2a3B5cDVrNWpneWJhOHJuaHZvcW9kNTUydDU5cSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3oEjI6SIIHBdRxXI40/giphy.gif")
          setImageUrl(data.result.variants[0])
          extractTextFromImage(data.result.variants[0])
          //setInputData({ ...inputData, image: data.result.variants[0] })
          //console.log(item)
          //updateItem(item.id, { ...inputData, image: data.result.variants[0] })
          //setUploadStatus('Image uploaded successfully.');
        } else {
          //setUploadStatus(`Failed to upload image: ${JSON.stringify(data.errors)}`);
        }
      } catch (error) {
        //setUploadStatus(`Error: ${error.message}`);
      }
    };
    
    return (
      <>
      <label className='h-min overflow-hidden rounded-md'
                style={{backgroundColor:"rgba(246,246,248,1)", display: 'block', width: '100%'}}>               
                <input 
                    type="file" 
                    onChange={handleFileChangeAndUpload}
                    style={{ display: 'none' }} // hides the input
                />
                
                    <img 
        src={previewUrl} // you can use a default placeholder image
                        loading="lazy"
                    />
            </label>

      </>

    );
};

export default GoogleVisionDemo;
