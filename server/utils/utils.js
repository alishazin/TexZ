const typeOf = (obj) => {
    return Object.getPrototypeOf(obj).constructor;
}

function checkType(value, type) {

    try {
        if (typeOf(value) === type) return true
        return false
    } catch(err) {
        // null will return false
        return false
    }
    
}

const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

function checkIfExpired(timestamp) {
    return (new Date().getTime() - timestamp.getTime()) > 10 * 60000
}

async function getUserWithId(id, UserModel) {

    return await UserModel.findOne({ _id: id })

}

module.exports = {
    checkType: checkType, 
    validateEmail: validateEmail, 
    checkIfExpired: checkIfExpired,
    getUserWithId: getUserWithId
}