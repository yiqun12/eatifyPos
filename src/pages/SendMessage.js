import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import firebase from 'firebase/compat/app';

function SendMessage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialPhone = searchParams.get('phoneNumber');
    const initialMessage = searchParams.get('message');
    const [phoneNumber, setPhoneNumber] = useState(initialPhone || '');
    const [message, setMessage] = useState(initialMessage || '');
    const [response, setResponse] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        // Update component state when query parameters change
        setPhoneNumber(initialPhone || '');
        setMessage(initialMessage || '');
    }, [initialPhone, initialMessage]);

    const handleSendSMS = async (event) => {
        event.preventDefault();

        const sendSMS = firebase.functions().httpsCallable('sendSMS');

        try {
            const res = await sendSMS({ phoneNumber, message });
            setResponse(`Status Code: ${res.data.status}`);
            console.log('SMS Response:', res.data);
        } catch (err) {
            setError(err.message);
            console.error('Error sending SMS:', err);
        }
    };

    return (
        <div className="min-h-screeno py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-orange-600 py-6 px-6">
                        <h1 className="text-3xl font-bold text-white">Sending SMS Messages via Our API</h1>
                    </div>
                    
                    {/* Content */}
                    <div className="p-6 space-y-8">
                        {/* Introduction */}
                        <div className="rounded-lg p-6">
                            <p className="text-gray-700 leading-relaxed">
                                This guide will show you how to send SMS messages using our API. We use Android phone with a SIM card as a server hosted on AWS.
                                This setup enables you to programmatically send SMS messages from your computer to any phone number.
                            </p>
                            
                            <div className="mt-6">
                                <p className="font-semibold text-gray-800 mb-2">The following sites are utilizing our service, sending over 200 SMS messages per day:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li><strong>Banner Shop USA:</strong> <a className="text-orange-600 hover:text-orange-800 hover:underline" href="https://www.bannershopusa.com/">www.bannershopusa.com</a></li>
                                    <li><strong>Bao 590 SF:</strong> <a className="text-orange-600 hover:text-orange-800 hover:underline" href="http://Bao590sf.com">Bao590sf.com</a></li>
                                    <li><strong>Genghix Menu:</strong> <a className="text-orange-600 hover:text-orange-800 hover:underline" href="http://genghixmenu.com">genghixmenu.com</a></li>
                                    <li><strong>Spiral Menu:</strong> <a className="text-orange-600 hover:text-orange-800 hover:underline" href="http://spiralmenu.com">spiralmenu.com</a></li>
                                </ul>
                            </div>
                            
                            <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                                <p className="font-semibold text-gray-800">
                                    Why use this instead of Twilio? This setup is designed to work with various regional SIM cards, allowing us to bypass lengthy regulatory processes (which usually takes 3-6 weeks). It enables us to utilize communications directly, avoiding typical regulatory delays.
                                </p>
                            </div>
                        </div>
                        
                        {/* Getting Started */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Getting Started</h2>
                            <p className="text-gray-700 mb-4">
                                To get started, follow these steps:
                            </p>
                            <ol className="list-decimal list-inside space-y-3 pl-2 text-gray-700">
                                <li className="font-medium">Create a new file called <code className="px-2 py-1 bg-gray-100 rounded text-orange-700">server.js</code> on your backend server (the Android phone).</li>
                                <li className="font-medium">Initialize a new Node.js project by running <code className="px-2 py-1 bg-gray-100 rounded text-orange-700">npm init</code> in the terminal and follow the prompts to create a <code className="px-2 py-1 bg-gray-100 rounded text-orange-700">package.json</code> file.</li>
                                <li className="font-medium">Install Axios by running <code className="px-2 py-1 bg-gray-100 rounded text-orange-700">npm install axios</code> in the terminal.</li>
                                <li className="font-medium">Save the following code into <code className="px-2 py-1 bg-gray-100 rounded text-orange-700">server.js</code>:</li>
                            </ol>
                        </div>
                        
                        {/* Code Example */}
                        <div className="bg-gray-800 rounded-lg overflow-hidden">
                            <pre className="p-4 text-sm text-gray-200 overflow-x-auto">
                                <code>{`const axios = require('axios');

const data = {
  phoneNumber: "+19294614214",//or +86xxxxxxxxxxx
  message: 'Nihao'
};

axios.post('http://outsourcesf.org:3000/send-sms', data)
  .then(response => {
    console.log(\`Status Code: \${response.status}\`);
    console.log(response.data);
  })
  .catch(error => {
    console.error(error.toString());
  });
`}</code>
                            </pre>
                        </div>
                        
                        {/* Final Step */}
                        <div>
                            <ol className="list-decimal list-inside" start="5">
                                <li className="font-medium text-gray-700">Run the server by executing <code className="px-2 py-1 bg-gray-100 rounded text-orange-700">node server.js</code> in the terminal.</li>
                            </ol>
                        </div>
                        
                        {/* Try Now Section */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm mr-3">DEMO</span>
                                Try Now
                            </h2>
                            
                            <form onSubmit={handleSendSMS} className="bg-gray-50 rounded-lg p-6 space-y-6">
                                <div>
                                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <input
                                        type="text"
                                        id="phoneNumber"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                        placeholder="e.g. +19294614214"
                                    />
                                </div>
                                
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                    <input
                                        type="text"
                                        id="message"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                        placeholder="Enter your message here"
                                    />
                                </div>
                                
                                <button 
                                    type="submit"
                                    className="w-full sm:w-auto px-6 py-3 bg-orange-600 text-white font-medium rounded-lg shadow-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 transition-colors"
                                >
                                    Send SMS
                                </button>
                                
                                {response && (
                                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                        <p className="text-green-700 font-medium">{response}</p>
                                    </div>
                                )}
                                
                                {error && (
                                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-red-700 font-medium">{error}</p>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SendMessage;
