const users = [];
const MAX_USER_LIMIT = parseInt(process.env.MAX_USER_LIMIT, 10);

// Add user
const addUser = ({ id, username, room }) => {
    // check for max user limit
    if (users.length >= MAX_USER_LIMIT) {
        return { error: 'Max user limit exceeded!' }
    }

    // clean data
    username = username.trim();
    room = room.trim().toLowerCase();

    // validate the data
    if (!username || !room) {
        return { error: 'username and room are required!' }
    }

    // check if username already exists in a room
    const existingUser = users.find((user) => user.room === room && user.username.toLowerCase() === username.toLowerCase() );

    // validate
    if (existingUser) {
        return { error: 'Username is already in use!' }
    }

    // store user
    const user = { id, username, room };
    users.push(user);
    return user;

};

// Remove User
const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id);
    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
};

// Get User
const getUser = (id) => {
    return users.find((user) => user.id === id );
};

// Get Users in a room
const getUsersInRoom = (room) => {
    return  users.filter((user) => user.room === room );
};

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
};
