const cloudinary = require('cloudinary');
const fs = require('fs');
require("dotenv").config()

cloudinary.config({
    cloud_name: `${process.env.CLOUD_NAME}`,
    api_key : `${process.env.CLOUD_API_KEY}`,
    api_secret: `${process.env.CLOUD_API_SECRET}`
})

module.exports = {
    uploadMutiple: async (files,  callback) => {

        let queryObj = [];     

        for (let i = 0; i < files.length;i++) {      
                await  cloudinary.v2.uploader.upload(files[i], {
                    folder: "toystrade"
                   }).then(result => {
                    fs.unlinkSync(files[i]); 
                    console.log(result)        
                    queryObj.push(result.secure_url);    
                })
        
        }
        callback(queryObj);    
    },

    reSizeImage: (id, h, w) => {
        return cloudinary.url(id, {
            height:h,
            width: w,
            crop: 'scale',
            format: 'jpg'
        })
    },

    

    deleteMutiple : async (files,  callback) => { 
    for (let i = 0; i < files.length;i++) 
    {         
             cloudinary.uploader.destroy(String(files[i])).then(result => {
                callback(result);    
            }) 
    }
    },
}
 

