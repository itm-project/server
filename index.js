let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let mysql = require('mysql');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// homepage route
app.get('/', (req, res) => {
    return res.send({
        error: false,
        message: 'Welcome',
        written_by: 'Parn',
        published_on: 'https://test.test'
    })
})

//connection to mysql database
let dbCon = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'itmproject'
})
dbCon.connect();

//retrieve all user
app.get('/users', (req, res) => {
    dbCon.query('SELECT * FROM user', (error, results, fields) => {
        if (error) throw error;

        let message = ""
        if (results === undefined || results.length == 0) {
            message = "user table is empty";
        }
        else {
            message = "Succrssfully retrieved all users";
        }
        return res.send({ error: false, data: results, message: message });
    })
})

//add a new user
app.post('/user', (req, res) => {
    let name = req.body.name;
    let lastname = req.body.lastname;
    let phone = req.body.phone;
    let role = req.body.role;
    let address = req.body.address;
    let username = req.body.username;
    let password = req.body.password;

    //validation
    if (!name || !lastname || !phone || !role || !address || !username || !password) {
        return res.status(400).send({ error: true, message: "Please provide information." });
    }
    else {
        dbCon.query('INSERT INTO user (name, lastname, phone, role, address, username, password) VALUES(?,?,?,?,?,?,?)', [name, lastname, phone, role, address, username, password], (error, results, fields) => {
            if (error) throw error;
            return res.send({ error: false, data: results, message: "user Successfully added" })
        })
    }
})

//retrieve by userID
app.post('/user/profile', (req, res) => {
    let userID = req.body.userID;

    if (!userID) {
        return res.status(400).send("Please provide username" )
    }
    else {
        dbCon.query("SELECT * FROM user WHERE user_id = ?", userID, (error, results, fields) => {
            if (error) throw error;

            let message = "";
            if (results === undefined || results.length == 0) {
                message = "userID not found";
                return res.send(null)
            }
            else {
                message = "Successfully retrieved user data";
            }
            return res.send(results)
        })
    }
})

//update user by username
app.put('/user', (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    if (!username || !password) {
        return res.status(400).send({ error: true, message: "Please provide username and password" })
    }
    else {
        dbCon.query('UPDATE user SET password = ? WHERE username = ?', [password, username], (error, results, fields) => {
            if (error) throw error;

            let message = "";
            if (results.changRows === 0) {
                message = "user not found or data same";
            }
            else {
                message = "user successfully updated";
            }

            return res.send({ error: false, data: results, message: message })
        })
    }
})

//DELETE user by username
app.delete('/user', (req, res) => {
    let username = req.body.username;


    if (!username) {
        return res.status(400).send({ error: true, message: "Please provide username" })
    }
    else {
        dbCon.query('DELETE FROM user WHERE username = ?', username, (error, results, fields) => {
            if (error) throw error;

            let message = "";
            if (results.affectedRows === 0) {
                message = "user not found";
            }
            else {
                message = "user successfully deleted";
            }

            return res.send({ error: false, data: results, message: message })
        })
    }

})


//register
app.post('/user/register', (req, res) => {
    let name = req.body.name;
    let lastname = req.body.lastname;
    let phone = req.body.phone;
    let username = req.body.username;
    let password = req.body.password;

    let number = req.body.number;
    let moo = req.body.moo;
    let road = req.body.road;
    let subDistrict = req.body.subDistrict;
    let district = req.body.district;
    let province = req.body.province;
    let postcode = req.body.postcode;

    let request = req.body.request;

    global.userUsed = Boolean(false)
    global.addressId = 0;


    if (!username) {
        return res.status(400).send("โปรดกรอกชื่อผู้ใช่");
    }
    else {
        dbCon.query('SELECT * FROM user WHERE username = ?', username, function (error, results, fields) {
            if (error) throw error;

            if (results.length >= 1) {
                return res.send("ชื่อผู้ใช้นี้ถูกใช้แล้ว");
            }

            if ((!number || !subDistrict || !district || !province || !postcode)) {
                return res.status(400).send("โปรดกรอกข้อมูลที่อยู่");
            }
            else {

                dbCon.query('INSERT INTO address (number, moo, road, `sub-district`, district, province, postcode) VALUES(?,?,?,?,?,?,?)',
                    [number, moo, road, subDistrict, district, province, postcode], function (error, results, fields) {

                        if (error) throw error;
                        addressId = results.insertId

                        if ((!name || !lastname || !phone || !password)) {
                            return res.status(400).send("โปรดกรอกข้อมูลผู้ใช้");
                        }
                        else {
                            addressId = String(addressId);
                            dbCon.query('INSERT INTO user (name, lastname, phone, role, address, username, password) VALUES(?,?,?,?,?,?,?)',
                                [name, lastname, phone, 2, addressId, username, password], function (error, results, fields) {

                                    if (error) throw error;
                                    return res.send(results)
                                })
                        }

                    })
            }

        })
    }
})

