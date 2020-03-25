//jshint esversion:6

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/todo", {
  useNewUrlParser: true
});


const itemsSchema = new mongoose.Schema({
  name: String
});
const Item = mongoose.model("Item", itemsSchema);
// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];
const a = new Item({
  name: "Buy food"
});
const b = new Item({
  name: "cook food"
});
const c = new Item({
  name: "Eat food"
});
const defaultitem=[a,b,c];



app.get("/", function(req, res) {

  // const day = date.getDate();

  Item.find({},function(err, ite) {
    if (ite.length===0) {   //this checks and inserts only once  in to the database
      Item.insertMany(defaultitem, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("successfully added items");
        };
      });
      res.redirect("/");
    } else {


      res.render("list", {
        listTitle: "Today",
        newListItems: ite});
    }
  })
});

const workSchema=mongoose.Schema({
  name:String,
  item:[itemsSchema]
});
const List=mongoose.model("List",workSchema);
app.get("/:custom",function(req,res)//this is to get dynamically the parameters given to the url
{
  const custom=req.params.custom;


  List.findOne({name:custom},function(err,found){
    if(!err){
      if(!found)  {
        const list=new List({
          name:custom,
          item:defaultitem
        });
        list.save();
        res.redirect("/"+custom)

      }//create list

      else{//show an existing list
       res.render("list", {listTitle: found.name, newListItems: found.item});
      }
    }
  })
})





app.post("/", function(req, res){

  const itemName = req.body.newItem;
    const listName=req.body.list;
  const itemadd= new Item({
    name:itemName
  })
  if(listName==="Today")
  {
  itemadd.save();

    res.redirect("/");
}
else{
  List.findOne({name:listName},function(err,found){
    found.item.push(itemadd);
    found.save();
    res.redirect("/"+ listName)
  })
}
});




app.post("/delete",function(req,res){
const checked= req.body.checkbox;
const listName=req.body.listName;
if(listName==="Today")
{
  Item.findByIdAndRemove(checked,function(err){
    if(err){
      console.log(err);
    }
    else{
      console.log("deleted item checked successfully");
      res.redirect("/")
    }
  })
}
else{
  List.findOneAndUpdate({name:listName},{$pull:{item:{_id:checked}}},function(err,checked)
{if(!err)
{  console.log("deleted  item checked successfully");
  res.redirect("/" + listName)

}})
}
})
// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });
//
// app.get("/about", function(req, res){
//   res.render("about");
// });

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
