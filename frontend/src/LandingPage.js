import React from 'react';
import './styles/LandingPage.css';
import { useNavigate } from 'react-router-dom';


const LandingPage = () => {
    const navigate = useNavigate();

  const handleNavigate = () => {
    navigate('/app');
  };
  return (
    <div className="landing-page">
      <header>
        <h1 className="fluid">HodlUp<br />Broke ... :( </h1>
      </header>
      <main>
        <section className="content fluid">
          <h2>
            <span aria-hidden="true">You won't&nbsp;</span>
            <span className="sr-only">you can ship Regret.</span>
          </h2>
          <ul aria-hidden="true" style={{ '--count': 22 }}>
            <li style={{ '--i': 0 }}>lose.</li>
            <li style={{ '--i': 1 }}>cry.</li>
            <li style={{ '--i': 2 }}>suffer.</li>
            <li style={{ '--i': 3 }}>despair.</li>
            <li style={{ '--i': 4 }}>yapp.</li>
            <li style={{ '--i': 5 }}>fade.</li>
            <li style={{ '--i': 21 }}>regret it.</li>
          </ul>
        </section>
        
        <section>
          <h2 className="fluid h222">Trust <span className="gold-text">the Process $$$</span>.</h2>
        </section>

        <a
          className="bear-link fixed-logo"
          target="_blank"
          rel="noreferrer noopener"
          style={{
            position: 'fixed',
            right: '20px',
            top: '20px',
            zIndex: 1000,
            display: 'block'
          }}
        >
          <img
            src="/logo.png"
            alt="icon"
            className="w-9"
            style={{ width: '150px', height: 'auto' }}
          />
        </a>

        <button className="btnn gold-text" onClick={handleNavigate}>
            Get Started <img className='imgg' src="https://cdn.pixabay.com/animation/2024/04/19/03/00/03-00-02-678_512.gif" alt="arrow" />
        </button>
      </main>
    </div>
  );
};

export default LandingPage;