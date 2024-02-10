import React, { useState, useEffect } from 'react';
import './fetch.css';
import axios from 'axios';
import { CiCircleInfo } from "react-icons/ci";
import storelogo from './storelogo.png';
import 'bootstrap/dist/css/bootstrap.min.css';
import fetchAILogo from './fetchailogo.jpg';
import { IoSend } from "react-icons/io5";

const REACT_APP_OPENAI_API_KEY = import.meta.env.VITE_REACT_APP_OPENAI_API_KEY;

axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';

const Fetch = () => {

  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false); 
  const [output, setOutput] = useState(''); 
  const [threadId, setThreadId] = useState(null); 

  async function callOpenAIAPI() {
    setIsLoading(true); 
    
    const API_BODY = {
      model: 'gpt-4',
      messages: [{
        role: "system",
        content: 'Greet the User:"Welcome! How can I am Agent Marshmallow here to take your order?"User Initiates Order:"Id like to place an order."Request Location:"Sure thing! Before we proceed, could you please provide your location?"User Provides Location:"Im located in users location."Acknowledge Location and Take Order:"Thank you for providing your location. What items would you like to order and in what quantities?" User Provides Items and Quantities:"User order."Reccomend Items based on selection :"Excellent choice! We also have similar items available. Would you like to add any of those to your order?"User Decides Whether to Add More Items if yes then add those items to the bill :"Users response"Confirm Order or Prompt for Confirmation:"Alright, your order consists of users order. Would you like to confirm your order?"User Confirms Order:"Users confirmation"Generate Invoice:System: "Your order has been confirmed. Here is your invoice: Receipt Number: generate random set of numbers Items - Users order Total Amount: calculate total amount then show everything that was ordered , the location and reciept number Thank you for choosing us! " End of Conversation.',
      }, {
        role: "user",
        content: input,
      }],
      temperature: 0.5,
      max_tokens: 1024,
      top_p: 1.0,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
      ...(threadId && { thread: threadId }), 
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
        setResult('Error: API request failed.'); 
        return;
      }

      const data = response.data;
      if (data.choices && data.choices.length > 0) {
        setOutput(data.choices[0].message.content);
        setResult(`Marshmallow: ${data.choices[0].message.content}`);
        if (!threadId) {
          setThreadId(data.choices[0].thread_id); 
        }
      } else {
        setResult('Error: No response from API.');
      }
    } catch (error) {
      console.error('Error during API call:', error);
      setResult('Error: Failed to call API.');
    } finally {
      setIsLoading(false); 
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    await callOpenAIAPI(); 
    setInput(''); 
  };

  return (
    
    <div className="mainblock">
  

      <div className="app">
        <div className="anime">
        <div className="cont"> 
        <img src={storelogo} alt="Agent Max Logo" style={{ width: "250px", height: "200px", marginLeft: "15px", marginTop: "-60px" }} />
  </div>
  </div>
        <div className="innerchat">
          <div className="agentdisplay">
            <div className="logoicon">
              <img src={fetchAILogo} alt="Agent Max Logo" />
              <CiCircleInfo className="circle"/>
            </div>
            <div className="agent-info">
              <h2>Agent Marshmallow</h2>
              <p>@marshmallowfetchai</p>
            </div>
          </div>
          <div className="chatcontainer">
            <div className="defaultext"> 
            <div className="chatog">
            <p1> This is Marshmallow, here to take your order</p1>
            </div>
            </div>
          {isLoading && (
  <div className="loader-wrapper">
    <div className="loader">
      <label>Please wait...</label>
      <div className="loading"></div>
    </div>
  </div>
)}


            <form onSubmit={handleSubmit}>
              <div className="input-container">
                <div className="sender-area">
                  <div className="input-place">
                    <input
                      type="text"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      placeholder="Chat here"
                      className="send-input"
                    />
                    <button type="submit" className="send">
                    <IoSend />

                    </button>
                  </div>
                </div>
              </div>
              {result !== null && <div className="chat-message">{result}</div>}
            </form>
          </div>
        </div> 
      </div>
      </div>
    
  );
};

export default Fetch;

