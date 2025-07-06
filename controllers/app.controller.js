const EmpModel = require("../models/emp.model");
const fs = require("fs");
const path = require("path");

class AppController {
    async getForm(req, res) {
        try {
            res.render('form', {
                title: "Form"
            });
        } catch (err) {
            throw err;
        }
    }

    async submitForm(req, res) {
    try {
        const { fullName, email, skills } = req.body;

        // Validate required fields
        if (!fullName || !email || !skills || !req.file) {
            console.log("All fields are required.");
            return res.redirect("/add-dev");
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.log("Invalid email format.");
            return res.redirect("/add-dev");
        }

        // Check for duplicate email
        const existingEmail = await EmpModel.findOne({ email, isDeleted: false });
        if (existingEmail) {
            console.log("Email already exists.");
            return res.redirect("/add-dev");
        }

        // Validate resume is PDF
        const resumeFile = req.file;
        if (resumeFile.mimetype !== "application/pdf") {
            console.log("Resume must be a PDF file.");
            return res.redirect("/add-dev");
        }

        // Convert skills to array
        const skillsArray = skills
            .split(",")
            .map(s => s.trim())
            .filter(s => s);

        // Prepare user object
        const userObj = {
            fullName,
            email,
            skills: skillsArray,
            resumePdf: resumeFile.filename,
            isDeleted: false
        };

        await EmpModel.create(userObj);
        res.redirect("/add-dev");
    } catch (err) {
        console.log(err);
        return res.redirect("/add-dev");
    }
}

    async getList(req, res) {
        try {
            let allData = await EmpModel.find({ isDeleted: false }).sort({ fullName: 1 });
            res.render('list', {
                title: "List",
                allData
            });
        } catch (err) {
            throw err;
        }
    }

    async getEditForm(req, res) {
        try {
            let empId = req.params.id;
            let empData = await EmpModel.findById(empId);
            res.render('edit', {
                title: "Edit Form",
                empData
            });
        } catch (err) {
            throw err;
        }
    }

    async updateEmp(req, res) {
        try {
            let empId = req.params.id;
            const { fullName, email, skills } = req.body;

            // Validate required fields
            if (!fullName || !email || !skills) {
                console.log("All fields are required.");
                return res.redirect(`/edit/${empId}`);
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                console.log("Invalid email format.");
                return res.redirect(`/edit/${empId}`);
            }

            // Check for duplicate email (excluding current)
            const existingEmail = await EmpModel.findOne({ email, isDeleted: false, _id: { $ne: empId } });
            if (existingEmail) {
                console.log("Email already exists.");
                return res.redirect(`/edit/${empId}`);
            }

            // Prepare update object
            let updateObj = {
                fullName,
                email,
                skills: skills.split(",").map(s => s.trim()).join(",")
            };

            // Handle resume update
            if (req.files && req.files.resumePdf && req.files.resumePdf[0]) {
                const resumeFile = req.files.resumePdf[0];
                if (resumeFile.mimetype !== "application/pdf") {
                    console.log("Resume must be a PDF file.");
                    return res.redirect(`/edit/${empId}`);
                }
                // Remove old resume file
                const emp = await EmpModel.findById(empId);
                if (emp && emp.resumePdf) {
                    const oldPath = path.join(__dirname, "../uploads", emp.resumePdf);
                    if (fs.existsSync(oldPath)) {
                        fs.unlinkSync(oldPath);
                    }
                }
                updateObj.resumePdf = resumeFile.filename;
            }

            await EmpModel.findByIdAndUpdate(empId, updateObj, { new: true });
            res.redirect("/");
        } catch (err) {
            console.log(err);
            return res.redirect(`/edit/${req.params.id}`);
        }
    }

    // Hard delete with resume removal
    async deleteEmp(req, res) {
        try {
            console.log("Delete route hit with ID:", req.params.id);
            let empId = req.params.id;
            const emp = await EmpModel.findById(empId);

            if (emp && emp.resumePdf) {
                const filePath = path.join(__dirname, "../public/uploads", emp.resumePdf);
                console.log("File path:", filePath);

                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log("File deleted");
                }
            }

            await EmpModel.findByIdAndDelete(empId);
            console.log("Employee deleted from DB");
            res.redirect("/");
        } catch (err) {
            console.log("Delete error:", err);
            res.redirect("/");
        }
    }
}

module.exports = new AppController();