// login
app.post('/login', (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    if (!username && !password) {
        return res.status(400).send("โปรดกรอกชื่อผู้ใช้และรหัสผ่าน");
    }
    else if (!username) {
        return res.status(400).send("โปรดกรอกชื่อผู้ใช้");
    }
    else if (!password) {
        return res.status(400).send("โปรดกรอกรหัสผ่าน");
    }
    else {
        dbCon.query('SELECT * FROM user WHERE username = ? ', username, (error, results, fields) => {
            if (error) throw error;

            //console.log(results.length==1);
            if (results.length == 1) {
                dbCon.query('SELECT * FROM user WHERE username = ? AND password = ?', [username, password], (error, results, fields) => {
                    if (error) throw error;

                    if (results.length == 1) {
                        return res.send(results);
                    }
                    else {
                        return res.send("รหัสผ่านไม่ถูกต้อง");
                    }

                })
            }
            else {
                return res.send("ไม่ชื่อผู้ใช้นี้");
            }

        })
    }
})

//get important notification
app.get('/notification/important', (req, res) => {
    dbCon.query('SELECT * FROM important_notification WHERE status = 1', (error, results, fields) => {
        if (error) throw error;

        return res.send(results);
    })
})

//get news notification
app.get('/notification/news', (req, res) => {
    dbCon.query('SELECT * FROM (SELECT * FROM news) AS news INNER JOIN (SELECT * FROM notification) AS notification ON news.notification_id = notification.noti_id WHERE notification.status = 0',
        (error, results, fields) => {
            if (error) throw error;
            //console.log(results.length)
            if (results.length >= 1) {

                //dbCon.query('UPDATE notification SET status = 1 WHERE status = 0')
            }

            return res.send(results);
        })
})

//get news 
app.get('/news', (req, res) => {
    global.news = "[";
    //JSON news

    dbCon.query('SELECT * FROM news', (error, results, fields) => {
        if (error) throw error;

        var i = (results.length) - 1;
        var j = 0;

        for (i; i >= 0 && j < 5; i--, j++) {

            news += JSON.stringify(results[i]);
            //console.log(i);
            if (i > 0 && j < 4) news += ",";

        }
        news += "]"
        news = JSON.parse(news);
        return res.send(news);
    })
})

//get news by name
app.post('/news/name', (req, res) => {
    let name = req.body.name;

    dbCon.query('SELECT * FROM news WHERE name = ?', name, (error, results, fields) => {
        if (error) throw error;

        return res.send(results);
    })
})

//add travel history
app.post('/history', (req, res) => {
    let latitude = req.body.latitude;
    let longtitude = req.body.longtitude;
    let time = req.body.time;
    let username = req.body.username;

    global.user_id;
    global.sp;
    global.sp1;

    if (!username) {
        return res.status(400).send("โปรดกรอกชื่อผู้ใช่");
    }
    else {
        dbCon.query('SELECT user_id FROM user WHERE username = ?', username, function (error, results, fields) {

            if (results.length == 0) return res.status(400).send("ไม่มีชื่อผู้ใช้นี้");

            else {
                user_id = JSON.stringify(results);
                user_id = user_id.split(":");
                user_id = user_id[1].split("}");
                console.log(user_id[0]);
                //return res.send({error:false ,data: results});

                dbCon.query('INSERT INTO travel_history (time , latitude, longtitude,user_id) VALUES (?,?,?,?)', [time, latitude, longtitude, user_id[0]],
                    (error, results, fields) => {
                        if (error) throw error;

                        if (!time || !latitude || !longtitude || !user_id) {
                            return res.status(400).send(message = "ข้อมูลไม่เพียงพอ");
                        }
                        else {
                            return res.send(results)
                        }
                    })
            }

        })
    }
})

