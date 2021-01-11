import React, { Component} from 'react';
import { auth } from "../services/firebase";
import socketIOClient from "socket.io-client";

const ENDPOINT = "http://127.0.0.1:4100";
let connectionOptions = {
    "force new connection": true,
    "reconnectionAttempts": "Infinity", //avoid having user reconnect manually in order to prevent dead clients after a server restart
    "timeout": 10000,                  //before connect_error and connect_timeout are emitted.
    "transports": ["websocket"]
};
export default class Lobby extends Component {

    constructor(props) {
        super(props);
        this.state = {
            code: null,
            roomCode: null,
            user: auth().currentUser,
            isLoaded: true,
            items: null,
            response: null
        };


        this.CreateRoom = this.CreateRoom.bind(this);
        this.JoinRoom = this.JoinRoom.bind(this);
        this.handleChange = this.handleChange.bind(this);
        console.log("App called");
        localStorage.setItem('counter', "0");
        
    }

    handleChange(event) {
        this.setState({
            roomCode: event.target.value
        });
    }

    async CreateRoom() {
        const randomcode = Math.floor(Math.random() * 100000) + 1;
        this.setState({
            code: randomcode,
        }
        );
        // const requestOptions = {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({id: 0, name: this.state.user.email, room: randomcode.toString(), active: true })
        // };

        // const response = await fetch("https://localhost:5001/api/usercontroller", requestOptions)
        // const data = await response.json();

        // console.log(data);
        this.props.history.push(`/playarea/${randomcode}`)

    }

    JoinRoom() {
        this.props.history.push(`/playarea/${this.state.roomCode}`)
    }

    componentDidMount() {
        // const socket = socketIOClient(ENDPOINT, connectionOptions);

        // socket.on("cardShuffled", data => {
        //     this.setState({cards: data});
        // });
    }
    render() {

        // useEffect(() => {
            
        // }, []);
        return (

            <div className="form-group col-3">
                <p>
                    It's <time dateTime={this.state.response}>{this.state.response}</time>
                </p>
                <div>
                    <h1>
                        {this.state.code}
                    </h1>
                    <div class="row">
                        <button className="btn btn-primary px-5" onClick={this.CreateRoom}>
                            Create Room
                    </button>
                    </div>
                    <div class="row">
                        <div class="col-12" style={{ 'height': 20 }}></div>
                    </div>

                    <div class="row">

                        <input type="text" id="roomNumber" className="form-control" name="roomNumber" onChange={this.handleChange} value={this.state.roomCode}></input>
                        <button className="btn btn-primary px-5" onClick={this.JoinRoom}>
                            Join Room
                    </button>
                    </div>

                </div>



            </div>

        );
    }
}