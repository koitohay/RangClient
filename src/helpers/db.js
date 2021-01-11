import { db } from "../services/firebase";
import { gatherings } from "../helpers/gatherings";

export function readChats() {
    let abc = [];
    db.ref("chats").on("value", snapshot => {
        snapshot.forEach(snap => {
            abc.push(snap.val())
        });
        return abc;
    });
}

export function writeChats(message) {
    return db.ref("Gatherings").push({
        content: message.content,
        timestamp: message.timestamp,
        uid: message.uid
    });
}