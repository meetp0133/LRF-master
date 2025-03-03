const helper = require("../helpers/file-creating");
const { createDir, writeFile } = require("../helpers/file-creating");
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const { exec } = require("child_process");
const { default: simpleGit } = require("simple-git");

// API to generate project
module.exports.masterLRF = async (req, res) => {
    const { projectTitle, models } = req.body;

    if (!projectTitle) {
        return res.status(400).json({ error: "Project title is required." });
    }
    const projectPath = path.join(__dirname, "../../generatedProject/", projectTitle);
    const projectSrcPath = path.join(__dirname, "../../generatedProject", `${projectTitle}/src`);
    console.log('projectSrcPatht', projectSrcPath);
    // return false
    try {

        // 1. Create Base Structure
        createDir(projectPath);

        // 2. Generate package.json
        const packageJson = {
            name: projectTitle,
            version: "1.0.0",
            main: "index.js",
            scripts: {
                start: "node src/index.js",
                dev: "nodemon src/index.js"
            },
        };
        writeFile(
            path.join(projectPath, "package.json"),
            JSON.stringify(packageJson, null, 2),
            (err) => {
                if (err) throw err;
                console.log("Package.json file generated successfully!");
            }
        );

        // 3. Generate Project stricture
        createDir(path.join(projectSrcPath, "models"));
        createDir(path.join(projectSrcPath, "routes"));
        createDir(path.join(`${projectSrcPath}/routes`, "/api/v1"));
        createDir(path.join(`${projectSrcPath}/routes`, "/admin"));
        createDir(path.join(projectSrcPath, "controller"));
        createDir(path.join(`${projectSrcPath}/controller`, "/v1"));
        createDir(path.join(`${projectSrcPath}/controller`, "/admin"));
        createDir(path.join(projectSrcPath, "connection"));
        createDir(path.join(projectSrcPath, "middleware"));
        createDir(path.join(projectSrcPath, "validations"));
        createDir(path.join(projectSrcPath, "helpers"));
        createDir(path.join(projectSrcPath, "transformer"));
        createDir(path.join(projectSrcPath, "services"));
        createDir(path.join(projectSrcPath, "view"));
        createDir(path.join(projectSrcPath, "i18n"));
        createDir(path.join(projectPath, "config"));

        // Initialize git if requested
        // if (config.git) {
        //     const git = simpleGit(projectPath);
        //     await git.init();
        //     helper.writeFile(`${projectPath}`, '', '.gitignore', helper.generateGitIgnore());

        //     // await git.add('.');
        //     // await git.commit('Initial commit');
        // }

        // // Open project in VS Code if requested
        // if (config.openCode) {
        //     exec(`cd ${projectPath} && code .`)
        // }


        // Generate .ENV
        const envJson = helper.envJson(projectTitle)
        console.log('------>.env Created');
        writeFile(
            path.join(projectPath, ".env"),
            envJson
        );

        // Generate Config.json
        const configJson = helper.keyJson()
        console.log('------>Config file Created');
        writeFile(
            path.join(`${projectPath}/config/`, "key.js"),
            configJson
        );

        // Generate Constants.js
        const constantsJson = helper.constantsJson()
        console.log('------>constances file Created');
        writeFile(
            path.join(`${projectPath}/config/`, "constants.js"),
            constantsJson
        );

        // Generate Db.js
        const dbJson = helper.dbJson()
        console.log('------>Conection file Created');
        writeFile(
            path.join(`${projectSrcPath}/connection/`, "db.js"),
            dbJson
        );

        // Generate i18n file
        console.log('------> I18n file Created');
        const i18nJson = helper.i18nJson()
        writeFile(
            path.join(`${projectSrcPath}/i18n/`, "i18n.js"),
            i18nJson
        );

        // Generate Startup service
        const startUpService = helper.startUpService()
        console.log('------>StartUp file Created');
        writeFile(
            path.join(`${projectSrcPath}/services/`, "startUpService.js"),
            startUpService
        );

        //Copy helper and index files
        helper.copyHelperFunction(projectTitle, "dateFormat.helper.js", "", "src/helpers")
        helper.copyHelperFunction(projectTitle, "helper.js", "", "src/helpers")
        helper.copyHelperFunction(projectTitle, "loggerService.js", "", "src/helpers")
        helper.copyHelperFunction(projectTitle, "response.helper.js", "", "src/helpers")
        helper.copyHelperFunction(projectTitle, "response.helper.js", "", "src/helpers")
        helper.copyHelperFunction(projectTitle, "mailer.js", "", "src/helpers")
        helper.copyHelperFunction(projectTitle, "index.js", "../", "src/")

        //Controllers
        helper.copyHelperFunction(projectTitle, "user.controller.js", "../controller/v1/", "src/controller/v1")
        helper.copyHelperFunction(projectTitle, "admin.controller.js", "../controller/admin/", "src/controller/admin")
        helper.copyHelperFunction(projectTitle, "cms.controller.js", "../controller/admin/", "src/controller/admin")

        //Transformer
        helper.copyHelperFunction(projectTitle, "user.transformer.js", "../transformer", "src/transformer")
        helper.copyHelperFunction(projectTitle, "admin.transformer.js", "../transformer", "src/transformer")
        helper.copyHelperFunction(projectTitle, "cms.transformer.js", "../transformer", "src/transformer")

        //Middleware
        helper.copyHelperFunction(projectTitle, "uploadImage.js", "../middleware", "src/middleware")
        helper.copyHelperFunction(projectTitle, "user.auth.js", "../middleware", "src/middleware")

        //Routes
        helper.copyHelperFunction(projectTitle, "common.routes.js", "../routes/", "src/routes")
        helper.copyHelperFunction(projectTitle, "user.route.js", "../routes/api/v1", "src/routes/api/v1/")
        helper.copyHelperFunction(projectTitle, "admin.route.js", "../routes/admin", "src/routes/admin/")
        helper.copyHelperFunction(projectTitle, "cms.route.js", "../routes/admin", "src/routes/admin/")

        //Validation
        helper.copyHelperFunction(projectTitle, "user.validation.js", "../validations", "src/validations/")
        helper.copyHelperFunction(projectTitle, "admin.validation.js", "../validations", "src/validations/")
        helper.copyHelperFunction(projectTitle, "cms.validation.js", "../validations", "src/validations/")

        //Email templates
        helper.copyHelperFunction(projectTitle, "forgot-password.ejs", "../view", "src/view/")
        helper.copyHelperFunction(projectTitle, "otp-verification.ejs", "../view", "src/view/")
        helper.copyHelperFunction(projectTitle, "resend-otp-verification.ejs", "../view", "src/view/")
        helper.copyHelperFunction(projectTitle, "welcome-user.ejs", "../view", "src/view/")


        // 4. Generate Models
        helper.generateSchemaFile(`${projectSrcPath}/models`, models)
        helper.generateSchemaFileForAdmin(`${projectSrcPath}/models`, {
            name: "admin"
        })
        helper.generateSchemaFileForCMS(`${projectSrcPath}/models`, {
            name: "cms"
        })

        // 5. Install Dependencies (Optional)
        let dependencies = ["bcryptjs", "cors", "dotenv", "ejs", "express", "helmet", "i18n", "joi", "express-rate-limit",
            "joi-objectid", "jsonwebtoken", "moment", "mongoose", "multer", "nodemailer", "winston", "morgan"]
        if (dependencies && dependencies.length) {
            exec(
                `npm install ${dependencies.join(" ")}`,
                { cwd: projectPath },
                (err) => {
                    if (err) {
                        console.error("Error installing dependencies", err);
                    }
                }
            );
        }


        // 6. Zip the Project
        setTimeout(() => {
            const zipDir = path.join(__dirname, `../../../`);
            if (!fs.existsSync(zipDir)) {
                fs.mkdirSync(zipDir, { recursive: true });
            }


            console.log('__dirname------------', __dirname);

            const zipPath = path.join(zipDir, `${projectTitle}.zip`);
            console.log('zipPath------------', zipPath);

            const output = fs.createWriteStream(zipPath);
            const archive = archiver("zip", { zlib: { level: 9 } });

            output.on("close", () => {
                const downloadLink = `/downloads/${projectTitle}.zip`;
                res.json({ message: "Project created successfully!", downloadLink });
            });

            archive.pipe(output);
            archive.directory(projectPath, false);
            archive.finalize();
        }, 20000)

        // return res.send({ message: "project created" })
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to generate project." });
    }
};


