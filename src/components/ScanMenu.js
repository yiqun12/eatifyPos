import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/functions';
import { v4 as uuidv4 } from 'uuid'; // Import UUID generator
import { useMyHook } from '../pages/myHook';
import { useMemo } from 'react';
import { WindowSharp } from '@mui/icons-material';
import imageCompression from 'browser-image-compression';
import loadingGif from './loading.gif'; // Assuming it's in the same directory
import { useUserContext } from "../context/userContext";

const GoogleVisionDemo = ({ reload, store, setFoods }) => {
  /**listen to localtsorage */
  const { id, saveId } = useMyHook(null);
  const [uploadStatus, setUploadStatus] = useState('idle');  // Possible values: 'idle', 'loading', 'success'

  const [resultScan, setResultScan] = useState('');  // Possible values: 'idle', 'loading', 'success'
  const [autoGenerateImage, setAutoGenerateImage] = useState(true);
  const [nonEnglishLanguage, setNonEnglishLanguage] = useState(true);
  const [recommendation, setRecommendation] = useState([]);

  useEffect(() => {
    saveId(Math.random());
  }, []);
  const GOOGLE_CLOUD_VISION_API_KEY = 'AIzaSyCw8WmZfhBIuYJVw34gTE6LlEfOE0e1Dqo';

  const generateJSON = async (ocr_scan, url, LanMode, imgBool) => {
    console.log(ocr_scan, url, LanMode, imgBool)


    try {
      const [recommendationResult, jsonResult] = await Promise.allSettled([
        (async () => {
          if (window.location.pathname === "/scan") {
            const myFunction = firebase.functions().httpsCallable('recommendation');
            const response = await myFunction({ url, ocr_scan });
            console.log(response.data.result);
            const processMenu = (menu) => {
              return menu.filter(section => section.trim() !== "") // Remove empty strings
                .map(item => {
                  const [title, ...details] = item.split(":");
                  const entries = [];
                  for (let i = 0; i < details.length; i += 2) {
                    entries.push({
                      name: details[i]?.trim(),
                      description: details[i + 1]?.trim(),
                    });
                  }
                  return { title: title.trim(), entries };
                });
            };

            setRecommendation(processMenu(response.data.result));
          }
        })(),
        (async () => {
          const myFunction = firebase.functions().httpsCallable('generateJSON');
          const response = await myFunction({ url, ocr_scan, LanMode, imgBool });
          setUploadStatus('success');
          return response.data.result;
        })()
      ]);

      if (recommendationResult.status === 'fulfilled') {
        console.log('Recommendation Success:', recommendationResult.value);
      } else {
        console.error('Recommendation Failed:', recommendationResult.reason);
      }

      if (jsonResult.status === 'fulfilled') {
        console.log('JSON Generation Success:', jsonResult.value);
        return jsonResult.value;
      } else {
        console.error('JSON Generation Failed:', jsonResult.reason);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    }



  };

  const extractTextFromImage = async (img, selectedFile) => {
    // Convert the file to a base64-encoded string
    const toBase64 = (file) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]); // Strip out the 'data:image/...' prefix
      reader.onerror = (error) => reject(error);
    });
    try {
      // Convert the image file to base64
      const base64Image = await toBase64(selectedFile);

      // Send the base64 image to Google Cloud Vision API
      const response = await fetch('https://vision.googleapis.com/v1/images:annotate?key=' + GOOGLE_CLOUD_VISION_API_KEY, {
        method: 'POST',
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: base64Image  // Pass base64 image content
              },
              features: [{ type: 'TEXT_DETECTION' }]  // Set feature to detect text
            }
          ]
        }),
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (data.responses && data.responses[0].textAnnotations) {
        const detectedText = data.responses[0].textAnnotations[0].description;
        console.log('Detected text:', detectedText);
        let scann_json = await generateJSON(detectedText.replace(/[\s\r\n]+/g, ' '), base64Image,
          nonEnglishLanguage ? "other" : "en", autoGenerateImage ? "yes" : "no")
        const mergedArray = scann_json.concat(JSON.parse(localStorage.getItem(store)))
        //alert("result scanned:" + mergedArray.length)
        reload(mergedArray)//result
        setUploadStatus('Text detected successfully.');
        setResultScan("scanned " + scann_json.length + " items")

      } else {
        console.log('No text detected.');
        setUploadStatus('No text detected.');
      }

    } catch (error) {
      console.error('Error:', error);
      setUploadStatus(`Error: ${error.message}`);
    }
  }


  const handleFileChangeAndUpload = async (event) => {
    console.log("scanning")
    setResultScan("")
    const selectedFile = event.target.files ? event.target.files[0] : event;
    if (!selectedFile) {
      //setUploadStatus('No file selected.');
      return;

    }
    setUploadStatus('loading');
    setIsModalOpen(false)
    extractTextFromImage("", selectedFile);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('https://hello-world-twilight-art-645c.eatify12.workers.dev/', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        console.log(data.result.variants[0])
      } else {
        //setUploadStatus(`Failed to upload image: ${JSON.stringify(data.errors)}`);
      }
    } catch (error) {
      //setUploadStatus(`Error: ${error.message}`);
    }
  };

  // 处理示例菜单图片上传
  const handleSampleImageUpload = async () => {
    setResultScan("");
    setUploadStatus('loading');
    
    try {
      // 获取示例图片
      const response = await fetch('/images/menu.png');
      const blob = await response.blob();
      // 创建一个文件对象
      const file = new File([blob], 'menu.png', { type: 'image/png' });
      
      // 调用原本的上传逻辑
      setIsModalOpen(false);
      extractTextFromImage("", file);
      
      // 处理图片上传到CDN
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadResponse = await fetch('https://hello-world-twilight-art-645c.eatify12.workers.dev/', {
        method: 'POST',
        body: formData,
      });
      
      const data = await uploadResponse.json();
      if (data.success) {
        console.log(data.result.variants[0]);
      }
    } catch (error) {
      console.error('Error uploading sample image:', error);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [width, setWidth] = useState(window.innerWidth);

  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }
  useEffect(() => {
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    }
  }, []);


  const isMobile = width <= 768;
  return (
    <div>

      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"></link>

      <div>
        <label
          onClick={() => {
            setIsModalOpen(true);
          }}
          style={{ cursor: 'pointer' }}>

          <div className="btn d-inline-flex btn-sm btn-secondary mx-1">
            <span className="pe-2">
              {
                uploadStatus === 'loading' ?

                  (<img className=" scale-150" style={{ width: "17px", height: "17px", padding: "0px" }} src={loadingGif} alt="Loading..." />) :
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

        {window.location.pathname === "/scan" ?
          <div style={{ padding: "5px", fontFamily: "Arial, sans-serif", fontSize: "12px" }}>
            {recommendation?.map((section, index) => (
              <div key={index} style={{ marginBottom: "12px" }}>
                <h2 style={{ fontSize: "16px" }}>{section?.title}</h2>
                <ul style={{ paddingLeft: "18px" }}>
                  {section?.entries.map((entry, idx) => (
                    <li key={idx} style={{ marginBottom: "6px", fontSize: "12px" }}>
                      <strong >{entry?.name} </strong>
                      {localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ?
                        <strong className='notranslate'>{entry?.name}</strong> : null}: {entry?.description}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div> : null
        }
      </div>
      
      {isModalOpen && (
        <div id="defaultModal"
          className={`${isMobile ? " w-full " : "w-[700px]"} fixed top-0 left-0 right-0 bottom-0 z-50 w-full h-full p-4 overflow-x-hidden overflow-y-auto flex justify-center bg-black bg-opacity-50`}>
          <div className="relative w-full max-w-2xl max-h-full mt-20">
            <div className="relative bg-white rounded-lg border-black shadow">
              <div className="flex items-start justify-between p-4 border-b rounded-t ">
                <h3 className="text-xl font-semibold text-gray-900 ">
                  Upload Menu Image
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  type="button"
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center ">
                  <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>
              
              <div className="p-4 space-y-4">
                {/* 选项区域 */}
                <div className="space-y-2">
                  {window.location.pathname === "/scan" ?
                    null : <div className="form-check">
                      <input
                        className='form-check-input'
                        type="checkbox"
                        id="autoGenerateImage"
                        checked={autoGenerateImage}
                        onChange={(e) => setAutoGenerateImage(e.target.checked)}
                        style={{ marginRight: "5px" }}
                        translate="no"
                      />
                      <label htmlFor="autoGenerateImage">Automatically generate image</label>
                    </div>
                  }

                  {/* Main language is non-English checkbox */}
                  <div className="form-check">
                    <input
                      className='form-check-input'
                      type="checkbox"
                      id="nonEnglishLanguage"
                      checked={nonEnglishLanguage}
                      onChange={(e) => setNonEnglishLanguage(e.target.checked)}
                      style={{ marginRight: "5px" }}
                      translate="no"
                    />
                    <label htmlFor="nonEnglishLanguage">Menu Main language is non-English</label>
                  </div>
                </div>
                
                {/* 示例图片和上传区域 */}
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="text-center">
                    <p className="font-medium text-gray-700 mb-2">Sample Menu</p>
                    <div 
                      onClick={handleSampleImageUpload}
                      className="cursor-pointer transform hover:scale-105 transition-transform border-2 border-dashed border-gray-300 p-1 hover:border-orange-500"
                    >
                      <img 
                        src="/images/menu.png" 
                        alt="Sample Menu" 
                        className="max-h-60 object-contain"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Click to use this sample</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="font-medium text-gray-700 mb-2">Upload Your Menu</p>
                    <label className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-orange-500 transition-colors">
                      <input
                        type="file"
                        onChange={handleFileChangeAndUpload}
                        style={{ display: 'none' }}
                        translate="no"
                      />
                      <svg className="w-8 h-8 text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                      </svg>
                      <p className="text-sm text-gray-500">Click to browse</p>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div>
        <span style={{ color: 'red' }}>{resultScan}</span>
      </div>
    </div>
  );
};

export default GoogleVisionDemo;
