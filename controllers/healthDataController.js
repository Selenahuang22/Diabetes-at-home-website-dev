const HealthData = require("../models/healthData");

/**
 * 
 * @param {String} owner _id of the patient as record in the mongoDB
 * @param {Number} time a long - represent unix time
 * @param {String} name name of the time series
 * @param {String} comment customise comment of patient 
 * @returns Json packet: status indicate if the action is successful, data can either be the object just save or error message
 */
const insert = async (owner, time, name, comment) => {
    let data = await HealthData.create({
        owner: owner,
        time: time, 
        comment: comment,
        name: name
    })

    try{
        data.save()
    } catch(err){
        return {status:false, data: err}
    }
    return {status: true, data: data}
}

module.exports = {
    insert
}