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
        <div className="container mx-auto p-4">
            <h1>Sending SMS Messages via Our API</h1>
            <p>
                This guide will show you how to send SMS messages using our API. We use Android phone with a SIM card as a server hosted on AWS.
                This setup enables you to programmatically send SMS messages from your computer to any phone number.
                <br></br>

                The following sites are utilizing our service, sending over 200 SMS messages per day:
                <ul>
                    <li><strong>Banner Shop USA:</strong> <a class="text-blue-500" href="https://www.bannershopusa.com/">www.bannershopusa.com</a></li>
                    <li><strong>Bao 590 SF:</strong> <a class="text-blue-500" href="http://Bao590sf.com">Bao590sf.com</a></li>
                    <li><strong>Genghix Menu:</strong> <a class="text-blue-500" href="http://genghixmenu.com">genghixmenu.com</a></li>
                    <li><strong>Spiral Menu:</strong> <a class="text-blue-500" href="http://spiralmenu.com">spiralmenu.com</a></li>
                </ul>
                <b>

                    Why use this instead of Twilio? This setup is designed to work with various regional SIM cards, allowing us to bypass lengthy regulatory processes. (which usually takes 3-6 weeks). It enables us to utilize communications directly, avoiding typical regulatory delays. </b>

            </p>
            <p>
                To get started, follow these steps:
            </p>
            <b className="list-decimal list-inside">
                <li>Create a new file called <code>server.js</code> on your backend server (the Android phone).</li>
                <li>Initialize a new Node.js project by running <code>npm init</code> in the terminal and follow the prompts to create a <code>package.json</code> file.</li>
                <li>Install Axios by running <code>npm install axios</code> in the terminal.</li>
                <li>Save the following code into <code>server.js</code>:</li>
            </b>
            <span>
                <pre>
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
            </span>
            <b className="list-decimal list-inside">
                <span> 5. Run the server by executing <code>node server.js</code> in the terminal.</span>
            </b>
            <h1>Try Now:</h1>
            <form onSubmit={handleSendSMS} className="space-y-4">
                <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                        type="text"
                        id="phoneNumber"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                    <input
                        type="text"
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                    Send SMS
                </button>
            </form>
            {response && <p className="mt-4 text-green-600">{response}</p>}
            {error && <p className="mt-4 text-red-600">{error}</p>}
        </div>
    );
}

export default SendMessage;
