const HealthData = require("../models/healthData");

/**
 * 
 * @param {String} owner _id of the patient as record in the mongoDB
 * @param {String} data_name name of the time series
 * @param {String} comment customise comment of patient 
 * @returns Json packet: status indicate if the action is successful, data can either be the object just save or error message
 */
const insert = async (owner, data_name, comment, value) => {
    let data = await HealthData.create({
        owner: owner,
        time: Date.now(),
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

const insertAndRender = async(req, res) => {
    let result = await insert(req.body.id, req.body.data_name, req.body.comment, req.body.value)
    let directPath = '/patient/'+req.body.id+'/home'
        
    if(result.status){
        res.redirect(directPath)
    } else {
        res.status(404).render('error', {errorCode: '404', message: 'Error occur lead to fail to submit data.'})
    }
}


module.exports = {
    insert,
    insertAndRender,
}