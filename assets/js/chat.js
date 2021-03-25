import {Socket, Presence} from 'phoenix'
class Chat{
    constructor(roomName) {
        this.presences = {}
        this.roomName = roomName
        this.messageInput = document.getElementById("new-message")
        this.messageList = document.getElementById("message-list")
        this.userList =  document.getElementById('user-list')
        this.formatPresences = this.formatPresences.bind(this)
        this.renderPresences = this.renderPresences.bind(this)
        this.renderMessaage = this.renderMessaage.bind(this)
    }
    initialize(){
        //ask for the user name
        this.user = window.prompt('What is your name ? ')  || 'Anonymous'
        // set up the websocket connection
        this.socket = new Socket('/socket', {params: {user: this.user}})
        this.socket.connect()
        // set up room
        this.room = this.socket.channel(this.roomName)
        //Sync presence state
        this.room.on('presence_state', state => {
            this.presences = Presence.syncState(this.presences, state)
            this.renderPresences(this.presences)
        })

        this.room.on('presence_diff', state => {
            this.presences = Presence.syncDiff(this.presences, state)
            this.renderPresences(this.presences)
        })

        //set up new message handler
        this.room.on('message:new',this.renderMessaage)

        //set up input handler
        this.messageInput.addEventListener('keypress', (e) =>{
            if (e.keyCode === 13 && this.messageInput != ''){
                this.room.push('message:new', this.messageInput.value)
                this.messageInput.value = ''
            }
        })

        // join room
        this.room.join()

    }

    formatTimestamp(timestamp){
        let date = new Date(timestamp)
        return date.toLocaleString()
    }
    renderMessaage(message){
        let messageElement = document.createElement('li')
        messageElement.innerHTML = `
        <b>${message.user}</b>
        <i>${this.formatTimestamp(message.timestamp)}</i>
        <p>${message.body}</p>
        `
        this.messageList.appendChild(messageElement)
        this.messageList.scrollTop = this.messageList.scrollHeight
    }

    formatPresences(presences){
        return Presence.list(presences, (user, {metas})=> {
            return {
                user: user,
                onlineAt: this.formatTimestamp(metas[0].online_at)
            }
        })
    }

    renderPresences(presences){
        let html = this.formatPresences(presences).map(presence =>
            `<li> 
            ${presence.user} 
            </br> 
            <small>online since ${presence.onlineAt}</small>
            </li>`).join('')
        this.userList.innerHTML = html

    }
}
export default Chat
