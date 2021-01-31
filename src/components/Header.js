import React from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../services/firebase';

function Header(props) {


  return (
    <header>
      <nav className="navbar navbar-expand-lg fixed-top navbar-light bg-light" role="navigation">
        <a className="navbar-brand" href="#">Rang card game</a>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse justify-content-end" id="navbarNavAltMarkup">
          {auth().currentUser
            ? <ul className="navbar-nav">
              <li class="nav-item "><Link className="nav-link mr-3" href="#" onClick={props.onEndGame}>Endgame</Link></li>

              <li class="nav-item "> <button className="btn btn-primary mr-3" onClick={() => auth().signOut()}>Logout</button></li>
            </ul>
            : <ul className="navbar-nav">
              <li class="nav-item "><Link className="nav-link mr-3" to="/login">Sign In</Link></li>
              <li class="nav-item "><Link className="nav-link mr-3" to="/signup">Sign Up</Link></li>
            </ul>}

        </div>
      </nav>
    </header>
  );
}

export default Header;