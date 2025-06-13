const express = require("express");
const app = express();
// const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"))

// app.use(cookieParser("secretcode"));

// app.get("/getsignedcookie",(req,res)=>{
//     res.cookie("made-in","india",{signed:true});
//     res.send("signed cookie sent");
// })

// app.get("/verify",(req,res)=>{
//     console.log(req.signedCookies);
//     res.send("verified")
// })

// app.get("/getcookies",(req,res)=>{
//     res.cookie("greet","namaste");
//     res.send("sended cookies");
// });
// app.get("/greet",(req,res)=>{
//     let {name = "anonymous"} = req.cookies;
//     res.send(`Hi,${name}`);
// })

const sessionOptions = {
  secret: "mysupersecretstring",
  resave: false,
  saveUninitialized: true,
};
app.use(session(sessionOptions));
app.use(flash());

app.use((req,res,next)=>{
    res.locals.msg = req.flash("success");
next()
})

app.get("/register", (req, res) => {
  let { name = "anonymous" } = req.query;
  req.session.name = name;
  console.log(req.session);
  req.flash("success", "user registerred successfully");
  res.redirect("/hello");
});

app.get("/hello", (req, res) => {
  // console.log(req.flash("success"));
    // res.locals.msg = req.flash("success");
    res.render("page.ejs",{
        name:req.session.name
    })    
});

app.get("/test", (req, res) => {
  res.send("test successful");
});

app.get("/reqcount", (req, res) => {
  if (req.session.count) {
    req.session.count++;
  } else {
    req.session.count = 1;
  }
  res.send(`You sent a request ${req.session.count} times`);
});
app.listen(3000, () => {
  console.log("server is litnening to 3000");
});
