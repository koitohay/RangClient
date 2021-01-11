import React, { Component } from 'react';
import { Link } from 'react-router-dom';

export default class HomePage extends Component {
    render() {
        return (
            <div className="home">
                <section>
                    <div className="jumbotron jumbotron-fluid py-5">
                        <div className="container text-center py-5">
                            <h1 className="display-4">Welcome to Rang the game</h1>
                            <p className="lead">A great place to play rang card game with friends</p>
                            <div className="mt-4">
                                <Link className="btn btn-primary px-5 mr-3" to="/signup">Create New Account</Link>
                                <Link className="btn px-5" to="/login">Login to Your Account</Link>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        )
    }
}