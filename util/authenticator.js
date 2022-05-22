const bcrypt = require("bcrypt")
const Patient = require("../models/patient")
const Clinician = require("../models/clinician")

const SALT_ROUND = 10
const INVALID_CHARACTER = "!?*&$#~=+-[{}] ,.<>/\|@()"

const generateHash = async (argv, cb) => {
    bcrypt.genSalt(SALT_ROUND, function(err, salt) {
        if(err){
            return
        }
        bcrypt.hash(argv.password, salt, async function(err, hash) {
            // Store hash in your password DB.
            if(err){
                console.log(err);
                return
            }
            await cb(argv, hash)
        });
    });
}

const checkHash = async (password, hash, cb) => {
    bcrypt.compare(password, hash, async (err, valid) => {
        await cb(err, valid)
    })
}

module.exports = {
    generateHash,
    checkHash,
}