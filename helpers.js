import { userData } from "./data/index.js"
import { ObjectId } from 'mongodb';


/**
 * Given a list of arguments, check if all arguments exist
 * @param {Array} args List of arguments
 * @usage await checkInputsExistence(Array.from(arguments));
 */
export async function checkInputsExistence(args) {
    for (let i = 0; i < args.length; i++) {
        const currArg = args[i]
        if (typeof currArg !== 'boolean') {
            if (!currArg)
                throw new Error("Inputs must exist")
        }
    }
}

/**
 * Validate if input is an array 
 * @param {Array} array array input
 * @param {String} array_name Name of array input 
 */
async function isArray(array, array_name) {
    if (arguments.length !== 2)
        throw new Error("isArray function must only have 2 arguments");

    await checkInputsExistence(Array.from(arguments));

    if (Array.isArray(array) === false)
        throw new Error(`${array_name} should be an array input`)

    await checkInputsExistence(array);
}

/**
 * Validate if an input is a string 
 * @param {String} str String input
 * @param {String} str_name Name of string input 
 */
export async function isStr(str, str_name) {
    if (arguments.length !== 2)
        throw new Error("isStr function must only have 2 arguments");
    await checkInputsExistence(Array.from(arguments));

    if (typeof str_name !== 'string')
        throw new Error(`${str_name} input must be a string`)

    if (typeof str === 'string' && str.trim().length !== 0)
        return;

    throw new Error(`${str_name} input must be a non-empty string`)
}

/**
 * Given an input, check if it is a valid number
 * @param {String} num num input 
 * @param {String} num_name Name of num input 
 */
async function isNum(num, num_name) {
    await checkInputsExistence(Array.from(arguments));
    if (arguments.length !== 2)
        throw new Error("isNum arguments should have 2 arguments")

    if (typeof num_name !== 'string')
        throw new Error(`${num_name} input must be a string`)

    if (typeof num === 'number')
        return;

    throw new Error(`${num_name} input must be a number`)
}

/**
 * Check if number of arguments inputted is equal to intended number of arguments
 * @param  {Array[string]} currArgs: Current function arguments
 * @param  {number} intendedNumArgs: Intended number of arguments 
 * @param {string} functionName: Function that called this function -- used for debugging 
 * 
 */
export async function checkNumArguments(...args) {
    const function_arguments = args;

    // Check if all inputs all exist
    checkInputsExistence(function_arguments);

    // Check if function was called with the correct number of arguments
    if (function_arguments.length !== 3)
        throw new Error(`Invalid number of arguments`);

    // Validate each input are of the correct type
    const currArgs = function_arguments[0];
    const intendedNumArgs = function_arguments[1];
    const functionName = function_arguments[2];
    isStr(functionName, `checkNumArguments call doesnt have function name`)
    isArray(currArgs, `checkNumArguments call from function: ${functionName}`)
    isNum(intendedNumArgs, `checkNumArguments call from function: ${functionName}`)

    // Validate that number of arguments is valid 
    if (currArgs.length !== intendedNumArgs)
        throw new Error(`Invalid number of arguments from function: ${functionName}`);
}

/**
 * Check if number of arguments inputted is equal to intended number of arguments
 * @param {Number} actualNumArguments Actual number of arguments
 * @param {Number} intendedNumArguments Intended number of arguments
 * @returns if number of arguments are equal to intended number of arguments, throw an error otherwise
 */
async function checkNumArgs(actualNumArguments, intendedNumArguments) {
    await checkInputsExistence(Array.from(arguments));
    await isNum(actualNumArguments, "actualNumArguments");
    await isNum(intendedNumArguments, 'intendedNumArguments');

    if (actualNumArguments !== intendedNumArguments)
        throw new Error("Invalid number of arguments");
    return;
}

/**
 * Checks if string is alphanumeric
 * @param {String} str Input string 
 * @returns if string input is alphanumeric
 */
async function isAlphaNumeric(str, str_name) {
    await checkNumArgs(arguments.length, 2);
    await checkInputsExistence(Array.from(arguments));
    await isStr(str, "str");
    await isStr(str_name, "str_name");

    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        const ascii_char = char.charCodeAt(0);
        if (!(ascii_char >= 65 && ascii_char <= 90) &&
            !(ascii_char >= 97 && ascii_char <= 122) &&
            !(ascii_char >= 48 && ascii_char <= 57) &&
            !(ascii_char == 32)) {
            throw new Error(`${str_name} must consist of letters and numbers only:
            String: ${str}
            Letter Value: ${char}
            ASCII Value: ${ascii_char}
            `);
        }
    }
};

/**
 * Checks if length of string is equal or greater than than the minimum provided 
 * @param {String} str String input
 * @param {Number} minLength Minimum length string can be
 * @returns if length of string is equal or greater than mminLength otherwise false
 */
