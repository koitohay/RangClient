import React, { Component } from 'react';
import { Modal, Button } from 'react-bootstrap'
import greenImg from '../icons/iconfinder_Circle_Green_34211.png';
import '../styles.css';
import { auth } from "../services/firebase";
import socketIOClient from "socket.io-client";
import configData from "../config.json";
import Header from "../components/Header";
import Footer from "../components/Footer";

const ENDPOINT = process.env.NODE_ENV === "development" ? configData.DEV_SERVER_URL : configData.PROD_SERVER_URL;
let connectionOptions = {
    "force new connection": true,
    "reconnectionAttempts": "Infinity", //avoid having user reconnect manually in order to prevent dead clients after a server restart
    "timeout": 10000,                  //before connect_error and connect_timeout are emitted.
    "transports": ["websocket"]
};

const Results = () => (
    <img src={greenImg} style={{ width: "16px", height: "16px" }} />
);

const refreshPage = () => {
    window.location.reload();
}

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
            playerName: null,
            socketId: null,
            playerTurn: 0,
            message: '',
            playerWonMessage: '',
            showModal: false,
            rangSelectionCards: [],
            rangOfGame: '',
            gameMessage: '',
            closeModal: null
        };

        this.baseState = this.state;
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
        this.whoWonRound = this.whoWonRound.bind(this);
        this.endGame = this.endGame.bind(this);
        this.JoinRoom = this.JoinRoom.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleChangeName = this.handleChangeName.bind(this);
        this.selectRangForGame = this.selectRangForGame.bind(this);
        this.rangSelected = this.rangSelected.bind(this);
        this.showModalClose = this.showModalClose.bind(this);
        this.endGameButtonClicked = this.endGameButtonClicked.bind(this);
        this.gameEnded = this.gameEnded.bind(this);
    }

    componentDidMount() {
        var that = this;

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
        socket.on('whoWonRound', this.whoWonRound);
        socket.on('selectRangForGame', this.selectRangForGame);
        socket.on('rangSelected', this.rangSelected);

        //room full start game
        socket.on('roomfull', this.roomfull);

        socket.on('endGame', this.endGame);
        socket.on('gameEnded', this.gameEnded);

        // Error event
        socket.on('error', (e) => {
            that.setState({
                modalTitle: "Error",
                playerWonMessage: e.message,
                showModal: true
            });
            console.error(e);
        });
    }

    componentWillUnmount() {
    }

    showCard(card, playerId, stopEmit) {

        if (playerId !== this.state.playerTurn)
            return;

        var arrayOfCards = [...this.state.Cards];
        var indexOfCard = arrayOfCards.indexOf(card);
        if (indexOfCard !== -1) {
            arrayOfCards.splice(indexOfCard, 1);
            this.setState({ Cards: arrayOfCards });
        }

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

    handleChangeName(event) {
        this.setState({
            playerName: event.target.value
        });
    }

    handleChange(event) {
        this.setState({
            gameId: event.target.value
        });
    }

    JoinRoom() {
        if (this.state.playerName != null && this.state.gameId != null) {
            var data = {
                gameId: this.state.gameId,
                playerName: this.state.playerName || 'anon'
            };
            this.setState({ playerId: this.state.players.length + 1 });
            socket.emit("playerJoinGame", data);
        }
    }

    CreateRoom() {
        socket.emit("hostCreateNewGame", {
            gameId: null,
            playerName: this.state.user.email || 'anon'
        });
    }

    roomfull() {
        socket.emit("hostRoomFull", { gameId: this.state.gameId.toString() });
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
        console.log('Room joined');
        this.setState({
            myRole: 'Player',
            noOfPlayers: 1,
            gameId: data.gameId,
            socketId: data.socketId,
            showPlayArea: true,
            players: data.players
        });
    }

    beginNewGame(data) {
        console.log('Begin new game', this.state.myRole);
        socket.emit('getCardForRangSelection', { roomId: data.gameId });
    }

    sendSelectionOfRang(card) {
        this.setState({
            modalTitle: "",
            playerWonMessage: "",
            showModal: false,
            rangSelectionCards: []
        })
        socket.emit('dealCardsToPlayers', { roomId: this.state.gameId, selectedCards: this.state.rangSelectionCards, selectedRang: card });
    }

    selectRangForGame(data) {
        console.log("Select the rang called");
        this.setState({
            modalTitle: "Select rang!",
            gameMessage: "Player 1 selecting rang for the game!",
            playerWonMessage: "Please select rang from the following cards.",
            showModal: true,
            rangSelectionCards: data.cards
        });
    }

    rangSelected(data) {
        this.setState({ rangOfGame: data.rang, gameMessage: "Game started!" })
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

        if (data.clearCards)
            this.setState({
                playerTurn: data.playerId,
                gameMessage: "",
                activeCard: null, activeCardPlayer02: null, activeCardPlayer03: null, activeCardPlayer04: null
            });
        else
            this.setState({ playerTurn: data.playerId })

        switch (data.playerId) {
            case 1:
                this.setState({
                    hostTurn: true,
                    gameMessage: "Player " + data.playerId + " turn!",
                    player02Turn: false, player03Turn: false, player04Turn: false
                });
                break;
            case 2:
                this.setState({
                    hostTurn: false,
                    gameMessage: "Player " + data.playerId + " turn!",
                    player02Turn: true, player03Turn: false, player04Turn: false
                });
                break;
            case 3:
                this.setState({
                    hostTurn: false,
                    gameMessage: "Player " + data.playerId + " turn!",
                    player02Turn: false, player03Turn: true, player04Turn: false
                });
                break;
            case 4:
                this.setState({
                    hostTurn: false,
                    gameMessage: "Player " + data.playerId + " turn!",
                    player02Turn: false, player03Turn: false, player04Turn: true
                });
                break;
            default:
                this.setState({
                    hostTurn: true,
                    gameMessage: "Player " + data.playerId + " turn!",
                    player02Turn: false, player03Turn: false, player04Turn: false
                });
                break;
        }
    }


    mapToCardText(value) {

        switch (value) {
            case 11:
                return 'J'
            case 12:
                return 'Q'
            case 13:
                return 'K'
            case 14:
                return 'A'
            default:
                return value;
        }
    }

    whoWonRound(data) {

        this.setState({
            message: "Player " + data.winner.playerData.playerId + " won the round!",
            activeCard: null, activeCardPlayer02: null, activeCardPlayer03: null, activeCardPlayer04: null
        });

        var thisComponent = this;
        setTimeout(function () {
            thisComponent.setState({ message: '' });
        }, 10000);

        this.yourTurn(data);
    }

    endGame(data) {
        console.log(data.gameWinner);
        this.setState({
            modalTitle: "Game ended!",
            playerWonMessage: "Team with players " + data.gameWinner.playerNames + " won the game by winning " + data.gameWinner.roundsWon + " rounds!",
            showModal: true,
            closeModal: refreshPage,
            activeCard: null, activeCardPlayer02: null, activeCardPlayer03: null, activeCardPlayer04: null
        });
    }

    gameEnded(data) {
        this.setState({
            modalTitle: "Game ended!",
            playerWonMessage: "One or more players left the room, you need to restart game.",
            showModal: true,
            closeModal: refreshPage,
        });
    }

    endGameButtonClicked(e) {
        socket.emit("gameEnded", { gameId: this.state.gameId, socketId: this.state.socketId, playerId: this.state.playerId });
        refreshPage();
    }

    showModalClose() {
        if (this.state.closeModal)
            this.state.closeModal();

        this.setState({
            showModal: false,
            closeModal: null
        });
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

        const rangSelectionCards = this.state.rangSelectionCards.map((card) =>
            <div class="card" onClick={() => this.sendSelectionOfRang(card)}>
                <div class="value">{this.mapToCardText(card.value)}
                </div>
                <div className={card.class}>
                </div>
            </div>
        );
        return (
            <div>
                <Header onEndGame={this.endGameButtonClicked} />
                <div>
                    <div id="Lobby" style={{ display: !this.state.showPlayArea ? 'block' : 'none' }}>
                        <div class="container h-100 play-area">
                            <div class="row h-100 justify-content-center align-items-center">
                                <div class="col-10 col-md-8 col-lg-6">
                                    <div className="form-group">

                                        <button className="btn btn-primary form-control" onClick={this.CreateRoom}>
                                            Create Room
                                </button>
                                        <br></br>
                        Name: <input type="text" id="nameOfPlayer" className="form-control" name="nameOfPlayer" onChange={this.handleChangeName} value={this.state.playerName}></input>
                        Room Id: <input type="text" id="roomNumber" className="form-control" name="roomNumber" onChange={this.handleChange} value={this.state.gameId}></input>
                                        <button className="btn btn-primary form-control" onClick={this.JoinRoom}>
                                            Join Room
                                 </button>

                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div id="PlayArea" className="play-area" style={{ display: this.state.showPlayArea ? 'block' : 'none' }}>

                        <div className="alert alert-success" style={{ display: this.state.message !== '' ? 'block' : 'none' }} role="alert">
                            {this.state.message}
                        </div>
                        <div className='row'>
                            <button type="button" class=" mb-3 btn btn-success">
                                Players online: <span class="badge badge-light"> {this.state.players.length}</span>
                            </button>
                            <div class="col-3" style={{ 'float': 'right', display: this.state.rangOfGame !== '' ? 'block' : 'none' }}>
                                <div class={"cardSmall " + (this.state.rangOfGame) + "Small"}></div>
                            </div>
                            <div class="col-3" style={{ 'float': 'right', display: this.state.rangOfGame === '' ? 'block' : 'none' }}>
                                Rang is not selected yet!
                        </div>
                            <div class="col-3" style={{ 'float': 'right', display: this.state.gameMessage !== "" ? 'block' : 'none' }}>
                                {this.state.gameMessage}
                            </div>
                        </div>


                        <br />

                        <div class="row">
                            <div className={"card text-white mb-3 col-3 " + (!this.state.hostTurn ? 'bg-primary' : 'bg-danger')} style={{ 'max-width': '18rem', 'float': 'left' }}>
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
                            <div className={"card text-white  mb-3 col-3 " + (!this.state.player02Turn ? 'bg-success' : 'bg-danger')} style={{ 'max-width': '18rem', 'float': 'right' }}>
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

                            <div className={"card text-white  mb-3 col-3 " + (!this.state.player04Turn ? 'bg-success' : 'bg-danger')} style={{ 'max-width': '18rem', 'float': 'right' }}>
                                <div class="card-header">{this.state.players.length >= 4 ? this.state.players[3].playerName : ""}</div>
                                <div class="card-body">
                                    <h5 class="card-title">
                                        {this.state.players.length >= 4 ? <Results /> : null}
                                    </h5>
                                    <p class="card-text">player joining...</p>
                                </div>
                            </div>
                            <div class="col-3 mb-3" >
                                <div class="deck" style={{ 'float': 'left' }}>
                                    <div class="card" >
                                        <div class="value">{this.state.activeCardPlayer04 != null ? this.mapToCardText(this.state.activeCardPlayer04.value) : ''}
                                        </div>
                                        <div className={this.state.activeCardPlayer04 != null ? this.state.activeCardPlayer04.class : ''}>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-3 mb-3">
                                <div class="deck" style={{ 'float': 'right' }}>
                                    <div class="card" >
                                        <div class="value">{this.state.activeCardPlayer03 != null ? this.mapToCardText(this.state.activeCardPlayer03.value) : ''}
                                        </div>
                                        <div className={this.state.activeCardPlayer03 != null ? this.state.activeCardPlayer03.class : ''}>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={"card text-white  mb-3 col-3 " + (!this.state.player03Turn ? 'bg-primary' : 'bg-danger')} style={{ 'max-width': '18rem', 'float': 'left' }}>
                                <div class="card-header">{this.state.players.length >= 3 ? this.state.players[2].playerName : ""}</div>
                                <div class="card-body">
                                    <h5 class="card-title">
                                        {this.state.players.length >= 3 ? <Results /> : null}
                                    </h5>
                                    <p class="card-text">cards coming...</p>
                                </div>
                            </div>

                        </div>
                        <div class="row">
                            <div className="deck">
                                {cardsItems}
                            </div>
                        </div>
                    </div >
                    <Modal show={this.state.showModal}
                        onHide={() => this.setState({ showModal: false })}>
                        <Modal.Header closeButton>
                            <Modal.Title>{this.state.modalTitle}</Modal.Title>
                        </Modal.Header>

                        <Modal.Body>
                            <p>{this.state.playerWonMessage}</p>
                            <div className="deck">
                                {rangSelectionCards}
                            </div>
                        </Modal.Body>

                        <Modal.Footer>
                            <Button variant="secondary" onClick={this.showModalClose}>Close</Button>
                        </Modal.Footer>
                    </Modal>
                </div >
                <Footer />
            </div>
        );
    }

}
export default Playarea;