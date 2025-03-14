import React, { useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
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
      const functions = getFunctions();
      const [recommendationResult, jsonResult] = await Promise.allSettled([
        (async () => {
          if (window.location.pathname === "/scan") {
            const recommendationFunction = httpsCallable(functions, 'recommendation');
            const response = await recommendationFunction({ url, ocr_scan });
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
          const generateJSONFunction = httpsCallable(functions, 'generateJSON');
          const response = await generateJSONFunction({ url, ocr_scan, LanMode, imgBool });
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
    const selectedFile = event.target.files[0];
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

      <div >

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
              <div className="flex items-start justify-between p-4 border-b rounded-t ">
                <div className='flex-col'>


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


                <label style={{ cursor: 'pointer' }}>
                  <input
                    type="file"
                    onChange={handleFileChangeAndUpload}
                    style={{ display: 'none' }} // hides the input
                    translate="no"
                  />
                  <div className="btn d-inline-flex btn-sm btn-secondary mx-1">
                    <span>
                      Upload Now
                    </span>
                  </div>

                </label>

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
