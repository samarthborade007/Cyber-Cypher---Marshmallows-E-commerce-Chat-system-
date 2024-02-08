import React, { useState } from 'react';
import './fetch.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import fetchAILogo from './fetchailogo.jpg';

axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';

const Fetch = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Split the input into two numbers based on the space
    const numbers = input.split(' ').map(num => parseFloat(num));

    // Check if we have exactly two numbers
    if (numbers.length === 2 && numbers.every(num => !isNaN(num))) {
      try {
        const response = await axios.post('http://127.0.0.1:8000/api/add', {
          num1: numbers[0],
          num2: numbers[1],
        });
        setResult(`Result: ${response.data.result}`);
      } catch (error) {
        console.error('Error:', error);
        setResult('Error calculating sum.');
      }
    } else {
      setResult('Please enter exactly two numbers separated by a space.');
    }
    setInput('');

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
            <form onSubmit={handleSubmit}>
              <div className="input-container">
                <div className="sender-area">
                  <div className="input-place">
                    <input
                      type="text"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      placeholder="Test Field"
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
    </div>
  );
};

export default Fetch;