// module.exports.masterLRFNew = async (req, res) => {
//     const { projectTitle, models } = req.body;

//     if (!projectTitle) {
//         return res.status(400).json({ error: "Project title is required." });
//     }
//     const projectPath = path.join(__dirname, "../../../", projectTitle);
//     const projectSrcPath = path.join(__dirname, "../../../", `${projectTitle}/src`);
//     console.log('projectSrcPatht', projectSrcPath);
//     // return false
//     try {

//         // 1. Create Base Structure
//         createDir(projectPath);

//         // 2. Generate package.json
//         const packageJson = {
//             name: projectTitle,
//             version: "1.0.0",
//             main: "index.js",
//             scripts: {
//                 start: "node src/index.js",
//                 dev: "nodemon src/index.js"
//             },
//         };
//         writeFile(
//             path.join(projectPath, "package.json"),
//             JSON.stringify(packageJson, null, 2),
//             (err) => {
//                 if (err) throw err;
//                 console.log("Package.json file generated successfully!");
//             }
//         );

//         // 3. Generate Project stricture
//         createDir(path.join(projectSrcPath, "models"));
//         createDir(path.join(projectSrcPath, "routes"));
//         createDir(path.join(`${projectSrcPath}/routes`, "/api/v1"));
//         createDir(path.join(projectSrcPath, "controllers"));
//         createDir(path.join(`${projectSrcPath}/controllers`, "v1"));
//         createDir(path.join(projectSrcPath, "connection"));
//         createDir(path.join(projectSrcPath, "validation"));
//         createDir(path.join(projectSrcPath, "helpers"));
//         createDir(path.join(projectSrcPath, "transformer"));
//         createDir(path.join(projectSrcPath, "views"));
//         createDir(path.join(`${projectSrcPath}/views`, "emails"));
//         createDir(path.join(projectSrcPath, "i18n"));
//         createDir(path.join(projectPath, "config"));

