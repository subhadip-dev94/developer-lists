const route = require('express').Router();
const appController = require("../controllers/app.controller")
const FileUploader = require('../helper/fileUpload');

const fileUpload = new FileUploader({
    folderName: "public/uploads",
    supportedFiles: ["application/pdf"],
    fieldSize: 1024 * 1024 * 5
});

const uploadFields = fileUpload.upload().single('resumePdf');

route.get('/add-dev', appController.getForm);
route.post('/submit-form', uploadFields, appController.submitForm);
route.get('/', appController.getList);
route.post('/delete/:id', appController.deleteEmp);
route.get('/edit/:id', appController.getEditForm);
route.post('/update-form/:id', uploadFields, appController.updateEmp);

module.exports = route;