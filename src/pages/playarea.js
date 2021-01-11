import React, { Component, useContext, useEffect } from 'react';
import greenImg from '../icons/iconfinder_Circle_Green_34211.png';
import '../styles.css';
import { auth } from "../services/firebase";
import socketIOClient from "socket.io-client";

const ENDPOINT = "http://127.0.0.1:4100";
let connectionOptions = {
    "force new connection": true,
    "reconnectionAttempts": "Infinity", //avoid having user reconnect manually in order to prevent dead clients after a server restart
    "timeout": 10000,                  //before connect_error and connect_timeout are emitted.
    "transports": ["websocket"]
};
const Results = () => (
    <img src={greenImg} style={{ width: "16px", height: "16px" }} />
);
let cards = [
    { name: "diamonds", value: "Q", class: "suit diamonds" },
    { name: "diamonds", value: "10", class: "suit diamonds" },
    { name: "diamonds", value: "2", class: "suit diamonds" },
    { name: "diamonds", value: "K", class: "suit diamonds" },
    { name: "spades", value: "9", class: "suit spades" },
    { name: "spades", value: "A", class: "suit spades" },
    { name: "spades", value: "5", class: "suit spades" },
    { name: "spades", value: "4", class: "suit spades" },
    { name: "hearts", value: "J", class: "suit hearts" },
    { name: "hearts", value: "3", class: "suit hearts" },
    { name: "hearts", value: "Q", class: "suit hearts" },
    { name: "hearts", value: "1", class: "suit hearts" },
    { name: "clubs", value: "10", class: "suit clubs" }
];
let socket = null;
class Playarea extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: auth().currentUser,
            error: null,
            players: [],
            Cards: [],
            playerId: null,
            activeCard: null,
            showPlayArea: false,
            roomCode: null,
            myRole: '',
            noOfPlayers: 0,
            gameId: null,
            socketId: null
        };

        this.showCard = this.showCard.bind(this);
        this.CreateRoom = this.CreateRoom.bind(this);

        this.onRoomCreated = this.onRoomCreated.bind(this);
        this.onPlayerJoined = this.onPlayerJoined.bind(this);
        this.beginNewGame = this.beginNewGame.bind(this);
        this.roomfull = this.roomfull.bind(this);
        this.mapToCardText = this.mapToCardText.bind(this);

        this.cardDealForPlayers = this.cardDealForPlayers.bind(this);
        this.updatePlayerId = this.updatePlayerId.bind(this);
        this.updateOtherPlayerCard = this.updateOtherPlayerCard.bind(this);
        this.yourTurn = this.yourTurn.bind(this);

        this.JoinRoom = this.JoinRoom.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {
        console.log('componetnmount called  ');
        socket = socketIOClient(ENDPOINT, connectionOptions);

        // room created
        socket.on('newGameCreated', this.onRoomCreated);

        // room created
        socket.on('playerJoinedRoom', this.onPlayerJoined);

        // begin new game
        socket.on('beginNewGame', this.beginNewGame);
        socket.on('yourTurn', this.yourTurn);

        // deal cards for players
        socket.on('cardDealForPlayers', this.cardDealForPlayers);
        socket.on('updatePlayerId', this.updatePlayerId);
        socket.on('updateOtherPlayerCard', this.updateOtherPlayerCard);

        //room full start game
        socket.on('roomfull', this.roomfull);

        // Error event
        socket.on('error', (e) => {
            console.error(e);
        });
    }

    componentWillUnmount() {
    }

    showCard(card, playerId, stopEmit) {
        switch (playerId) {
            case 1:
                this.setState({ activeCard: card });
                break;
            case 2:
                this.setState({ activeCardPlayer02: card });
                break;
            case 3:
                this.setState({ activeCardPlayer03: card });
                break;
            case 4:
                this.setState({ activeCardPlayer04: card });
                break;
            default:
                this.setState({ activeCard: card });
                break;
        }
        if (!stopEmit)
            socket.emit('playedCard', { playerId: this.state.playerId, socketId: this.state.socketId, roomId: this.state.gameId.toString(), card: card });
    }

    handleChange(event) {
        this.setState({
            roomCode: event.target.value
        });
    }

    JoinRoom() {
        var data = {
            gameId: this.state.roomCode,
            playerName: 'Kaleem' || 'anon'
        };
        this.setState({ playerId: this.state.players.length + 1 });
        socket.emit("playerJoinGame", data);
    }

    CreateRoom() {
        socket.emit("hostCreateNewGame", {
            gameId: null,
            playerName: this.state.user.email || 'anon'
        });
    }

    roomfull() {
        // if (this.state.myRole === 'Host') {
        socket.emit("hostRoomFull", { gameId: this.state.gameId.toString() });
        //}
    }

    onRoomCreated(data) {
        this.setState({
            myRole: 'Host',
            noOfPlayers: 1,
            playerId: 1,
            gameId: data.gameId,
            socketId: data.socketId,
            showPlayArea: true,
            hostText: this.state.user.email,
            players: data.players
        });
        console.log('Room created:' + data.players.length);
    }

    onPlayerJoined(data) {
        // if (this.state.myRole !== 'Host') {
        console.log('Room joined');
        this.setState({
            myRole: 'Player',
            noOfPlayers: 1,
            gameId: data.gameId,
            socketId: data.socketId,
            showPlayArea: true,
            players: data.players
        });
        // }

    }

    beginNewGame(data) {
        console.log('Begin new game', this.state.myRole);

        socket.emit('dealCardsToPlayers', { roomId: data.gameId });
    }

    cardDealForPlayers(data) {
        this.setState({ Cards: data.cards });
    }

    updatePlayerId(data) {
        this.setState({ playerId: data.playerId });
    }

    updateOtherPlayerCard(data) {
        console.log("The player who played: ", data.playerId);
        this.showCard(data.card, data.playerId, true);
    }

    yourTurn(data) {
        console.log('Your turn called', data.playerId);
        switch (data.playerId) {
            case 1:
                this.setState({ hostTurn: true });
                this.setState({ player02Turn: false })
                this.setState({ player03Turn: false })
                this.setState({ player04Turn: false })
                break;
            case 2:
                this.setState({ hostTurn: false });
                this.setState({ player02Turn: true })
                this.setState({ player03Turn: false })
                this.setState({ player04Turn: false })
                break;
            case 3:
                this.setState({ hostTurn: false });
                this.setState({ player02Turn: false })
                this.setState({ player03Turn: true })
                this.setState({ player04Turn: false })
                break;
            case 4:
                this.setState({ hostTurn: false });
                this.setState({ player02Turn: false })
                this.setState({ player03Turn: false })
                this.setState({ player04Turn: true })
                break;
            default:
                this.setState({ hostTurn: true });
                this.setState({ player02Turn: false })
                this.setState({ player03Turn: false })
                this.setState({ player04Turn: false })
                break;
        }
    }


    mapToCardText(value) {

        switch (value) {
            case 11:
                return 'J'
                break;
            case 12:
                return 'Q'
                break;
            case 13:
                return 'K'
                break;
            case 14:
                return 'A'
                break;
            default:
                return value;
                break;
        }
        console.log('Youe turn called');
        //this.setState({turn: true});
    }

    render() {
        const cardsItems = this.state.Cards.map((card) =>
            <div class="card" onClick={() => this.showCard(card, this.state.playerId)}>
                <div class="value">{this.mapToCardText(card.value)}
                </div>
                <div className={card.class}>
                </div>
            </div>
        );
        return (
            <div>
                <div id="Lobby" style={{ display: !this.state.showPlayArea ? 'block' : 'none' }}>
                    <div className="form-group col-3">
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

                </div>
                <div id="PlayArea" style={{ display: this.state.showPlayArea ? 'block' : 'none' }}>
                    <nav class="navbar navbar-expand-lg navbar-light bg-light">

                        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
                            <span class="navbar-toggler-icon"></span>
                        </button>
                        <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
                            <div class="navbar-nav">
                                <a class="nav-item nav-link active" href="#">Rang card game <span class="sr-only">(current)</span></a>
                                <a class="nav-item nav-link" href="#">Distribute</a>
                                <a class="nav-item nav-link" href="#">declare winner</a>
                                <a class="nav-item nav-link" href="#">Endgame</a>
                                <a class="nav-item nav-link" href="#">Choose 1 player</a>
                            </div>
                        </div>
                    </nav>

                    <div className='count'>
                        <button type="button" class=" mb-3 btn btn-success">
                            Players online: <span class="badge badge-light"> {this.state.players.length}</span>
                        </button>
                    </div>

                    <br />

                    <div class="row">
                        <div className={"card text-white  mb-3 col-3 " + (!this.state.hostTurn ? 'bg-primary' : 'bg-danger')} style={{ 'max-width': '18rem', 'float': 'left'}}>
                            <div class="card-header">Host</div>
                        <div class="card-body">
                            <h5 class="card-title">
                                {this.state.gameId}
                                {this.state.players.length >= 1 ? <Results /> : null}
                            </h5>
                            <p class="card-text">
                                {this.state.hostText}
                            </p>
                        </div>
                    </div>
                    <div class="col-3 mb-3">
                        <div class="deck">
                            <div class="card" >
                                <div class="value">{this.state.activeCard != null ? this.mapToCardText(this.state.activeCard.value) : ''}
                                </div>
                                <div className={this.state.activeCard != null ? this.state.activeCard.class : ''}>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-3 mb-3" >
                        <div class="deck" style={{ 'float': 'right' }}>
                            <div class="card" >
                                <div class="value">{this.state.activeCardPlayer02 != null ? this.mapToCardText(this.state.activeCardPlayer02.value) : ''}
                                </div>
                                <div className={this.state.activeCardPlayer02 != null ? this.state.activeCardPlayer02.class : ''}>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={"card text-white  mb-3 col-3 " + (!this.state.player02Turn ? 'bg-primary' : 'bg-danger')} style={{ 'max-width': '18rem', 'float': 'right' }}>
                        <div class="card-header">{this.state.players.length >= 2 ? this.state.players[1].playerName : ""}</div>
                        <div class="card-body">
                            <h5 class="card-title">
                                {this.state.players.length >= 2 ? <Results /> : null}
                            </h5>
                            <p class="card-text">player joining ...</p>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div className={"card text-white  mb-3 col-3 " + (!this.state.player03Turn ? 'bg-primary' : 'bg-danger')} style={{ 'max-width': '18rem', 'float': 'left' }}>
                        <div class="card-header">{this.state.players.length >= 3 ? this.state.players[2].playerName : ""}</div>
                        <div class="card-body">
                            <h5 class="card-title">
                                {this.state.players.length >= 3 ? <Results /> : null}
                            </h5>
                            <p class="card-text">cards coming...</p>
                        </div>
                    </div>
                    <div class="col-3 mb-3">
                        <div class="deck">
                            <div class="card" >
                                <div class="value">{this.state.activeCardPlayer03 != null ? this.mapToCardText(this.state.activeCardPlayer03.value) : ''}
                                </div>
                                <div className={this.state.activeCardPlayer03 != null ? this.state.activeCardPlayer03.class : ''}>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-3 mb-3" >
                        <div class="deck" style={{ 'float': 'right' }}>
                            <div class="card" >
                                <div class="value">{this.state.activeCardPlayer04 != null ? this.mapToCardText(this.state.activeCardPlayer04.value) : ''}
                                </div>
                                <div className={this.state.activeCardPlayer04 != null ? this.state.activeCardPlayer04.class : ''}>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={"card text-white  mb-3 col-3 " + (!this.state.player04Turn ? 'bg-primary' : 'bg-danger')} style={{ 'max-width': '18rem', 'float': 'right' }}>
                        <div class="card-header">{this.state.players.length >= 4 ? this.state.players[3].playerName : ""}</div>
                        <div class="card-body">
                            <h5 class="card-title">
                                {this.state.players.length >= 4 ? <Results /> : null}
                            </h5>
                            <p class="card-text">player joining...</p>
                        </div>
                    </div>
                </div>

                <div className="deck">
                    {cardsItems}
                </div>
            </div >
            </div >
        );
    }

}
export default Playarea;