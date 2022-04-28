const HealthData = require("../models/healthData");

/**
 * 
 * @param {String} owner _id of the patient as record in the mongoDB
 * @param {Number} time a long - represent unix time
 * @param {String} data_name name of the time series
 * @param {String} comment customise comment of patient 
 * @returns Json packet: status indicate if the action is successful, data can either be the object just save or error message
 */
const insert = async (owner, time, data_name, comment, value) => {
    let data = await HealthData.create({
        owner: owner,
        time: time, 
        comment: comment,
        data_name: data_name,
        value: value
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