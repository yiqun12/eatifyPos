import React, { useState,useEffect } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/functions';
import { v4 as uuidv4 } from 'uuid'; // Import UUID generator
import { useMyHook } from '../pages/myHook';
import { useMemo } from 'react';
import { WindowSharp } from '@mui/icons-material';
import imageCompression from 'browser-image-compression';
import loadingGif from './loading.gif'; // Assuming it's in the same directory
import { useUserContext } from "../context/userContext";

const GoogleVisionDemo = ({ store, setFoods }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [extractedText, setExtractedText] = useState('');
  /**listen to localtsorage */
  const { id, saveId } = useMyHook(null);
  const [uploadStatus, setUploadStatus] = useState('idle');  // Possible values: 'idle', 'loading', 'success'
  const { user, user_loading } = useUserContext();


  useEffect(() => {
    saveId(Math.random());
  }, []);
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

    for (let i = 1; i < items.length; i++) {
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
      console.log(extractedTextData.replace(/[\s\r\n]+/g, ' '))
      const result = await formJson(extractedTextData.replace(/[\s\r\n]+/g, ' '))
      console.log(result.data.replace(/[\s\r\n]+/g, ' '))
      setExtractedText(result.data.replace(/[\s\r\n]+/g, ' '));
      const jsonOutput = stringToJson(result.data.replace(/[\s\r\n]+/g, ' '));
      console.log(jsonOutput)
      translate(jsonOutput.map(item => item.name).join('@')).then(async (translatedText) => { // Mark this function as async
        const translatedNames = translatedText.split('@');

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
          item.subtotal = 1;
          item.attributes = [];
          item.attributes2 = [];
          item.availability = ['Morning', 'Afternoon', 'Evening'];
        });
        const mergedArray =  jsonWithImage.concat(JSON.parse(localStorage.getItem(store)));

        localStorage.setItem(store, JSON.stringify(mergedArray))
        setFoods(mergedArray)
        console.log(jsonWithImage);
        //setPreviewUrl(img)
        setUploadStatus('success');
        saveId(Math.random());
        //console.log(jsonWithImage);
        // translate(jsonWithImage.map(item => item.category).join('@')).then(async (translatedText) => { // Mark this function as async
        //   const translatedNames = translatedText.split('@');

        //   const translatedMenuItems = jsonWithImage.map((item, index) => ({
        //     ...item,
        //     categoryCHI: translatedNames[index]
            
        //   }));
        //   const mergedArray =  translatedMenuItems.concat(JSON.parse(localStorage.getItem(store)));

        //   localStorage.setItem(store, JSON.stringify(mergedArray))
        //   setFoods(mergedArray)
        //   console.log(jsonWithImage);
        //   //setPreviewUrl(img)
        //   setUploadStatus('success');
        //   saveId(Math.random());
        //  // window.location.reload()
        // });
        //localStorage.setItem("food_arrays", JSON.stringify(jsonWithImage))
        //console.log(img)
        //setPreviewUrl(img)

        //imageUrl
      });

    } else {
      console.error("Unexpected API response:", data);
    }

  };
  const [previewUrl, setPreviewUrl] = useState("")
  const handleFileChangeAndUpload = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) {
      //setUploadStatus('No file selected.');
      return;
    }
    setUploadStatus('loading');

   // setPreviewUrl("https://img.zcool.cn/community/012d625a55b18da80120121f12e55d.gif")

      // 压缩选项
  const options = {
    maxSizeMB: 1, // 最大输出文件大小
    maxWidthOrHeight: 1920, // 最大输出图片尺寸
    useWebWorker: true
  };

  try {
    const selectedFile = await imageCompression(selectedFile, options);
    // 你可以在这里上传或保存压缩后的文件
    console.log('压缩后的图片大小:', selectedFile.size / 1024 / 1024, 'MB');
  } catch (error) {
    console.error('图片压缩失败:', error);
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
        //setPreviewUrl("https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExcW9lZDRyMG9tdGw2a3B5cDVrNWpneWJhOHJuaHZvcW9kNTUydDU5cSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3oEjI6SIIHBdRxXI40/giphy.gif")
        //setUploadStatus('loading');

        setImageUrl(data.result.variants[0])
        extractTextFromImage(data.result.variants[0])
        //setUploadStatus('success');

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
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"></link>

      <div >
    <label style={{ cursor: 'pointer' }}>
      <input
        type="file"
        onChange={handleFileChangeAndUpload}
        style={{ display: 'none' }} // hides the input
      />
      <div className="btn d-inline-flex btn-sm btn-secondary mx-1">
        <span className="pe-2">
          { 
            uploadStatus === 'loading' ? 

            (<img className=" scale-150"style={{width:"17px",height:"17px",padding:"0px"}} src={loadingGif} alt="Loading..."/>) :
            uploadStatus === 'success' ?
            (<i className="bi bi-check-circle"></i>) :  // Check icon when upload succeeds
            (<i className="bi bi-camera"></i>)
          }
        </span>
        <span>
          {"Scan Menu"}
        </span>
      </div>
    </label>

      </div>


    </>

  );
};

export default GoogleVisionDemo;
