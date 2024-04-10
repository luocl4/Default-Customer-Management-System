const mysql = require("mysql");
const url = require("url");
const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "123456",
  database: "default",
});

db.connect();

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// 查询违约用户
app.get("/default_users", (req, res) => {
  const sql = `select * from users inner join default_application_record on users.is_default=1 and users.id=default_application_record.id`;
  db.query(sql, (err, results) => {
    if (err) {
      console.log(err);
      return;
    }
    const data = results
    const sql_name = `select id as identified_person,name from users where user_type =1	`
    db.query(sql_name, data[0].identified_person, (err, results) => {
      if (err) {
        console.log(err);
        return;
      }
      identified_person = results
      res.send({
        status: 0,
        message: "success",
        data: data,
        name: identified_person
      });
    })
  });
});
// 查询非违约用户
app.get("/undefault_users", (req, res) => {
  const sql = `select * from users where is_default=0`;
  db.query(sql, (err, results) => {
    if (err) {
      console.log(err);
      return;
    }
    // console.log(results)
    res.send({
      status: 0,
      message: "success",
      data: results,
    });
  });
});
// 根据id查询用户信息
app.get("/userinformation", (req, res) => {
  const sql = `select * from users where id=?`;
  var parseObj = url.parse(req.url, true);
  // console.log(parseObj.query.id);
  db.query(sql, parseObj.query.id, (err, results) => {
    if (err) {
      console.log(err);
      return;
    }
    // console.log(results);
    res.send({
      status: 0,
      message: "success",
      data: results,
    });
  });
});
// 查询违约申请记录
app.get("/default_record", (req, res) => {
  const sql = `select * from default_application_record,users where default_application_record.id =users.id`;
  db.query(sql, (err, results) => {
    if (err) {
      console.log(err);
      return;
    }
    const data = results
    const sql_name = `select id as identified_person,name from users where user_type =1	`
    db.query(sql_name, data[0].identified_person, (err, results) => {
      if (err) {
        console.log(err);
        return;
      }
      identified_person = results
      res.send({
        status: 0,
        message: "success",
        data: data,
        name: identified_person
      });
    })
  });
});
// 查询未审核重生申请记录
app.get("/rebirth_record", (req, res) => {
  const sql = `select * from rebirth_application_record inner join default_application_record on rebirth_application_record.id=default_application_record.id and rebirth_application_record.rebirth_audit_status=2
   inner join users on rebirth_application_record.id=users.id`;
  db.query(sql, (err, results) => {
    if (err) {
      console.log(err);
      return;
    }
    if (results.length != 0) {
      const data = results
      const sql_name = `select id as identified_person,name from users where user_type =1	`
      db.query(sql_name, data[0].rebirth_identified_person, (err, results) => {
        if (err) {
          console.log(err);
          return;
        }
        identified_person = results
        res.send({
          status: 0,
          message: "success",
          data: data,
          name: identified_person
        });
      })
    }
    else {
      res.send({
        status: 0,
        message: "success",
        data: results
      })
    }
  });
});
// 根据审核状态查询违约用户记录
app.get("/audit_status", (req, res) => {
  const sql = `select * from default_application_record,users where audit_status=? and default_application_record.id =users.id `;
  var parseObj = url.parse(req.url, true);
  //   console.log(parseObj.query.audit_status);
  db.query(sql, parseObj.query.audit_status, (err, results) => {
    if (err) {
      //   console.log(err);
      return;
    }
    if (results.length != 0) {
      const data = results
      const sql_name = `select id as identified_person,name from users where user_type =1	`
      db.query(sql_name, data[0].identified_person, (err, results) => {
        if (err) {
          console.log(err);
          return;
        }
        identified_person = results
        res.send({
          status: 0,
          message: "success",
          data: data,
          name: identified_person
        });
      })
    }
    else {
      res.send({
        status: 0,
        message: "success",
        data: results
      });
    }
  });
});
// 提交对用户的违约申请
app.post("/post_default_application", (req, res) => {
  const sql_sel = `select * from users where id=?`
  db.query(sql_sel, req.body.id, (err, results) => {
    if (results[0].is_default == 0) {
      const sqlStr = `select * from default_application_record where id=? `;
      // console.log(req.body.id);
      db.query(sqlStr, req.body.id, (err, results) => {
        // if(err){console.log(err);return;}
        if (results.length == 0) {
          //插入新申请
          const sql = ` insert into default_application_record set ?`;
          db.query(sql, req.body, (err, results) => {
            if (err) {
              console.log(err);
              return;
            }
          });
        } else {
          //修改旧申请
          const sql_del = ` delete from default_application_record where id=?`;
          db.query(sql_del, req.body.id, (err, results) => {
            if (err) {
              console.log(err);
              return;
            }
          });
          const sql_ins = ` insert into default_application_record set ?`;
          db.query(sql_ins, req.body, (err, results) => {
            if (err) {
              console.log(err);
              return;
            }
          });
        }
        // console.log(results);
      });
      res.send({
        status: 0,
        message: "success",
      });
    }
    else {
      res.send({
        status: 1,
        message: "fail"
      })
    }
  })

});
//审核是否通过违约申请
app.post("/audit_default", (req, res) => {
  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var Hours = date.getHours();
  var Minutes = date.getMinutes();
  var Seconds = date.getSeconds();
  if (month < 10) {
    month = "0" + month;
  }
  if (day < 10) {
    day = "0" + day;
  }
  var s_createtime =
    year +
    "-" +
    month +
    "-" +
    day +
    " " +
    Hours +
    ":" +
    Minutes +
    ":" +
    Seconds;
  if (req.body.audit_default_status == 1) {
    const sql1 = `update default_application_record set audit_status = 1,review_time=?,identified_person=? where id =?`;
    db.query(sql1, [s_createtime, req.body.manager_id, req.body.id], (err, results) => {
      if (err) {
        console.log(err);
        return;
      }
    }
    );
    const sql2 = `select * from default_application_record where id =?`;
    db.query(sql2, req.body.id, (err, results) => {
      if (err) {
        console.log(err);
        return;
      }
      const data = results[0]
      // console.log(data)
      const sql_insert = `update users set latest_external_rating=?,is_default=1,default_cause=?,default_severity=? where id=?`
      db.query(sql_insert, [data.default_latest_external_rating, data.post_default_cause, data.post_default_severity, req.body.id], (err, results) => {
        if (err) {
          console.log(err);
          return;
        }
      })
    })
  }
  else {
    const sql = `update default_application_record set audit_status = 0,review_time=?,identified_person=? where id =?`;
    db.query(sql, [s_createtime, req.body.manager_id, req.body.id], (err, results) => {
      if (err) {
        console.log(err);
        return;
      }
    }
    );
  }
  res.send({
    status: 0,
    message: "success",
  })
});
// 提交对用户的重生申请
app.post("/post_rebirth_application", (req, res) => {
  const sqlStr = `select * from rebirth_application_record where id=? `;
  // console.log(req.body.id);
  db.query(sqlStr, req.body.id, (err, results) => {
    if (err) { console.log(err); return; }
    if (results.length == 0) {
      //插入新申请
      const sql = ` insert into rebirth_application_record set ?`;
      db.query(sql, req.body, (err, results) => {
        if (err) {
          console.log(err);
          return;
        }
      });
    } else {
      //修改旧申请
      const sql_del = ` delete from rebirth_application_record where id=?`;
      db.query(sql_del, req.body.id, (err, results) => {
        if (err) {
          console.log(err);
          return;
        }
      });
      const sql_ins = ` insert into rebirth_application_record set ?`;
      db.query(sql_ins, req.body, (err, results) => {
        if (err) {
          console.log(err);
          return;
        }
      });
    }
    // console.log(results);
  });
  res.send({
    status: 0,
    message: "success",
  });
});
//审核是否通过重生申请
app.post("/audit_rebirth", (req, res) => {
  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var Hours = date.getHours();
  var Minutes = date.getMinutes();
  var Seconds = date.getSeconds();
  if (month < 10) {
    month = "0" + month;
  }
  if (day < 10) {
    day = "0" + day;
  }
  var s_createtime =
    year +
    "-" +
    month +
    "-" +
    day +
    " " +
    Hours +
    ":" +
    Minutes +
    ":" +
    Seconds;
  if (req.body.audit_rebirth_status == 1) {
    const sql1 = `update rebirth_application_record set rebirth_audit_status = 1,rebirth_review_time=?,rebirth_identified_person=? where id =?`;
    db.query(sql1, [s_createtime, req.body.manager_id, req.body.id], (err, results) => {
      if (err) {
        console.log(err);
        return;
      }
    }
    );
    // const sql2 = `select * from rebirth_application_record where id =?`;
    // db.query(sql2,req.body.id,(err,results)=>{
    //   if (err) {
    //     console.log(err);
    //     return;
    //   }
    //   const data=results[0]
    // console.log(data)
    const sql_insert = `update users set is_default=0,default_cause=null,default_severity=null where id=?`
    db.query(sql_insert, req.body.id, (err, results) => {
      if (err) {
        console.log(err);
        return;
      }
    })
    // })
  }
  else {
    const sql = `update rebirth_application_record set rebirth_audit_status = 0,rebirth_review_time=?,rebirth_identified_person=? where id =?`;
    db.query(sql, [s_createtime, req.body.manager_id, req.body.id], (err, results) => {
      if (err) {
        console.log(err);
        return;
      }
    }
    );
  }
  res.send({
    status: 0,
    message: "success",
  })
});
//登录
app.post("/login", (req, res) => {
  console.log(req.body)
  const sql = `select * from users where account=?`
  db.query(sql, req.body.account, (err, results) => {
    if (err) {
      console.log(err);
      return;
    }
    else if (results.length != 1) {
      res.send({
        status: 2,
        message: '账号错误'
      })
    }
    else if (results[0].password == req.body.password) {
      res.send({
        status: 0,
        message: 'success',
        data: results
      })
    }
    else {
      res.send({
        status: 1,
        message: '密码错误'
      })
    }
  })
})
//按行业统计违约
app.get("/statistics_industry_default", (req, res) => {
  const sql = `select users.industry,count(users.id) as count from users inner join default_application_record on users.industry is not null and users.id=default_application_record.id and year(default_application_record.review_time)=? group by (users.industry)`
  var parseObj = url.parse(req.url, true);
  db.query(sql, parseObj.query.year, (err, results) => {
    if (err) {
      console.log(err);
      return;
    }
    const data = results
    const sql_sel = `select users.industry,month(default_application_record.review_time) as month,count(users.id) as count from users inner join default_application_record on users.industry is not null and users.id=default_application_record.id and year(default_application_record.review_time)=? group by users.industry,month(default_application_record.review_time)`
    db.query(sql_sel, parseObj.query.year, (err, results) => {
      if (err) {
        console.log(err);
        return;
      }
      const data_month = results
      res.send({
        status: 0,
        message: 'success',
        data: data,
        data_month: data_month
      })
    })
  })
})
//按行业统计重生
app.get("/statistics_industry_rebirth", (req, res) => {
  const sql = `select users.industry,count(users.id) as count from users inner join rebirth_application_record on users.industry is not null and users.id=rebirth_application_record.id and year(rebirth_application_record.rebirth_review_time)=? group by (users.industry)`
  var parseObj = url.parse(req.url, true);
  db.query(sql, parseObj.query.year, (err, results) => {
    if (err) {
      console.log(err);
      return;
    }
    const data = results
    const sql_sel = `select users.industry,month(rebirth_application_record.rebirth_review_time) as month,count(users.id) as count from users inner join rebirth_application_record on users.industry is not null and users.id=rebirth_application_record.id and year(rebirth_application_record.rebirth_review_time)=? group by users.industry,month(rebirth_application_record.rebirth_review_time)`
    db.query(sql_sel, parseObj.query.year, (err, results) => {
      if (err) {
        console.log(err);
        return;
      }
      const data_month = results
      res.send({
        status: 0,
        message: 'success',
        data: data,
        data_month: data_month
      })
    })
  })
})
//按区域统计违约
app.get("/statistics_area_default", (req, res) => {
  const sql = `select users.area,count(users.id) as count from users inner join default_application_record on users.area is not null and users.id=default_application_record.id and year(default_application_record.review_time)=? group by (users.area)`
  var parseObj = url.parse(req.url, true);
  db.query(sql, parseObj.query.year, (err, results) => {
    if (err) {
      console.log(err);
      return;
    }
    const data = results
    const sql_sel = `select users.area,month(default_application_record.review_time) as month,count(users.id) as count from users inner join default_application_record on users.area is not null and users.id=default_application_record.id and year(default_application_record.review_time)=? group by users.area,month(default_application_record.review_time)`
    db.query(sql_sel, parseObj.query.year, (err, results) => {
      if (err) {
        console.log(err);
        return;
      }
      const data_month = results
      res.send({
        status: 0,
        message: 'success',
        data: data,
        data_month: data_month
      })
    })
  })
})
//按区域统计重生
app.get("/statistics_area_rebirth", (req, res) => {
  const sql = `select users.area,count(users.id) as count from users inner join rebirth_application_record on users.area is not null and users.id=rebirth_application_record.id and year(rebirth_application_record.rebirth_review_time)=? group by (users.area)`
  var parseObj = url.parse(req.url, true);
  db.query(sql, parseObj.query.year, (err, results) => {
    if (err) {
      console.log(err);
      return;
    }
    const data = results
    const sql_sel = `select users.area,month(rebirth_application_record.rebirth_review_time) as month,count(users.id) as count from users inner join rebirth_application_record on users.area is not null and users.id=rebirth_application_record.id and year(rebirth_application_record.rebirth_review_time)=? group by users.area,month(rebirth_application_record.rebirth_review_time)`
    db.query(sql_sel, parseObj.query.year, (err, results) => {
      if (err) {
        console.log(err);
        return;
      }
      const data_month = results
      res.send({
        status: 0,
        message: 'success',
        data: data,
        data_month: data_month
      })
    })
  })
})
app.listen(port, () => {
  // console.log(`Example app listening on port ${port}`);
});
