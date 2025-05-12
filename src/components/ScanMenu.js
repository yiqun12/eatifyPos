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

const GoogleVisionDemo = ({ reload, store, setFoods, onScanComplete, isButton = false, t = (text) => text, showText = false, icon, buttonLabel, buttonClassName, iconClassName }) => {
  /**listen to localtsorage */
  const { id, saveId } = useMyHook(null);
  const [uploadStatus, setUploadStatus] = useState('idle');  // Possible values: 'idle', 'loading', 'success'

  const [autoGenerateImage, setAutoGenerateImage] = useState(true);
  const [nonEnglishLanguage, setNonEnglishLanguage] = useState(true);

  useEffect(() => {
    saveId(Math.random());
  }, []);
  const GOOGLE_CLOUD_VISION_API_KEY = 'AIzaSyCw8WmZfhBIuYJVw34gTE6LlEfOE0e1Dqo';

  // Function to process raw recommendation data - DEFINITION ADDED BACK HERE
  const processMenuRecommendation = (menu) => {
    if (!Array.isArray(menu)) return [];
    return menu.filter(section => typeof section === 'string' && section.trim() !== "")
      .map(item => {
        const parts = item.split(":");
        const title = parts[0]?.trim();
        const entries = [];
        if (parts.length > 1) {
          const detailsString = parts.slice(1).join(":").trim();
          const entryPairs = detailsString.split(/,(?=\s*\w+[:\- ])/);
          entryPairs.forEach(pair => {
            const nameDescSplit = pair.split(/[:\-]/, 2);
            if (nameDescSplit.length > 0) {
              entries.push({
                name: nameDescSplit[0]?.trim(),
                description: nameDescSplit[1]?.trim() || "",
              });
            }
          });
        }
        return { title: title || "Recommendation", entries };
      }).filter(section => section.entries.length > 0);
  };

  const generateJSON = async (ocr_scan, url, LanMode, imgBool) => {
    console.log("generateJSON called with:", { ocr_scan, url, LanMode, imgBool });
    let recommendationData = [];
    let scannedItems = [];
    let statusMessage = "";

    try {
      const results = await Promise.allSettled([
        (async () => {
          if (window.location.pathname === "/scan") {
            console.log("Calling recommendation function...");
            const myFunction = firebase.functions().httpsCallable('recommendation');
            const response = await myFunction({ url, ocr_scan });
            console.log("Recommendation raw response data:", response.data); // Log raw response
            const rawResult = response.data?.result;
            console.log("Recommendation raw result (before processing):", rawResult); // Log raw result
            return processMenuRecommendation(rawResult);
          } else {
            return []; // Return empty if not on /scan page
          }
        })(),
        (async () => {
          console.log("Calling generateJSON function...");
          const myFunction = firebase.functions().httpsCallable('generateJSON');
          const response = await myFunction({ url, ocr_scan, LanMode, imgBool });
          console.log("generateJSON response:", response.data);
          return response.data.result || []; // Ensure it returns an array
        })()
      ]);

      if (results[0].status === 'fulfilled') {
        recommendationData = results[0].value;
        console.log('Recommendation Processed:', recommendationData);
      } else {
        console.error('Recommendation Failed:', results[0].reason);
        statusMessage += "Failed to get recommendations. ";
      }

      if (results[1].status === 'fulfilled') {
        scannedItems = results[1].value;
        console.log('JSON Generation Success:', scannedItems);
        statusMessage += `Successfully scanned ${scannedItems.length} items.`;
        const existingItems = JSON.parse(localStorage.getItem(store) || "[]");
        const mergedArray = [...scannedItems, ...existingItems]; // New items first
        reload(mergedArray); // Use reload from props
      } else {
        console.error('JSON Generation Failed:', results[1].reason);
        statusMessage += "Failed to scan items.";
      }

      setUploadStatus('success');
      // Re-add the timeout to reset status to idle after a short delay
      setTimeout(() => setUploadStatus('idle'), 3000); // Reset after 3 seconds

    } catch (error) {
      console.error('Error in generateJSON or recommendation calls:', error);
      setUploadStatus('error');
      statusMessage = "An error occurred during scanning.";
    }

    // Add log before calling the callback
    console.log('ScanMenu.js: generateJSON finished. About to call onScanComplete. Callback type:', typeof onScanComplete, 'Status message:', statusMessage);

    // Call the callback with the results
    if (onScanComplete) {
      onScanComplete({
        recommendationData,
        statusMessage,
        scannedItems // Optionally pass scanned items if parent needs them directly
      });
    }
  };

  const extractTextFromImage = async (img, selectedFile) => {
    const toBase64 = (file) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = (error) => reject(error);
    });

    try {
      const base64Image = await toBase64(selectedFile);
      const response = await fetch('https://vision.googleapis.com/v1/images:annotate?key=' + GOOGLE_CLOUD_VISION_API_KEY, {
        method: 'POST',
        body: JSON.stringify({
          requests: [{
            image: { content: base64Image },
            features: [{ type: 'TEXT_DETECTION' }]
          }]
        }),
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();

      if (data.responses && data.responses[0].textAnnotations && data.responses[0].textAnnotations.length > 0) {
        const detectedText = data.responses[0].textAnnotations[0].description;
        console.log('Detected text:', detectedText.substring(0, 100) + "..."); // Log truncated text
        await generateJSON(
          detectedText.replace(/[\s\r\n]+/g, ' '),
          base64Image, // Pass base64 for potential use in recommendation
          nonEnglishLanguage ? "other" : "en",
          autoGenerateImage ? "yes" : "no"
        );
      } else {
        console.log('No text detected.');
        setUploadStatus('error');
        if (onScanComplete) {
          onScanComplete({ statusMessage: 'No text detected in the image.' });
        }
      }
    } catch (error) {
      console.error('Error during text extraction or processing:', error);
      setUploadStatus('error');
      if (onScanComplete) {
        onScanComplete({ statusMessage: `Error processing image: ${error.message}` });
      }
    }
  };

  const handleFileChangeAndUpload = async (event) => {
    console.log("Initiating scan...");
    const selectedFile = event.target.files ? event.target.files[0] : null;
    if (!selectedFile) return;

    setUploadStatus('loading');
    setIsModalOpen(false);
    await extractTextFromImage("", selectedFile); // Await completion
  };

  const handleSampleImageUpload = async () => {
    console.log("Initiating scan with sample...");
    setUploadStatus('loading');
    setIsModalOpen(false);
    try {
      const response = await fetch('/images/menu.png');
      if (!response.ok) throw new Error('Failed to fetch sample image');
      const blob = await response.blob();
      const file = new File([blob], 'menu.png', { type: 'image/png' });
      await extractTextFromImage("", file); // Await completion
    } catch (error) {
      console.error('Error uploading sample image:', error);
      setUploadStatus('error');
      if (onScanComplete) {
        onScanComplete({ statusMessage: `Error processing sample image: ${error.message}` });
      }
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {isButton ? (
        <button
            title={t("Scan Menu")}
            onClick={() => uploadStatus !== 'loading' && setIsModalOpen(true)}
            className={buttonClassName || `flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition duration-150 ease-in-out ${
                uploadStatus === 'loading'
                    ? 'bg-gray-500 text-white cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
            }`}
            disabled={uploadStatus === 'loading'}
        >
            {uploadStatus === 'loading' ? (
                 <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
             ) : uploadStatus === 'success' ? (
                 <i className="bi bi-check h-4 w-4 mr-1"></i>
             ) : icon ? (
                 icon
             ) : (
                 <i className="bi bi-camera h-4 w-4 mr-1"></i>
             )}
            <span className={iconClassName}>{buttonLabel || t("Scan Menu")}</span>
        </button>
      ) : (
        <button
             title={t("Scan Menu")}
             onClick={() => uploadStatus !== 'loading' && setIsModalOpen(true)}
             // Apply w-36 here directly, or rely on parent class + internal adjustments
             className={`w-36 h-10 px-3 text-xs space-x-1.5 text-white rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-150 ease-in-out flex items-center justify-center ${ // Added justify-center
                 uploadStatus === 'loading'
                     ? 'bg-gray-500 cursor-not-allowed'
                     : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
             }`}
             disabled={uploadStatus === 'loading'}
         >
             {/* Icon logic remains the same, adjust size */}
             {uploadStatus === 'loading' ? (
                 <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> {/* Size h-4 w-4 */}
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
             ) : uploadStatus === 'success' ? (
                 <i className="bi bi-check h-4 w-4"></i>
             ) : (
                 <i className="bi bi-camera h-4 w-4"></i>
              )}
             {/* Always render Text Span */}
             <span>{t("Scan Menu")}</span>
         </button>
      )}

      {isModalOpen && (
        <div id="defaultModal"
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto bg-black bg-opacity-50 mt-0"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="relative w-full max-w-xl mx-auto my-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-white rounded-lg shadow-xl dark:bg-gray-800">
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
    </>
  );
};

export default GoogleVisionDemo;
