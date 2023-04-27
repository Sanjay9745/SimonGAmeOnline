require("dotenv").config()
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const ejs = require("ejs");
var _ = require("lodash");
const mongoose = require("mongoose");
const app = express();
const bcrypt = require("bcrypt");
const saltRound = 10;


app.use(session({
  secret: process.env.SECRET,
  saveUninitialized: true,
  resave: true
}));

mongoose.connect("mongodb+srv://admin-sanjay:"+process.env.USER_KEY+"@cluster0.3wo8evg.mongodb.net/gameDB");
const gameSchema = new mongoose.Schema({
  name:String,
  password:String,
  score:Number,
})

const User = new mongoose.model("User",gameSchema)


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));



app.get("/",(req,res)=>{

if(req.session.user){
  res.render("index",{user:true,name:req.session.username,score:req.session.score});
}else{
  res.render("index",{user:false});
}
})


app.get("/register",(req,res)=>{
  
    res.render("register");
})


app.post("/register",(req,res)=>{
    
      async function getData(){
        try{
          const data =  await User.findOne({name:req.body.username});
          return data
        }catch(e){
          console.log(e);
        }
    
      }
      getData().then((data)=>{
      
       if(data){
        res.redirect("/login")
       }else{
        bcrypt.hash(req.body.password,saltRound,(err,hash)=>{
          const user = new User({
            name:req.body.username,
            password:hash,
            score:0
        });
        user.save();
        req.session.username=req.body.username;
        req.session.user=true;
        req.session.score=0;
        res.redirect("/");
        })
        
       }
      })
   
   
})

app.get("/login",(req,res)=>{
  
    res.render("login");
})

app.post("/login",(req,res)=>{
    
    async function getData(){
        try{
          const data =  await User.findOne({name:req.body.username});
          return data
        }catch(e){
          console.log(e);
        }
    
      }
      getData().then((data)=>{
      
       if(data){
        bcrypt.compare(req.body.password,data.password,(err,result)=>{
          if(result==true){
       
            req.session.username=req.body.username;
            req.session.user=true;
            req.session.score=data.score;
            console.log("sucess");
            res.redirect("/");
          }else{
            res.redirect("/login");
            console.log("error");
         }  })
      }else{
        res.redirect("/register")
      }
       
    
      })
})

app.post("/score",(req,res)=>{

  if(req.session.user){
  
    if(req.session.score<req.body.score){
      async function getData(){
        try{
          const data =  await User.findOneAndUpdate({name:req.session.username},{$set:{score:req.body.score}});
          return data
        }catch(e){
          console.log(e);
        }
    
      }
      getData().then((data)=>{
        req.session.score=req.body.score;
        res.redirect("/")
       
      })
    }else{
      res.redirect("/")
    }
    }else{
      res.redirect("/")
       
    }
   

})


app.get("/score-board",(req,res)=>{
  async function getData(){
    try{
      const data =  await User.find().sort({score:'desc'});
      return data
    }catch(e){
      console.log(e);
    }

  }
  if(req.session.user){
   
    getData().then((data)=>{

      
      res.render("score",{data:data,currentUser:req.session.username,user:true})
     
    })
    
  }else{
    getData().then((data)=>{

      
      res.render("score",{data:data,currentUser:null,user:false});
     
    })
  }
  
})


app.get("/account",(req,res)=>{
  res.render("account",{invalid:"Please Enter Username and Password To Update",success:true,name:req.session.username})
  
})
app.post("/account",(req,res)=>{
  if(req.body.button=="update"){
    if(req.body.username===req.session.username){
      res.redirect("/account")
    }else{
       async function getData(){
      try{
        const data =  await User.findOne({name:req.body.username});
        return data
      }catch(e){
        console.log(e);
      }
  
    }
    getData().then((data)=>{
      if(data){
        res.render("account",{invalid:"Username Already Exist",success:false,name:req.session.username})
      }else{
        async function updateData(){
          try{
            const data =  await User.updateOne({name:req.session.username},{$set:{name:req.body.username}});
            return data
          }catch(e){
            console.log(e);
          }
         
        }
        updateData().then((data)=>{
         
          req.session.username=req.body.username;
        res.redirect("/account")
        })
       
      }
    })
    }
   
  }else if(req.body.button=="delete"){

    async function deleteData(){
     
      try{
        const data =  await User.findOneAndRemove({name:req.session.username});
        return data
      }catch(e){
        console.log(e);
      }
  
    }
    deleteData().then((data)=>{
   
      
    })
  
    req.session.username=null;
    req.session.user=false;
    req.session.score=null;
    res.redirect("/");
  }else{
    req.session.destroy();
    res.redirect("/");
  }
})

const chatSchema = new mongoose.Schema({

  chat:String
})

const Chat = new mongoose.model("Chat",chatSchema)


app.get("/chatroom",(req,res)=>{
async function getChat(){
  try{
    const data = await Chat.find({})
    return data;
  }catch(e){
    console.log(e);
  }

}
 getChat().then((data)=>{
  req.session.chat=data.chat
    res.render("chat",{chats:data})
  

 })
})

app.post("/chatroom",(req,res)=>{

  const chat = new Chat({
    chat:req.body.chat

  })
  chat.save()

  res.redirect("/chatroom")
})


app.post("/delete-chat",(req,res)=>{
  async function deleteData(){
     
    try{
      const data =  await Chat.findOneAndRemove({_id:req.body.id});
      return data
    }catch(e){
      console.log(e);
    }

  }
  deleteData().then((data)=>{
    
    res.redirect("/chatroom")
  })
 
})

app.get("/how-to-play",(req,res)=>{
  res.render("how-to-play");
})
app.listen(3000, function() {
    console.log("Server started on port 3000");
  });
  