async function minStrLength(str, minLength, str_name) {
    await checkNumArgs(arguments.length, 3);
    await checkInputsExistence(Array.from(arguments));
    await isStr(str, 'str');
    await isNum(minLength, 'minLength')

    if (str.length < minLength)
        throw new Error(`${str_name} string length must be at least ${minLength}`);
    return;
}

/**
 * Given a list of arguments, if the element in the array is a string, trim it 
 * @param {Array} args List of arguments
 * @returns Trimmed Arguments   
 */
export async function trimArguments(args) {
    await checkNumArgs(arguments.length, 1);
    await isArray(args, 'args');
    await checkInputsExistence(args);

    for (let i = 0; i < args.length; i++) {
        if (typeof args[i] === 'string') {
            args[i] = args[i].trim();
        }
    }
    return args;
}

/**
 * Given a string input, check if str input only contains letters 
 * @param {String} str String input
 * @param {String} str_name Name of string input  
 */
async function isAlphabetic(str, str_name) {
    await checkNumArgs(arguments.length, 2);
    await checkInputsExistence(Array.from(arguments));
    await isStr(str, "str");
    await isStr(str_name, "str_name");

    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        const ascii_char = char.charCodeAt(0);
        if (!(ascii_char >= 65 && ascii_char <= 90) && !(ascii_char >= 97 && ascii_char <= 122) && (ascii_char != 32)) {
            throw new Error(`${str_name} must consist of letters only:
            String: '${str}'
            Letter Value: '${char}'
            ASCII Value: '${ascii_char}'
            `);
        }
    }
};

/**
 * Checks if object input is actually an object. If not, it will throw an error 
 * @param {Object} object Object input
 * @param {String} object_str Name of Object input
 */
async function isObject(object, object_str) {
    await checkNumArgs(arguments.length, 2);
    await checkInputsExistence(Array.from(arguments));

    // Check if the input is an array
    if (Array.isArray(object)) {
        // Ensure each element in the array is an object
        for (const item of object) {
            if (typeof item !== 'object' || item === null || Array.isArray(item)) {
                throw new Error(`${object_str} input must be an array of objects`);
            }
        }
    } else {
        // Check if the input is a singular object
        if (typeof object !== 'object' || object === null) {
            throw new Error(`${object_str} input must be an object input`);
        }
    }
}


/**
 * Validates if name input is valid
 * @param {String} name 
 */
export async function validateName(name, nameStr) {
    await checkNumArgs(arguments.length, 2);
    await checkInputsExistence(Array.from(arguments));

    // Check that name is a non-empty string
    await isStr(nameStr, "NameofValidateNameStr");
    await isStr(name, nameStr);

    // Check that the name is alphabetic
    await isAlphabetic(name, nameStr);
}

/**
 * Validates if input is a valid email address
 * @param {String} emailAdress Email input
 * @returns Boolean if input is an email
 * @reference https://regexr.com/3e48o
 */
export async function validateEmail(emailAdress, emailAddressStr) {
    await checkNumArgs(arguments.length, 2);
    await checkInputsExistence(Array.from(arguments));
    await isStr(emailAddressStr, `emailAddressStr invalid`)
    await isStr(emailAdress, emailAddressStr);

    let regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (emailAdress.match(regex))
        return true;
    else
        throw new Error(`${emailAddressStr} is not a valid email address`)
}

/**
 * Validate if age input is valid
 * @param {Number} age Age input 
 * @param {Number} ageStr Name of funnction that called age
 */
export async function validateAge(age, ageStr) {
    await checkNumArgs(arguments.length, 2);
    await checkInputsExistence(Array.from(arguments));
    
    await isStr(ageStr, 'validateAgeStr');
    await isNum(age, ageStr);

    if (age < 18 || age > 100)
        throw new Error("Age must be between 18-100");
}

/**
 * Validate if username input is valid
 * @param {String} username Username input
 * @param {String} usernameStr Source of username input 
 */
export async function validateUsername(username, usernameStr) {
    // Validate inputs 
    await checkNumArgs(arguments.length, 2);
    await checkInputsExistence(Array.from(arguments));
    await isStr(usernameStr, 'validateUsernameStr');
    await isStr(username, usernameStr);

    // Get all users and check if username is unique
    const users = await userData.getAllUsers();
    for (let i = 0; i < users.length; i++){
        const currUser = users[i];
        if (username === currUser.username) {
            throw new Error(`Username: ${username} already in use!`);
        }
    }
}

/**
 * Check if ID input is valid and returns trimmed ID 
 * @param {String} id Potential movie ID 
 * @returns trimmed movie ID 
 */
export async function validateIdAndReturnTrimmedId(id) {
    await checkNumArgs(arguments.length, 1);
    await checkInputsExistence(Array.from(arguments));
    await isStr(id, "validateUserId");

    id = await trimArguments(Array.from(arguments));
    id = id[0];

    if (!ObjectId.isValid(id))
        throw new Error(`User ID: ${id} not found`);

    return id;
}

