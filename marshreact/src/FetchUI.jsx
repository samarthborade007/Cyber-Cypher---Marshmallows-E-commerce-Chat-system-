import React, { useState, useEffect } from 'react';
import './fetch.css';
import axios from 'axios';

import 'bootstrap/dist/css/bootstrap.min.css';
import fetchAILogo from './fetchailogo.jpg';
const REACT_APP_OPENAI_API_KEY = import.meta.env.VITE_REACT_APP_OPENAI_API_KEY;

// Set axios default settings for CSRF token
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';

const Fetch = () => {
  // State variables for handling input, result, loading status, and OpenAI API output
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // For loading status
  const [output, setOutput] = useState(''); // For storing API output
  const [threadId, setThreadId] = useState(null); // State to store thread ID

  // Function to call OpenAI API, adapted to use threads
  async function callOpenAIAPI() {
    setIsLoading(true); // Start loading indicator
    
    // Adjusted API body to conditionally include the thread ID if it exists
    const API_BODY = {
      model: 'gpt-4',
      messages: [{
        role: "system",
        content: 'Greet the User:"Welcome! How can I assist you today?"User Initiates Order:"Id like to place an order."Request Location:"Sure thing! Before we proceed, could you please provide your location?"User Provides Location:"Im located in users location."Acknowledge Location and Take Order:"Thank you for providing your location. What items would you like to order and in what quantities?" User Provides Items and Quantities:"User order."Suggest Similar Items:"Excellent choice! We also have similar items available. Would you like to add any of those to your order?"User Decides Whether to Add More Items:"Users response"Confirm Order or Prompt for Confirmation:"Alright, your order consists of users order. Would you like to confirm your order?"User Confirms Order:"Users confirmation"Generate Invoice:System: "Your order has been confirmed. Here is your invoice: Receipt Number: generate random set of numbers Items - Users order Total Amount: calculate total amount then show everything that was ordered , the location and reciept number Thank you for choosing us! " End of Conversation.',
      }, {
        role: "user",
        content: input,
      }],
      temperature: 0.5,
      max_tokens: 1024,
      top_p: 1.0,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
      ...(threadId && { thread: threadId }), // Conditionally add thread ID to the request
    };

    try {
      const response = await axios.post("https://api.openai.com/v1/chat/completions", API_BODY, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${REACT_APP_OPENAI_API_KEY}`,
        }
      });

      if (response.status !== 200) {
        console.error('API request failed with status', response.status);
        setResult('Error: API request failed.'); // Show error in the chat container
        return;
      }

      const data = response.data;
      if (data.choices && data.choices.length > 0) {
        setOutput(data.choices[0].message.content); // Update the result to show in the chat container
        setResult(`AI Response: ${data.choices[0].message.content}`);
        if (!threadId) {
          setThreadId(data.choices[0].thread_id); // Save the thread ID for future requests
        }
      } else {
        setResult('Error: No response from API.');
      }
    } catch (error) {
      console.error('Error during API call:', error);
      setResult('Error: Failed to call API.');
    } finally {
      setIsLoading(false); // Stop loading indicator
    }
  }

  // Adjusted handleSubmit to incorporate the callOpenAIAPI function
  const handleSubmit = async (e) => {
    e.preventDefault();
    await callOpenAIAPI(); // Call OpenAI API with the current input
    setInput(''); // Reset input field after submission
  };

  return (
    <div className="mainblock">
      <div className="app">
        <div className="innerchat">
          <div className="agentdisplay">
            <div className="logoicon">
              <img src={fetchAILogo} alt="Agent Max Logo" />
            </div>
            <div className="agent-info">
              <h2>Agent Max</h2>
              <p>@maxifetchai</p>
            </div>
          </div>

          <div className="chatcontainer">
           
          {!isLoading &&(
              <div class="loader">
              <div class="loader-square"></div>
              <div class="loader-square"></div>
              <div class="loader-square"></div>
              <div class="loader-square"></div>
              <div class="loader-square"></div>
              <div class="loader-square"></div>
              <div class="loader-square"></div>
              </div>

          )}

            

       
             <div className="initial-message">
              
            <p>Hey There this is Agent Max from FetchAI Here to take your orders</p>

            </div>
           



            </div>
            <form onSubmit={handleSubmit}>
              <div className="input-container">
                <div className="sender-area">
                  <div className="input-place">
                    <input
                      type="text"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      placeholder="Enter your task"
                      className="send-input"
                    />
                    <button type="submit" className="send">
                    <svg className="send-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <path fill="#6B6C7B" d="M481.508,210.336L68.414,38.926c-17.403-7.222-37.064-4.045-51.309,8.287C2.86,59.547-3.098,78.551,1.558,96.808 L38.327,241h180.026c8.284,0,15.001,6.716,15.001,15.001c0,8.284-6.716,15.001-15.001,15.001H38.327L1.558,415.193 c-4.656,18.258,1.301,37.262,15.547,49.595c14.274,12.357,33.937,15.495,51.31,8.287l413.094-171.409 C500.317,293.862,512,276.364,512,256.001C512,235.638,500.317,218.139,481.508,210.336z"/>
        </svg>
                    </button>
                  </div>
                </div>
              </div>
              {result !== null && <div className="chat-message">{result}</div>}
              

            </form>
          </div>
        </div>
      </div>
    
  );
};

export default Fetch;

