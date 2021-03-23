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

//retrieve by userID
app.post('/user/profile', (req, res) => {
    let userID = req.body.userID;

    if (!userID) {
        return res.status(400).send("Please provide username")
    }
    else {
        dbCon.query("SELECT * FROM user WHERE user_id = ?", userID, (error, results, fields) => {
            if (error) throw error;


            if (results === undefined || results.length == 0) {

                return res.send(null)
            }

            return res.send(results)
        })
    }
})

//get address
app.post('/address', (req, res) => {
    let addressId = req.body.addressId;

    if (!addressId) {
        var str = '{"message":"โปรดกรอกที่อยู่นี้"}'
        return res.send(JSON.parse(str));
    }
    else {
        dbCon.query('SELECT address_id,number,moo,road,TambonThai,DistrictThai,ProvinceThai,postcode FROM (SELECT address_id,number,moo,road,TambonThai,DistrictThai,province,postcode FROM (SELECT address_id,number,moo,road,TambonThai,district,province,postcode FROM  (SELECT * FROM address WHERE address_id=?  ) AS address INNER JOIN tambon ON address.`sub-district` = tambon.TambonID) AS tambon INNER JOIN district ON tambon.district = district.DistrictID) AS district INNER JOIN province ON district.province = province.ProvinceID', addressId,
            (err, results) => {
                if (err) throw err;

                return res.send(results[0]);
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

    global.userUsed = Boolean(false)
    global.addressId = 0;
    global.provinceID;
    global.districtID;
    global.tambonID;
    global.str;


    if (!username) {
        str = '{"message":"โปรดกรอกชื่อผู้ใช่"}'
        return res.send(JSON.parse(str));
    }
   /* else if (!password) {
        str = '{"message":"โปรดกรอกรหัสผ่าน"}'
        return res.send(JSON.parse(str));
    }
    else if (!name) {
        str = '{"message":"โปรดกรอกชื่อ"}'
        return res.send(JSON.parse(str));
    }
    else if (!lastname) {
        str = '{"message":"โปรดกรอกนามสกุล"}'
        return res.send(JSON.parse(str));
    }
    else if (!phone) {
        str = '{"message":"โปรดกรอกหมายเลขโทรศัพท์"}'
        return res.send(JSON.parse(str));
    }*/
    else {
        dbCon.query('SELECT * FROM user WHERE username = ?', username, function (error, results, fields) {
            if (error) throw error;

            if (results.length >= 1) {
                str = '{"message":"ชื่อผู้ใช้นี้ถูกใช้แล้ว"}'
                return res.send(JSON.parse(str));
            }
            else if (!number) {
                str = '{"message":"โปรดใส่เลขที่ที่อยู่"}'
                return res.send(JSON.parse(str));
            }
            else if (!province) {
                str = '{"message":"โปรดใส่ชื่อจังหวัด"}'
                return res.send(JSON.parse(str));
            }
            else if (!district) {
                str = '{"message":"โปรดใส่ชื่ออำเภอ"}'
                return res.send(JSON.parse(str));
            }
            else if (!subDistrict) {
                str = '{"message": "โปรดใส่ชื่อตำบล"}'
                return res.send(JSON.parse(str));
            }
            else if (!postcode) {
                str = '{"message": "โปรดใส่รหัสไปรษณี"}'
                return res.send(JSON.parse(str));
            }
            else {
                dbCon.query('SELECT ProvinceID FROM province WHERE  ProvinceThai = ?', province, (error, results, fields) => {
                    if (error) throw error;

                    if (results.length <= 0) {
                        str = '{"message:"ไม่มีข้อมูลจังหวัดนี้"}'
                        return res.send(JSON.parse(str));
                    }
                    else {

                        provinceID = JSON.stringify(results);
                        //console.log(provinceID);
                        provinceID = provinceID.split(":");
                        provinceID = provinceID[1].split("}");
                        //console.log(provinceID[0]);
                        dbCon.query('SELECT DistrictID FROM district WHERE DistrictThai = ?', district, function (error, results, fields) {
                            if (error) throw error;

                            if (results.length <= 0) {
                                str = '{"message":"ไม่มีข้อมูลอำเภอนี้"}'
                                return res.send(JSON.parse(str));
                            }
                            else {

                                districtID = JSON.stringify(results);
                                //console.log(provinceID);
                                districtID = districtID.split(":");
                                districtID = districtID[1].split("}");
                                //console.log(districtID[0]);
                                dbCon.query('SELECT TambonID FROM tambon WHERE TambonThai = ?', subDistrict, function (error, results, fields) {
                                    if (error) throw error;

                                    if (results.length <= 0) {
                                        str = '{"message":"ไม่มีข้อมูลตำบลนี้"}'
                                        return res.send(JSON.parse(str));
                                    }
                                    else {
                                        tambonID = JSON.stringify(results);
                                        //console.log(provinceID);
                                        tambonID = tambonID.split(":");
                                        tambonID = tambonID[1].split("}");
                                        //console.log(districtID[0]);
                                        dbCon.query('INSERT INTO address (number, moo, road, `sub-district`, district, province, postcode) VALUES(?,?,?,?,?,?,?)',
                                            [number, moo, road, tambonID[0], districtID[0], provinceID[0], postcode], function (error, results, fields) {

                                                if (error) throw error;
                                                addressId = results.insertId

                                                if ((!name || !lastname || !phone || !password)) {
                                                    str = '{"message":"โปรดกรอกข้อมูลผู้ใช้"}'
                                                    return res.send(JSON.parse(str));
                                                }
                                                else {
                                                    addressId = String(addressId);
                                                    dbCon.query('INSERT INTO user (name, lastname, phone, role, address, username, password) VALUES(?,?,?,?,?,?,?)',
                                                        [name, lastname, phone, 2, addressId, username, password], function (error, results, fields) {

                                                            if (error) throw error;
                                                            str = '{"message":"success"}'
                                                            return res.send(JSON.parse(str));
                                                        })
                                                }

                                            })
                                    }

                                })
                            }
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

            if (results.length >= 1) {

                //dbCon.query('UPDATE notification SET status = 1 WHERE status = 0')
            }

            return res.send(results);
        })
})

//get news 
app.get('/news', (req, res) => {
    global.news = "[";

    dbCon.query('SELECT * FROM news', (error, results, fields) => {
        if (error) throw error;

        var i = (results.length) - 1;
        var j = 0;

        for (i; i >= 0 && j < 5; i--, j++) {

            news += JSON.stringify(results[i]);

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
    let longitude = req.body.longitude;
    //let time = req.body.time;
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
                //console.log(user_id[0]);
                var date01 = Math.floor(new Date().getTime()/1000);
                //var date01 = new Date().toUTCString;

                
                dbCon.query('INSERT INTO travel_history (time , latitude, longtitude,user_id) VALUES (?,?,?,?)', [date01, latitude, longitude, user_id[0]],
                    (error, results, fields) => {
                        if (error) throw error;

                        if (!latitude || !longitude || !user_id) {
                            return res.status(400).send(message = "ข้อมูลไม่เพียงพอ");
                        }
                        else {
                            //console.log(user_id[0]+"---------");
                            dbCon.query('SELECT * FROM travel_history WHERE user_id = ?', user_id[0], function (error, results, fields) {
                               
                                if(error) throw error;
                                
                                if (results.length == 0) return res.status(400).send("ไม่มีชื่อผู้ใช้นี้");
                                
                                else {
                                    
                                    return res.send(results);
                                }
                    
                            })
                        }
                    })
            }

        })
    }
})

/*app.post('/history/travel', (req, res) => {
    
    let userID = req.body.userID;

    if (!userID) {
        return res.status(400).send("โปรดกรอกชื่อผู้ใช่");
    }
    else {
        dbCon.query('SELECT * FROM history WHERE user_id = ?', userID, function (error, results, fields) {
            if(error) throw error;
            if (results.length == 0) return res.status(400).send("ไม่มีชื่อผู้ใช้นี้");

            else {
                return results;
            }

        })
    }
})*/


//uplode pic
app.use('/picNews', express.static('./picNews'));
const multer = require('multer');
const { json } = require('body-parser');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './picNews');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const uploadImg = multer({ storage: storage }).single('image');

app.post('/newspic', uploadImg /*insert this guy*/);

//get news pic
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