import React, { Component } from "react";
import { db } from "../services/firebase";

export default class PlayArea extends Component {
    Users = [];

    constructor(props) {
        super(props);
        this.state = {
            error: null,
            db: db,
            roomName:this.roomName || 'globe',
            room: null,
            myName: '',
            user: null
        };

        this.join = this.join.bind(this);
        this.leave = this.leave.bind(this);
        this.over = this.over.bind(this);
        this.randomName = this.randomName.bind(this);

        this.setState({room: this.db.ref("gatherings/" + encodeURIComponent(this.roomName))});

        // Add user to presence list when online.
        var self = this;
        var presenceRef = this.db.ref(".info/connected");
        presenceRef.on("value", function(snap) {
            if (snap.val()) {
                self.user.onDisconnect().remove();
                self.user.set(self.myName);
                self.users.push(snap.user);
            }
        });
    }

    join (uid, displayName) {
        if(this.user) {
            console.error('Already joined.');
            return false;
        }

        this.setState({myName: this.displayName || 'Anonymous - '+ this.randomName()});
        this.setState({user: uid ? this.room.child(uid) : this.room.push()});
        
        // Add user to presence list when online.
        var self = this;
        var presenceRef = this.db.ref(".info/connected");
        presenceRef.on("value", function(snap) {
            if (snap.val()) {
                self.user.onDisconnect().remove();
                self.user.set(self.myName);
                self.users.push(snap.user);
            }
        });
    }

    leave() {
        this.user.remove();
        this.myName = '';
    };

    over () {
        this.room.remove();
    };

    randomName () {
        return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
    };

    render(){
return (
        <div>
            <span> Welcome to the rang game</span>
            <div>
      {this.Users.map(data => (
        <p>{data.name}</p>
      ))}
    </div>
        </div>
    );
    }
}