//get province
app.get('/provinces', (req, res) => {
    dbCon.query('SELECT * FROM province', (error, results, fields) => {
        if (error) throw error;

        let message = ""
        if (results === undefined || results.length == 0) {
            message = "province table is empty";
        }
        else {
            message = "Succrssfully retrieved all province";
        }
        return res.send(results);
    })
})

//get district
app.post('/districts', (req, res) => {
    let provincename = req.body.provincename
    global.provinceID;


    if (!provincename) {
        return res.status(400).send("โปรดใส่ชื่อจังหวัด");
    }
    else {
        dbCon.query('SELECT ProvinceID FROM province WHERE  ProvinceThai = ?', provincename, (error, results, fields) => {
            if (error) throw error;

            if (results.length <= 0) {

                return res.send("ไม่มีข้อมูลจังหวัดนี้");
            }
            else {
                provinceID = JSON.stringify(results);
                //console.log(provinceID);
                provinceID = provinceID.split(":");
                provinceID = provinceID[1].split("}");
                //console.log(provinceID[0]);

                dbCon.query('SELECT * FROM district WHERE ProvinceID = ?', provinceID[0], function (error, results, fields) {
                    if (error) throw error;

                    let message = ""
                    if (results === undefined || results.length == 0) {
                        message = "province table is empty";
                    }
                    else {
                        message = "Succrssfully retrieved all district";
                    }
                    return res.send(results);
                })
            }
        })
    }


})

//get tambon
app.post('/tambons', (req, res) => {
    let districtname = req.body.districtname
    global.districtID;

    if (!districtname) {
        return res.status(400).send("โปรดใส่ชื่ออำเภอ");
    }
    else {
        dbCon.query('SELECT DistrictID FROM district WHERE  DistrictThai = ?', districtname, (error, results, fields) => {
            if (error) throw error;

            if (results.length <= 0) {

                return res.send("ไม่มีข้อมูลอำเภอนี้");
            }
            else {

                districtID = JSON.stringify(results);
                //console.log(districtID);
                districtID = districtID.split(":");
                //console.log(districtID[1]);
                districtID = districtID[1].split("}");
                //console.log(districtID[0]);

                dbCon.query('SELECT * FROM tambon WHERE DistrictID = ?', districtID[0], (error, results, fields) => {
                    if (error) throw error;

                    let message = ""
                    if (results === undefined || results.length == 0) {
                        message = "province table is empty";
                    }
                    else {
                        message = "Succrssfully retrieved all tambon";
                    }
                    return res.send(results);
                })
            }
        })
    }


})


//get news pic
app.use('/picNews', express.static('./picNews'));
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './picNews');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const uploadImg = multer({ storage: storage }).single('image');
/*module.exports = { 
    uploadImg    
};*/
app.post('/newspic', uploadImg /*insert this guy*/);

app.post('/news/pic', (req, res) => {
    let newsname = req.body.newsname;

    fs = require('fs');
    fs.readdir('E:/NodeJS_MIT_api/picNews', function (err, files) {
        if (err) {
            console.log(err);
            return;
        }

        for (var i = 0; i < files.length; i++) {
            var name = files[i].split('.');

            //console.log(newsname+" "+name[0]);
            if (name[0] == newsname) {
                return res.sendFile('E:/NodeJS_MIT_api/picNews/' + newsname + '.jpg');
            }

        }
        return res.sendFile('E:/NodeJS_MIT_api/picNews/default.jpg');
    });

})

app.listen(5001, () => {
    console.log('Node App run on port 5001');
})
module.exports = app;