//         // Generate .ENV
//         const envJson = helper.envJson(projectTitle)
//         writeFile(
//             path.join(projectPath, ".env"),
//             envJson
//         );

//         // Generate Config.json
//         const configJson = helper.keyJson()
//         writeFile(
//             path.join(`${projectPath}/config/`, "key.js"),
//             configJson
//         );

//         // Generate Constants.js
//         const constantsJson = helper.constantsJson()
//         writeFile(
//             path.join(`${projectPath}/config/`, "constants.js"),
//             constantsJson
//         );

//         // Generate Db.js
//         const dbJson = helper.dbJson()
//         writeFile(
//             path.join(`${projectSrcPath}/connection/`, "db.js"),
//             dbJson
//         );

//         // Generate i18n file
//         const i18nJson = helper.i18nJson()
//         writeFile(
//             path.join(`${projectSrcPath}/i18n/`, "i18n.js"),
//             i18nJson
//         );

//         //Copy helper and index files
//         helper.copyHelperFunction(projectTitle, "dateFormat.helper.js", "", "src/helpers")
//         helper.copyHelperFunction(projectTitle, "helper.js", "", "src/helpers")
//         helper.copyHelperFunction(projectTitle, "loggerService.js", "", "src/helpers")
//         helper.copyHelperFunction(projectTitle, "response.helper.js", "", "src/helpers")
//         helper.copyHelperFunction(projectTitle, "index.js", "../", "src/")

//         // 4. Generate Models
//         helper.generateSchemaFile(`${projectSrcPath}/models`, models)

//         // 5. Install Dependencies (Optional)
//         let dependencies = ["bcrypt", "cors", "dotenv", "ejs", "express", "helmet", "i18n", "joi", "express-rate-limit",
//             "joi-objectid", "jsonwebtoken", "moment", "mongoose", "multer", "nodemailer", "winston", "morgan"]
//         if (dependencies && dependencies.length) {
//             exec(
//                 `npm install ${dependencies.join(" ")}`,
//                 { cwd: projectPath },
//                 (err) => {
//                     if (err) {
//                         console.error("Error installing dependencies", err);
//                     }
//                 }
//             );
//         }


//         // 6. Zip the Project
//         setTimeout
//         // return res.send({ message: "project created" })
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: "Failed to generate project." });
//     }
// };


// // API to download the zip
// app.get("/download/:file", (req, res) => {
//     const filePath = path.join(__dirname, req.params.file);
//     if (fs.existsSync(filePath)) {
//         res.download(filePath);
//     } else {
//         res.status(404).send("File not found.");
//     }
// });