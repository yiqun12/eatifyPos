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


  useEffect(() => {
    saveId(Math.random());
  }, []);
  const GOOGLE_CLOUD_VISION_API_KEY = 'AIzaSyCw8WmZfhBIuYJVw34gTE6LlEfOE0e1Dqo';

  const generateJSON = async (ocr_scan, url, LanMode, imgBool) => {
    try {
      const myFunction = firebase.functions().httpsCallable('generateJSON');
      const response = await myFunction({
        url,
        ocr_scan,
        LanMode,
        imgBool,
      });
      //console.log(response.data.result)
      setUploadStatus('success')
      return response.data.result
    } catch (error) {
      //return []
    }
  };

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
      let scann_json = await generateJSON(extractedTextData.replace(/[\s\r\n]+/g, ' '), img, "other", "no")
      const mergedArray = scann_json.concat(JSON.parse(localStorage.getItem(store)))
      reload(mergedArray)//result
    }

    //console.log(await generateJSON())

  };
  const handleFileChangeAndUpload = async (event) => {
    console.log("scanning")
    const selectedFile = event.target.files[0];
    if (!selectedFile) {
      //setUploadStatus('No file selected.');
      return;
    }
    setUploadStatus('loading');

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
        console.log(data.result.variants[0])
        extractTextFromImage(data.result.variants[0])
      } else {
        //setUploadStatus(`Failed to upload image: ${JSON.stringify(data.errors)}`);
      }
    } catch (error) {
      //setUploadStatus(`Error: ${error.message}`);
    }
  };


  return (
    <div>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"></link>

      <div >
        <label style={{ cursor: 'pointer' }}>
          <input
            type="file"
            onChange={handleFileChangeAndUpload}
            style={{ display: 'none' }} // hides the input
            translate="no"
          />
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

      </div>


    </div>

  );
};

export default GoogleVisionDemo;
