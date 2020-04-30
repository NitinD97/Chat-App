const socket = io();

// ELEMENTS
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $locationShareButton = document.querySelector('#locationShare');
const $messages = document.querySelector('#messages');

//templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-share-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix:true });

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild;

    // Height of new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // Visible height
    const visibleHeight = $messages.offsetHeight;

    // messages container height
    const messagesContainerHeight = $messages.scrollHeight;

    // How much has been scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if ((messagesContainerHeight-newMessageHeight) <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;
    }


};

socket.on('toMessageClientEvent', (messageObject) => {
    const html = Mustache.render(messageTemplate, {
        username: messageObject.username,
        message: messageObject.text,
        createdAt: moment(messageObject.createdAt).format('h:mm A')
    });
    $messages.insertAdjacentHTML('beforeend', html);
});


socket.on('toLocationShareClientEvent', (locationObject) => {
    // console.log(message);
    const html = Mustache.render(locationTemplate, {
        username: locationObject.username,
        locationUrl: locationObject.url,
        createdAt: moment(locationObject.createdAt).format('h:mm A')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll()
});


$messageForm.addEventListener('submit', (event) => {
    // stop page refresh on submit
    event.preventDefault();

    // disable submit button
    $messageFormButton.setAttribute('disabled', 'disabled');

    const msg = $messageFormInput.value;
    socket.emit('toMessageServerEvent', msg, (error) => {
        // enable submit button
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();
        autoscroll()
        if (error){
            return console.log(error);
        }
    });
});


$locationShareButton.addEventListener('click', (event) => {
    if (!navigator.geolocation) {
        return alert('Browser does not support this feature');
    }

    // disable button
    $locationShareButton.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('toLocationShareServerEvent', {lat: position.coords.latitude, long: position.coords.longitude}, () => {
            // enable button
            $locationShareButton.removeAttribute('disabled');
            $messageFormInput.focus();
            console.log('Shared!')

        });
    });
});


socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = '/';
    }
});

socket.on('toRoomDataClientEvent', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    });
    document.querySelector('#sidebar').innerHTML = html;
});