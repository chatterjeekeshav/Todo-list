//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const { mongo, default: mongoose } = require("mongoose");
const _ = require("lodash");
// const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect("mongodb+srv://Keshav:Keshav%40123@cluster0.9zntmaq.mongodb.net/todolist",{useNewUrlParser: true});

const itemSchema = {
  name:String 
}
const Item = mongoose.model("Item", itemSchema);

const item_1=new Item({
  name:"Welcome!,"
})
const item_2=new Item({
  name:"To the"
})
const item_3=new Item({
  name:"To-do app"
})

const defaultItems = [item_1,item_2,item_3];

const listSchema = {
  name:String,
  items:[itemSchema]
};
const List = mongoose.model("list",listSchema);


app.get("/", function(req, res) {

  
// const day = date.getDate();
  Item.find({},function(err,foundItems){
    if (foundItems.length === 0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("Items Inserted to the list");
        }
      });
      res.redirect("/"); 
    }

    else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});    
    }
  } )

  

});

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err,foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name:customListName,
          items:defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }
      else{
        res.render("list",{listTitle: foundList.name, newListItems: foundList.items})
      }
    }
  });
  
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name:itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName}, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    })
  }

});

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;


  if(listName=="Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Successfully deleted");
        res.redirect("/"); 
      }
    })
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
      if(!err){
          res.redirect("/"+listName);
      }
    });
  }

  
})



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
