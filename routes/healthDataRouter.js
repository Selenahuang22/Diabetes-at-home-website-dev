const express = require('express')

// create our Router object
const healthDataRouter = express.Router()
const healthDataController = require("../controllers/healthDataController")

healthDataRouter.all(
    '/record',
    (req, res) => {
        let result = healthDataController.insert(req.body.id, req.body.time, req.body.data_name, req.body.comment)
        let directPath = '/patient/'+req.body.id+'/home'
        
        if(result.status){
            res.redirect(directPath)
        }else{
            console.log(
                "fail"
            );
            res.sendStatus(404)
        }
    }
)

module.exports = healthDataRouter