/**
 * 
 * @param {Array[String]} userIds List of User Ids to check
 * @param {String} listName Name of list 
 */
export async function validateListUserIds(userIds, listName) {
    // Validate inputs 
    await checkNumArgs(arguments.length, 2);
    await checkInputsExistence(Array.from(arguments));
    await isStr(listName, "validateListUserIds");
    await isArray(userIds, userIds);

    // Loop through all user ids, if all user ids are valid nothing happens 
    // If user id is invalid, it throws an error 
    for (let i = 0; i < userIds.length; i++){
        const currUser = userIds[i];
        await userData.getUserById(currUser._id);
    }
}

/**
 * Function that returns today's date and time in MM/DD/YYYY HH:MM:SS format
 * @returns Today's date and time in MM/DD/YYYY HH:MM:SS format
 */
export async function getTodayDate() {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();

    const hh = String(today.getHours()).padStart(2, '0');
    const mn = String(today.getMinutes()).padStart(2, '0');
    const ss = String(today.getSeconds()).padStart(2, '0');

    return `${mm}/${dd}/${yyyy} ${hh}:${mn}:${ss}`;
}

/**
 * Updates collection by only adding or removing unique elements
 * @param {Object} collection MongoDB Collection
 * @param {string} documentId ID of Document
 * @param {string} action Input 'add' or 'remove' depending on action
 * @param {string} arrayField Name of array input to update 
 * @param {*} value Value to be adding or removing 
 * @param {String} functionName Name of the function where its being called from 
 * @returns MongoDB Object that was added to or removed from
 */
export async function updateUniqueElementInList(collection, documentId, action, arrayField, value, functionName) {
    // Validate inputs 
    await checkNumArgs(arguments.length, 6);
    await checkInputsExistence(Array.from(arguments));
    await isStr(functionName, "updateUniqueElementInList-functionName");
    await isObject(collection, `${functionName}-collection`);
    await isStr(documentId, `${functionName}-documentId`);
    await isStr(action, `${functionName}-action`);
    await isStr(arrayField, `${functionName}-arrayField`);
    // ? How to validate what type of input value is? should it always be a string? 

    let updateOperation;

    if (action === 'add') {
        updateOperation = { $addToSet: { [arrayField]: value } };
    } else if (action === 'remove') {
        updateOperation = { $pull: { [arrayField]: value } }; 
    } else {
        throw new Error("Invalid action. Use 'add' or 'remove'.");
    }

    const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(documentId) },
        updateOperation,
        { returnDocument: 'after' }
    );

    return result; 
}

export async function removeElementFromAllDocuments(collection, arrayField, value, functionName){
    // Validate inputs 
    await checkInputsExistence(Array.from(arguments));
    await checkNumArgs(arguments.length, 4);
    await isStr(functionName, "removeElementFromAllDocuments-functionName");
    await isObject(collection, `${functionName}-collection`);
    await isStr(arrayField, `${functionName}-arrayField`);
    // ? Should Input value always be a string? 

    // Remove all instances of value from all arrayField in all documents
    const updateOperation = { $pull: { [arrayField]: value } }; 
    collection.updateMany(
        {}, 
        updateOperation
     );
}

/**
 * Given an array of JSONs, append the associated user JSON thats connected to the userId element
 * @param {Array[JSON]} inputJsons List of JSONs that must have the 'userId' key
 * @param {String} functionName Name of function
 * @returns Array of Objects with associated user object appended
 */
export async function addUserJsonToInput(inputJsons, functionName) {
    // Validate inputs 
    await checkInputsExistence(Array.from(arguments));
    await checkNumArgs(arguments.length, 2);
    await isObject(inputJsons, `${functionName}-inputJsons`);

    // Add user json to input json with the key 'user'
    for (let i = 0; i < inputJsons.length; i++) {
        const inputJson = inputJsons[i];
        const userId = inputJson.userId;
        if (userId !== undefined) {
            const userJson = await userData.getUserById(userId); 
            inputJson.user = userJson;
        }
    }
    return inputJsons;
}

/**
 * Given an array of UserIDs, return a list of JSON objects for each associated user
 * @param {Array[String]} userIds List of UserIDs
 * @param {String} functionName Name of function
 * @returns Array of JSON objects with associated user data
 */
export async function getUserJsonsFromUserIds(userIds, functionName) {
    // Validate inputs 
    await checkInputsExistence(Array.from(arguments));
    await checkNumArgs(arguments.length, 2);
    await isArray(userIds, `${functionName}-userIds`);

    // Initialize an array to hold the user JSON results
    const userJsons = [];

    // Retrieve user JSON for each UserID
    for (let i = 0; i < userIds.length; i++) {
        const userId = userIds[i];
        if (userId !== undefined) {
            const userJson = await userData.getUserById(userId);
            if (userJson) {
                userJsons.push(userJson); 
            }
        }
    }
    return userJsons; 
}